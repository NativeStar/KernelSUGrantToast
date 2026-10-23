import { Alert } from "@/components/Alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu, isEnabledHotUpdateConfig } from "@/hooks/useKsu";
import { showSaveConfigSuccessToast } from "@/lib/utils";
import { CircleQuestionMark } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export default function RootGrantVibrationSetting() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const [vibrationTime, setVibrationTime] = useState(0);
    const { setConfig, getStringConfig, deleteConfig, vibration, getAndroidVersion } = useKsu();
    const [openDetailAlert, setOpenDetailAlert] = useState(false);
    const [androidVersion, setAndroidVersion] = useState<number>(-1);
    useEffect(() => {
        getStringConfig("rootGrantVibrationTime").then(time => {
            time && setVibrationTime(parseInt(time));
        })
    }, []);
    useEffect(() => {
        getAndroidVersion().then(version => {
            setAndroidVersion(version)
        })
    }, [])
    const saveTime = useCallback(async () => {
        vibration("KEY")
        if (androidVersion < 12) {
            toast.error(getLang("toast.vibration.unsupported"));
            return
        }
        //空值
        if (isNaN(vibrationTime) || vibrationTime === 0) {
            const result = await deleteConfig("rootGrantVibrationTime");
            if (isEnabledHotUpdateConfig()) {
                //热重置设置
                setConfig("rootGrantVibrationTime", "", true);
                result ? toast.success(getLang("text.reset.success")) : toast.error(getLang("text.save.failed"))
            } else {
                result ? toast.success(getLang("text.reset.success"), { description: getLang("text.reboot.tip") }) : toast.error(getLang("text.save.failed"))
            }
            return
        }
        if (vibrationTime < 0 || vibrationTime > 1000) {
            toast.error(getLang("advanced.internalCooldown.save.failed.invalid"));
            return
        }
        setConfig("rootGrantVibrationTime", vibrationTime.toString()).then(result => {
            showSaveConfigSuccessToast(result, getLang);
        })
    }, [vibrationTime])
    return (
        <>
            <Alert open={openDetailAlert} confirmText={getLang("text.ok")} description={getLang("toast.vibration.description.detail")} onConfirm={() => {
                vibration("KEY")
                setOpenDetailAlert(false)
            }} title={getLang("text.detail")} />
            <div className="flex flex-col mt-2 items-center">
                <FieldLabel className="mt-2">{getLang("toast.vibration.label")}</FieldLabel>
                <ButtonGroup className="w-[70%]">
                    <Input disabled={androidVersion < 12} type="number" value={vibrationTime} min={0} max={1000} onChange={e => setVibrationTime(parseInt(e.target.value))} className="placeholder:text-[11px] w-[70%]" placeholder={"0"} />
                    <Button variant="outline" onClick={saveTime}>{getLang("text.save")}</Button>
                </ButtonGroup>
                <FieldDescription className="flex items-center">
                    {getLang("toast.vibration.description")}
                    <Badge variant="ghost" onClick={() => {
                        vibration("TICK")
                        setOpenDetailAlert(true)
                    }}>
                        <CircleQuestionMark />
                    </Badge>
                </FieldDescription>
            </div>
        </>
    )
}