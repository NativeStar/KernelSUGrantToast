import { FieldDescription } from "@/components/ui/field";
import SearchDepthSetting from "./components/SearchDepthSetting";
import { Separator } from "@/components/ui/separator";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useContext, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import TestShowToastButton from "./components/TestShowToastButton";
import EnableDebugLogSetting from "./components/EnableDebugLogSetting";
import ToastInternalCooldownSetting from "./components/ToastInternalCooldownSetting";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDownIcon ,ChevronUpIcon} from "lucide-react";


export default function AdvancedPage() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const [fold, setFold] = useState(false);
    return (
        <div className="flex flex-col items-center">
            <FieldDescription className="text-yellow-500 text-center">{getLang("advanced.warning")}</FieldDescription>
            <Separator className="mt-2" />
            <SearchDepthSetting />
            <ToastInternalCooldownSetting />
            <Separator className="mt-2" />
            <Collapsible open={fold} onOpenChange={setFold} className="rounded-md data-open:bg-muted w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full">
                        {getLang("advanced.debugOptions.collapsible.label")}
                        {fold ? <ChevronUpIcon className="group-data-panel-open/button:rotate-180" /> : <ChevronDownIcon className="group-data-panel-open/button:rotate-180" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <EnableDebugLogSetting />
                    <TestShowToastButton />
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}