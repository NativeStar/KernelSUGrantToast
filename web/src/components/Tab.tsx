import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageContext } from "@/contexts/LanguageContext";
import { useI18n } from "@/hooks/useI18n"
import { Spinner } from "@/components/ui/spinner"
import type SupportedLangs from "@/locales/SupportedLangs";
import BasePage from "@/pages/BasePage/BasePage";
import { useContext, lazy, Suspense, useEffect } from "react";
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
        <Tabs defaultValue="base" className="w-full h-full">
            <TabsList variant="line">
                <TabsTrigger value="base">{getLang("tabs.base")}</TabsTrigger>
                <TabsTrigger value="ignorePackage">{getLang("tabs.ignorePackage")}</TabsTrigger>
                <TabsTrigger value="advanced">{getLang("tabs.advanced")}</TabsTrigger>
                <TabsTrigger value="about">{getLang("tabs.about")}</TabsTrigger>
            </TabsList>
            <TabsContent value="base">
                <BasePage setLanguage={setLanguage} />
            </TabsContent>
            <TabsContent value="ignorePackage" className="min-h-0">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <IgnorePackagePage />
                </Suspense>
            </TabsContent>
            <TabsContent value="advanced">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <AdvancedPage />
                </Suspense>
            </TabsContent>
            <TabsContent value="about">
                <Suspense fallback={<Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12" />}>
                    <AboutPage />
                </Suspense>
            </TabsContent>
        </Tabs>
    )
}