import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isEnabledHotUpdateConfig } from "@/hooks/useKsu";
import BaseKeys from "@/locales/zhCN";
import { toast } from "sonner";
type GetLangFunctionType = (key: keyof typeof BaseKeys) => string

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function shellQuote(value: string) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
export function showSaveConfigSuccessToast(result: boolean, getLang: GetLangFunctionType) {
  if (isEnabledHotUpdateConfig()) {
    result ? toast.success(getLang("text.save.success")) : toast.error(getLang("text.save.failed"))
  } else {
    result ? toast.success(getLang("text.save.success"), { description: getLang("text.reboot.tip") }) : toast.error(getLang("text.save.failed"))
  }
}