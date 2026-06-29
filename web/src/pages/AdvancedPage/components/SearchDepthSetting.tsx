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

export default function SearchDepthSetting() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const [depthValue, setDepthValue] = useState(1);
    const { setConfig, getStringConfig, deleteConfig, vibration } = useKsu();
    const [openDetailAlert, setOpenDetailAlert] = useState(false);
    useEffect(() => {
        getStringConfig("packageSearchDepth").then(depth => {
            depth && setDepthValue(parseInt(depth));
        })
    }, []);
    const saveDepth = useCallback(async () => {
        vibration("KEY")
        //空值
        if (isNaN(depthValue)) {
            const result = await deleteConfig("packageSearchDepth");
            if (isEnabledHotUpdateConfig()) {
                //热重置设置
                setConfig("packageSearchDepth", "");
                result ? toast.success(getLang("advanced.searchDepth.reset.success")) : toast.error(getLang("text.save.failed"))
            } else {
                result ? toast.success(getLang("advanced.searchDepth.reset.success"), { description: getLang("text.reboot.tip") }) : toast.error(getLang("text.save.failed"))
            }
            return
        }
        if (depthValue < 0 || depthValue > 32) {
            toast.error(getLang("advanced.searchDepth.save.failed.invalid"));
            return
        }
        setConfig("packageSearchDepth", depthValue.toString()).then(result => {
            showSaveConfigSuccessToast(result, getLang);
        })
    }, [depthValue])
    return (
        <>
            <Alert open={openDetailAlert} confirmText={getLang("text.ok")} description={getLang("advanced.searchDepth.description.detail")} onConfirm={() => {
                vibration("KEY")
                setOpenDetailAlert(false)
            }} title={getLang("text.detail")} />
            <div className="flex flex-col mt-2 items-center">
                <FieldLabel className="mt-2">{getLang("advanced.searchDepth.label")}</FieldLabel>
                <ButtonGroup className="w-[70%]">
                    <Input type="number" value={depthValue} min={0} max={32} onChange={e => setDepthValue(parseInt(e.target.value))} className="placeholder:text-[11px] w-[70%]" placeholder={"1"} />
                    <Button variant="outline" onClick={saveDepth}>{getLang("text.save")}</Button>
                </ButtonGroup>
                <FieldDescription className="flex items-center">
                    {getLang("advanced.searchDepth.description")}
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