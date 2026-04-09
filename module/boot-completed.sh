#!/system/bin/sh
MODDIR=${0%/*};
KSUD=/data/adb/ksud
checkSuLogEnabled() {
    v="$($KSUD feature get sulog 2>/dev/null | awk -F': *' '/^Value:/ {print $2; exit}')"
    [ "$v" = "1" ]
}
#必须启用SuLog
if ! checkSuLogEnabled; then
  desc="(❌Please enable SuLog and reboot!)Show a root granted toast like Magisk.Require SuLog enabled."
  sed -i "s/description=.*/description=$desc/" "$MODDIR/module.prop"
  exit 1
fi
exec /system/bin/app_process -Djava.class.path=./daemon.apk / --nice-name=KsuGrantToast com.suisho.kernelsugranttoast.Entry "$@"