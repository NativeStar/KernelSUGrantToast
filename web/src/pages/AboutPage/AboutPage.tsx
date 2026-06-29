import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n";
import { GitBranch } from "lucide-react";
import { useContext, useState } from "react";
import ProjectItem from "./components/ProjectItem";
import ProjectsList from "./projects"
import { useKsu } from "@/hooks/useKsu";
import { Alert } from "@/components/Alert";

export default function AboutPage() {
    const language = useContext(LanguageContext);
    const { getLang } = useI18n(language);
    const [openEasterEggAlert, setOpenEasterEggAlert] = useState(false);
    const { openUrl, vibration, getVersion } = useKsu();
    const versionInfo = getVersion();
    return (
        <>
            <Alert open={openEasterEggAlert} confirmText={getLang("text.ok")} description={getLang("about.easterEgg")} onConfirm={() => {
                vibration("KEY")
                setOpenEasterEggAlert(false)
            }}/>
            <div className="flex flex-col items-center">
                <h3 className="text-2xl text-center">KernelSU Grant Toast</h3>
                <span>{getLang("about.description")}</span>
                <span className="text-sm text-[gray]" onContextMenu={() => setOpenEasterEggAlert(true)}>{versionInfo.versionName}({versionInfo.versionCode})</span>
                <Button className="mt-2 w-[70%]" onClick={() => {
                    vibration("CONFIRM")
                    openUrl("https://github.com/NativeStar/KernelSUGrantToast")
                }}>
                    <GitBranch />
                    {getLang("about.button.repository")}
                </Button>
                <Separator className="mt-2" />
                <FieldDescription className="mt-2">
                    {getLang("about.otherProjects.title")}
                </FieldDescription>
                <Table className="table-fixed w-full">
                    <TableBody>
                        {
                            ProjectsList.map((item, index) =>
                                // 只对中文用户展示部分项目 因为它们没有多语言支持且暂无计划(或实现太难)添加
                                //港澳台应该看得懂简体
                                <TableRow hidden={language === "en-US" && !item.hasI18n} key={index} onClick={() => {
                                    vibration("KEY")
                                    openUrl(item.url)
                                }}>
                                    <TableCell className="whitespace-normal break-all">
                                        <ProjectItem title={item.title} description={getLang(item.description)} />
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </div>
        </>
    )
}