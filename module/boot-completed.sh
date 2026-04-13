#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
checkSuLogEnabled() {
    v="$($KSUD feature get sulog 2>/dev/null | awk -F': *' '/^Value:/ {print $2; exit}')"
    [ "$v" = "1" ]
}
#必须启用SuLog
if ! checkSuLogEnabled; then
  "$KSUD" module config set --temp override.description "(❌Please enable SuLog and reboot!)Show a root granted toast like Magisk.Require SuLog enabled."
  exit 1
fi
customToastText="$($KSUD module config get customToastText)"
exec /system/bin/app_process -Djava.class.path=./daemon.apk / --nice-name=SuToaster com.suisho.kernelsugranttoast.Entry "$@" "$customToastText"