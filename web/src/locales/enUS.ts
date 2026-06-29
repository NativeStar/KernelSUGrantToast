import type BaseLang from "./zhCN"
const EnglishKeys: typeof BaseLang = {
  "text.save": "Save",
  "text.save.failed": "Save failed due to an unknown error",
  "text.save.success": "Saved",
  "text.reboot.tip": "Reboot device to apply changes",
  "text.ok": "OK",
  "text.cancel": "Cancel",
  "text.detail": "Details",
  "text.followSystem": "Follow System",


  "tabs.advanced": "Advanced",
  "tabs.ignorePackage": "Ignore List",
  "tabs.base": "Basic",
  "tabs.about": "About",

  "language.label": "Language",
  "language.select": "Select Language",

  "theme.label": "Theme",
  "theme.select": "Select Theme",
  "theme.dark": "Dark",
  "theme.light": "Light",

  "toast.custom.title": "Custom Toast Message",
  "toast.custom.placeholder": "%s was granted Superuser rights",//Magisk提示原句 不要改
  "toast.custom.description": "Must contain the '%s' placeholder and be fewer than 64 characters",
  "toast.save.reset.success": "Default toast message restored",
  "toast.save.error.invalidLength": "Message length must be less than 64 characters",
  "toast.save.error.missionPlaceholder": "Message must contain '%s' placeholder",
  "toast.save.error.tooManyPlaceholders": "Only one placeholder is allowed",

  "ignorePackage.tip": "Requests from apps in this list will not trigger a superuser toast",
  "ignorePackage.delete.confirm.title": "Confirm Removal",
  "ignorePackage.delete.confirm.description": "Are you sure you want to remove this app from the ignore list?",
  "ignorePackage.add": "Add Application",
  "ignorePackage.add.dialog.description": "Click an app to add it",
  "ignorePackage.add.dialog.search.placeholder": "Filter by app name or package name",
  "ignorePackage.add.exist": "This application is already in the list",

  "autoDeleteLog.label": "Auto-delete logs",
  "autoDeleteLog.detail": "Automatically delete SuLog logs generated during startup after initialization is complete. This can prevent log files from piling up and taking up storage, but may make it harder to report issues because these log files may be useful.",

  "advanced.warning": "Improper settings on this page may affect performance or cause malfunctions",
  "advanced.searchDepth.reset.success": "Reset to default",
  "advanced.searchDepth.label": "Package Search Depth",
  "advanced.searchDepth.save.failed.invalid": "Invalid input, should be between 0 and 32",
  "advanced.searchDepth.description": "Enter a value between 0 and 32. Default: 1",
  "advanced.searchDepth.description.detail": "Setting this too high may hurt performance, while setting it too low may cause some privilege-escalation data to be ignored. This setting only takes effect when encountering apps with shared UIDs (which require falling back to the old detection logic).",

  "about.description": "Show a root granted toast like Magisk",
  "about.button.repository": "Project Repository",
  "about.otherProjects.title": "Other Projects",
  "about.otherProjects.description.kyouka": "A versatile browser extension that supports modifying web pages, intercepting calls, exporting data, and more",
  "about.otherProjects.description.connector.windows": "Transfer files between phone and PC over a local network, forward notifications, and more (Windows side)",
  "about.otherProjects.description.connector.android": "Transfer files and text between phone and PC over a local network, forward notifications, and more (Android side)",
  "about.otherProjects.description.ruru": "A fork of a well-known app list detector, with stronger detection and support for custom target apps",

}
export default EnglishKeys;
