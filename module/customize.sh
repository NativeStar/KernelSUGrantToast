#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
checkSuLogEnabled() {
    v="$($KSUD feature get sulog 2>/dev/null | awk -F': *' '/^Value:/ {print $2; exit}')"
    [ "$v" = "1" ]
}
echo "Welcome"
#仅限ksu使用
if [ ! "$KSU" ]; then
  abort "This module only support KernelSU!"
fi
if [ "$KSU_KERNEL_VER_CODE" -lt 32457 ]; then
  abort "Please update KernelSU!(Minimum version required 32457)"
fi
#判断旧进程是否存在
oldProcessPid=$(pidof SuToaster)
if [ "$oldProcessPid" ]; then
  echo "Killing old process..."
  kill -9 "$oldProcessPid"
fi
#检查suLog功能状态 没开启则强提醒
if ! checkSuLogEnabled; then
  echo "警告:"
  echo "SuLog功能当前未启用"
  echo "请在重启设备前在管理器内打开SuLog功能"
  echo "此模块完全依赖SuLog功能工作"
  echo "Warning:"
  echo "The SuLog feature is currently disabled"
  echo "Please enable SuLog in KernelSU manager before rebooting the device"
  echo "This module requires SuLog to be enabled"
  sleep 3
fi
#重要警告 双语显示吧
echo "该项目仅在官方版本KernelSU上进行测试"
echo "不保证在其他分支版本上正常工作"
echo "This project only test on official KernelSU"
echo "It is not guaranteed to work properly on other branch versions"
sleep 3
echo "警告:"
echo "由于该模块接管了原本ksud进程的数据"
echo "在安装后原本的SU日志将不再被记录"
echo "也无法在管理器中查看Su日志"
echo "这是正常现象 不必惊慌"
echo "安装将在5秒后继续"
echo "WARNING:"
echo "Because this module takes over data from the ksud process"
echo "The original SuLog will no longer be recorded"
echo "SuLog can no longer be viewed in the manager"
echo "This is normal. No need to be alarmed"
echo "Module installation will continue in 5 seconds"
sleep 5
echo "Extracting libraries..."
#sleep没什么意义 但好玩
sleep 0.3
#so
unzip -oj "$MODPATH/daemon.apk" 'lib/arm64-v8a/libshimizu.so' -d "$MODPATH"
mv -f "$MODPATH/libshimizu.so" "$MODPATH/Shimizu"
#dex
sleep 0.1
unzip -oj "$MODPATH/daemon.apk" 'classes.dex' -d "$MODPATH"
mv -f "$MODPATH/classes.dex" "$MODPATH/daemon.dex"
sleep 0.1
set_perm "$MODPATH/Shimizu" 0 0 0755
set_perm "$MODPATH/daemon.dex" 0 0 0755
rm -f "$MODPATH/daemon.apk"
echo "Setting description..."
"$KSUD" module config set --temp override.description "[Waiting reboot]Show a root granted toast like Magisk.Require SuLog enabled."
echo "Installation successful!"
echo "Please reboot for changes to take effect"