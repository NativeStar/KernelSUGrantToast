import { Separator } from "@/components/ui/separator";
import EnableAuditSetting from "./components/EnableAuditSetting";
import AuditList from "./components/AuditList";
export default function AuditPage() {
    return (
        <div className="flex h-full min-h-0 w-full flex-col">
            <div className="shrink-0">
                <EnableAuditSetting />
            </div>
            <Separator className="mt-5 shrink-0" />
            <div className="min-h-0 w-full flex-1">
                <AuditList />
            </div>
        </div>
    )
}