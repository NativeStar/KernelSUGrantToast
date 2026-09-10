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

bool tryKillFdOwnerProcess();

int getKernelSuDriver();

int getSuLogFd(int driverFd);

void deleteSuLogFile();

AndroidAppInfo queryAndroidApplicationInfo(pid_t pid,short depth);

#endif //KERNELSUGRANTTOAST_UTIL_H
