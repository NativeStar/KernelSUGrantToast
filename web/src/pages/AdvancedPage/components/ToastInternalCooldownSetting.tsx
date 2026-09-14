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

export default function ToastInternalCooldownSetting() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const [cooldownValue, setCooldownValue] = useState(3);
    const { setConfig, getStringConfig, deleteConfig, vibration } = useKsu();
    const [openDetailAlert, setOpenDetailAlert] = useState(false);
    useEffect(() => {
        getStringConfig("internalToastCooldown").then(cd => {
            cd && setCooldownValue(parseInt(cd));
        })
    }, []);
    const saveCooldown = useCallback(async () => {
        vibration("KEY")
        //空值
        if (isNaN(cooldownValue)) {
            const result = await deleteConfig("internalToastCooldown");
            if (isEnabledHotUpdateConfig()) {
                //热重置设置
                setConfig("internalToastCooldown", "");
                result ? toast.success(getLang("text.reset.success")) : toast.error(getLang("text.save.failed"))
            } else {
                result ? toast.success(getLang("text.reset.success"), { description: getLang("text.reboot.tip") }) : toast.error(getLang("text.save.failed"))
            }
            return
        }
        if (cooldownValue < 0 || cooldownValue > 10) {
            toast.error(getLang("advanced.internalCooldown.save.failed.invalid"));
            return
        }
        setConfig("internalToastCooldown", cooldownValue.toString()).then(result => {
            showSaveConfigSuccessToast(result, getLang);
        })
    }, [cooldownValue])
    return (
        <>
            <Alert open={openDetailAlert} confirmText={getLang("text.ok")} description={getLang("advanced.internalCooldown.description.detail")} onConfirm={() => {
                vibration("KEY")
                setOpenDetailAlert(false)
            }} title={getLang("text.detail")} />
            <div className="flex flex-col mt-2 items-center">
                <FieldLabel className="mt-2">{getLang("advanced.internalCooldown.label")}</FieldLabel>
                <ButtonGroup className="w-[70%]">
                    <Input type="number" value={cooldownValue} min={0} max={10} onChange={e => setCooldownValue(parseInt(e.target.value))} className="placeholder:text-[11px] w-[70%]" placeholder={"3"} />
                    <Button variant="outline" onClick={saveCooldown}>{getLang("text.save")}</Button>
                </ButtonGroup>
                <FieldDescription className="flex items-center">
                    {getLang("advanced.internalCooldown.description")}
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