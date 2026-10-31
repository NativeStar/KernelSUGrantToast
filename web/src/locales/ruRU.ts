import type BaseLang from "./zhCN"

const RussianKeys: typeof BaseLang = {
  "text.save": "Сохранить",
  "text.save.failed": "Не удалось сохранить из-за неизвестной ошибки",
  "text.save.success": "Сохранено",
  "text.reboot.tip": "Для применения этого изменения конфигурации требуется перезагрузка устройства",
  "text.ok": "OK",
  "text.cancel": "Отмена",
  "text.detail": "Подробнее",
  "text.followSystem": "Как в системе",

  "error.title": "Произошла ошибка",
  "error.missingProcess": "Процесс модуля завершил работу. Пожалуйста, перезагрузите устройство.\nВы всё ещё можете использовать WebUI для настройки параметров",

  "tabs.advanced": "Расшир.",
  "tabs.ignorePackage": "Список исключений",
  "tabs.base": "Основные",
  "tabs.about": "Инфо",
  "text.reset.success": "Настройки по умолчанию восстановлены",

  "language.label": "Язык",
  "language.select": "Выберите язык",

  "theme.label": "Тема",
  "theme.select": "Выберите тему",
  "theme.dark": "Тёмная",
  "theme.light": "Светлая",

  "toast.custom.title": "Пользовательский текст уведомления",
  "toast.custom.placeholder": "%s was granted Superuser rights", // Оригинальная фраза Magisk, не изменяйте её
  "toast.custom.description": "Должен содержать плейсхолдер '%s' и быть короче 64 символов",
  "toast.save.reset.success": "Текст уведомления по умолчанию восстановлен",
  "toast.save.error.invalidLength": "Длина сообщения должна быть менее 64 символов",
  "toast.save.error.missionPlaceholder": "Сообщение должно содержать плейсхолдер '%s'",
  "toast.save.error.tooManyPlaceholders": "Разрешен только один плейсхолдер",
  "toast.vibration.label": "Длительность вибрации при выдаче Root",
  "toast.vibration.description": "Длительность виброотклика, добавляемого при появлении всплывающего уведомления, в миллисекундах",
  "toast.vibration.description.detail": "Вибрация длительностью 100 мс или меньше обычно ощущается комфортно. Установите 0, чтобы отключить эту функцию",
  "toast.vibration.unsupported": "Эта функция поддерживается только на Android 12 и новее\nМинимальная версия Android, требуемая Менеджером KernelSU — 12. Как вы его установили?",
  "enableWebHaptic.label": "Виброотклик WebUI",
  "enableWebHaptic.detail": "Обеспечивает виброотклик при нажатии кнопок, изменении настроек и т.д.\nОбратите внимание, что выключение этого переключателя не отключит виброотклик, добавляемый самим WebView (например, при длительном нажатии на определенные элементы управления).",

  "ignorePackage.tip": "Запросы от приложений из этого списка не будут вызывать всплывающее уведомление Superuser",
  "ignorePackage.tip.longPress": "Удерживайте, чтобы добавить имя пакета вручную",
  "ignorePackage.add.dialog.custom.description": "Введите имя пакета приложения для добавления",
  "ignorePackage.add.dialog.customPackageName.placeholder": "имя пакета приложения",
  "ignorePackage.delete.confirm.title": "Подтверждение удаления",
  "ignorePackage.delete.confirm.description": "Вы уверены, что хотите удалить это приложение из списка игнорирования?",
  "ignorePackage.add": "Добавить приложение",
  "ignorePackage.add.dialog.description": "Нажмите на приложение, чтобы добавить его",
  "ignorePackage.add.dialog.search.placeholder": "Фильтр по названию или пакету",
  "ignorePackage.add.exist": "Это приложение уже находится в списке",
  "ignorePackage.showSystemApps.label": "Показывать системные приложения",

  "autoDeleteLog.label": "Автоудаление логов",
  "autoDeleteLog.detail": "Автоматически удалять логи SuLog, создаваемые во время загрузки после завершения инициализации. Это предотвращает накопление файлов логов и загромождение памяти, но может затруднить отправку отчетов об ошибках, так как эти логи могут быть полезны.",
  "longTimeToast.label": "Увеличенная длительность уведомлений",
  "longTimeToast.detail": "Сделать так, чтобы всплывающее уведомление оставалось на экране дольше. Это может не работать на некоторых системах. Из-за ограничений Android эту длительность нельзя настроить более точечно.",

  "advanced.warning": "Неправильные настройки на этой странице могут повлиять на производительность или вызвать сбои",
  "advanced.searchDepth.label": "Глубина поиска пакетов",
  "advanced.searchDepth.save.failed.invalid": "Неверный ввод, значение должно быть от 0 до 32",
  "advanced.searchDepth.description": "Введите значение от 0 до 32. По умолчанию: 1",
  "advanced.searchDepth.description.detail": "Слишком высокое значение может ухудшить производительность, а слишком низкое — привести к игнорированию некоторых данных о повышении привилегий.\nЭта настройка вступает в силу только при столкновении с приложениями, имеющими общие UID (для которых требуется откат к старой логике определения).",
  "advanced.enableDebugLog.label": "Включить отладочные логи",
  "advanced.enableDebugLog.detail": "Включение этого параметра приведет к записи логов в '/data/local/SuToaster.log'. Для вступления изменений в силу требуется перезагрузка устройства.\nВключение этой функции окажет определенное влияние на производительность. Включайте её только тогда, когда вам нужно отправить логи.",
  "advanced.test.showDebugToastButton": "Показать тестовое уведомление",
  "advanced.test.showDebugToastButton.description": "Нажмите, чтобы показать тестовое уведомление, используемое только для устранения неполадок при возникновении проблем. (Удерживайте, чтобы показать уведомление с увеличенной длительностью)",
  "advanced.internalCooldown.label": "Задержка уведомлений",
  "advanced.internalCooldown.description": "Введите значение от 0 до 10. По умолчанию: 3 секунды",
  "advanced.internalCooldown.description.detail": "Когда получается запрос superuser от определенного приложения, последующие запросы от этого приложения будут игнорироваться в течение настроенной длительности.\nКороткая длительность может вызывать появление множества всплывающих окон подряд.",
  "advanced.internalCooldown.save.failed.invalid": "Неверный ввод, значение должно быть от 0 до 10",

  "about.description": "Всплывающее уведомление о предоставлении прав Root, как в Magisk",
  "about.button.repository": "Репозиторий проекта",
  "about.otherProjects.title": "Другие проекты",
  "about.otherProjects.description.kyouka": "Многофункциональное расширение для браузера, поддерживающее изменение веб-страниц, перехват вызовов, экспорт данных и многое другое",
  "about.otherProjects.description.connector.windows": "Передача файлов между телефоном и ПК по локальной сети, пересылка уведомлений и многое другое (версия для Windows)",
  "about.otherProjects.description.connector.android": "Передача файлов и текста между телефоном и ПК по локальной сети, пересылка уведомлений и многое другое (версия для Android)",
  "about.otherProjects.description.ruru": "Форк известного детектора списка приложений с более сильным детектированием и поддержкой пользовательских целевых приложений",
  "about.easterEgg": "Проза"
}

export default RussianKeys;
