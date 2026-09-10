import { Button } from "@/components/ui/button";
import { useKsu } from "@/hooks/useKsu";

export default function TestShowToastButton() {
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