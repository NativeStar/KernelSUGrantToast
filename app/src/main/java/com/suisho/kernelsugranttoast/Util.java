package com.suisho.kernelsugranttoast;

import android.util.Log;

import androidx.annotation.Nullable;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

public class Util {
    public static boolean checkConfigConfigValueValid(String configKey, String value) {
        return switch (configKey) {
            case "customToastText":
                yield value.length() < 65 && value.contains("%s");
            case "ignorePackageNames":
                //允许空字符串 那就没啥好查的了
                yield !value.isEmpty();
            case "packageSearchDepth":
                try {
                    short tempSearchDepth = Short.parseShort(value);
                    yield tempSearchDepth >= 0 && tempSearchDepth < 33;
                } catch (NumberFormatException numberFormatException) {
                    yield false;
                }
            case "internalToastCooldown":
                try {
                    short tempCooldown = Short.parseShort(value);
                    yield tempCooldown >= 0 && tempCooldown < 11;
                } catch (NumberFormatException numberFormatException) {
                    yield false;
                }
                //boolean系列
            case "autoDeleteLog":
            case "enableDebugLog":
            case "longTimeToast":
                yield value.equals("true") || value.equals("false");
            default:
                yield false;
        };
    }

    @Nullable
    public static <T> T getModuleConfig(String configKey, Class<T> type) {
        ProcessBuilder processBuilder = new ProcessBuilder("/data/adb/ksud", "module", "config", "get", configKey);
        processBuilder.environment().put("KSU_MODULE", "ksuGrantToast");
        try {
            java.lang.Process readConfigProcess = processBuilder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(readConfigProcess.getInputStream()));
            if(!readConfigProcess.waitFor(10, TimeUnit.SECONDS)) {
                //正常不可能这么久 1秒都顶天了
                Log.w(Entry.TAG, "Read config timeout!Config key:" + configKey);
                readConfigProcess.destroyForcibly();
                return null;
            }
            StringBuilder configValueBuilder = new StringBuilder();
            String tempLine;
            while ((tempLine = reader.readLine()) != null) {
                configValueBuilder.append(tempLine);
            }
            readConfigProcess.destroyForcibly();
            //出问题了
            if(readConfigProcess.exitValue() != 0) {
                Log.w(Entry.TAG, "Failed to load module config,Maybe this config does not exist:" + configKey);
                return null;
            }
            String configValue = configValueBuilder.toString();
            Log.i(Entry.TAG, "Config key:" + configKey + " value:" + configValue);
            return (T) switch (type.getName()) {
                case "java.lang.String" -> configValue;
                case "java.lang.Boolean" -> {
                    if(configValue.equals("true") || configValue.equals("false")) {
                        yield Boolean.parseBoolean(configValue);
                    } else {
                        Log.w(Entry.TAG, "Config value is not a boolean:" + configValue);
                        yield false;
                    }
                }
                case "java.lang.Integer" -> Integer.valueOf(configValue);
                case "java.lang.Short" -> Short.parseShort(configValue);
                default -> {
                    Log.w(Entry.TAG, "Unsupported config type:" + type.getName());
                    yield null;
                }
            };
        } catch (IOException | InterruptedException | NumberFormatException e) {
            Log.e(Entry.TAG, "Cause exception on load config:", e);
            return null;
        }
    }
}
