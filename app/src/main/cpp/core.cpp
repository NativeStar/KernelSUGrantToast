#include "jni.h"
#include "android/log.h"
#include <cstdio>
#include <unistd.h>
#include <asm-generic/fcntl.h>
#include "sys/epoll.h"
#include "sys/prctl.h"
#include "thread"
#include "util.h"
#include "map"
#include "ctime"

#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "KernelSuGrantToast", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "KernelSuGrantToast", __VA_ARGS__)
#define TASK_COMM_LEN  16
#define KSU_EVENT_TYPE_DROPPED 0xFFFFu
#define KSU_SULOG_EVENT_ROOT_EXECVE 1u
#define KSU_SULOG_EVENT_SUCOMPAT 2u
static JavaVM *jvm = nullptr;
static jclass globalEntryClass = nullptr;
static jmethodID onFallbackSuEventJavaMethod = nullptr;
static jmethodID onNewSuEventJavaMethod = nullptr;
static std::map<uint32_t, time_t> toastedApplication;
static std::map<uint32_t, time_t> ignoredProcess;
static std::map<uint32_t, time_t> ignoredUid;
static short packageSearchDepth = 1;
static bool autoDeleteLog = false;

struct __attribute__((packed)) EventRecordHeader {
    uint16_t record_type;
    uint16_t flags;
    uint32_t payload_len;
    uint64_t seq;
    uint64_t ts_ns;
};

struct __attribute__((packed)) SulogEventHeader {
    uint16_t version;
    uint16_t event_type;
    int32_t retval;
    uint32_t pid, tgid, ppid, uid, euid;
    char comm[TASK_COMM_LEN];
    uint32_t filename_len, argv_len;
};

void pushToastedApplicationMap(uint32_t pid, time_t timestamp) {
    if (toastedApplication.size() > 4) {
        toastedApplication.erase(toastedApplication.begin());
    }
    toastedApplication[pid] = timestamp;
}

void pushIgnoredProcessMap(uint32_t pid, time_t timestamp) {
    if (ignoredProcess.size() > 8) {
        ignoredProcess.erase(ignoredProcess.begin());
    }
    ignoredProcess[pid] = timestamp;
}

void pushIgnoredUidMap(uint32_t pid, time_t timestamp) {
    if (ignoredUid.size() > 8) {
        ignoredUid.erase(ignoredUid.begin());
    }
    ignoredUid[pid] = timestamp;
}

//对于有sharedUserId的应用 靠uid判断具体提权是不稳定的 需要回退到老逻辑
void processSuEvent(JNIEnv *threadJniEnv, uint32_t uid, uint32_t ppid) {
    time_t currentTime = time(nullptr);
    auto findUidResult = ignoredUid.find(uid);
    if (findUidResult != ignoredUid.end()) {
        if (currentTime - findUidResult->second <= 3) return;
    }
    pushIgnoredUidMap(uid, currentTime);
    threadJniEnv->CallStaticVoidMethod(globalEntryClass, onNewSuEventJavaMethod,
                                       static_cast<int>(uid), static_cast<int>(ppid));
}

void pollingLogEvent(int suLogFd) {
    JNIEnv *localJniEnv;
    jvm->AttachCurrentThread(&localJniEnv, nullptr);
    //Android特色对线程提权
    setresuid(0, 0, 0);
    {
        int fl = fcntl(suLogFd, F_GETFL);
        fcntl(suLogFd, F_SETFL, fl | O_NONBLOCK);
    }
    int epfd = epoll_create1(EPOLL_CLOEXEC);
    epoll_event ev{EPOLLIN | EPOLLERR | EPOLLHUP, {.fd = suLogFd}};
    epoll_ctl(epfd, EPOLL_CTL_ADD, suLogFd, &ev);
    static uint8_t buf[8192];
    epoll_event events[4];
    while (true) {
        int ready = epoll_wait(epfd, events, 4, -1);
        if (ready < 0) {
            if (errno == EINTR) continue;
            break;
        }
        for (int i = 0; i < ready; i++) {
            uint32_t mask = events[i].events;
            if (mask & EPOLLIN) {
                for (;;) {
                    ssize_t n = read(suLogFd, buf, sizeof(buf));
                    if (n <= 0) {
                        if (n < 0 && (errno == EINTR)) continue;
                        if (n < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) break;
                        goto done;
                    }
                    for (size_t off = 0; off + sizeof(EventRecordHeader) <= (size_t) n;) {
                        auto *rec = reinterpret_cast<EventRecordHeader *>(buf + off);
                        size_t frame = sizeof(EventRecordHeader) + rec->payload_len;
                        if (off + frame > (size_t) n) break;
                        if (rec->record_type != KSU_EVENT_TYPE_DROPPED) {
                            auto *hdr = reinterpret_cast<SulogEventHeader *>(buf + off +
                                                                             sizeof(EventRecordHeader));
                            if (rec->payload_len >= sizeof(SulogEventHeader) && hdr->uid != 0 &&
                                hdr->retval == 0) {
//                              //只有这两个是来自第三方的调用 GRANT_ROOT是对管理器自动授权 不要处理
                                if (hdr->event_type == KSU_SULOG_EVENT_ROOT_EXECVE ||
                                    hdr->event_type == KSU_SULOG_EVENT_SUCOMPAT) {
                                    processSuEvent(localJniEnv, hdr->uid, hdr->ppid);
                                }
                            }
                        }
                        off += frame;
                    }
                }
            }
            if (mask & (EPOLLERR | EPOLLHUP)) goto done;
        }
    }
    done:
    close(epfd);
    close(suLogFd);
    jmethodID modifyModuleDescriptionMethod = localJniEnv->GetStaticMethodID(globalEntryClass,
                                                                             "onFatalException",
                                                                             "(Ljava/lang/String;)V");
    jstring description = localJniEnv->NewStringUTF("Error on working,Exited");
    localJniEnv->CallStaticVoidMethod(globalEntryClass, modifyModuleDescriptionMethod, description);
    localJniEnv->DeleteLocalRef(description);
    jvm->DetachCurrentThread();
    LOGE("pollingLogEvent exited");
}

