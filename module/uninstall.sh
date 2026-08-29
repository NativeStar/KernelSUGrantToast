#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
#清理一些残存的状态
echo "Goodbye"
rm  -f /data/adb/toast_ipc
"$KSUD" module config delete manage.sulog