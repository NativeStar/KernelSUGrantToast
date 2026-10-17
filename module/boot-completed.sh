#!/system/bin/sh
KSUD=/data/adb/ksud
export KSU_MODULE=ksuGrantToast
CFG_DIR=/data/adb/ksu/module_configs/ksuGrantToast
# KernelSU 3.x 起模块配置从 TOML 文本改成了 KSUM 二进制格式，但升级时不会
# 迁移旧文件。残留的旧格式 persist.config 会让所有 `ksud module config`
# 调用报 "Invalid config magic"，WebUI 也因此无法读取/保存配置。这里只在
# 检测到该错误时备份旧文件并删除，让 ksud 重建为新格式，不影响旧版内核。
migrate_legacy_config() {
  [ -f "$CFG_DIR/persist.config" ] || return 0
  local err
  err=$("$KSUD" module config get manage.sulog 2>&1 >/dev/null)
  case "$err" in
    *"Invalid config magic"*)
      echo "Migrating legacy module config (TOML -> KSUM)..."
      cp -f "$CFG_DIR/persist.config" "$CFG_DIR/persist.config.toml.bak" &&
        rm -f "$CFG_DIR/persist.config"
      ;;
  esac
}
migrate_legacy_config
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
  kill -9 "$oldProcessPid"
fi
customToastText="$($KSUD module config get customToastText)"
ignoredPackages="$($KSUD module config get ignorePackageNames)"
packageSearchDepth="$($KSUD module config get packageSearchDepth)"
autoDeleteLog="$($KSUD module config get autoDeleteLog)"
enableDebugLog="$($KSUD module config get enableDebugLog)"
longTimeToast="$($KSUD module config get longTimeToast)"
internalToastCooldown="$($KSUD module config get internalToastCooldown)"
#创建ipc管道
rm  -f /data/adb/toast_ipc
mkfifo /data/adb/toast_ipc
"$KSUD" module config set --temp override.description "[Booting...]Show a root granted toast like Magisk."
exec /system/bin/app_process -Djava.class.path=./daemon.dex / --nice-name=SuToaster com.suisho.kernelsugranttoast.Entry "$customToastText" "$ignoredPackages" "$packageSearchDepth" "$autoDeleteLog" "$enableDebugLog" "$longTimeToast" "$internalToastCooldown"