bool handleSuLog() {
    int driverFd = getKernelSuDriver();
    if (driverFd < 0) {
        LOGE("Failed to open kernel su driver");
        return false;
    }
    int suLogFd = getSuLogFd(driverFd);
    close(driverFd);
    if (suLogFd < 0) {
        LOGE("Failed to get Su log fd");
        return false;
    }
    std::thread pollingThread(pollingLogEvent, suLogFd);
    pollingThread.detach();
    if (autoDeleteLog) deleteSuLogFile();
    return true;
}

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *reserved) {
    //保持权限
    JNIEnv *jniEnv;
    jvm = vm;
    vm->GetEnv(reinterpret_cast<void **>(&jniEnv), JNI_VERSION_1_6);
    prctl(PR_SET_KEEPCAPS, 1, 0, 0, 0);
    vm->GetEnv(reinterpret_cast<void **>(&jniEnv), JNI_VERSION_1_6);
    jclass entryClass = jniEnv->FindClass("com/suisho/kernelsugranttoast/Entry");
    globalEntryClass = reinterpret_cast<jclass>(jniEnv->NewGlobalRef(entryClass));
    onFallbackSuEventJavaMethod = jniEnv->GetStaticMethodID(globalEntryClass,
                                                            "jniOnFallbackSuEvent",
                                                            "(Ljava/lang/String;)V");
    onNewSuEventJavaMethod = jniEnv->GetStaticMethodID(globalEntryClass, "jniOnNewSuEvent",
                                                       "(II)V");
    jniEnv->DeleteLocalRef(entryClass);
    return JNI_VERSION_1_6;
}

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_suisho_kernelsugranttoast_Entry_jniInit(JNIEnv *env, jclass clazz, short searchDepth,jboolean deleteLog) {
    packageSearchDepth = searchDepth;
    autoDeleteLog = deleteLog;
    if (!utilInit()) return false;
    if (!handleSuLog()) return false;
    LOGI("JNI utilInit successful");
    return true;
}
extern "C"
JNIEXPORT void JNICALL
Java_com_suisho_kernelsugranttoast_Entry_jniSetUid(JNIEnv *env, jclass clazz, jint uid) {
    setresuid(uid, uid, 0);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_suisho_kernelsugranttoast_Entry_jniProcessSharedUidApplication(JNIEnv *threadJniEnv,
                                                                        jclass clazz,
                                                                        jint ppid) {
    time_t currentTime = time(nullptr);
    //限制相同ppid
    auto findPpidResult = ignoredProcess.find(ppid);
    if (findPpidResult != ignoredProcess.end()) {
        //相同ppid的请求每3秒最多处理一个
        if (currentTime - findPpidResult->second <= 3) {
            //避免toast无法显示
            setresuid(1000, 1000, 0);
            return;
        }
    }
    pushIgnoredProcessMap(ppid, currentTime);
    AndroidAppInfo appInfo = queryAndroidApplicationInfo(static_cast<pid_t>(ppid),
                                                         packageSearchDepth);
    if (appInfo.isAndroidApp && !appInfo.cmdline.empty()) {
        auto findToastedApplicationResult = toastedApplication.find(appInfo.realPid);
        if (findToastedApplicationResult != toastedApplication.end()) {
            //是Android应用且拥有相同pid 提醒至少间隔5秒
            if (currentTime - findToastedApplicationResult->second <= 5) {
                setresuid(1000, 1000, 0);
                return;
            }
        }
        pushToastedApplicationMap(appInfo.realPid, currentTime);
        jstring cmd = threadJniEnv->NewStringUTF(appInfo.cmdline.c_str());
        threadJniEnv->CallStaticVoidMethod(globalEntryClass, onFallbackSuEventJavaMethod, cmd);
        threadJniEnv->DeleteLocalRef(cmd);
    }
    setresuid(1000, 1000, 0);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_suisho_kernelsugranttoast_Entry_updatePackageSearchDepth(JNIEnv *env, jclass clazz,
                                                                  jshort value) {
    packageSearchDepth = value;
}