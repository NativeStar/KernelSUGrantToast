import { shellQuote } from "@/lib/utils";
import type { ModuleInfo } from "@/types";
import { exec, listPackages, getPackagesInfo, spawn , moduleInfo} from "kernelsu"
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
        //autoDeleteLog只在启动后检查触发一次 没有热更新的意义
        if (isEnabledHotUpdate && result.errno === 0 && configKey !== "autoDeleteLog") {
            //写入热更新ipc
            const ipcContent = `${configKey}${String.fromCharCode(0x2)} ${value}`;
            spawn(`echo ${shellQuote(ipcContent)} > /data/adb/toast_ipc`)
        }
        return result.errno === 0
    }, []);
    const deleteConfig = useCallback(async (configKey: string) => {
        if (mock) return true
        const result = await exec(`export KSU_MODULE=ksuGrantToast&&/data/adb/ksud module config delete ${configKey}`)
        return result.errno === 0 || (result.errno === 1 && result.stderr === `Error: Key '${configKey}' not found in config`)
    }, []);
    const listAllPackages = useCallback(async (showSystemApps:boolean) => {
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
        const packages = listPackages(showSystemApps?"all":"user")
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
    const getVersion = useCallback(() => {
        if (mock) return { versionName: "6.6.6", versionCode: "666"}
        const moduleInfoObject:ModuleInfo=JSON.parse(moduleInfo());
        return {versionName: moduleInfoObject.version, versionCode: moduleInfoObject.versionCode};
    }, []);
    return { getStringConfig, getBooleanConfig, setConfig, deleteConfig, listAllPackages, getPackageInfo, openUrl, vibration ,getVersion}
}
export function isEnabledHotUpdateConfig(){
    return isEnabledHotUpdate??false;
}