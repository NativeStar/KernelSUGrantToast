import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import type { PackageInfo } from "@/types";
import { useContext, useEffect, useState } from "react";
interface AddCustomPackageDialogProps {
    open: boolean,
    onAddApplication: (pkgInfo: PackageInfo) => void,
    onCancel: () => void
}
export default function AddCustomPackageDialog({ onAddApplication, onCancel, open }: AddCustomPackageDialogProps) {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { vibration } = useKsu();
    const [inputValue, setInputValue] = useState("");
    // 避免下次打开还带着输入数据
    useEffect(() => {
        setInputValue("")
    }, [open])
    return (
        <Dialog open={open}>
            <DialogContent onOpenAutoFocus={(event) => event.preventDefault()} showCloseButton={false} className="max-h-[96vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{getLang("ignorePackage.add")}</DialogTitle>
                    <DialogDescription>{getLang("ignorePackage.add.dialog.custom.description")}</DialogDescription>
                </DialogHeader>
                <Input className="placeholder:text-sm" placeholder={getLang("ignorePackage.add.dialog.customPackageName.placeholder")} autoFocus={false} value={inputValue} onChange={e => setInputValue(e.target.value)} />
                <DialogFooter>
                    <Button variant="outline" onClick={() => {
                        setInputValue("")
                        onCancel()
                    }}>{getLang("text.cancel")}</Button>
                    <Button onClick={() => {
                        if (!inputValue || inputValue.trim() === "") {
                            vibration("KEY")
                            return
                        }
                        onAddApplication({
                            packageName: inputValue,
                            name: inputValue
                        })
                    }}>{getLang("text.ok")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}