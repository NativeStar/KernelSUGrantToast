import { useTheme } from "@/components/ThemeProvider";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import { useContext } from "react";
export default function ThemeSelect() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { setTheme, theme } = useTheme();
    const {vibration} = useKsu();
    return (
        <div className="select-setting">
            <Label className="mt-3" htmlFor="themeSelect">{getLang("theme.label")}</Label>
            <Select value={theme} onValueChange={(value => {
                vibration("KEY")
                setTheme(value as typeof theme);
            })} onOpenChange={(open)=>{
                open&&vibration("TICK")
            }}>
                <SelectTrigger className="w-[90%] mt-1.5">
                    <SelectValue placeholder={getLang("theme.select")} />
                </SelectTrigger>
                <SelectContent id="themeSelect" className="compact-select-popup">
                    <SelectGroup>
                        <SelectLabel>{getLang("theme.select")}</SelectLabel>
                        <SelectItem value="system">{getLang("text.followSystem")}</SelectItem>
                        <SelectItem value="light">{getLang("theme.light")}</SelectItem>
                        <SelectItem value="dark">{getLang("theme.dark")}</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
