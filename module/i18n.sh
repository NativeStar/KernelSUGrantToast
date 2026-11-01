#!/system/bin/sh

get_module_locale() {
  MODULE_LOCALE=$(settings get system system_locales 2>/dev/null | cut -d',' -f1)
  if [ -z "$MODULE_LOCALE" ] || [ "$MODULE_LOCALE" = "null" ]; then
    MODULE_LOCALE=$(getprop persist.sys.locale 2>/dev/null)
  fi
  if [ -z "$MODULE_LOCALE" ] || [ "$MODULE_LOCALE" = "null" ]; then
    MODULE_LOCALE=$(getprop ro.product.locale 2>/dev/null)
  fi
  if [ -z "$MODULE_LOCALE" ] || [ "$MODULE_LOCALE" = "null" ]; then
    MODULE_CONFIG=$(cmd activity get-config 2>/dev/null |
      grep -m1 '^config:' |
      sed 's/^config:[[:space:]]*//' |
      cut -d',' -f1)
    MODULE_LANGUAGE=$(printf '%s' "$MODULE_CONFIG" |
      tr '-' '\n' |
      grep -m1 -E '^[a-z]{2,3}$')
    MODULE_REGION=$(printf '%s' "$MODULE_CONFIG" |
      tr '-' '\n' |
      grep -m1 -E '^r[A-Z]{2}$' |
      cut -c2-)
    if [ -n "$MODULE_LANGUAGE" ]; then
      MODULE_LOCALE="$MODULE_LANGUAGE"
      if [ -n "$MODULE_REGION" ]; then
        MODULE_LOCALE="$MODULE_LOCALE-$MODULE_REGION"
      fi
    fi
  fi
  if [ -z "$MODULE_LOCALE" ] || [ "$MODULE_LOCALE" = "null" ]; then
    MODULE_LANGUAGE=$(getprop persist.sys.language 2>/dev/null)
    MODULE_REGION=$(getprop persist.sys.country 2>/dev/null)
    MODULE_LOCALE="$MODULE_LANGUAGE"
    if [ -n "$MODULE_REGION" ]; then
      MODULE_LOCALE="$MODULE_LOCALE-$MODULE_REGION"
    fi
  fi

  MODULE_LOCALE=$(printf '%s' "$MODULE_LOCALE" |
    tr '_' '-' |
    tr '[:upper:]' '[:lower:]')
  export KSU_GRANT_TOAST_LOCALE="$MODULE_LOCALE"
  case "$MODULE_LOCALE" in
    ru|ru-*)
      MSG_WELCOME="Добро пожаловать"
      MSG_KERNELSU_ONLY="Модуль поддерживает только KernelSU!"
      MSG_ARM64_ONLY="Модуль поддерживает только устройства arm64!"
      MSG_UPDATE_KSU="Обновите KernelSU! (требуется версия не ниже 32457)"
      MSG_KILLING_OLD="Завершение старого процесса..."
      MSG_TESTED_OFFICIAL="Проект тестировался только на официальной версии KernelSU"
      MSG_FORK_WARNING="Работа на других форках не гарантируется"
      MSG_WARNING="Внимание:"
      MSG_TAKES_OVER="Модуль перехватывает данные исходного процесса логирования."
      MSG_LOG_NOT_RECORDED="После установки исходные логи Su больше не будут записываться."
      MSG_LOG_UNAVAILABLE="Просмотр логов Su в менеджере также станет недоступен."
      MSG_NORMAL="Это нормально, не беспокойтесь."
      MSG_CONTINUE_IN="Установка продолжится через 5 секунд."
      MSG_EXTRACTING="Извлечение библиотек..."
      MSG_SETTING_DESCRIPTION="Настройка описания..."
      MSG_INSTALL_SUCCESS="Установка завершена успешно!"
      MSG_REBOOT="Перезагрузите устройство, чтобы изменения вступили в силу."
      DESC_DISABLED="(❌Отключён)Показывает уведомление при предоставлении root-доступа, как в Magisk."
      DESC_WAITING="[Ожидание перезагрузки]Показывает уведомление при предоставлении root-доступа, как в Magisk."
      DESC_BOOTING="[Запуск...]Показывает уведомление при предоставлении root-доступа, как в Magisk."
      ;;
    zh-hant*|zh-tw*|zh-hk*|zh-mo*)
      MSG_WELCOME="歡迎"
      MSG_KERNELSU_ONLY="此模組僅支援 KernelSU！"
      MSG_ARM64_ONLY="此模組僅支援 arm64 裝置！"
      MSG_UPDATE_KSU="請更新 KernelSU！（最低需要 32457 版本）"
      MSG_KILLING_OLD="正在終止舊程序..."
      MSG_TESTED_OFFICIAL="此專案僅在官方版本 KernelSU 上測試"
      MSG_FORK_WARNING="不保證能在其他分支版本上正常運作"
      MSG_WARNING="警告："
      MSG_TAKES_OVER="此模組會接管原本日誌程序的資料。"
      MSG_LOG_NOT_RECORDED="安裝後，原本的 Su 日誌將不再記錄。"
      MSG_LOG_UNAVAILABLE="也無法在管理器中查看 Su 日誌。"
      MSG_NORMAL="這是正常現象，請勿擔心。"
      MSG_CONTINUE_IN="安裝將於 5 秒後繼續。"
      MSG_EXTRACTING="正在解壓縮程式庫..."
      MSG_SETTING_DESCRIPTION="正在設定模組描述..."
      MSG_INSTALL_SUCCESS="安裝成功！"
      MSG_REBOOT="請重新啟動裝置以套用變更。"
      DESC_DISABLED="(❌已停用)像 Magisk 一樣，在授予 root 權限時顯示提示。"
      DESC_WAITING="[等待重新啟動]像 Magisk 一樣，在授予 root 權限時顯示提示。"
      DESC_BOOTING="[啟動中...]像 Magisk 一樣，在授予 root 權限時顯示提示。"
      ;;
    zh*)
      MSG_WELCOME="欢迎"
      MSG_KERNELSU_ONLY="此模块仅支持 KernelSU！"
      MSG_ARM64_ONLY="此模块仅支持 arm64 设备！"
      MSG_UPDATE_KSU="请更新 KernelSU！（最低需要 32457 版本）"
      MSG_KILLING_OLD="正在结束旧进程..."
      MSG_TESTED_OFFICIAL="此项目仅在官方版本 KernelSU 上测试"
      MSG_FORK_WARNING="不保证能在其他分支版本上正常运行"
      MSG_WARNING="警告："
      MSG_TAKES_OVER="此模块会接管原有日志进程的数据。"
      MSG_LOG_NOT_RECORDED="安装后，原有 Su 日志将不再记录。"
      MSG_LOG_UNAVAILABLE="也无法在管理器中查看 Su 日志。"
      MSG_NORMAL="这是正常现象，请不必担心。"
      MSG_CONTINUE_IN="安装将在 5 秒后继续。"
      MSG_EXTRACTING="正在解压库文件..."
      MSG_SETTING_DESCRIPTION="正在设置模块描述..."
      MSG_INSTALL_SUCCESS="安装成功！"
      MSG_REBOOT="请重启设备以使更改生效。"
      DESC_DISABLED="(❌已禁用)像 Magisk 一样，在授予 root 权限时显示提示。"
      DESC_WAITING="[等待重启]像 Magisk 一样，在授予 root 权限时显示提示。"
      DESC_BOOTING="[启动中...]像 Magisk 一样，在授予 root 权限时显示提示。"
      ;;
    *)
      MSG_WELCOME="Welcome"
      MSG_KERNELSU_ONLY="This module only supports KernelSU!"
      MSG_ARM64_ONLY="This module only supports arm64 devices!"
      MSG_UPDATE_KSU="Please update KernelSU! (Minimum version required: 32457)"
      MSG_KILLING_OLD="Killing old process..."
      MSG_TESTED_OFFICIAL="This project has only been tested on the official KernelSU release"
      MSG_FORK_WARNING="Compatibility with other forks is not guaranteed"
      MSG_WARNING="WARNING:"
      MSG_TAKES_OVER="This module takes over data from the original logger process."
      MSG_LOG_NOT_RECORDED="The original Su logs will no longer be recorded after installation."
      MSG_LOG_UNAVAILABLE="Su logs will also no longer be available in the manager."
      MSG_NORMAL="This is normal. No need to worry."
      MSG_CONTINUE_IN="Installation will continue in 5 seconds."
      MSG_EXTRACTING="Extracting libraries..."
      MSG_SETTING_DESCRIPTION="Setting module description..."
      MSG_INSTALL_SUCCESS="Installation successful!"
      MSG_REBOOT="Please reboot for changes to take effect."
      DESC_DISABLED="(❌Disabled)Shows a root granted toast like Magisk."
      DESC_WAITING="[Waiting for reboot]Shows a root granted toast like Magisk."
      DESC_BOOTING="[Starting...]Shows a root granted toast like Magisk."
      ;;
  esac
}

