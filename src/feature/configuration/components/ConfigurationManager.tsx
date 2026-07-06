import { useState, useEffect } from 'react';
import { Tabs, TabsOption } from "../../../components/Tabs.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import { postConfigToGateway, fetchPaths } from "../../../api/configApi.ts";
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

    // State to hold path parameters retrieved from filesystem crawler API
    const [pathOptions, setPathOptions] = useState<{
        cycles: string[];
        users: string[];
        samples: string[];
        experimentNumbers: string[];
    }>({
        cycles: [],
        users: [],
        samples: [],
        experimentNumbers: []
    });

    // Load path options dynamically from backend
    useEffect(() => {
        const loadPaths = async () => {
            try {
                const paths = await fetchPaths();
                setPathOptions({
                    cycles: paths.cycles,
                    users: paths.users,
                    samples: paths.samples,
                    experimentNumbers: paths.experimentNumbers
                });

                // Auto-fill metadata defaults from last accessed directory if currently blank
                updateDraft({
                    cycleNumber: draft.cycleNumber,
                    userId: draft.userId,
                    sampleName: draft.sampleName,
                    experimentNumber: draft.experimentNumber,
                });
            } catch (error) {
                console.error("Failed to load CHESS paths from gateway", error);
            }
        };
        loadPaths();
    }, [updateDraft]);
    const handleSampleChange = (val: string) => {
        if (val === "new-sample-action") {
            const currentName = draft.sampleName;
            const newName = prompt("Enter new sample name:");
            if (newName && newName.trim()) {
                const cleaned = newName.trim();
                if (!pathOptions.samples.includes(cleaned)) {
                    setPathOptions(prev => ({
                        ...prev,
                        samples: [...prev.samples, cleaned]
                    }));
                }
                updateDraft({ sampleName: cleaned });
            } else {
                updateDraft({ sampleName: currentName });
            }
        } else {
            updateDraft({ sampleName: val });
        }
    };

    const handleExperimentChange = (val: string) => {
        if (val === "new-experiment-action") {
            const numbers = pathOptions.experimentNumbers
                .map(item => parseInt(item, 10))
                .filter(num => !isNaN(num));
            
            const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
            const nextExpStr = String(nextNum);

            if (!pathOptions.experimentNumbers.includes(nextExpStr)) {
                setPathOptions(prev => ({
                    ...prev,
                    experimentNumbers: [...prev.experimentNumbers, nextExpStr]
                }));
            }
            updateDraft({ experimentNumber: nextExpStr });
        } else {
            updateDraft({ experimentNumber: val });
        }
    };
    const isConfigValid = Object.values(validationErrors).flat().length === 0;

    const handleSave = async () => {
        const allErrors = Object.values(validationErrors).flat();
        if (allErrors.length > 0) {
            alert("Cannot save configuration: Please resolve all validation errors first.");
            return;
        }
        const name = "rams4/" + draft.sampleName.trim() + `/config${draft.experimentNumber.trim()}.json`;

        try {
            // Sends the full, raw Zustand draft config object
            await postConfigToGateway(draft);

            console.log(`Successfully saved and synced config: ${name}`);
            alert(`Configuration successfully loaded and saved to: ${name}`);
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
            {/* Tab bar and Global Controls */}
            <div className='flex flex-col gap-4'>
                <div className='flex items-end justify-between w-full'>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
                    <div className='flex flex-row gap-4 items-center'>
                        <Button
                            variant="secondary"
                            onClick={handleSave}
                            disabled={!isConfigValid}
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

                {/* Metadata Card */}
                <div className="grid grid-cols-4 gap-4 bg-mauve-50/50 p-6 rounded-3xl border border-mauve-200/50 text-left shadow-sm mt-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-mauve-850">Cycle Number</label>
                        <Select 
                            value={draft.cycleNumber} 
                            onValueChange={(val) => updateDraft({ cycleNumber: val })}
                        >
                            <SelectTrigger className="w-full bg-white border-mauve-200 rounded-2xl h-10">
                                <SelectValue placeholder="Select Cycle" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.cycles.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-mauve-850">User ID</label>
                        <Select 
                            value={draft.userId} 
                            onValueChange={(val) => updateDraft({ userId: val })}
                        >
                            <SelectTrigger className="w-full bg-white border-mauve-200 rounded-2xl h-10">
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.users.map(u => (
                                    <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-mauve-850">Sample Name</label>
                        <Select 
                            value={draft.sampleName} 
                            onValueChange={handleSampleChange}
                        >
                            <SelectTrigger className="w-full bg-white border-mauve-200 rounded-2xl h-10">
                                <SelectValue placeholder="Select Sample" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.samples.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                                <SelectItem value="new-sample-action" className="font-semibold text-mauve-800 border-t mt-1">
                                    + New Sample...
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-mauve-850">Experiment Number</label>
                        <Select 
                            value={draft.experimentNumber} 
                            onValueChange={handleExperimentChange}
                        >
                            <SelectTrigger className="w-full bg-white border-mauve-200 rounded-2xl h-10">
                                <SelectValue placeholder="Select Experiment" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.experimentNumbers.map(e => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                                <SelectItem value="new-experiment-action" className="font-semibold text-mauve-800 border-t mt-1">
                                    + New Experiment...
                                </SelectItem>
                            </SelectContent>
                        </Select>
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
