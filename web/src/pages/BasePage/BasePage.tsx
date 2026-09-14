import { LanguageContext } from "@/contexts/LanguageContext";
import type SupportedLangs from "@/locales/SupportedLangs";
import { useContext } from "react";
import LanguageSelect from "./components/LanguageSelect";
import ToastTextInput from "./components/ToastTextInput";
import { Separator } from "@/components/ui/separator";
import ThemeSelect from "./components/ThemeSelect";
import AutoDeleteLogSetting from "./components/AutoDeleteLogSetting";
import LongTimeToastSetting from "./components/LongTimeToastSetting";
interface BasePageProps {
    setLanguage: (language: keyof typeof SupportedLangs) => void;
}
export default function BasePage({ setLanguage }: BasePageProps) {
    const languageContext = useContext(LanguageContext);
    return (
        <div className="flex flex-col items-center">
            <LanguageSelect setLanguage={setLanguage} languageContext={languageContext} />
            <ThemeSelect />
            <Separator className="mt-5" />
            <ToastTextInput />
            <LongTimeToastSetting />
            <Separator className="mt-5" />
            <AutoDeleteLogSetting />
        </div>
    )
}