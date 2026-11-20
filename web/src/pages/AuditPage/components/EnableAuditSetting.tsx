import { LanguageContext } from "@/contexts/LanguageContext";
import { useContext, useState, useEffect } from "react";
import { FieldDescription } from "@/components/ui/field";
import { useKsu } from "@/hooks/useKsu";
import { useI18n } from "@/hooks/useI18n";
import { showSaveConfigSuccessToast } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
export default function EnableAuditSetting() {
    const languageContext = useContext(LanguageContext);
    const { getBooleanConfig, setConfig, vibration } = useKsu();
    const { getLang } = useI18n(languageContext);
    const [enableAudit, setEnableAudit] = useState(false);
    useEffect(() => {
        getBooleanConfig("enableAuditLog").then(value => setEnableAudit(value === null ? false : value))
    }, []);
    function onSwitchChange() {
        vibration("TICK")
        setConfig("enableAuditLog", String(!enableAudit)).then((result) => {
            showSaveConfigSuccessToast(result, getLang, true);
            result && setEnableAudit(!enableAudit);
        })
    }
    return (
        <div className="flex flex-col items-center">
            <FieldDescription className="text-center shrink-0">{getLang("audit.tip.1")}</FieldDescription>
            <FieldDescription className="text-center shrink-0">{getLang("audit.tip.2")}</FieldDescription>
            <div className="flex flex-row mt-1.5 gap-2">
                <Switch onClick={onSwitchChange} checked={enableAudit} id="enableAuditSwitch" />
                <Label htmlFor="enableAuditSwitch">{getLang("audit.switch")}</Label>
            </div>
        </div>
    )
}