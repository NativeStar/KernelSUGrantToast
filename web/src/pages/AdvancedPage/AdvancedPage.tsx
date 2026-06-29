import { FieldDescription } from "@/components/ui/field";
import SearchDepthSetting from "./components/SearchDepthSetting";
import { Separator } from "@/components/ui/separator";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useContext } from "react";
import { useI18n } from "@/hooks/useI18n";
import ExperimentalSettingHotUpdateSetting from "./components/ExperimentalSettingHotUpdateSetting";


export default function AdvancedPage() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    return (
        <div className="flex flex-col items-center">
            <FieldDescription className="text-yellow-500 text-center">{getLang("advanced.warning")}</FieldDescription>
            <Separator className="mt-2" />
            <SearchDepthSetting />
            <Separator className="mt-2" />
            <ExperimentalSettingHotUpdateSetting />
        </div>
    )
}