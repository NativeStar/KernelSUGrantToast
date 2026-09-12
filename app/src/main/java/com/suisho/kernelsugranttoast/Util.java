package com.suisho.kernelsugranttoast;

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
            //boolean系列
            case "autoDeleteLog":
            case "enableDebugLog":
                yield value.equals("true") || value.equals("false");
            default:
                yield false;
        };
    }
}
