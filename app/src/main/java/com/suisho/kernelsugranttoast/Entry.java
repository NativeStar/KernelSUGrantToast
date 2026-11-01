package com.suisho.kernelsugranttoast;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;
import android.os.Process;
import android.os.VibrationEffect;
import android.os.VibratorManager;
import android.util.Log;
import android.util.LruCache;
import android.widget.Toast;

import com.suisho.kernelsugranttoast.object.SettingArguments;

import org.lsposed.hiddenapibypass.HiddenApiBypass;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.TimeUnit;


public class Entry {
    private static final Set<String> allowedSettingKeys = new HashSet<>(Arrays.asList("customToastText", "ignorePackageNames", "packageSearchDepth", "longTimeToast", "internalToastCooldown", "rootGrantVibrationTime"));
    public static final String TAG = "KernelSuGrantToast";
    private static Context systemContext;
    private static Handler handler;
    private static PackageManager packageManager;
    private static FileInputStream ipcInputStream;
    private static RandomAccessFile ipcPipe;
    private static VibratorManager vibratorManager = null;
    //缓存应用名 避免每次都走PackageManager
    private static final LruCache<String, String> appNameCache = new LruCache<>(32);
    private static String customToastText = Messages.getLocaleMessage();
    private static final HashSet<String> ignorePackageList = new HashSet<>();
    private static int toastShowTime = Toast.LENGTH_SHORT;
    private static short grantVibrationTime = 0;

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    public static void main(String[] args) {
        if(Process.myUid() != 0) {
            Log.e(TAG, "Need root access!!!");
            return;
        }
        try {
            SettingArguments tmpArgs = SettingArguments.initSettings(args, ignorePackageList);
            customToastText = tmpArgs.customToastText;
            toastShowTime = tmpArgs.longTimeToast ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
            grantVibrationTime = tmpArgs.rootGrantVibrationTime;
            HiddenApiBypass.addHiddenApiExemptions("Landroid/app/ActivityThread;");
            if(Looper.getMainLooper() == null) Looper.prepareMainLooper();
            @SuppressLint("PrivateApi") Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Object activityThread = HiddenApiBypass.invoke(activityThreadClass, null, "systemMain");
            Context context = (Context) HiddenApiBypass.invoke(activityThreadClass, activityThread, "getSystemContext");
            //uid0不能弹出toast
            systemContext = context.createPackageContext("android", 0);
            File localPath = new File("");
            File libraryFile = new File(localPath.getAbsolutePath(), "Shimizu");
            if(!libraryFile.exists()) {
                onInitFailed("Library file not found!Please reinstall module!!!");
                System.exit(1);
                return;
            }
            //确定没有崩掉再加载
            //app_process没法加载内置so
            System.load(libraryFile.getAbsolutePath());
            if(!jniInit(tmpArgs.packageSearchDepth, tmpArgs.autoDeleteLog, tmpArgs.enableDebugLogs, tmpArgs.toastCooldownTime)) {
                onInitFailed("Native init failed!");
                System.exit(1);
                return;
            }
            modifyModuleDescription(String.format(Locale.getDefault(), "✅Working.PID:%d", Process.myPid()));
            initSettingHotUpdateIpcListener();
            //降权 不然就是java.lang.SecurityException: Package android is not owned by uid 0
            //等写入描述完成才执行 系统框架没模块目录权限
            jniSetUid(1000);
            //KernelSU管理器最低要求Android版本12 刚好支持这个api
            //这要是崩了就自生自灭吧
            vibratorManager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            //刚启动时不知道为啥占用会达到130MB 调用以加速回落
            System.gc();
            Log.i(TAG, "Init success!");
            Looper.loop();
        } catch (Throwable e) {
            Log.e(TAG, "Crashed!", e);
            //重新提权 否则无法执行ksud
            if(Process.myUid() != 0) {
                jniSetUid(0);
            }
            onInitFailed("Crashed!");
            systemContext = null;
            System.exit(1);
        }
    }

