import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import type { PackageInfo } from "@/types";
import { useContext, useEffect, useState } from "react";
import { ApplicationView } from "./ApplicationView";
import { Input } from "@/components/ui/input";
import { CirclePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
interface AddApplicationDialogProps {
    open: boolean
    onCancel: () => void
    onAddApplication: (pkgInfo: PackageInfo) => void
}
export default function AddApplicationDialog({ open, onAddApplication, onCancel }: AddApplicationDialogProps) {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const [rawPackages, setRawPackages] = useState<PackageInfo[]>([]);
    const [searchShowPackages, setSearchShowPackages] = useState<PackageInfo[]>([]);
    const { listAllPackages, vibration } = useKsu();
    const [searchValue, setSearchValue] = useState("");
    const [showSystemApps, setShowSystemApps] = useState<boolean>(false);
    useEffect(() => {
        listAllPackages(false).then(value => {
            setRawPackages(value);
            setSearchShowPackages(value);
        });
    }, []);
    useEffect(() => {
        setSearchShowPackages(rawPackages.filter(value => value.name.includes(searchValue) || value.packageName.includes(searchValue)));
    }, [searchValue]);
    //防止第二次打开残留搜索内容
    useEffect(() => {
        setSearchValue("");
    }, [open]);
    //当显示系统应用开关更新时 刷新列表
    useEffect(() => {
        setSearchValue("");
        listAllPackages(showSystemApps).then(value => {
            setRawPackages(value);
            setSearchShowPackages(value);
        });
    }, [showSystemApps])
    return (
        <Dialog open={open}>
            <DialogContent onOpenAutoFocus={(event) => event.preventDefault()} showCloseButton={false} className="max-h-[96vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{getLang("ignorePackage.add")}</DialogTitle>
                    <DialogDescription>{getLang("ignorePackage.add.dialog.description")}</DialogDescription>
                </DialogHeader>
                <Input className="placeholder:text-sm" placeholder={getLang("ignorePackage.add.dialog.search.placeholder")} disabled={rawPackages.length === 0} autoFocus={false} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                <div className="flex space-x-2.5 justify-center">
                    <Switch id="showSystemApps" checked={showSystemApps} onCheckedChange={(checked)=>{
                        vibration("TICK");
                        setShowSystemApps(checked);
                    }} />
                    <Label htmlFor="showSystemApps">{getLang("ignorePackage.showSystemApps.label")}</Label>
                </div>
                <div className="max-h-[55vh] overflow-y-scroll no-scrollbar overscroll-none">
                    <Table className="table-fixed w-full">
                        <TableBody>
                            {
                                searchShowPackages.map((pkg) => (
                                    <TableRow className="pointer-events-none" key={pkg.packageName}>
                                        <TableCell className="min-w-0">
                                            <ApplicationView name={pkg.name} packageName={pkg.packageName} />
                                        </TableCell>
                                        <TableCell className="text-right w-10 whitespace-nowrap pointer-events-auto">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                onAddApplication(pkg);
                                            }}>
                                                <CirclePlus />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>{getLang("text.cancel")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}