import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import type SupportedLangs from "@/locales/SupportedLangs";

interface LanguageSelectProps {
    languageContext: keyof typeof SupportedLangs;
    setLanguage: (language: keyof typeof SupportedLangs) => void;
}
export default function LanguageSelect({ languageContext, setLanguage }: LanguageSelectProps) {
    const { getLang ,resetLanguage} = useI18n(languageContext);
    const {vibration}=useKsu();
    return (
        <div className="select-setting">
            <Label htmlFor="languageSelect">{getLang("language.label")}</Label>
            <Select value={languageContext} onValueChange={(value => {
                vibration("KEY")
                if (value==="system") {
                    resetLanguage(setLanguage)
                    return
                }
                setLanguage(value as keyof typeof SupportedLangs);
                localStorage.setItem("language", value);
            })} onOpenChange={(open)=>{
                open&&vibration("TICK")
            }}>
                <SelectTrigger className="w-[90%] mt-1.5">
                    <SelectValue placeholder={getLang("language.select")} />
                </SelectTrigger>
                <SelectContent id="languageSelect" className="compact-select-popup">
                    <SelectGroup>
                        <SelectLabel>{getLang("language.select")}</SelectLabel>
                        <SelectItem value="system">{getLang("text.followSystem")}</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="zh-TW">繁體中文</SelectItem>
                        <SelectItem value="ru-RU">Русский</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
