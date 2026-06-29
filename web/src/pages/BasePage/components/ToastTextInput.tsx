import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { LanguageContext } from "@/contexts/LanguageContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useKsu, isEnabledHotUpdateConfig } from "@/hooks/useKsu";
import { toast } from "sonner"
import { showSaveConfigSuccessToast } from "@/lib/utils";
export default function ToastTextInput() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { getStringConfig, setConfig, deleteConfig, vibration } = useKsu();
    const [customToastText, setCustomToastText] = useState<string>("");
    useEffect(() => {
        getStringConfig("customToastText").then(text => {
            text && setCustomToastText(text);
        })
    }, []);
    const saveMessage = useCallback(async () => {
        vibration("KEY")
        if (customToastText === "") {
            const result = await deleteConfig("customToastText");
            if (isEnabledHotUpdateConfig()) {
                //热重置设置
                setConfig("customToastText", "");
                result ? toast.success(getLang("toast.save.reset.success")) : toast.error(getLang("text.save.failed"))
            } else {
                result ? toast.success(getLang("toast.save.reset.success"), { description: getLang("text.reboot.tip") }) : toast.error(getLang("text.save.failed"))
            }
            return
        }
        if (customToastText.length > 64) {
            toast.warning(getLang("toast.save.error.invalidLength"))
            return
        }
        if (!customToastText.includes("%s")) {
            toast.warning(getLang("toast.save.error.missionPlaceholder"))
            return
        }
        if (customToastText.split("%s").length>2) {
            toast.warning(getLang("toast.save.error.tooManyPlaceholders"))
            return
        }
        setConfig("customToastText", customToastText).then(result => {
            showSaveConfigSuccessToast(result, getLang);
        })
    }, [customToastText, languageContext]);
    return (
        <>
            <FieldLabel className="mt-2">{getLang("toast.custom.title")}</FieldLabel>
            <ButtonGroup className="w-[90%]">
                <Input value={customToastText} maxLength={64} onChange={e => setCustomToastText(e.target.value)} className="placeholder:text-[11px]" placeholder={getLang("toast.custom.placeholder")} />
                <Button variant="outline" onClick={saveMessage}>{getLang("text.save")}</Button>
            </ButtonGroup>
            <FieldDescription className="self-center text-center">{getLang("toast.custom.description")}</FieldDescription>
        </>
    )
}