#include <unistd.h>
#include "util.h"
#include "android/log.h"
#include "fcntl.h"
#include "sys/syscall.h"
#include "dirent.h"

using namespace std;
#define KSU_INSTALL_MAGIC1 0xDEADBEEFu
#define KSU_INSTALL_MAGIC2 0xCAFEBABEu
#define KSU_IOCTL_GET_SULOG_FD 0x40044B14u
#define SULOG_FD_LINK "anon_inode:[ksu_sulog]"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "KernelSuGrantToast", __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, "KernelSuGrantToast", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "KernelSuGrantToast", __VA_ARGS__)
static int zygotePid = -886;
static int zygote64Pid = -996;
FILE *logFile;
static uint8_t writeLogLineCount = 0;
static bool enableDebugLog = false;

bool readProcFile(const std::string &path, std::string &out) {

    int fd = open(path.c_str(), O_RDONLY | O_CLOEXEC);
    if (fd < 0) return false;
    string tmpString;
    tmpString.resize(1536);
    ssize_t readLength;
    while (true) {
        readLength = read(fd, tmpString.data(), tmpString.size());
        if (readLength < 0 && errno == EINTR) continue;
        break;
    }
    close(fd);
    if (readLength <= 0) {
        out.clear();
        return false;
    }
    out.assign(tmpString.data(), readLength);
    return true;
}

bool isNumeric(const char *name) {
    if (!name || *name == '\0') return false;
    for (const char *p = name; *p; ++p) {
        if (*p < '0' || *p > '9') return false;
    }
    return true;
}

void appendLog(const std::string &log) {
    if (logFile == nullptr || !enableDebugLog) return;
    fprintf(logFile, "%s\n", log.c_str());
    if (++writeLogLineCount % 5 == 0) {
        fflush(logFile);
    }
}

pid_t findSulogFdOwnerPid() {
    DIR *procDir = opendir("/proc");
    if (!procDir) {
        return -1;
    }
    while (dirent *procEntry = readdir(procDir)) {
        if (procEntry->d_type != DT_DIR || !isNumeric(procEntry->d_name)) {
            continue;
        }
        string fdListPath = "/proc/" + string(procEntry->d_name) + "/fd";
        DIR *fdDir = opendir(fdListPath.c_str());
        if (!fdDir) {
            continue;
        }
        while (dirent *fdEntry = readdir(fdDir)) {
            string currentFdPath = fdListPath + string("/") + string(fdEntry->d_name);
            char fdLinkString[1024];
            ssize_t readLength = readlink(currentFdPath.c_str(), fdLinkString, sizeof(fdLinkString));
            if (readLength < 0) {
                continue;
            }
            fdLinkString[readLength] = '\0';
            if (std::strcmp(fdLinkString, SULOG_FD_LINK) == 0) {
                LOGI("Found su log fd owner pid:%s", procEntry->d_name);
                auto pid = static_cast<pid_t>(strtol(procEntry->d_name, nullptr, 10));
                if (pid == 0) {
                    LOGE("Failed to get pid from proc entry name!");
                    continue;
                }
                closedir(fdDir);
                closedir(procDir);
                LOGI("Return su log fd owner pid");
                return pid;
            }
        }
        closedir(fdDir);
    }
    closedir(procDir);
    return -1;
}

