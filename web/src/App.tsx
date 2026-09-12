import { Tab } from "@/components/Tab";
import { LanguageContext } from "./contexts/LanguageContext";
import { useEffect, useState } from "react";
import type SupportedLangs from "./locales/SupportedLangs";
import { useI18n } from "./hooks/useI18n";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/Alert";
import { useKsu } from "@/hooks/useKsu";
export function App() {
  const [language, setLanguage] = useState<keyof typeof SupportedLangs>("en-US");
  const { vibration, isModuleProcessAvailable } = useKsu();
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDeadProcessAlert, setShowDeadProcessAlert] = useState(false);
  const [errorStack, setErrorStack] = useState("");
  //尽早初始化
  const { getLang } = useI18n(language, setLanguage);
  function onError(e: Event) {
    console.error(e);
    if (e instanceof PromiseRejectionEvent) {
      setErrorStack(e.reason.stack);
    } else if (e instanceof ErrorEvent) {
      setErrorStack(e.message);
    }
    setShowErrorAlert(true);
  }
  useEffect(() => {
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    }
  }, []);
  // 检查进程是否还活着
  useEffect(() => {
    isModuleProcessAvailable().then(res => {
      if (!res) {
        setShowDeadProcessAlert(true)
      }
    })
  }, []);
  return (
    <>
      <LanguageContext.Provider value={language}>
        <Tab setLanguage={setLanguage} />
        <Toaster />
        <Alert open={showErrorAlert} confirmText={getLang("text.ok")} title={getLang("error.title")} description={errorStack} onConfirm={() => {
          vibration("KEY")
          setShowErrorAlert(false)
        }} />
        <Alert open={showDeadProcessAlert} confirmText={getLang("text.ok")} title={getLang("error.title")} description={getLang("error.missingProcess")} onConfirm={() => {
          vibration("KEY")
          setShowDeadProcessAlert(false)
        }} />
      </LanguageContext.Provider>
    </>
  )
}

export default App
