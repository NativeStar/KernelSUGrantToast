#include <cstring>
#include <string>

#ifndef KERNELSUGRANTTOAST_UTIL_H
#define KERNELSUGRANTTOAST_UTIL_H
#pragma once
typedef struct AndroidAppInfo {
    bool isAndroidApp;
    pid_t realPid;
    std::string cmdline;
} AndroidAppInfo;

bool utilInit();

bool tryKillKsudProcess();

int getKernelSuDriver();

int getSuLogFd(int driverFd);

AndroidAppInfo queryAndroidApplicationInfo(pid_t pid);

#endif //KERNELSUGRANTTOAST_UTIL_H
