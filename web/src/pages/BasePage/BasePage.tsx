import { LanguageContext } from "@/contexts/LanguageContext";
import type SupportedLangs from "@/locales/SupportedLangs";
import { useContext } from "react";
import LanguageSelect from "./components/LanguageSelect";
import ToastTextInput from "./components/ToastTextInput";
import { Separator } from "@/components/ui/separator";
import ThemeSelect from "./components/ThemeSelect";
import AutoDeleteLogSetting from "./components/AutoDeleteLogSetting";
import LongTimeToastSetting from "./components/LongTimeToastSetting";
import WebHapticSetting from "./components/WebHapticSetting";
import RootGrantVibrationSetting from "./components/RootGrantVibrationSetting";
interface BasePageProps {
    setLanguage: (language: keyof typeof SupportedLangs) => void;
}
export default function BasePage({ setLanguage }: BasePageProps) {
    const languageContext = useContext(LanguageContext);
    return (
        <div className="settings-page">
            <section className="settings-card settings-card-preferences">
                <LanguageSelect setLanguage={setLanguage} languageContext={languageContext} />
                <ThemeSelect />
            </section>
            <section className="settings-card settings-card-group">
                <ToastTextInput />
                <Separator />
                <LongTimeToastSetting />
                <Separator />
                <RootGrantVibrationSetting />
            </section>
            <section className="settings-card settings-card-group">
                <AutoDeleteLogSetting />
                <Separator />
                <WebHapticSetting />
            </section>
        </div>
    )
}
