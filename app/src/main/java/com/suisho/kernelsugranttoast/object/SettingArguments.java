package com.suisho.kernelsugranttoast.object;

import android.util.Log;

import com.suisho.kernelsugranttoast.Messages;
import com.suisho.kernelsugranttoast.Util;

import java.util.HashSet;

public class SettingArguments {
    private static final String TAG = "KernelSuGrantToast";
    public final short packageSearchDepth;
    public final boolean autoDeleteLog;
    public final boolean enableDebugLogs;
    public String customToastText;

    public SettingArguments(short packageSearchDepth, boolean autoDeleteLog, boolean enableDebugLogs, String customToastText) {
        this.packageSearchDepth = packageSearchDepth;
        this.autoDeleteLog = autoDeleteLog;
        this.enableDebugLogs = enableDebugLogs;
        this.customToastText = customToastText;

    }

    public static SettingArguments parseArguments(String[] args, HashSet<String> ignorePackageList) {
        short packageSearchDepth = 1;
        boolean autoDeleteLog = false;
        boolean enableDebugLogs = false;
        String customToastText = Messages.getLocaleMessage();
        //自定义提示文本
        if(args.length > 0 && args[0] != null) {
            String tempCustomText = args[0];
            Log.i(TAG, "Found custom toast text");
            if(Util.checkConfigConfigValueValid("customToastText", tempCustomText)) {
                customToastText = tempCustomText;
            } else {
                Log.w(TAG, "Invalid custom toast text!");
            }
        } else {
            Log.i(TAG, "Use default toast text");
        }
        //忽略包列表
        if(args.length > 1 && args[1] != null) {
            String tempRawIgnorePackageList = args[1];
            Log.i(TAG, "Found ignore package list");
            if(!tempRawIgnorePackageList.isEmpty()) {
                String[] rawSplit = tempRawIgnorePackageList.split(";");
                for(String packageName : rawSplit) {
                    if(!packageName.isEmpty()) ignorePackageList.add(packageName);
                }
                Log.i(TAG, "Added all ignore package");
            } else {
                Log.w(TAG, "Invalid ignore package list");
            }
        }
        //搜索深度
        if(args.length > 2 && args[2] != null) {
            try {
                if(Util.checkConfigConfigValueValid("packageSearchDepth", args[2])) {
                    short tempSearchDepth = Short.parseShort(args[2]);
                    Log.i(TAG, "Found custom package search depth");
                    if(tempSearchDepth >= 0 && tempSearchDepth < 33) {
                        packageSearchDepth = tempSearchDepth;
                        Log.i(TAG, "Set package search depth to " + tempSearchDepth);
                    } else {
                        Log.w(TAG, "Invalid package search depth!");
                    }
                }
            } catch (NumberFormatException numberFormatException) {
                Log.e(TAG, "Invalid package search depth!", numberFormatException);
            }
        }
        //自动移除log
        if(args.length > 3 && args[3] != null) {
            try {
                if(Util.checkConfigConfigValueValid("autoDeleteLog", args[3])) {
                    Log.i(TAG, "Found auto delete log setting");
                    autoDeleteLog = Boolean.parseBoolean(args[3]);
                    Log.i(TAG, "Set auto delete log to " + autoDeleteLog);
                }
            } catch (NumberFormatException numberFormatException) {
                Log.e(TAG, "Invalid auto delete log setting!", numberFormatException);
            }
        }
        //启用调试日志
        if(args.length > 4 && args[4] != null) {
            try {
                if(Util.checkConfigConfigValueValid("enableDebugLog", args[4])) {
                    Log.i(TAG, "Found debug log setting");
                    enableDebugLogs = Boolean.parseBoolean(args[4]);
                    Log.i(TAG, "Set debug log to " + enableDebugLogs);
                }
            } catch (NumberFormatException numberFormatException) {
                Log.e(TAG, "Invalid debug log setting!", numberFormatException);
            }
        }
        return new SettingArguments(packageSearchDepth, autoDeleteLog, enableDebugLogs, customToastText);
    }
}
