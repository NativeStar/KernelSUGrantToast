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
// import { toast } from "sonner";

export default function AutoDeleteLogSetting() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { getBooleanConfig, setConfig, vibration } = useKsu();
    const [autoDeleteLog, setAutoDeleteLog] = useState(false);
    const [openDetailAlert, setOpenDetailAlert] = useState(false);

    useEffect(() => {
        getBooleanConfig("autoDeleteLog").then(value => setAutoDeleteLog(value === null ? false : value))
    }, []);
    function onSwitchChange() {
        vibration("TICK")
        setConfig("autoDeleteLog", String(!autoDeleteLog)).then((result) => {
            showSaveConfigSuccessToast(result, getLang);
            result && setAutoDeleteLog(!autoDeleteLog);
        })
    }
    return (
        <>
            <Alert open={openDetailAlert} confirmText={getLang("text.ok")} description={getLang("autoDeleteLog.detail")} onConfirm={() => {
                vibration("KEY")
                setOpenDetailAlert(false)
            }} title={getLang("text.detail")} />
            <div className="flex flex-col items-center mt-2">
                <div className="flex space-x-2.5">
                    <Switch onClick={onSwitchChange} checked={autoDeleteLog} id="autoDeleteLog" />
                    <Label htmlFor="autoDeleteLog">{getLang("autoDeleteLog.label")}
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