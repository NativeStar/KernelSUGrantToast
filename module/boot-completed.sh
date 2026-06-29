#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
checkSuLogEnabled() {
    v="$($KSUD feature get sulog 2>/dev/null | awk -F': *' '/^Value:/ {print $2; exit}')"
    [ "$v" = "1" ]
}
#必须启用SuLog
if ! checkSuLogEnabled; then
  "$KSUD" module config set --temp override.description "[❌Please enable SuLog and reboot!]Show a root granted toast like Magisk.Require SuLog enabled."
  exit 1
fi
customToastText="$($KSUD module config get customToastText)"
ignoredPackages="$($KSUD module config get ignorePackageNames)"
packageSearchDepth="$($KSUD module config get packageSearchDepth)"
autoDeleteLog="$($KSUD module config get autoDeleteLog)"
experimentalSettingHotUpdate="$($KSUD module config get experimentalSettingHotUpdate)"
#根据设置创建ipc管道
if [ "$experimentalSettingHotUpdate" = "true" ]; then
  rm  -f /data/adb/toast_ipc
  mkfifo /data/adb/toast_ipc
else
  rm  -f /data/adb/toast_ipc
fi
exec /system/bin/app_process -Djava.class.path=./daemon.dex / --nice-name=SuToaster com.suisho.kernelsugranttoast.Entry "$customToastText" "$ignoredPackages" "$packageSearchDepth" "$autoDeleteLog"