    private static void showToast(String appName) {
        if(handler == null) handler = new Handler(Looper.getMainLooper());
        if(vibratorManager != null && grantVibrationTime > 0)
            vibratorManager.getDefaultVibrator().vibrate(VibrationEffect.createOneShot(grantVibrationTime, VibrationEffect.EFFECT_HEAVY_CLICK));
        handler.post(() -> Toast.makeText(systemContext, String.format(Locale.getDefault(), customToastText, appName), toastShowTime).show());
    }

    public static void jniOnFallbackSuEvent(String cmdline) {
        if(packageManager == null) packageManager = systemContext.getPackageManager();
        String packageName;
        if(cmdline.contains(":")) {
            int index = cmdline.indexOf(':');
            packageName = cmdline.substring(0, index);
        } else {
            packageName = cmdline;
        }
        //忽略提示的包名
        if(ignorePackageList.contains(packageName)) return;
        try {
            String cachedAppName = appNameCache.get(packageName);
            if(cachedAppName != null) {
                showToast(cachedAppName);
                return;
            }
            ApplicationInfo appInfo = packageManager.getApplicationInfo(packageName, 0);
            String appName = appInfo.loadLabel(packageManager).toString();
            appNameCache.put(packageName, appName);
            showToast(appName);
        } catch (PackageManager.NameNotFoundException e) {
            Log.w(TAG, "Failed to get app info", e);
        } catch (Exception | Error e) {
            Log.e(TAG, "Error on showing toast!", e);
            onFatalException("Error on showing toast!");
        }
    }

    public static void jniOnNewSuEvent(int uid, int ppid) {
        if(packageManager == null) packageManager = systemContext.getPackageManager();
        try {
            String[] appsList = packageManager.getPackagesForUid(uid);
            if(appsList == null || appsList.length == 0) {
                Log.i(TAG, "No package found for uid " + uid);
                return;
            }
            //sharedUserId处理 回退旧逻辑
            if(appsList.length > 1) {
                jniProcessSharedUidApplication(ppid);
                return;
            }
            String packageName = appsList[0];
            //忽略提示的包名
            if(ignorePackageList.contains(packageName)) return;
            String cachedAppName = appNameCache.get(packageName);
            if(cachedAppName != null) {
                showToast(cachedAppName);
                return;
            }
            ApplicationInfo appInfo = packageManager.getApplicationInfo(packageName, 0);
            String appName = appInfo.loadLabel(packageManager).toString();
            appNameCache.put(packageName, appName);
            showToast(appName);
        } catch (PackageManager.NameNotFoundException e) {
            Log.w(TAG, "Failed to get app info", e);
        } catch (Exception | Error e) {
            Log.e(TAG, "Error on showing toast!", e);
            onFatalException("Error on showing toast!");
        }
    }

    private static void onInitFailed(String errorMessage) {
        modifyModuleDescription("❌" + errorMessage);
    }

    private static void onFatalException(String msg) {
        jniSetUid(0);
        modifyModuleDescription("❌" + msg);
        System.exit(1);
    }

    private static void modifyModuleDescription(String descText) {
        //使用ksu特性临时更改描述
        try {
            File ksudFile = new File("/data/adb/ksud");
            if(!ksudFile.exists()) {
                Log.w(TAG, "ksud file not found!");
                return;
            }
            Locale locale = getModuleLocale();
            String desc = String.format(locale, "[%s]%s", localizeModuleStatus(descText, locale), localizeModuleSummary(locale));
            ProcessBuilder processBuilder = new ProcessBuilder("/data/adb/ksud", "module", "config", "set", "--temp", "override.description", desc);
            processBuilder.environment().put("KSU_MODULE", "ksuGrantToast");
            java.lang.Process changeDescriptorProcess = processBuilder.start();
            //等待写入完成 方便降权
            changeDescriptorProcess.waitFor(20, TimeUnit.SECONDS);
            changeDescriptorProcess.destroyForcibly();
        } catch (IOException | InterruptedException e) {
            Log.e(TAG, "Failed to modify module description", e);
        }
    }

    private static Locale getModuleLocale() {
        String moduleLocale = System.getenv("KSU_GRANT_TOAST_LOCALE");
        if (moduleLocale != null && !moduleLocale.isEmpty()) {
            Locale detectedLocale = Locale.forLanguageTag(moduleLocale.replace('_', '-'));
            if (!detectedLocale.getLanguage().isEmpty()) {
                return detectedLocale;
            }
        }
        return Locale.getDefault();
    }

