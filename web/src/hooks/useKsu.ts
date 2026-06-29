import { shellQuote } from "@/lib/utils";
import { exec, listPackages, getPackagesInfo, spawn } from "kernelsu"
import { useCallback } from "react"
const VibrationType = {
    TICK: 20,
    KEY: 45,
    CONFIRM: 75
}
let isEnabledHotUpdate: boolean | null = null;
export function useKsu() {
    const mock = !Reflect.has(window, "ksu");
    if (mock) {
        console.warn("ipc mocking!");
        isEnabledHotUpdate = false;
    }
    if (isEnabledHotUpdate === null) {
        exec("test -e /data/adb/toast_ipc").then(result => {
            result.errno === 0 ? isEnabledHotUpdate = true : isEnabledHotUpdate = false
            console.log(isEnabledHotUpdate);
        })
    }
    const getStringConfig = useCallback(async (configKey: string) => {
        if (mock) {
            if (configKey === "packageSearchDepth") {
                return "6"
            }
            return "mocking"
        }
        const result = await exec(`export KSU_MODULE=ksuGrantToast&&/data/adb/ksud module config get ${configKey}`)
        if (result.errno !== 0) return null;
        return result.stdout
    }, []);
    const getBooleanConfig = useCallback(async (configKey: string) => {
        if (mock) return true
        const result = await exec(`export KSU_MODULE=ksuGrantToast&&/data/adb/ksud module config get ${configKey}`)
        if (result.errno !== 0) return null;
        return result.stdout === "true"
    }, []);
    const setConfig = useCallback(async (configKey: string, value: string) => {
        if (mock) return true
        const result = await exec(`export KSU_MODULE=ksuGrantToast&&/data/adb/ksud module config set ${configKey} ${shellQuote(value)}`)
        if (isEnabledHotUpdate && result.errno === 0 && configKey !== "autoDeleteLog") {
            //写入热更新ipc
            spawn(`echo '${configKey}${String.fromCharCode(0x2)} ${value}' > /data/adb/toast_ipc`)
        }
        return result.errno === 0
    }, []);
    const deleteConfig = useCallback(async (configKey: string) => {
        if (mock) return true
        const result = await exec(`export KSU_MODULE=ksuGrantToast&&/data/adb/ksud module config delete ${configKey}`)
        return result.errno === 0 || (result.errno === 1 && result.stderr === `Error: Key '${configKey}' not found in config`)
    }, []);
    const listAllPackages = useCallback(async () => {
        if (mock) {
            const temp = [];
            for (let i = 0; i < 50; i++) {
                temp.push({
                    packageName: i.toString(),
                    name: "mocking" + i
                })
            }
            return temp;
        }
        const packages = listPackages("user")
        const packagesInfo = getPackagesInfo(packages);
        return packagesInfo.map(info => {
            return {
                packageName: info.packageName,
                name: info.appLabel
            }
        })
    }, []);
    const getPackageInfo = useCallback(async (packages: string[]) => {
        if (mock) {
            const temp = [];
            for (let i = 0; i < 5; i++) {
                temp.push({
                    packageName: i.toString(),
                    name: "mocking:abc aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" + i
                })
            }
            return temp;
        }
        const packagesInfo = getPackagesInfo(packages);
        return packagesInfo.map(info => {
            return {
                packageName: info.packageName,
                name: info.appLabel
            }
        }).filter(info => info.name !== undefined)
    }, []);
    const openUrl = useCallback((url: string) => {
        if (mock) return
        exec(`am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${url}'`)
    }, []);
    const vibration = useCallback(async (type: keyof typeof VibrationType) => {
        if (mock) return
        spawn(`cmd vibrator_manager synced oneshot ${VibrationType[type]}`)
    }, []);
    return { getStringConfig, getBooleanConfig, setConfig, deleteConfig, listAllPackages, getPackageInfo, openUrl, vibration }
}
export function isEnabledHotUpdateConfig(){
    return isEnabledHotUpdate??false;
}