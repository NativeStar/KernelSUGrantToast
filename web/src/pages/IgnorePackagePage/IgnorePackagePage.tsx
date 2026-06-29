import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useContext, useEffect, useState } from "react";
import { CirclePlus } from "lucide-react"
import IgnoredPackagesTable from "./components/IgnoredPackagesTable";
import { Separator } from "@/components/ui/separator";
import AddApplicationDialog from "./components/AddApplicationDialog";
import { useKsu } from "@/hooks/useKsu";
import type { PackageInfo } from "@/types";
import { toast } from "sonner";
import { showSaveConfigSuccessToast } from "@/lib/utils";
export default function IgnorePackagePage() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { getStringConfig, getPackageInfo, setConfig, vibration } = useKsu();
    const [showAddApplicationDialog, setShowAddApplicationDialog] = useState(false);
    const [ignorePackages, setIgnorePackages] = useState<PackageInfo[]>([]);

    useEffect(() => {
        (async () => {
            const rawList = await getStringConfig("ignorePackageNames");
            if (!rawList) return;
            const splitPackage = rawList.split(";");
            getPackageInfo(splitPackage).then(setIgnorePackages);
        })();
    }, []);
    return (
        <>
            <AddApplicationDialog open={showAddApplicationDialog} onCancel={() => {
                vibration("KEY")
                setShowAddApplicationDialog(false)
            }} onAddApplication={async (pkgInfo) => {
                if (ignorePackages.some(pkg => pkg.packageName === pkgInfo.packageName)) {
                    vibration("TICK")
                    toast.warning(getLang("ignorePackage.add.exist"))
                    return
                }
                vibration("CONFIRM")
                const newIgnoredPackages = [...ignorePackages, pkgInfo];
                setIgnorePackages(newIgnoredPackages);
                const result = await setConfig("ignorePackageNames", newIgnoredPackages.map(item => item.packageName).join(";"));
                showSaveConfigSuccessToast(result, getLang);
                setShowAddApplicationDialog(false);
            }} />
            <div className="flex flex-col h-full min-h-0 items-center text-center overflow-hidden">
                <FieldDescription className="text-center shrink-0">{getLang("ignorePackage.tip")}</FieldDescription>
                <Button className="w-[90%]" onClick={() => {
                    vibration("KEY")
                    setShowAddApplicationDialog(true)
                }}>
                    <CirclePlus />
                    {getLang("ignorePackage.add")}
                </Button>
                <Separator className="mt-3.5" />
                <div className="min-h-0 w-full">
                    <IgnoredPackagesTable ignoredPackages={ignorePackages} setIgnorePackages={setIgnorePackages} />
                </div>
            </div>
        </>
    )
}