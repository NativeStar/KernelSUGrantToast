plugins {
    alias(libs.plugins.android.application) apply false
}
val exportRootDir = file("./tempOutput")
val stagedModuleDir = exportRootDir.resolve("KernelSUGrantToast")
val apkOutput =
    project(":app").layout.buildDirectory.file("outputs/apk/release/app-release-unsigned.apk")
val apkNameAfterRename = "daemon.apk"
val zipName = "KernelSUGrantToast.zip"
val buildWeb by tasks.registering(Exec::class) {
    workingDir = rootProject.file("web")
    commandLine(
        if (System.getProperty("os.name")
                .startsWith("Windows", ignoreCase = true)
        ) "npm.cmd" else "npm",
        "run", "build"
    )
}
val cleanPackWorkspace by tasks.registering(Delete::class) {
    delete(stagedModuleDir, exportRootDir.resolve(zipName))
}
buildWeb.configure {
    // web 输出目录位于 stagedModuleDir 下，避免产物被清理任务删掉
    mustRunAfter(cleanPackWorkspace)
}
val copyModule by tasks.registering(Copy::class) {
    dependsOn(cleanPackWorkspace)
    from(rootProject.file("module"))
    into(stagedModuleDir)
    doLast {
        fileTree(stagedModuleDir) {
            include("**/*.sh")
        }.files.forEach { scriptFile ->
            val source = scriptFile.readText(Charsets.UTF_8)
            val normalized = source.replace("\r\n", "\n").replace('\r', '\n')
            if (source != normalized) {
                scriptFile.writeText(normalized, Charsets.UTF_8)
            }
        }
    }
}
val copyRenamedApk by tasks.registering(Copy::class) {
    dependsOn(":app:assembleRelease", copyModule)
    from(apkOutput)
    into(stagedModuleDir)
    rename { apkNameAfterRename }
    doFirst {
        val apkFile = apkOutput.get().asFile
        require(apkFile.exists()) { "未找到 APK: ${apkFile.absolutePath}" }
    }
}
val zipCopiedModule by tasks.registering(Zip::class) {
    dependsOn(copyRenamedApk,buildWeb)
    from(stagedModuleDir)
    destinationDirectory.set(exportRootDir)
    archiveFileName.set(zipName)
}
tasks.register("buildModule") {
    dependsOn(zipCopiedModule)
}
