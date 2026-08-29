# KernelSU Grant Toast

[简体中文](https://github.com/NativeStar/KernelSUGrantToast/blob/master/README_zh.md)
[English](https://github.com/NativeStar/KernelSUGrantToast/blob/master/README.md)

##### Make KernelSU display a "Superuser access granted" toast, like Magisk.

### Screenshots

![](./mdAssets/1000132279.png)
![](./mdAssets/1000130680.png)

### Features

- Shows a toast notification when an app gains elevated privileges.
- Supports custom notification text.
- Supports ignoring privilege-grant notifications for specified apps.

### Installation

Download the module package from the Releases page, then select and install it in KernelSU.

After installation, reboot the device for the module to take effect.

This module does not depend on Zygisk or MetaModule.

### Compatibility Notes

This module is intended only for the latest version of KernelSU that supports Su logging, and has only been tested with the official release.

Compatibility with other forks is unknown. In theory, it should work as long as their Su logging implementation has not been modified.

### How It Works

When Su logging is enabled, KernelSU starts a persistent process that receives log data forwarded by the kernel and writes it to a file.

This data is highly real-time, making it fully suitable for event monitoring.

After the module is installed and the device has finished booting, the module kills the original process responsible for writing the logs. It then obtains the file descriptor used to receive the relevant data (only one process can hold this descriptor, so the original process must be terminated) and takes over event handling.

If an Android app is found to have been granted root access, the module retrieves information about the app and displays a notification when the configured conditions are met.

### Notes

Because the process that originally writes the log file is terminated after the device finishes booting, Su logs will no longer be recorded.

To prevent files from accumulating, the module also deletes old log files after it starts.

As a result, you will no longer be able to view Su log data in the manager.

(In theory, the original process could be left running and the module could obtain information by monitoring changes to the log file, but this may have poor performance.)

### Final Note

This module is mainly for fun.

Thanks for using it.
