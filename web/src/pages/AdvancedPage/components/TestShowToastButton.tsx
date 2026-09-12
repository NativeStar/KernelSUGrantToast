import { Button } from "@/components/ui/button";
import { useKsu } from "@/hooks/useKsu";

export default function TestShowToastButton() {
    // TODO 当没有开启热更新时 停用这个按钮
    const { showDebugToast } = useKsu();
    return (
        <Button onClick={() => {
            showDebugToast(false);
        }} onContextMenu={e => {
            e.preventDefault();
            showDebugToast(true)
        }}>Show a debug toast</Button>
    )
}