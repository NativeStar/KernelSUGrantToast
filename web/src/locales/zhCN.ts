const SimplifiedChineseKeys = {
    "text.save": "保存",
    "text.save.success": "保存成功",
    "text.save.failed": "由于未知异常,配置保存失败",
    "text.reboot.tip":"需要重启设备以应用更改",
    "text.ok": "确定",
    "text.cancel": "取消",
    "text.detail":"详情",
    "text.followSystem": "跟随系统",

    "tabs.base": "基础",
    "tabs.ignorePackage": "忽略列表",
    "tabs.advanced": "高级",
    "tabs.about": "关于",

    "language.label": "语言",
    "language.select": "选择语言",

    "theme.label":"主题模式",
    "theme.select": "选择主题模式",
    "theme.light": "浅色",
    "theme.dark": "深色",

    "toast.custom.title": "自定义提示消息",
    "toast.custom.placeholder": "%s 已被授予超级用户权限",
    "toast.custom.description": "须带有'%s'占位符用于显示应用名且长度小于64字符",
    "toast.save.reset.success": "已恢复默认提示消息",
    "toast.save.error.invalidLength": "消息长度需小于64字符",
    "toast.save.error.missionPlaceholder": "消息需带有'%s'占位符",
    "toast.save.error.tooManyPlaceholders":"只允许存在一个占位符",

    "ignorePackage.tip":"在列表中的应用发起提权将不会提醒",
    "ignorePackage.delete.confirm.title":"确认移除",
    "ignorePackage.delete.confirm.description":"确认将此应用从忽略列表中移除?",
    "ignorePackage.add":"添加应用",
    "ignorePackage.add.dialog.description":"点击应用项以添加",
    "ignorePackage.add.dialog.search.placeholder":"根据应用名或包名过滤",
    "ignorePackage.add.exist":"此应用已在列表中",
    "ignorePackage.showSystemApps.label":"显示系统应用",

    "autoDeleteLog.label":"自动删除日志",
    "autoDeleteLog.detail":"初始化完成后自动删除启动时生成的SuLog日志 可避免日志文件堆积占用存储 但可能不利于反馈异常(这些日志文件可能有用)",

    "advanced.warning":"该页面设置调整不当可能影响性能或导致工作异常",
    "advanced.searchDepth.reset.success":"已恢复默认值",
    "advanced.searchDepth.label":"应用包搜索深度",
    "advanced.searchDepth.save.failed.invalid":"输入数值无效 应为0-32之间",
    "advanced.searchDepth.description":"输入应为0-32之间 默认值1",
    "advanced.searchDepth.description.detail":'过高影响性能 过低可能导致某些提权数据被忽略.\n该设置只在遇到使用共享UID的应用(需要回退到旧检测逻辑)时生效',
    "advanced.experimental.hotUpdateSetting.label":"设置实时生效(实验性)",
    "advanced.experimental.hotUpdateSetting.detail":"使部分设置更改后实时生效 不再需要重启设备.\n该功能正在进行测试 可能存在异常.\n测试期间当设置项更新后会发出Toast提醒",

    "about.description":"像Magisk一样弹出授予超级用户权限Toast",
    "about.button.repository":"项目仓库",
    "about.otherProjects.title":"其他项目",
    "about.otherProjects.description.kyouka":"支持修改网页、拦截调用、数据导出等的多功能浏览器扩展",
    "about.otherProjects.description.connector.windows":"在局域网内让手机和电脑互相传输文件、转发通知等(Windows端)",
    "about.otherProjects.description.connector.android":"在局域网内让手机和电脑互相传输文件和文本、转发通知等(Android端)",
    "about.otherProjects.description.ruru":"知名应用列表检测器的分支, 增加检测强度并支持自定义检测目标应用",
    //根据语言来 不用翻译
    "about.easterEgg":"栀子花开"
}
export default SimplifiedChineseKeys;