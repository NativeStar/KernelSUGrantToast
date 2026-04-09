package com.suisho.kernelsugranttoast;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;
import android.os.Process;
import android.util.Log;
import android.util.LruCache;
import android.widget.Toast;

import org.lsposed.hiddenapibypass.HiddenApiBypass;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.util.List;
import java.util.Locale;

public class Entry {
    private static Context systemContext;
    private static Handler handler;
    private static PackageManager packageManager;
    //缓存应用名 避免每次都走PackageManager
    private static final LruCache<String, String> appNameCache = new LruCache<>(16);

    public static void main(String[] args) {
        if(Process.myUid() != 0) {
            Log.e("KsuToast", "Need root access!!!");
            return;
        }
        HiddenApiBypass.addHiddenApiExemptions("Landroid/app/ActivityThread;");
        try {
            if(Looper.getMainLooper() == null) Looper.prepareMainLooper();
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Object activityThread = HiddenApiBypass.invoke(activityThreadClass, null, "systemMain");
            Context context = (Context) HiddenApiBypass.invoke(activityThreadClass, activityThread, "getSystemContext");
            //uid0不能弹出toast
            systemContext = context.createPackageContext("android", 0);
            File localPath = new File("");
            File libraryFile = new File(localPath.getAbsolutePath(), "Shimizu");
            if(!libraryFile.exists()) {
                onInitFailed("Library file not found!Please reinstall module");
                System.exit(1);
                return;
            }
            //确定没有崩掉再加载
            //app_process没法加载内置so
            System.load(libraryFile.getAbsolutePath());
            if(!jniInit()) {
                onInitFailed("Native init failed!");
                System.exit(1);
                return;
            }
            modifyModuleDescription("✅Working PID:"+Process.myPid());
            //降权 不然就是java.lang.SecurityException: Package android is not owned by uid 0
            //等写入描述完成才执行 系统框架没模块目录权限
            jniSetUid(1000);
            //刚启动时不知道为啥占用会达到130MB 调用以加速回落
            System.gc();
            Log.i("KsuToast", "Init success!");
            Looper.loop();
        } catch (ClassNotFoundException | NoSuchMethodException | InvocationTargetException |
                 IllegalAccessException | PackageManager.NameNotFoundException |
                 RuntimeException e) {
            Log.e("KsuToast", "Failed to init!", e);
            onInitFailed("Init failed!");
            systemContext = null;
            System.exit(1);
        }
    }

    private static void showToast(String pkgName) {
        if(handler == null) handler = new Handler(Looper.getMainLooper());
        //TODO 自定义提示消息 等开发webUi界面
        handler.post(() -> Toast.makeText(systemContext, String.format(Locale.getDefault(), "%s 已被授予超级用户权限", pkgName), Toast.LENGTH_SHORT).show());
    }

    public static void jniOnNewSuEvent(String cmdline) {
        if(packageManager == null) packageManager = systemContext.getPackageManager();
        String packageName;
        if(cmdline.contains(":")) {
            int index = cmdline.indexOf(':');
            packageName = cmdline.substring(0, index);
        } else {
            packageName = cmdline;
        }
        try {
            String cachedAppName=appNameCache.get(packageName);
            if(cachedAppName != null) {
                showToast(cachedAppName);
                return;
            }
            ApplicationInfo appInfo = packageManager.getApplicationInfo(packageName, 0);
            String appName = appInfo.loadLabel(packageManager).toString();
            appNameCache.put(packageName, appName);
            showToast(appName);
        } catch (PackageManager.NameNotFoundException e) {
            Log.w("KsuToast", "Failed to get app info", e);
        }
    }

    private static void onInitFailed(String errorMessage) {
        modifyModuleDescription("❌" + errorMessage);
    }

    private static void modifyModuleDescription(String descText) {
        File localPath = new File("");
        File propFile = new File(localPath.getAbsolutePath(), "module.prop");
        try {
            List<String> lines = Files.readAllLines(propFile.toPath());
            if(lines.size() < 6) {
                Log.w("KsuToast", "module.prop too short");
                return;
            }
            lines.set(5, String.format(Locale.getDefault(), "description=(%s)Show a root granted toast like Magisk.Require SuLog enabled.", descText));
            Files.write(propFile.toPath(), lines);
        } catch (IOException e) {
            Log.e("KsuToast", "Failed to modify module.prop", e);
        }
    }

    private static native boolean jniInit();

    private static native void jniSetUid(int uid);
}
