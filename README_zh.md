# KernelSU Grant Toast

[简体中文](https://github.com/NativeStar/KernelSUGrantToast/blob/master/README-zh.md)
[English](https://github.com/NativeStar/KernelSUGrantToast/blob/master/README.md)
##### 让KernelSU像Magisk一样弹出'授予超级用户权限' Toast
### 截图
![](./mdAssets/1000132279.png)
![](./mdAssets/1000130680.png)
### 功能
- 在应用提权时弹出Toast提醒
- 支持自定义提醒文本
- 支持忽略指定应用的提权提醒
### 安装
在Release中下载模块包后进入KernelSU中选中模块包安装即可

安装完成后需要重启生效

该模块不依赖Zygisk和MetaModule
### 兼容性提醒
模块仅限最新(支持Su日志的版本)KernelSU使用 且仅在官方版本上测试

对该其他分支版本兼容性未知 理论上如果未对Su日志功能进行修改就能正常工作
### 原理
KernelSU在开启Su日志功能后 会拉起一个常驻的进程用于接收由内核转发的日志数据并将其写入文件

该数据实时性极高 完全足够用作事件监测

安装模块后 当设备启动完成 模块将杀死原有负责日志写入的进程并获取用于接收相关数据的文件描述符(该描述符只能被一个进程持有 故必须杀死原来的进程)接手事件处理

如果发现有Android应用被授予root权限 模块将获取该应用的相关信息 并在满足条件时弹出提醒
### 注意
由于原本负责写入日志文件的进程在设备启动完成后即被杀死 原本的Su日志将停止记录

并且为避免文件堆积 在模块启动完成后会将旧的日志文件删除

因此你将无法在管理器中查看Su日志数据

(理论上也可以不杀死进程 通过监听日志文件变化实现获取信息 但这么做性能可能不佳)

### 最后
模块娱乐为主

感谢使用