#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
. "$MODPATH/i18n.sh"
get_module_locale
echo "$MSG_WELCOME"
#仅限ksu使用
if [ ! "$KSU" ]; then
  abort "$MSG_KERNELSU_ONLY"
fi
if [ "$ARCH" != "arm64" ]; then
  abort "$MSG_ARM64_ONLY"
fi
if [ "$KSU_KERNEL_VER_CODE" -lt 32457 ]; then
  abort "$MSG_UPDATE_KSU"
fi
#判断旧进程是否存在
oldProcessPid=$(pidof SuToaster)
if [ "$oldProcessPid" ]; then
  echo "$MSG_KILLING_OLD"
  kill -9 "$oldProcessPid"
fi
echo "$MSG_TESTED_OFFICIAL"
echo "$MSG_FORK_WARNING"
sleep 3
echo "$MSG_WARNING"
echo "$MSG_TAKES_OVER"
echo "$MSG_LOG_NOT_RECORDED"
echo "$MSG_LOG_UNAVAILABLE"
echo "$MSG_NORMAL"
echo "$MSG_CONTINUE_IN"
sleep 5
echo "$MSG_EXTRACTING"
#sleep没什么意义 但好玩
sleep 0.3
#so
unzip -oj "$MODPATH/daemon.apk" 'lib/arm64-v8a/libshimizu.so' -d "$MODPATH"
mv -f "$MODPATH/libshimizu.so" "$MODPATH/Shimizu"
#dex
sleep 0.2
unzip -oj "$MODPATH/daemon.apk" 'classes.dex' -d "$MODPATH"
mv -f "$MODPATH/classes.dex" "$MODPATH/daemon.dex"
sleep 0.2
set_perm "$MODPATH/Shimizu" 0 0 0755
set_perm "$MODPATH/daemon.dex" 0 0 0755
rm -f "$MODPATH/daemon.apk"
echo "$MSG_SETTING_DESCRIPTION"
sed -i "s|^description=.*|description=$DESC_DISABLED|" "$MODPATH/module.prop"
"$KSUD" module config set --temp override.description "$DESC_WAITING"
echo "$MSG_INSTALL_SUCCESS"
echo "$MSG_REBOOT"
