import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n"
import { Spinner } from "@/components/ui/spinner"
import type SupportedLangs from "@/locales/SupportedLangs";
import BasePage from "@/pages/BasePage/BasePage";
import { useContext, lazy, Suspense, useEffect } from "react";
import { Info, Settings2, ShieldBan, SlidersHorizontal, ShieldCheck } from "lucide-react";
interface TabProps {
    setLanguage: (language: keyof typeof SupportedLangs) => void;
}
const aboutPageLoader = () => import("@/pages/AboutPage/AboutPage");
const advancedPageLoader = () => import("@/pages/AdvancedPage/AdvancedPage");
const ignorePackagePageLoader = () => import("@/pages/IgnorePackagePage/IgnorePackagePage");
const AboutPage = lazy(aboutPageLoader);
const AdvancedPage = lazy(advancedPageLoader);
const IgnorePackagePage = lazy(ignorePackagePageLoader);
export function Tab({ setLanguage }: TabProps) {
    const languageContext = useContext(LanguageContext);
    const { getLang } = useI18n(languageContext);
    useEffect(() => {
        requestIdleCallback(() => {
            aboutPageLoader();
            advancedPageLoader();
            ignorePackagePageLoader();
        });
    }, []);
    return (
        <Tabs defaultValue="base" className="app-shell">
            <header className="app-header">
                <div className="app-brand-mark"><ShieldCheck aria-hidden="true" /></div>
                <div className="app-brand-copy">
                    <span className="app-brand-title">KernelSU Grant Toast</span>
                </div>
            </header>
            <TabsContent value="base" className="app-page">
                <BasePage setLanguage={setLanguage} />
            </TabsContent>
            <TabsContent value="ignorePackage" className="app-page">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <IgnorePackagePage />
                </Suspense>
            </TabsContent>
            <TabsContent value="advanced" className="app-page">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <AdvancedPage />
                </Suspense>
            </TabsContent>
            <TabsContent value="about" className="app-page">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <AboutPage />
                </Suspense>
            </TabsContent>
            <TabsList className="app-navigation">
                <TabsTrigger value="base" className="app-navigation-item">
                    <span className="app-navigation-icon"><Settings2 aria-hidden="true" /></span>
                    <span>{getLang("tabs.base")}</span>
                </TabsTrigger>
                <TabsTrigger value="ignorePackage" className="app-navigation-item">
                    <span className="app-navigation-icon"><ShieldBan aria-hidden="true" /></span>
                    <span>{getLang("tabs.ignorePackage")}</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="app-navigation-item">
                    <span className="app-navigation-icon"><SlidersHorizontal aria-hidden="true" /></span>
                    <span>{getLang("tabs.advanced")}</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="app-navigation-item">
                    <span className="app-navigation-icon"><Info aria-hidden="true" /></span>
                    <span>{getLang("tabs.about")}</span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
