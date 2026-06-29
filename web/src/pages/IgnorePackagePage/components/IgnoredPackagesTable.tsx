import { Alert } from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { useKsu } from "@/hooks/useKsu";
import type { PackageInfo } from "@/types"
import { Trash } from "lucide-react";
import { useContext, useState, type Dispatch, type SetStateAction } from "react"
import { ApplicationView } from "./ApplicationView";
import { showSaveConfigSuccessToast } from "@/lib/utils";
interface IgnoredPackagesTableProps {
    ignoredPackages: PackageInfo[]
    setIgnorePackages: Dispatch<SetStateAction<PackageInfo[]>>

}
export default function IgnoredPackagesTable({ ignoredPackages, setIgnorePackages }: IgnoredPackagesTableProps) {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    const { setConfig, vibration } = useKsu();
    const [readyRemovePackage, setReadyRemovePackage] = useState<string | null>(null);
    return (
        <>
            <Alert open={readyRemovePackage !== null} title={getLang("ignorePackage.delete.confirm.title")} cancelText={getLang("text.cancel")} confirmText={getLang("text.ok")} description={getLang("ignorePackage.delete.confirm.description")} onCancel={() => {
                vibration("TICK")
                setReadyRemovePackage(null)
            }} onConfirm={async () => {
                vibration("KEY")
                const newIgnoredPackages = ignoredPackages.filter(item => item.packageName !== readyRemovePackage);
                setIgnorePackages(newIgnoredPackages);
                const result = await setConfig("ignorePackageNames", newIgnoredPackages.map(item => item.packageName).join(";"));
                showSaveConfigSuccessToast(result, getLang);
                setReadyRemovePackage(null)
            }
            } />
            <ScrollArea className="h-full w-full">
                <div className="mx-auto w-[91%]">
                    <Table className="table-fixed w-full">
                        <TableBody>
                            {
                                ignoredPackages.map((pkg) => (
                                    <TableRow key={pkg.packageName}>
                                        <TableCell className="min-w-0">
                                            <ApplicationView name={pkg.name} packageName={pkg.packageName} />
                                        </TableCell>
                                        <TableCell className="text-right w-10 whitespace-nowrap">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                vibration("KEY")
                                                setReadyRemovePackage(pkg.packageName)
                                            }}>
                                                <Trash color="red" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </ScrollArea>
        </>
    )
}