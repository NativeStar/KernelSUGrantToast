import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useContext } from "react";
import { FieldDescription } from "@/components/ui/field";


export default function TestShowToastButton() {
    const languageContext = useContext(LanguageContext);
    const { showDebugToast } = useKsu();
    const { getLang } = useI18n(languageContext);

    return (
        <div className="flex flex-col items-center mt-5">
            <Button onClick={() => {
                showDebugToast(false);
            }} onContextMenu={e => {
                e.preventDefault();
                showDebugToast(true)
            }}>{getLang("advanced.test.showDebugToastButton")}</Button>
            <FieldDescription className="flex items-center">
                {getLang("advanced.test.showDebugToastButton.description")}
            </FieldDescription>
        </div>
    )
} 