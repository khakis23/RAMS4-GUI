import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import { postConfigToGateway, fetchDirItems } from "../../../api/configApi.ts";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { PencilLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Checkbox } from "../../../components/ui/checkbox.tsx";

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
    const [dontShowWarningAgain, setDontShowWarningAgain] = useState(false);
    const [showManualWarningModal, setShowManualWarningModal] = useState(false);
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

    // Option states for the dropdown selectors
    const [cycleOptions, setCycleOptions] = useState<string[]>([]);
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [btrOptions, setBtrOptions] = useState<string[]>([]);
    const [sampleOptions, setSampleOptions] = useState<string[]>([]);
    const [experimentOptions, setExperimentOptions] = useState<string[]>([]);
    
    const [selectedStation, setSelectedStation] = useState<string>("");

    // Helper to parse cycle, station, btr, sample from a path string
    const parseDirectoryPath = (path: string) => {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 8 && parts[0] === 'nfs' && parts[1] === 'chess' && parts[2] === 'aux' && parts[3] === 'cycles') {
            const hasMetadata = parts[7] === 'metadata';
            if (hasMetadata && parts.length < 9) return null;
            return {
                cycle: parts[4],
                station: parts[5],
                btr: parts[6],
                sample: hasMetadata ? parts[8] : parts[7]
            };
        }
        return null;
    };

    const hasLoadedInitial = useRef(false);

    // Load initial root Cycle list, and reconstruct options chain if configDirectory exists
    useEffect(() => {
        if (hasLoadedInitial.current) return;
        hasLoadedInitial.current = true;

        const loadInitialData = async () => {
            try {
                const cycles = await fetchDirItems('cycle', "");
                setCycleOptions(cycles);

                if (draft.configDirectory) {
                    const parsed = parseDirectoryPath(draft.configDirectory);
                    if (parsed) {
                        setSelectedStation(parsed.station);
                        
                        // Load options for the pre-saved paths sequentially
                        const stations = await fetchDirItems('station', parsed.cycle);
                        setStationOptions(stations);
                        
                        const btrs = await fetchDirItems('btr', parsed.cycle);
                        setBtrOptions(btrs);
                        
                        const samples = await fetchDirItems('sample', parsed.btr);
                        setSampleOptions(samples);
                        
                        const exps = await fetchDirItems('experiment', parsed.sample);
                        setExperimentOptions(exps);

                        updateDraft({
                            cycleNumber: parsed.cycle,
                            userId: parsed.btr,
                            sampleName: parsed.sample
                        });
                    }
                } else {
                    // Fallback: if dropdown keys exist individually, reconstruct
                    if (draft.cycleNumber) {
                        const stations = await fetchDirItems('station', draft.cycleNumber);
                        setStationOptions(stations);
                    }
                }
            } catch (error) {
                console.error("Failed to load initial directories from gateway", error);
            }
        };
        loadInitialData();
    }, [draft.configDirectory, updateDraft]);

    const handleCycleChange = async (val: string) => {
        updateDraft({
            cycleNumber: val,
            userId: "",
            sampleName: "",
            experimentNumber: "",
            configDirectory: ""
        });
        setSelectedStation("");
        setStationOptions([]);
        setBtrOptions([]);
        setSampleOptions([]);
        setExperimentOptions([]);

        if (val) {
            try {
                const stations = await fetchDirItems('station', val);
                setStationOptions(stations);
            } catch (error) {
                console.error("Failed to load stations for cycle", error);
            }
        }
    };

    const handleStationChange = async (val: string) => {
        setSelectedStation(val);
        updateDraft({
            userId: "",
            sampleName: "",
            experimentNumber: "",
            configDirectory: ""
        });
        setBtrOptions([]);
        setSampleOptions([]);
        setExperimentOptions([]);

        if (val && draft.cycleNumber) {
            try {
                const btrs = await fetchDirItems('btr', draft.cycleNumber);
                setBtrOptions(btrs);
            } catch (error) {
                console.error("Failed to load users for station", error);
            }
        }
    };

    const handleBtrChange = async (val: string) => {
        updateDraft({
            userId: val,
            sampleName: "",
            experimentNumber: "",
            configDirectory: ""
        });
        setSampleOptions([]);
        setExperimentOptions([]);

        if (val) {
            try {
                const samples = await fetchDirItems('sample', val);
                setSampleOptions(samples);
            } catch (error) {
                console.error("Failed to load samples for user/btr", error);
            }
        }
    };

    const handleSampleChange = async (val: string) => {
        const updateAndFetchDir = async (sampleVal: string) => {
            const fullDir = `/nfs/chess/aux/cycles/${draft.cycleNumber}/${selectedStation}/${draft.userId}/metadata/${sampleVal}/`;
            updateDraft({
                sampleName: sampleVal,
                experimentNumber: "",
                configDirectory: fullDir
            });
            setExperimentOptions([]);
            try {
                const exps = await fetchDirItems('experiment', sampleVal);
                setExperimentOptions(exps);
            } catch (error) {
                console.error("Failed to load experiments for sample", error);
            }
        };

        if (val === "new-sample-action") {
            const newName = prompt("Enter new sample name:");
            if (newName && newName.trim()) {
                const cleaned = newName.trim();
                if (!sampleOptions.includes(cleaned)) {
                    setSampleOptions(prev => [...prev, cleaned]);
                }
                await updateAndFetchDir(cleaned);
            }
        } else {
            if (val) {
                await updateAndFetchDir(val);
            } else {
                updateDraft({ sampleName: "", configDirectory: "" });
                setExperimentOptions([]);
            }
        }
    };

    const handleExperimentChange = (val: string) => {
        if (val === "new-experiment-action") {
            const numbers = experimentOptions
                .map(item => parseInt(item, 10))
                .filter(num => !isNaN(num));
            
            const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
            const nextExpStr = String(nextNum);

            if (!experimentOptions.includes(nextExpStr)) {
                setExperimentOptions(prev => [...prev, nextExpStr]);
            }
            updateDraft({ experimentNumber: nextExpStr });
          } else {
              updateDraft({ experimentNumber: val });
          }
      };

      // Handler for direct manual editing of the directory path string
      const handleManualDirectoryChange = (val: string) => {
          updateDraft({ configDirectory: val });
          const parsed = parseDirectoryPath(val);
          if (parsed) {
              setSelectedStation(parsed.station);
              updateDraft({
                  cycleNumber: parsed.cycle,
                  userId: parsed.btr,
                  sampleName: parsed.sample
              });
          }
      };

      const handleManualToggleClick = async () => {
          if (isManualPath) {
              setIsManualPath(false);
              if (draft.configDirectory) {
                  const parsed = parseDirectoryPath(draft.configDirectory);
                  if (parsed) {
                      try {
                          const stations = await fetchDirItems('station', parsed.cycle);
                          setStationOptions(stations);
                          
                          const btrs = await fetchDirItems('btr', parsed.cycle);
                          setBtrOptions(btrs);
                          
                          const samples = await fetchDirItems('sample', parsed.btr);
                          setSampleOptions(samples);
                          
                          const exps = await fetchDirItems('experiment', parsed.sample);
                          setExperimentOptions(exps);
                      } catch (error) {
                          console.error("Failed to refresh options when exiting manual path mode", error);
                      }
                  }
              }
          } else {
              const isDismissed = sessionStorage.getItem('dismissManualWarning') === 'true';
              if (isDismissed) {
                  setIsManualPath(true);
              } else {
                  setShowManualWarningModal(true);
              }
          }
      };

      const handleConfirmManualProceed = () => {
          if (dontShowWarningAgain) {
              sessionStorage.setItem('dismissManualWarning', 'true');
          }
          setIsManualPath(true);
          setShowManualWarningModal(false);
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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftBlur, setShowLeftBlur] = useState(false);
    const [showRightBlur, setShowRightBlur] = useState(false);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (el) {
            setShowLeftBlur(el.scrollLeft > 2);
            setShowRightBlur(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            setShowLeftBlur(el.scrollLeft > 2);
            setShowRightBlur(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
        }
    }, [cycleOptions, stationOptions, btrOptions, sampleOptions, experimentOptions, isManualPath]);

    return (
        <div className="flex flex-col gap-3 w-full max-w-5xl mx-auto min-w-[700px] h-full min-h-0 text-left">
            {/* Compact Unified Control Bar */}
            <div className="flex flex-row items-center justify-between gap-3 w-full bg-white border border-mauve-200 px-5 py-2 rounded-2xl shadow-sm shrink-0">

                {/* Manual Path Mode Toggle Button - TODO maybe move back to the right? */}
                <TooltipProvider delayDuration={350}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={handleManualToggleClick}
                                className={`h-7 w-7 p-0 mr-2 rounded-lg border border-mauve-200 transition-colors shrink-0 ${
                                    isManualPath
                                        ? 'bg-mauve-600 text-white hover:bg-mauve-700'
                                        : 'bg-white text-mauve-600 hover:bg-mauve-50'
                                }`}
                            >
                                <PencilLine className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] p-2">
                            {isManualPath ? "Switch back to path select dropdowns" : "Configure path manually"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Inline Path Selectors with Scroll & Fade Mask */}
                <div className="relative flex-1 min-w-0 overflow-hidden h-9 flex items-center">
                    {isManualPath ? (
                        <div className="flex items-center gap-2 max-w-3xl w-full">
                            <span className="shrink-0 text-xs text-mauve-850 font-semibold">Directory:</span>
                            <Input
                                value={draft.configDirectory}
                                onChange={(e: any) => handleManualDirectoryChange(e.target.value)}
                                placeholder="/nfs/chess/aux/cycles/..."
                                className="h-7 w-full bg-white border-mauve-200 rounded-lg text-xs px-2.5 shadow-sm focus-visible:ring-mauve-400"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Left blur overlay */}
                            <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity duration-200 ${showLeftBlur ? 'opacity-100' : 'opacity-0'}`} />

                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="flex flex-row items-center gap-3.5 overflow-x-auto no-scrollbar py-1 pr-4 font-semibold text-mauve-650 text-xs w-full"
                            >
                                {/* 1. Cycle Select */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs text-mauve-850">Cycle</span>
                                    <Select value={draft.cycleNumber} onValueChange={handleCycleChange}>
                                        <SelectTrigger className="h-7 w-[95px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cycleOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 2. Station Select */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs text-mauve-850">Station</span>
                                    <Select value={selectedStation} onValueChange={handleStationChange} disabled={!draft.cycleNumber}>
                                        <SelectTrigger className="h-7 w-[85px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm disabled:opacity-50">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stationOptions.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 3. BTR Select */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs text-mauve-850">BTR</span>
                                    <Select value={draft.userId} onValueChange={handleBtrChange} disabled={!selectedStation}>
                                        <SelectTrigger className="h-7 w-[120px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm disabled:opacity-50">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {btrOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 4. Sample Select */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs text-mauve-850">Sample</span>
                                    <Select value={draft.sampleName} onValueChange={handleSampleChange} disabled={!draft.userId}>
                                        <SelectTrigger className="h-7 w-[160px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm disabled:opacity-50">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sampleOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            <SelectItem value="new-sample-action" className="font-semibold text-mauve-800 border-t mt-1">
                                                + New Sample...
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 5. Experiment Select */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs text-mauve-850">Exp.</span>
                                    <Select value={draft.experimentNumber} onValueChange={handleExperimentChange} disabled={!draft.sampleName}>
                                        <SelectTrigger className="h-7 w-[60px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm disabled:opacity-50">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experimentOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                            <SelectItem value="new-experiment-action" className="font-semibold text-mauve-800 border-t mt-1">
                                                + New Exp...
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Right blur overlay */}
                            <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity duration-200 ${showRightBlur ? 'opacity-100' : 'opacity-0'}`} />
                        </>
                    )}
                </div>

                {/* Action items outside scroll area - Save button remains isolated on the far right */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Save Button */}
                    <TooltipProvider delayDuration={350}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="secondary"
                                        onClick={handleSave}
                                        disabled={!isConfigValid}
                                        className="h-7 px-3.5 shadow-sm text-xs font-semibold rounded-lg"
                                    >
                                        Save Configuration
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] p-2">
                                Save the current configuration to the file path
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Attached Tab Card Container */}
            <div className="flex flex-col flex-1 min-h-0 bg-white rounded-3xl border border-mauve-200 shadow-sm overflow-hidden">
                {/* Tab Header Bar (Safari-style tabs tray) */}
                <div className="flex items-center border-b border-mauve-150 px-4 py-2 bg-mauve-50/40 shrink-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="bg-mauve-100/50 p-1 gap-1.5 rounded-xl border border-mauve-200 flex w-fit">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="py-1 px-3.5 rounded-lg text-xs transition-all cursor-pointer font-semibold text-mauve-650 hover:bg-white/40 data-[state=active]:bg-white data-[state=active]:text-mauve-850 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-mauve-200"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Tab Content view */}
                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                    {activeTab && renderTabContent()}
                </div>
            </div>

            {/* Tab Switch Unsaved Validation Warning */}
            <WarningModal
                isOpen={showConfirmDialog}
                title="Unsaved Validation Errors"
                description="You have invalid fields on the current tab that cannot be saved. Leaving will discard these changes."
                confirmText="Discard & Switch"
                cancelText="Stay and Fix"
                onConfirm={() => {
                    setShowConfirmDialog(false);
                    if (pendingTab) {
                        setErrors(activeTab, []);
                        setActiveTab(pendingTab);
                    }
                    setPendingTab(null);
                }}
                onCancel={() => {
                    setShowConfirmDialog(false);
                    setPendingTab(null);
                }}
            >
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                    <span className="text-xs font-bold text-red-800">Please fix the following fields:</span>
                    <ul className="list-disc list-inside text-xs text-red-700 space-y-1.5 pl-1">
                        {(validationErrors[activeTab] || []).map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            </WarningModal>

            {/* Advanced Manual Path Warning Dialog */}
            <WarningModal
                isOpen={showManualWarningModal}
                title="Advanced Action Required"
                description={
                    <>Editing the path manually is an <strong>advanced feature</strong>. Incorrect paths can prevent your configuration from loading correctly or modify files on the CHESS system.</>
                }
                confirmText="Proceed"
                cancelText="Cancel"
                onConfirm={handleConfirmManualProceed}
                onCancel={() => {
                    setShowManualWarningModal(false);
                    setDontShowWarningAgain(false);
                }}
            >
                <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                        id="dontShowAgain"
                        checked={dontShowWarningAgain}
                        onCheckedChange={(checked) => setDontShowWarningAgain(!!checked)}
                        className="border-mauve-300 data-checked:bg-mauve-600 data-checked:border-mauve-600 data-checked:text-white focus-visible:ring-mauve-400"
                    />
                    <label htmlFor="dontShowAgain" className="text-xs text-gray-505 font-medium select-none cursor-pointer">
                        Don't show warning again for this session
                    </label>
                </div>
            </WarningModal>
        </div>
    );
};

// Reusable Warning Modal Sub-component
interface WarningModalProps {
    isOpen: boolean;
    title: string;
    titleColorClass?: string;
    description: string | React.ReactNode;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

const WarningModal = ({
    isOpen,
    title,
    titleColorClass = "text-destructive",
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    children
}: WarningModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-mauve-150 flex flex-col gap-4 text-left animate-in fade-in zoom-in duration-200">
                <div className={`flex items-center gap-2.5 font-bold text-lg ${titleColorClass}`}>
                    <span>{title}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                </p>
                {children}
                <div className="flex gap-3 justify-end mt-2">
                    <Button variant="secondary" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
