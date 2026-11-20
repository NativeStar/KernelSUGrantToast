import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useKsu } from "@/hooks/useKsu";
import type { PackageInfo } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { LanguageContext } from "@/contexts/LanguageContext";
type AuditItem = { timestamp: number, packageName: string }
interface AuditListItemProps {
    audit: AuditItem
    getPackageInfo: (packageName: string) => Promise<PackageInfo[]>
}
function AuditListItem({ audit, getPackageInfo }: AuditListItemProps) {
    const [appName, setAppName] = useState<string>("Loading...")
    useEffect(() => {
        getPackageInfo(audit.packageName).then(result => {
            if (result.length === 0) {
                setAppName(audit.packageName)
            } else {
                setAppName(result[0].name)
            }
        })
    }, [])
    return (
        <div className="flex items-center min-w-0 pointer-events-none">
            <div className="text-muted-foreground text-xs">{isNaN(audit.timestamp) ? "N/A" : new Date(audit.timestamp).toLocaleString()}</div>
            <img src={`ksu://icon/${audit.packageName}`} className="size-8 pointer-events-none ml-2" onError={(event) => {
                const targetElement = event.target as HTMLImageElement;
                // 比原生的的异常图标好看点
                if (targetElement.src !== "ksu://icon/com.android.settings") {
                    targetElement.src = "ksu://icon/com.android.settings";
                }
            }} />
            <div className="text-sm font-medium ml-1.5">{appName}</div>
        </div>
    )
}

export default function AuditList() {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    // TODO 加载动画
    const [auditList, setAuditList] = useState<AuditItem[]>([]);
    const { readFile, getPackageInfo } = useKsu()
    useEffect(() => {
        readFile("/data/adb/ksu/log/su_audit.log").then(rawFile => {
            const tempAuditList = []
            const rawAuditList = rawFile.split("\n");
            // [timestamp,packageName]
            const auditList = rawAuditList.map(item => item.split("\t"));
            for (const auditItem of auditList) {
                if (auditItem.length !== 2) continue
                tempAuditList.push({
                    timestamp: parseInt(auditItem[0]),
                    packageName: auditItem[1]
                })
            }
            setAuditList(tempAuditList)
        })
    }, [])
    return (
        <>
            {auditList.length === 0 && (
                <div className="mx-auto w-[99%]">
                    <div className="text-center text-muted-foreground mt-6">{getLang("audit.list.noData")}</div>
                </div>
            )}
            <ScrollArea className="h-full w-full">
                <div className="mx-auto w-[99%]">
                    <Table className="table-fixed w-full">
                        <TableBody>
                            {
                                auditList.map((audit) => (
                                    <TableRow key={audit.timestamp}>
                                        <TableCell className="min-w-0">
                                            <AuditListItem audit={audit} getPackageInfo={getPackageInfo} />
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