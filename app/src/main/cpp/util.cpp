#include <unistd.h>
#include "util.h"
#include "android/log.h"
#include "cstdio"
#include "string"
#include "vector"
#include "fcntl.h"
#include "sys/syscall.h"

using namespace std;

#define KSU_INSTALL_MAGIC1     0xDEADBEEFu
#define KSU_INSTALL_MAGIC2     0xCAFEBABEu
#define KSU_IOCTL_GET_SULOG_FD  0x40044B14u
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "KsuToast", __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, "KsuToast", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "KsuToast", __VA_ARGS__)
static vector<int> zygotePids;

bool readProcFile(const std::string &path, std::string &out) {
    int fd = open(path.c_str(), O_RDONLY | O_CLOEXEC);
    if (fd < 0) return false;
    out.clear();
    char buf[512];
    constexpr size_t kMaxBytes = 4096;
    while (out.size() < kMaxBytes) {
        size_t remain = kMaxBytes - out.size();
        size_t want = remain < sizeof(buf) ? remain : sizeof(buf);
        ssize_t n = read(fd, buf, want);
        if (n > 0) {
            out.append(buf, static_cast<size_t>(n));
            continue;
        }
        if (n == 0) break; // EOF
        if (errno == EINTR) continue;
        close(fd);
        out.clear();
        return false;
    }
    close(fd);
    return !out.empty();
}

inline string getProcessCmdline(pid_t pid) {
    string statFilePath = "/proc/" + to_string(pid) + "/cmdline";
    string cmdline;
    if (readProcFile(statFilePath, cmdline)) {
        size_t nullPos=cmdline.find('\0');
        if (nullPos != string::npos){
            cmdline = cmdline.substr(0, nullPos);
        }
        return cmdline;
    }
    return "";
}

inline pid_t getPidByName(const string &name) {
    FILE *result = popen(("pidof " + name).c_str(), "r");
    if (!result) return -1;
    char buf[64];
    if (fgets(buf, sizeof(buf), result) == nullptr) {
        pclose(result);
        return -1;
    }
    pclose(result);
    return static_cast<pid_t>(strtol(buf, nullptr, 10));
}

bool utilInit() {
    pid_t zygotePid = getPidByName("zygote");
    pid_t zygote64Pid = getPidByName("zygote64");
    if (zygotePid > 0) zygotePids.push_back(zygotePid);
    if (zygote64Pid > 0) zygotePids.push_back(zygote64Pid);
    return !zygotePids.empty();
}

bool tryKillKsudProcess() {
    /*
     * 开启sulog后启动的ksud进程名
     * 如果是启动后才开启该功能 进程名会不同
     * 但我选择初始化时如果sulog未开启直接退出
     * */
    pid_t ksudPid = getPidByName("ksud");
    if (ksudPid > 1) {
        kill(ksudPid, SIGKILL);
        //等待退出
        for (int i = 0; i < 25; ++i) { // 500ms
            if (kill(ksudPid, 0) == -1 && errno == ESRCH) break;
            usleep(20000);
        }
        return true;
    }
    return false;
}

int getKernelSuDriver() {
    int fd = -1;
    syscall(SYS_reboot, KSU_INSTALL_MAGIC1, KSU_INSTALL_MAGIC2, 0, &fd);
    return fd;
}

int getSuLogFd(int driverFd) {
    struct {
        uint32_t flags;
    } suLog_cmd = {0};
    int fd = ioctl(driverFd, KSU_IOCTL_GET_SULOG_FD, &suLog_cmd);
    //被抢了也可能是-1
    if (fd < 0) {
        int err = errno;
        if (err == EBUSY) {
            LOGW("Get su log fd failed,trying kill ksud process...");
            if (tryKillKsudProcess()) {
                LOGI("Ksud process killed.Try get su log fd again");
                //再次尝试获取
                fd = ioctl(driverFd, KSU_IOCTL_GET_SULOG_FD, &suLog_cmd);
            }
        }
        //获取之后重新判断
        if (fd < 0) {
            LOGE("Get su log fd failed,errno:%d", err);
        }
    }
    return fd;
}

pid_t getPpid(pid_t pid) {
    string statFilePath = "/proc/" + to_string(pid) + "/stat";
    string line;
    if (readProcFile(statFilePath, line)) {
        size_t afterComm = line.find(") ");
        if (afterComm == string::npos) return -1;
        size_t statePos = afterComm + 2;
        size_t stateEnd = line.find(' ', statePos);
        if (stateEnd == string::npos) return -1;
        size_t ppidStart = stateEnd + 1;
        size_t ppidEnd = line.find(' ', ppidStart);
        string ppidStr = (ppidEnd == string::npos)
                         ? line.substr(ppidStart)
                         : line.substr(ppidStart, ppidEnd - ppidStart);
        char *end = nullptr;
        long v = strtol(ppidStr.c_str(), &end, 10);
        if (end == ppidStr.c_str() || *end != '\0') return -1;
        return static_cast<pid_t>(v);
    }
    return -1;
}

AndroidAppInfo queryAndroidApplicationInfo(pid_t pid) {
    pid_t targetPpid = getPpid(pid);
    //不可能有Android应用pid小于100
    if (targetPpid < 100) return {false, pid, ""};
    bool parentIsZygote =
            std::find(zygotePids.begin(), zygotePids.end(), targetPpid) != zygotePids.end();
    if (!parentIsZygote) {
        //尝试获取一次父进程
        pid_t newTargetPpid = getPpid(targetPpid);
        bool parentPpidIsZygote =
                std::find(zygotePids.begin(), zygotePids.end(), newTargetPpid) !=
                zygotePids.end();
        return {parentPpidIsZygote, targetPpid, getProcessCmdline(targetPpid)};
    }
    //是android应用了 再加个包名
    return {parentIsZygote, pid, getProcessCmdline(pid)};
}