    private static String localizeModuleSummary(Locale locale) {
        if ("ru".equals(locale.getLanguage())) {
            return "Показывает уведомление при предоставлении root-доступа, как в Magisk.";
        }
        if ("zh".equals(locale.getLanguage())) {
            if ("TW".equals(locale.getCountry()) || "HK".equals(locale.getCountry()) || "MO".equals(locale.getCountry()) || "Hant".equals(locale.getScript())) {
                return "像 Magisk 一樣，在授予 root 權限時顯示提示。";
            }
            return "像 Magisk 一样，在授予 root 权限时显示提示。";
        }
        return "Shows a root granted toast like Magisk.";
    }

    private static String localizeModuleStatus(String status, Locale locale) {
        String language = locale.getLanguage();
        if ("ru".equals(language)) {
            if (status.startsWith("✅Working.PID:")) return status.replaceFirst("✅Working\\.PID:", "✅Работает.ПИД:");
            if (status.equals("❌Library file not found!Please reinstall module!!!")) return "❌Файл библиотеки не найден! Переустановите модуль!";
            if (status.equals("❌Native init failed!")) return "❌Ошибка инициализации native!";
            if (status.equals("❌Crashed!")) return "❌Аварийное завершение!";
            if (status.equals("❌Failed to read IPC pipe file")) return "❌Не удалось прочитать файл IPC-канала";
            if (status.equals("❌Failed to open IPC pipe file")) return "❌Не удалось открыть файл IPC-канала";
            if (status.equals("❌Error on showing toast!")) return "❌Ошибка при показе уведомления!";
            if (status.equals("❌Error on working,Exited")) return "❌Ошибка работы, процесс завершён";
        }
        if ("zh".equals(language)) {
            boolean traditional = "TW".equals(locale.getCountry()) || "HK".equals(locale.getCountry()) || "MO".equals(locale.getCountry()) || "Hant".equals(locale.getScript());
            if (status.startsWith("✅Working.PID:")) return status.replaceFirst("✅Working\\.PID:", "✅运行中.PID:");
            if (status.equals("❌Library file not found!Please reinstall module!!!")) return traditional ? "❌找不到函式庫檔案！請重新安裝模組！" : "❌找不到库文件！请重新安装模块！";
            if (status.equals("❌Native init failed!")) return traditional ? "❌原生程式初始化失敗！" : "❌原生库初始化失败！";
            if (status.equals("❌Crashed!")) return traditional ? "❌程序已崩潰！" : "❌程序已崩溃！";
            if (status.equals("❌Failed to read IPC pipe file")) return traditional ? "❌無法讀取 IPC 管道檔案" : "❌无法读取 IPC 管道文件";
            if (status.equals("❌Failed to open IPC pipe file")) return traditional ? "❌無法開啟 IPC 管道檔案" : "❌无法打开 IPC 管道文件";
            if (status.equals("❌Error on showing toast!")) return traditional ? "❌顯示提示時發生錯誤！" : "❌显示提示时发生错误！";
            if (status.equals("❌Error on working,Exited")) return traditional ? "❌執行錯誤，程序已結束" : "❌运行错误，进程已退出";
        }
        return status;
    }

