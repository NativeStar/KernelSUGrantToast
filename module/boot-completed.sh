#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
#接管功能
#一直接管会导致功能被彻底关闭 日志数据也随之消失
# 临时释放一下让他能启动 后续恢复管理阻止改设置
"$KSUD" module config delete manage.sulog
sleep 1
"$KSUD" feature set sulog 1
sleep 1
"$KSUD" module config set manage.sulog true
#杀死旧进程 修复软重启后崩溃
oldProcessPid=$(pidof SuToaster)
if [ "$oldProcessPid" ]; then
  echo "Maybe use soft reboot.Killing old process..."
  kill -9 "$oldProcessPid"
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