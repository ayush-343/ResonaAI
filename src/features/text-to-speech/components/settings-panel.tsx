import { History, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingPanelHistory } from "@/features/text-to-speech/components/setting-panel-history";
import { SettingsPanelSettings } from "@/features/text-to-speech/components/settings-panel-settings";



const tabTriggerClassName =
    "flex-1 h-full gap-2 bg-transparent rounded-none border-x-0 border-t-0 border-b-px border-b-transparent shadow-none data-[state=active]:border-b-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none";


export function SettingsPanel() {
    return (
        <div className="hidden w-105 min-h-0 flex-col border-l lg:flex">
            <Tabs defaultValue="settings" className="flex h-full flex-col min-h-0 gap-y-0">
                <div className="border-b px-4 py-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Controls</h2>
                    <TabsList variant="line" className="w-full bg-transparent rounded-none border-b h-12 group-data-[">
                        <TabsTrigger value="settings" className={tabTriggerClassName}>
                            <Settings className="size-3.5" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="history" className={tabTriggerClassName}>
                            <History className="size-3.5" />
                            History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="settings" className="flex-1 overflow-y-auto min-h-0">
                    <SettingsPanelSettings />
                </TabsContent>
                <TabsContent value="history" className="flex-1 overflow-y-auto min-h-0">
                    <SettingPanelHistory />
                </TabsContent>
            </Tabs>
        </div>
    )
}