inline string getProcessCmdline(pid_t pid) {
    string statFilePath = "/proc/" + to_string(pid) + "/cmdline";
    string cmdline;
    if (readProcFile(statFilePath, cmdline)) {
        size_t nullPos = cmdline.find('\0');
        if (nullPos != string::npos) {
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

bool utilInit(bool useDebugLog) {
    if (useDebugLog) {
        enableDebugLog = useDebugLog;
        logFile = fopen("/data/local/SuToaster.log", "w");
        if (logFile == nullptr) {
            LOGW("Failed to open module log file");
        }
    }
    zygotePid = getPidByName("zygote");
    zygote64Pid = getPidByName("zygote64");
    appendLog("Zygote pid:" + to_string(zygotePid) + " zygote64 pid:" + to_string(zygote64Pid));
    return zygotePid > 1 || zygote64Pid > 1;
}

bool tryKillFdOwnerProcess() {
    /*
     * 开启sulog后启动的ksud进程名
     * 如果是启动后才开启该功能 进程名会不同
     * 但我选择初始化时如果sulog未开启直接退出
     * */
    pid_t fdOwnerPid = findSulogFdOwnerPid();
    if (fdOwnerPid < 0) {
        LOGE("Failed to find su log fd owner pid");
        return false;
    }
    LOGI("Sulog fd owner pid:%d", fdOwnerPid);
    if (fdOwnerPid > 1) {
        kill(fdOwnerPid, SIGKILL);
        //等待退出
        for (int i = 0; i < 25; ++i) { // 500ms
            if (kill(fdOwnerPid, 0) == -1 && errno == ESRCH) break;
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
        if (errno == EBUSY) {
            LOGW("Get su log fd failed,trying kill fd owner process...");
            if (tryKillFdOwnerProcess()) {
                LOGI("Process killed.Try get su log fd again");
                //再次尝试获取
                fd = ioctl(driverFd, KSU_IOCTL_GET_SULOG_FD, &suLog_cmd);
            }
        }
        //获取之后重新判断
        if (fd < 0) {
            LOGE("Get su log fd failed,errno:%d", errno);
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
        string ppidStr = (ppidEnd == string::npos) ? line.substr(ppidStart) : line.substr(ppidStart, ppidEnd - ppidStart);
        char *end = nullptr;
        long v = strtol(ppidStr.c_str(), &end, 10);
        if (end == ppidStr.c_str() || *end != '\0') return -1;
        return static_cast<pid_t>(v);
    }
    return -1;
}

AndroidAppInfo queryAndroidApplicationInfo(pid_t pid, short depth) {
    appendLog("Querying android app info for pid:" + to_string(pid));
    pid_t targetPpid = getPpid(pid);
    //不可能有Android应用pid小于100
    if (targetPpid < 100) {
        appendLog("Target pid less than 100,not an android app");
        return {false, pid, ""};
    }
    bool parentIsZygote = targetPpid == zygotePid || targetPpid == zygote64Pid;
    //尝试深度搜索
    if (!parentIsZygote && depth > 0) {
        appendLog("Trying to find android app info with depth:" + to_string(depth));
        pid_t currentProcessPpid = targetPpid;
        pid_t newTargetPpid = targetPpid;
        bool parentPpidIsZygote = parentIsZygote;
        for (short i = 0; i < depth; ++i) {
            currentProcessPpid = newTargetPpid;
            newTargetPpid = getPpid(newTargetPpid);
            parentPpidIsZygote = newTargetPpid == zygotePid || newTargetPpid == zygote64Pid;
            if (parentPpidIsZygote || newTargetPpid < 100) break;
        }
        appendLog("Found android app info with depth:" + to_string(depth) +
                  " ppid:" + to_string(currentProcessPpid) +
                  " cmdline:" + getProcessCmdline(currentProcessPpid));
        return {parentPpidIsZygote, currentProcessPpid, parentPpidIsZygote ? getProcessCmdline(currentProcessPpid) : ""};
    }
    //是android应用了 再加个包名
    appendLog("Found android app info without depth ppid:" + to_string(pid) +
              " cmdline:" + getProcessCmdline(pid));
    return {parentIsZygote, pid, parentIsZygote ? getProcessCmdline(pid) : ""};
}

void deleteSuLogFile() {
    DIR *dir = opendir("/data/adb/ksu/log");
    if (!dir) {
        LOGW("Failed to open KernelSU log directory!");
        return;
    }
    while (struct dirent *entry = readdir(dir)) {
        if (entry->d_type != DT_REG) continue;
        if (strstr(entry->d_name, "sulog-") != nullptr &&
            strstr(entry->d_name, ".log") != nullptr) {
            string path = "/data/adb/ksu/log/" + string(entry->d_name);
            if (unlink(path.c_str()) < 0) {
                LOGW("Failed to delete %s", path.c_str());
            }
        }
    }
    closedir(dir);
}