import org.gradle.api.tasks.Copy
import org.gradle.api.tasks.Delete
import org.gradle.api.tasks.bundling.Zip

plugins {
    alias(libs.plugins.android.application) apply false
}
val exportRootDir = file("./tempOutput")
val stagedModuleDir = exportRootDir.resolve("KernelSUGrantToast")
val apkOutput = project(":app").layout.buildDirectory.file("outputs/apk/release/app-release-unsigned.apk")
val apkNameAfterRename = "daemon.apk"
//val apkRelativeDirInModule = "" // APK 放到 module 内的相对路径
val zipName = "KernelSUGrantToast.zip"
val cleanPackWorkspace by tasks.registering(Delete::class) {
    delete(stagedModuleDir, exportRootDir.resolve(zipName))
}
val copyModule by tasks.registering(Copy::class) {
    dependsOn(cleanPackWorkspace)
    from(rootProject.file("module"))
    into(stagedModuleDir)
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
    dependsOn(copyRenamedApk)
    from(stagedModuleDir)
    destinationDirectory.set(exportRootDir)
    archiveFileName.set(zipName)
}
tasks.register("buildMudule") {
    dependsOn(zipCopiedModule)
}