import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import alipayEnvelopeImage from "@/assets/alipay_envelope.jpg"
interface EnvelopeAlertProps {
    open: boolean
    setOpen: (open: boolean) => void
}
export default function EnvelopeAlert({ open, setOpen }: EnvelopeAlertProps) {
    return (
        <Dialog open={open}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>感谢您的支持</DialogTitle>
                    <DialogDescription>
                        项目无法保证长期稳定更新,因此不打算接受直接捐赠.
                        <br />
                        你可以截图后,使用支付宝扫描这个二维码,获得一个支付红包(尽管通常只有几分钱),然后去线下店消费使用掉这个红包.我可以获得一些奖励(通常也只有几分钱).
                        <br />
                        这个码每天都可以扫一次,非常感谢!
                    </DialogDescription>
                </DialogHeader>
                <img src={alipayEnvelopeImage} className="w-full max-h-[55vh] h-auto object-contain" />
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>关闭</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}