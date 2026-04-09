#!/system/bin/sh
KSUD=/data/adb/ksud
checkSuLogEnabled() {
    v="$($KSUD feature get sulog 2>/dev/null | awk -F': *' '/^Value:/ {print $2; exit}')"
    [ "$v" = "1" ]
}
echo "Welcome"
#仅限ksu使用
if [ ! "$KSU" ]; then
  echo "This module only support KernelSU!"
  exit 1
fi
if [ "$KSU_KERNEL_VER_CODE" -lt 32457 ]; then
  echo "Please update KernelSU!(Minimum version required 32457)"
  echo "Please update both the manager and the kernel!"
  exit 1
fi
#检查suLog功能状态 没开启则强提醒
if ! checkSuLogEnabled; then
  echo "警告:"
  echo "请在重启前在管理器内打开SuLog功能"
  echo "此模块依赖SuLog功能工作"
  echo "Warning"
  echo "Please enable SuLog in KernelSU manager before reboot"
  echo "This module only working with SuLog enabled"
  sleep 3
fi
#重要警告 双语显示吧
echo "警告:"
echo "由于该模块接管了原本ksud进程的数据"
echo "在安装后原本的SU日志将不再被记录"
echo "也无法在管理器中查看SuLog"
echo "这是正常现象 不必惊慌"
echo "WARNING:"
echo "Due to the module takes over the data of ksud process"
echo "The original SU log will no longer be recorded"
echo "And SuLog cannot be viewed in the manager"
echo "This is normal. No need to be alarmed."
sleep 5
echo "Extracting files..."
unzip -oj "$MODPATH/daemon.apk" 'lib/arm64-v8a/libshimizu.so' -d "$MODPATH"
mv -f "$MODPATH/libshimizu.so" "$MODPATH/Shimizu"
set_perm "$MODPATH/Shimizu" 0 0 0755
echo "Install successful!"
echo "Please reboot to take effect"