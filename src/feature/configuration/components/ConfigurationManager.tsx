import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import { postConfigToGateway, fetchPaths } from "../../../api/configApi.ts";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { PencilLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip.tsx";

type TabName = 'daq' | 'xray' | 'dic';

export const ConfigurationManager = () => {
    const tabs: { id: TabName; label: string }[] = [
        { id: 'daq', label: 'DAQ' },
        { id: 'xray', label: 'X-ray' },
        { id: 'dic', label: 'DIC' },
    ];
    
    const [activeTab, setActiveTab] = useState<TabName>('daq');
    const [pendingTab, setPendingTab] = useState<TabName | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isManualPath, setIsManualPath] = useState(false);
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
        <div className='flex flex-col gap-3 w-full max-w-4xl mx-auto text-left h-full min-h-0'>
            {/* Header Row */}
            <div className="flex flex-row justify-between items-center w-full">
                <h1 className="text-2xl font-bold text-mauve-900 tracking-tight">Configure RAMS4</h1>
                <div className="flex flex-row gap-3 items-center">
                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        disabled={!isConfigValid}
                        className="h-10 px-5 shadow-sm"
                    >
                        Save Configuration
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReset}
                        className="h-10 px-5 shadow-sm"
                    >
                        Reset Configuration
                    </Button>
                </div>
            </div>
            
            {/* Merged Navigation and Metadata Toolbar */}
            <div className="flex flex-row justify-between items-end w-full pb-3 gap-4">
                <div className="pb-1">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="bg-transparent p-0 gap-1.5 border-b border-transparent">
                            {tabs.map(tab => (
                                <TabsTrigger 
                                    key={tab.id}
                                    value={tab.id}
                                    className="py-2 px-4 rounded-xl text-sm transition-all cursor-pointer font-medium text-mauve-600 hover:bg-mauve-50 hover:text-mauve-600 data-[state=active]:bg-mauve-400 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-semibold"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                
                {/* Compact Metadata Selectors */}
                <div className="flex flex-row items-end gap-3.5 text-xs text-mauve-600 font-medium">
                    <div className="flex flex-col gap-1 items-start">
                        <span className="text-sm font-medium text-mauve-850">Cycle</span>
                        <Select 
                            value={draft.cycleNumber} 
                            onValueChange={(val) => updateDraft({ cycleNumber: val })}
                        >
                            <SelectTrigger className="h-8 w-[110px] bg-white border-mauve-200 rounded-xl text-sm px-3 shadow-sm">
                                <SelectValue placeholder="Cycle" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.cycles.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-sm font-medium text-mauve-850">User ID</span>
                        <Select 
                            value={draft.userId} 
                            onValueChange={(val) => updateDraft({ userId: val })}
                        >
                            <SelectTrigger className="h-8 w-[200px] bg-white border-mauve-200 rounded-xl text-sm px-3 shadow-sm">
                                <SelectValue placeholder="User" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.users.map(u => (
                                    <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-sm font-medium text-mauve-850">Sample Name</span>
                        <Select 
                            value={draft.sampleName} 
                            onValueChange={handleSampleChange}
                        >
                            <SelectTrigger className="h-8 w-[200px] bg-white border-mauve-200 rounded-xl text-sm px-3 shadow-sm">
                                <SelectValue placeholder="Sample" />
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

                    <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-sm font-medium text-mauve-850">Experiment</span>
                        <Select 
                            value={draft.experimentNumber} 
                            onValueChange={handleExperimentChange}
                        >
                            <SelectTrigger className="h-8 w-[75px] bg-white border-mauve-200 rounded-xl text-sm px-3 shadow-sm">
                                <SelectValue placeholder="Exp" />
                            </SelectTrigger>
                            <SelectContent>
                                {pathOptions.experimentNumbers.map(e => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                                <SelectItem value="new-experiment-action" className="font-semibold text-mauve-800 border-t mt-1">
                                    + New Exp...
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Manual Path Mode Toggle Button with Tooltip */}
                    <TooltipProvider delayDuration={350}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsManualPath(!isManualPath)}
                                    className={`h-8 w-8 p-0 rounded-xl border border-mauve-200 transition-colors ${
                                        isManualPath 
                                            ? 'bg-mauve-600 text-white hover:bg-mauve-700' 
                                            : 'bg-white text-mauve-600 hover:bg-mauve-50'
                                    }`}
                                >
                                    <PencilLine className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs p-2 duration-300">
                                {isManualPath ? "Switch back to path select dropdowns" : "Configure path manually"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

              {/* Tab Content Card (flex-grow dynamically to fill remaining height) */}
              <div className='flex-1 min-h-0 bg-white p-6 rounded-3xl border border-mauve-200 shadow-sm overflow-y-auto'>
                  {activeTab && renderTabContent()}
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
