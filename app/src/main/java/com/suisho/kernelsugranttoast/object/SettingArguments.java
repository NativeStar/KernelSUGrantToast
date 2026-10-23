package com.suisho.kernelsugranttoast.object;

import android.util.Log;

import com.suisho.kernelsugranttoast.Entry;
import com.suisho.kernelsugranttoast.Messages;
import com.suisho.kernelsugranttoast.Util;

import java.util.HashSet;

public class SettingArguments {
    public final short packageSearchDepth;
    public final boolean autoDeleteLog;
    public final boolean enableDebugLogs;
    public final String customToastText;
    public final boolean longTimeToast;
    public final short toastCooldownTime;
    public final short rootGrantVibrationTime;


    public SettingArguments(short packageSearchDepth, boolean autoDeleteLog, boolean enableDebugLogs, String customToastText, boolean longTimeToast, short toastCooldownTime, short rootGrantVibrationTime) {
        this.packageSearchDepth = packageSearchDepth;
        this.autoDeleteLog = autoDeleteLog;
        this.enableDebugLogs = enableDebugLogs;
        this.customToastText = customToastText;
        this.longTimeToast = longTimeToast;
        this.toastCooldownTime = toastCooldownTime;
        this.rootGrantVibrationTime = rootGrantVibrationTime;

    }

    public static SettingArguments initSettings(String[] args, HashSet<String> ignorePackageList) {
        short packageSearchDepth = 1;
        boolean autoDeleteLog = false;
        boolean enableDebugLogs = false;
        boolean longTimeToast = false;
        String customToastText = Messages.getLocaleMessage();
        short toastCooldownTime = 3;
        short rootGrantVibrationTime = 0;
        //自定义提示文本
        String tempCustomText = Util.getModuleConfig("customToastText", String.class);
        if(tempCustomText != null && Util.checkConfigConfigValueValid("customToastText", tempCustomText)) {
            Log.i(Entry.TAG, "Found custom toast text");
            customToastText = tempCustomText;
        } else {
            Log.w(Entry.TAG, "Invalid custom toast text!");
        }
        //忽略包列表
        String tempRawIgnorePackageList = Util.getModuleConfig("ignorePackageNames", String.class);
        if(tempRawIgnorePackageList != null && !tempRawIgnorePackageList.isEmpty()) {
            Log.i(Entry.TAG, "Found ignore package list");
            String[] rawSplit = tempRawIgnorePackageList.split(";");
            for(String packageName : rawSplit) {
                if(!packageName.isEmpty()) ignorePackageList.add(packageName);
            }
            Log.i(Entry.TAG, "Added all ignore package");
        } else {
            Log.w(Entry.TAG, "Invalid ignore package list");
        }
        //搜索深度
        Short rawPackageSearchDepth = Util.getModuleConfig("packageSearchDepth", Short.class);
        if(rawPackageSearchDepth != null) {
            Log.i(Entry.TAG, "Found custom package search depth");
            if(rawPackageSearchDepth >= 0 && rawPackageSearchDepth < 33) {
                packageSearchDepth = rawPackageSearchDepth;
                Log.i(Entry.TAG, "Set package search depth to " + rawPackageSearchDepth);
            } else {
                Log.w(Entry.TAG, "Invalid package search depth!");
            }
        }
        //自动移除log
        Boolean rawAutoDeleteLog = Util.getModuleConfig("autoDeleteLog", Boolean.class);
        if(rawAutoDeleteLog != null) {
            Log.i(Entry.TAG, "Found auto delete log setting");
            autoDeleteLog = rawAutoDeleteLog;
            Log.i(Entry.TAG, "Set auto delete log to " + autoDeleteLog);
        } else {
            Log.w(Entry.TAG, "Invalid auto delete log setting");
        }
        //启用调试日志
        Boolean rawEnableDebugLogs = Util.getModuleConfig("enableDebugLog", Boolean.class);
        if(rawEnableDebugLogs != null) {
            Log.i(Entry.TAG, "Found debug log setting");
            enableDebugLogs = rawEnableDebugLogs;
            Log.i(Entry.TAG, "Set debug log to " + enableDebugLogs);
        } else {
            Log.w(Entry.TAG, "Invalid debug log setting");
        }
        //是否启用长时间Toast
        Boolean rawLongTimeToast = Util.getModuleConfig("longTimeToast", Boolean.class);
        if(rawLongTimeToast != null) {
            Log.i(Entry.TAG, "Found long time toast setting");
            longTimeToast = rawLongTimeToast;
            Log.i(Entry.TAG, "Set long time toast to " + longTimeToast);
        } else {
            Log.w(Entry.TAG, "Invalid long time toast setting");
        }
        //toast弹出冷却
        Short rawToastCooldownTime = Util.getModuleConfig("internalToastCooldown", Short.class);
        if(rawToastCooldownTime != null) {
            Log.i(Entry.TAG, "Found toast cooldown setting");
            if(rawToastCooldownTime >= 0 && rawToastCooldownTime < 11) {
                toastCooldownTime = rawToastCooldownTime;
                Log.i(Entry.TAG, "Set toast cooldown to " + rawToastCooldownTime);
            } else {
                Log.w(Entry.TAG, "Invalid toast cooldown setting!");
            }
        }
        //提权振动反馈时长
        Short rawRootGrantVibrationTime = Util.getModuleConfig("rootGrantVibrationTime", Short.class);
        if(rawRootGrantVibrationTime != null) {
            Log.i(Entry.TAG, "Found root grant vibration time setting");
            if(rawRootGrantVibrationTime >= 0 && rawRootGrantVibrationTime <= 1000) {
                rootGrantVibrationTime = rawRootGrantVibrationTime;
                Log.i(Entry.TAG, "Set root grant vibration time to " + rawRootGrantVibrationTime);
            } else {
                Log.w(Entry.TAG, "Invalid root grant vibration time setting!");
            }
        }
        return new SettingArguments(packageSearchDepth, autoDeleteLog, enableDebugLogs, customToastText, longTimeToast, toastCooldownTime, rootGrantVibrationTime);
    }
}
