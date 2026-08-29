import { Tab } from "@/components/Tab";
import { LanguageContext } from "./contexts/LanguageContext";
import { useEffect, useState } from "react";
import type SupportedLangs from "./locales/SupportedLangs";
import { useI18n } from "./hooks/useI18n";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  const [language, setLanguage] = useState<keyof typeof SupportedLangs>("en-US");
  //尽早初始化
  useI18n(language, setLanguage);
  function onError(e: Event) {
    console.error(e);
    if (e instanceof PromiseRejectionEvent) {
      alert(`Cause Error: ${e.reason}`);
    } else if (e instanceof ErrorEvent) {
      alert(`Cause Error: ${e.message}`);
    }
  }
  useEffect(() => {
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    }
  }, [])
  return (
    <>
      <LanguageContext.Provider value={language}>
        <Tab setLanguage={setLanguage} />
        <Toaster />
      </LanguageContext.Provider>
    </>
  )
}

export default App