    private static void initSettingHotUpdateIpcListener() {
        File pipeFile = new File("/data/adb/toast_ipc");
        if(!pipeFile.exists()) {
            Log.w(TAG, "IPC pipe file not found!");
            return;
        }
        //自保留写端
        try {
            ipcPipe = new RandomAccessFile(pipeFile, "rw");
            ipcInputStream = new FileInputStream(ipcPipe.getFD());
        } catch (IOException e) {
            Log.e(TAG, "Failed to open IPC pipe file", e);
            onFatalException("Failed to open IPC pipe file");
        }
        new Thread(() -> {
            try {
                //等自己的写入端开启
                BufferedReader reader = new BufferedReader(new InputStreamReader(ipcInputStream, StandardCharsets.UTF_8));
                String line;
                Log.i(TAG, "Start ipc polling");
                while ((line = reader.readLine()) != null) {
                    Log.i(TAG, "Received IPC message: " + line);
                    //debug toast显示
                    if(line.equals("showDebugToast") || line.equals("showDebugToastLong")) {
                        if(handler == null) handler = new Handler(Looper.getMainLooper());
                        String finalLine = line;
                        handler.post(() -> Toast.makeText(systemContext, "If you can see this toast,the test will passed!", finalLine.equals("showDebugToastLong") ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT).show());
                        continue;
                    }
                    String[] splitMessage = line.split((char) 0x2 + " ", 2);
                    if(splitMessage.length != 2) {
                        Log.w(TAG, "Invalid IPC message format");
                        continue;
                    }
                    if(!allowedSettingKeys.contains(splitMessage[0])) {
                        Log.w(TAG, "Invalid setting key: " + splitMessage[0]);
                        continue;
                    }
                    if(!Util.checkConfigConfigValueValid(splitMessage[0], splitMessage[1])) {
                        //重置内容检测
                        if(splitMessage[0].equals("customToastText") && splitMessage[1].isEmpty()) {
                            customToastText = Messages.getLocaleMessage();
                            Log.i(TAG, "Custom toast text reset");
                            continue;
                        } else if(splitMessage[0].equals("ignorePackageNames") && splitMessage[1].isEmpty()) {
                            ignorePackageList.clear();
                            Log.i(TAG, "Ignore package list reset");
                            continue;
                        } else if(splitMessage[0].equals("packageSearchDepth") && splitMessage[1].isEmpty()) {
                            updatePackageSearchDepth((short) 1);
                            Log.i(TAG, "Package search depth reset");
                            continue;
                        } else if(splitMessage[0].equals("internalToastCooldown") && splitMessage[1].isEmpty()) {
                            updateInternalToastCooldown((short) 3);
                            Log.i(TAG, "Internal toast cooldown reset");
                            continue;
                        } else if(splitMessage[0].equals("rootGrantVibrationTime") && splitMessage[1].isEmpty()) {
                            grantVibrationTime = 0;
                            Log.i(TAG, "Root grant vibration time reset");
                            continue;
                        }
                        Log.w(TAG, "Invalid config value: " + splitMessage[1]);
                        continue;
                    }
                    switch (splitMessage[0]) {
                        case "customToastText":
                            customToastText = splitMessage[1];
                            Log.i(TAG, "Custom toast text updated");
                            break;
                        case "ignorePackageNames":
                            ignorePackageList.clear();
                            String[] rawSplit = splitMessage[1].split(";");
                            for(String packageName : rawSplit) {
                                if(!packageName.isEmpty()) ignorePackageList.add(packageName);
                            }
                            Log.i(TAG, "Ignore package list updated");
                            break;
                        case "packageSearchDepth":
                            updatePackageSearchDepth(Short.parseShort(splitMessage[1]));
                            Log.i(TAG, "Package search depth updated");
                            break;
                        case "longTimeToast":
                            boolean newValue = Boolean.parseBoolean(splitMessage[1]);
                            toastShowTime = newValue ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
                            Log.i(TAG, "Long time toast updated");
                            break;
                        case "internalToastCooldown":
                            updateInternalToastCooldown(Short.parseShort(splitMessage[1]));
                            Log.i(TAG, "Internal toast cooldown updated");
                            break;
                        case "rootGrantVibrationTime":
                            grantVibrationTime = Short.parseShort(splitMessage[1]);
                            Log.i(TAG, "Root grant vibration time updated");
                            break;
                        default:
                            //autoDeleteLog没有热更新的意义
                            Log.w(TAG, "Unknown setting key or key not supported hot update: " + splitMessage[0]);
                    }
                }
                Log.w(TAG, "Stop ipc polling");
            } catch (IOException e) {
                Log.e(TAG, "Failed to read IPC pipe file", e);
                onFatalException("Failed to read IPC pipe file");
            }
        }, "Setting IPC thread").start();
    }

    private static native boolean jniInit(short packageSearchDepth, boolean autoDeleteLog, boolean enableDebugLog, short toastCooldown);

    private static native void jniSetUid(int uid);

    private static native void jniProcessSharedUidApplication(int ppid);

    private static native void updatePackageSearchDepth(short value);

    private static native void updateInternalToastCooldown(short value);
}
