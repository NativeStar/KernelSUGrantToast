import { Alert } from "@/components/Alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import { showSaveConfigSuccessToast } from "@/lib/utils";
import { CircleQuestionMark } from "lucide-react";
import { useContext, useEffect, useState } from "react";

export default function EnableDebugLogSetting() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { getBooleanConfig, setConfig, vibration } = useKsu();
    const [enableDebugLog, setEnableDebugLog] = useState(false);
    const [openDetailAlert, setOpenDetailAlert] = useState(false);

    useEffect(() => {
        getBooleanConfig("enableDebugLog").then(value => setEnableDebugLog(value === null ? false : value))
    }, []);
    function onSwitchChange() {
        vibration("TICK")
        setConfig("enableDebugLog", String(!enableDebugLog)).then((result) => {
            showSaveConfigSuccessToast(result, getLang,false);
            result && setEnableDebugLog(!enableDebugLog);
        })
    }
    return (
        <>
            <Alert open={openDetailAlert} confirmText={getLang("text.ok")} description={getLang("advanced.enableDebugLog.detail")} onConfirm={() => {
                vibration("KEY")
                setOpenDetailAlert(false)
            }} title={getLang("text.detail")} />
            <div className="flex flex-col items-center mt-2">
                <div className="flex space-x-2.5">
                    <Switch onClick={onSwitchChange} checked={enableDebugLog} id="enableDebugLog" />
                    <Label htmlFor="enableDebugLog">{getLang("advanced.enableDebugLog.label")}
                        <Badge variant="ghost" onClick={(e) => {
                            //避免点击帮助按钮时触发click事件
                            e.preventDefault();
                            e.stopPropagation();
                            vibration("TICK")
                            setOpenDetailAlert(true)
                        }}>
                            <CircleQuestionMark />
                        </Badge>
                    </Label>
                </div>
            </div>
        </>
    )
}