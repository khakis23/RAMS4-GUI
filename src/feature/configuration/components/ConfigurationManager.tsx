import { useState } from 'react';
import { Tabs, TabsOption } from "@/components/Tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import { compileToBackendPayload } from "../utils/transformers.ts";
import { postConfigToGateway } from "@/api/configApi.ts";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";

type TabName = 'daq' | 'xray' | 'dic';

export const ConfigurationManager = () => {
    const tabs: TabsOption[] = [
        { id: 'daq', label: 'DAQ' },
        { id: 'xray', label: 'X-ray' },
        { id: 'dic', label: 'DIC' },
    ];
    
    const [activeTab, setActiveTab] = useState<TabName>('daq');
    const [pendingTab, setPendingTab] = useState<TabName | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { errors: validationErrors, setErrors } = useValidationStore();

    const handleTabChange = (nextTab: string) => {
        const activeTabErrors = validationErrors[activeTab] || [];
        if (activeTabErrors.length > 0) {
            setPendingTab(nextTab as TabName);
            setShowConfirmDialog(true);
        } else {
            setActiveTab(nextTab as TabName);
        }
    };

    const { draft, updateDraft } = useConfigurationStore();

    const handleSave = async () => {
        const name = draft.sampleName.trim() || 'config';

        try {
            const apiPayload = compileToBackendPayload(draft);

            await postConfigToGateway(draft.userId.trim() || 'testuser', 'config', name, apiPayload);

            console.log(`Successfully saved and synced config: "${name}"`);
            alert(`Configuration saved and synced to the backend server under "${name}"!`);
        } catch (error) {
            console.error('Failed to sync configuration to backend gateway', error);
            alert('Failed to sync to the backend gateway.');
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset all configurations to their default values?")) {
            updateDraft({
                cycleNumber: "",
                sampleName: "",
                userId: "",
                experimentNumber: "",
                requiredAxes: ["A", "B", "RA", "RB"],
                daqFrequency: 1,
                samplePoints: 1000,
                handlerProfiles: [],
                xrayProfiles: []
            });
            setErrors('daq', []);
            setErrors('xray', []);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'daq':
                return <TabDAQ />;
            case 'xray':
                return <TabXray />;
            case 'dic':
                return <p className='text-lg font-medium text-mauve-800'>DIC Configuration Not Currently Supported</p>;
            default:
                return null;
        }
    };

    return (
        <div className='flex flex-col gap-6 w-full max-w-4xl mx-auto'>
            {/* TODO change this later: Metadata Bar */}
            <div className="grid grid-cols-4 gap-4 bg-mauve-50/50 p-6 rounded-3xl border border-mauve-200/50 text-left shadow-sm">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-mauve-850">Cycle Number</label>
                    <Input 
                        placeholder="Cycle (e.g. 2026-1)" 
                        value={draft.cycleNumber} 
                        onChange={(e) => updateDraft({ cycleNumber: e.target.value })}
                        className="bg-white border-mauve-200 rounded-2xl h-10"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-mauve-850">Sample Name</label>
                    <Input 
                        placeholder="Sample Name" 
                        value={draft.sampleName} 
                        onChange={(e) => updateDraft({ sampleName: e.target.value })}
                        className="bg-white border-mauve-200 rounded-2xl h-10"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-mauve-850">User ID</label>
                    <Input 
                        placeholder="User ID (e.g. jdoe)" 
                        value={draft.userId} 
                        onChange={(e) => updateDraft({ userId: e.target.value })}
                        className="bg-white border-mauve-200 rounded-2xl h-10"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-mauve-850">Experiment Number</label>
                    <Input 
                        placeholder="Experiment Num" 
                        value={draft.experimentNumber} 
                        onChange={(e) => updateDraft({ experimentNumber: e.target.value })}
                        className="bg-white border-mauve-200 rounded-2xl h-10"
                    />
                </div>
            </div>

            {/* Tab bar and Global Controls */}
            <div className='flex flex-col gap-4'>
                <div className='flex items-end justify-between w-full'>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
                    <div className='flex flex-row gap-4 items-center'>
                        <Button
                            variant="secondary"
                            onClick={handleSave}
                            className="h-10"
                        >
                            Save Config
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            className="h-10"
                        >
                            Reset Config
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className='mt-2 min-h-20 bg-white p-6 rounded-3xl border border-mauve-200 shadow-sm
                max-h-[calc(100vh-260px)] overflow-y-auto'>
                    {activeTab && renderTabContent()}
                </div>
            </div>

            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-mauve-150 flex flex-col gap-4 text-left animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-2.5 text-red-655 font-bold text-lg">
                            <span>⚠️ Unsaved Validation Errors</span>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                            You have invalid fields on the current tab that cannot be saved. Leaving will discard these changes.
                        </p>
                        
                        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                            <span className="text-xs font-bold text-red-800">Please fix the following fields:</span>
                            <ul className="list-disc list-inside text-xs text-red-700 space-y-1.5 pl-1">
                                {(validationErrors[activeTab] || []).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex gap-3 justify-end mt-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setPendingTab(null);
                                }}
                            >
                                Stay and Fix
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    if (pendingTab) {
                                        setErrors(activeTab, []);
                                        setActiveTab(pendingTab);
                                    }
                                    setPendingTab(null);
                                }}
                            >
                                Discard & Switch
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
