import { useState, useEffect, useRef, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select.tsx";
import { TabDAQ } from "../TabDAQ.tsx";
import { TabXray } from "../TabXray.tsx";
import {
    postConfigToGateway,
    fetchDirItems,
    fetchConfigFromGateway,
    fetchSettingsFromGateway,
    postSettingsToGateway
} from "../../../api/configApi.ts";
import { useConfigurationStore, useValidationStore } from "@/store/useConfigurationStore.ts";
import { useMechanicalTestStore } from "@/store/useMechanicalTestStore";
import {PencilLine, Save, Sliders, Check} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip.tsx";
import { Input } from "../../../components/ui/input.tsx";
import { Checkbox } from "../../../components/ui/checkbox.tsx";
import { WarningModal } from "../../../components/ui/WarningModal.tsx";
import { tooltips } from "@/config/tooltips.ts";

type TabName = 'daq' | 'xray' | 'dic';

const removeNulls = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(removeNulls);
    } else if (obj !== null && typeof obj === 'object') {
        const cleanObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                if (val !== null && val !== undefined) {
                    cleanObj[key] = removeNulls(val);
                }
            }
        }
        return cleanObj;
    }
    return obj;
};

const pruneConfigForSave = (config: any) => {
    const cleanConfig = JSON.parse(JSON.stringify(config));

    // Prune handlerProfiles
    if (cleanConfig.handlerProfiles) {
        cleanConfig.handlerProfiles = cleanConfig.handlerProfiles.map((hp: any) => {
            const cleanHp: any = {
                mode: hp.mode,
                filename: hp.filename,
                verboseAxis: hp.verboseAxis,
                verboseSystem: hp.verboseSystem,
                verboseTask: hp.verboseTask,
                verboseIO: hp.verboseIO,
                verboseAi: hp.verboseAi,
            };
            if (hp.signalLoad !== null && hp.signalLoad !== undefined) cleanHp.signalLoad = hp.signalLoad;
            if (hp.signalStrain !== null && hp.signalStrain !== undefined) cleanHp.signalStrain = hp.signalStrain;

            if (hp.mode === 'time-series') {
                if (hp.frequency !== null && hp.frequency !== undefined) cleanHp.frequency = hp.frequency;
                if (hp.cycles) cleanHp.cycles = hp.cycles;
            } else if (hp.mode === 'peak-valley') {
                if (hp.signalAxis !== null && hp.signalAxis !== undefined) cleanHp.signalAxis = hp.signalAxis;
                if (hp.signalItem !== null && hp.signalItem !== undefined) cleanHp.signalItem = hp.signalItem;
                if (hp.signalProminence !== null && hp.signalProminence !== undefined) cleanHp.signalProminence = hp.signalProminence;
            } else if (hp.mode === 'pso') {
                if (hp.psoAxis !== null && hp.psoAxis !== undefined) cleanHp.psoAxis = hp.psoAxis;
            }
            return cleanHp;
        });
    }

    // Prune xrayProfiles
    if (cleanConfig.xrayProfiles) {
        cleanConfig.xrayProfiles = cleanConfig.xrayProfiles.map((xp: any) => {
            const cleanXp: any = {
                id: xp.id,
                name: xp.name,
                mode: xp.mode,
                ctime: xp.ctime,
                beamHeight: xp.beamHeight,
                beamWidth: xp.beamWidth,
                atten: xp.atten,
            };

            if (xp.mode === 'rotation-series') {
                if (xp.ramsx !== null && xp.ramsx !== undefined) cleanXp.ramsx = xp.ramsx;
                if (xp.layerRanges && xp.layerRanges.length > 0) {
                    cleanXp.layerRanges = xp.layerRanges.map((lr: any) => ({
                        omeStart: lr.omeStart,
                        omeStop: lr.omeStop,
                        numPoints: lr.numPoints,
                        layerStart: lr.layerStart,
                        layerEnd: lr.layerEnd,
                        numLayers: lr.numLayers
                    }));
                }
            } else if (xp.mode === 'stills') {
                if (xp.stillPoints && xp.stillPoints.length > 0) {
                    cleanXp.stillPoints = xp.stillPoints.map((sp: any) => ({
                        ramsx: sp.ramsx,
                        ramsz: sp.ramsz,
                        ome: sp.ome,
                        numPoints: sp.numPoints
                    }));
                }
            } else if (xp.mode === 'mapscan') {
                if (xp.ramsx !== null && xp.ramsx !== undefined) cleanXp.ramsx = xp.ramsx;
                if (xp.ramsz !== null && xp.ramsz !== undefined) cleanXp.ramsz = xp.ramsz;
                if (xp.ome !== null && xp.ome !== undefined) cleanXp.ome = xp.ome;
                if (xp.mapscanAxes && xp.mapscanAxes.length > 0) {
                    cleanXp.mapscanAxes = xp.mapscanAxes.map((ma: any) => ({
                        axisName: ma.axisName,
                        start: ma.start,
                        stop: ma.stop,
                        points: ma.points
                    }));
                }
            }
            return cleanXp;
        });
    }

    return removeNulls(cleanConfig);
};

const normalizeConfig = (config: any) => {
    if (!config) return null;
    const cleanConfig = JSON.parse(JSON.stringify(config));

    if (cleanConfig.handlerProfiles) {
        cleanConfig.handlerProfiles = cleanConfig.handlerProfiles.map((hp: any) => ({
            mode: hp.mode,
            filename: hp.filename,
            signalLoad: hp.signalLoad ?? null,
            signalStrain: hp.signalStrain ?? null,
            verboseAxis: hp.verboseAxis || "-1",
            verboseTask: hp.verboseTask || "-1",
            verboseSystem: hp.verboseSystem ?? -1,
            verboseIO: hp.verboseIO ?? -1,
            verboseAi: Array.isArray(hp.verboseAi) ? hp.verboseAi : (hp.verboseAi ? hp.verboseAi.split(',').map((s: string) => s.trim()) : []),
            frequency: hp.frequency ?? null,
            cycles: hp.cycles || [],
            signalAxis: hp.signalAxis ?? null,
            signalItem: hp.signalItem ?? null,
            signalProminence: hp.signalProminence ?? null,
            psoAxis: hp.psoAxis ?? null,
        }));
    }

    if (cleanConfig.xrayProfiles) {
        cleanConfig.xrayProfiles = cleanConfig.xrayProfiles.map((xp: any) => ({
            id: xp.id,
            name: xp.name,
            mode: xp.mode || 'rotation-series',
            ramsx: xp.ramsx ?? null,
            ramsz: xp.ramsz ?? null,
            ome: xp.ome ?? null,
            ctime: xp.ctime ?? null,
            beamHeight: xp.beamHeight ?? null,
            beamWidth: xp.beamWidth ?? null,
            atten: xp.atten ?? null,
            stillPoints: xp.stillPoints || [],
            mapscanAxes: xp.mapscanAxes || [],
            layerRanges: xp.layerRanges || []
        }));
    }

    return cleanConfig;
};

const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
};

export const ConfigurationManager = () => {
    const tabs: { id: TabName; label: string }[] = [
        { id: 'daq', label: 'DAQ' },
        { id: 'xray', label: 'X-ray' },
        { id: 'dic', label: 'DIC' },
    ];
    
    const [activeTab, setActiveTab] = useState<TabName>('daq');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isManualPath, setIsManualPath] = useState(false);
    const [dontShowWarningAgain, setDontShowWarningAgain] = useState(false);
    const [showManualWarningModal, setShowManualWarningModal] = useState(false);
    const { errors: validationErrors } = useValidationStore();

    // Baseline configuration state is read from global useConfigurationStore
    const { draft, updateDraft, lastLoadedPath, setLastLoadedPath, savedConfig, setSavedConfig } = useConfigurationStore();
    const [selectedStation, setSelectedStation] = useState<string>("");

    const lastCycle = useRef(draft.cycleNumber);
    const lastStation = useRef(selectedStation);
    const lastBtr = useRef(draft.userId);
    const lastSample = useRef(draft.sampleName);
    const lastExp = useRef(draft.experimentNumber);
    const lastManualPath = useRef(draft.configDirectory);
    const lastIsManualPath = useRef(isManualPath);

    // State for pending path changes
    interface PendingPathChange {
        type: 'cycle' | 'station' | 'btr' | 'sample' | 'experiment' | 'manual' | 'manualToggle';
        val: any;
    }
    const [pendingPathChange, setPendingPathChange] = useState<PendingPathChange | null>(null);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // Deep compare draft vs saved config to compute global dirty state across all settings and configuration keys
    const isDirty = useMemo(() => {
        if (!savedConfig) return false;
        const keys = [
            'daqFrequency', 'samplePoints', 'requiredAxes', 'handlerProfiles', 'xrayProfiles', 'settingsVersion'
        ] as const;
        return keys.some(key => !deepEqual(draft[key], savedConfig[key]));
    }, [draft, savedConfig]);

    const handleTabChange = (nextTab: string) => {
        setActiveTab(nextTab as TabName);
    };

    // Option states for the dropdown selectors
    const [cycleOptions, setCycleOptions] = useState<string[]>([]);
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [btrOptions, setBtrOptions] = useState<string[]>([]);
    const [sampleOptions, setSampleOptions] = useState<string[]>([]);
    const [experimentOptions, setExperimentOptions] = useState<string[]>([]);

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

    const commitPathRefs = () => {
        lastCycle.current = draft.cycleNumber;
        lastStation.current = selectedStation;
        lastBtr.current = draft.userId;
        lastSample.current = draft.sampleName;
        lastExp.current = draft.experimentNumber;
        lastManualPath.current = draft.configDirectory;
        lastIsManualPath.current = isManualPath;
    };

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
                        
                        const btrs = await fetchDirItems('btr', parsed.cycle + "/" + parsed.station);
                        setBtrOptions(btrs);
                        
                        const samples = await fetchDirItems('sample', parsed.cycle + "/" + parsed.station + "/" + parsed.btr);
                        setSampleOptions(samples);
                        
                        const exps = await fetchDirItems('experiment', parsed.cycle + "/" + parsed.station + "/" + parsed.btr + "/metadata/" + parsed.sample);
                        setExperimentOptions(exps);

                        updateDraft({
                            cycleNumber: parsed.cycle,
                            userId: parsed.btr,
                            sampleName: parsed.sample
                        });

                        // Set initial committed refs
                        lastCycle.current = parsed.cycle;
                        lastStation.current = parsed.station;
                        lastBtr.current = parsed.btr;
                        lastSample.current = parsed.sample;
                        lastExp.current = draft.experimentNumber;
                        lastManualPath.current = draft.configDirectory;
                        lastIsManualPath.current = isManualPath;
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
    }, [draft.configDirectory, updateDraft, draft.cycleNumber, draft.experimentNumber, isManualPath, selectedStation]);

    // Hook to dynamically load config file from gateway when path changes
    useEffect(() => {
        const dir = draft.configDirectory;
        const exp = draft.experimentNumber;

        if (!dir || !exp) {
            setSavedConfig(null);
            return;
        }

        // Only load if the path has actually changed from what is currently in memory
        if (lastLoadedPath === `${dir}::${exp}`) {
            return;
        }

        const loadConfig = async () => {
            try {
                const fetched = await fetchConfigFromGateway(dir, exp);

                // Set default settings if none loaded
                const defaultSettings = {
                    settingsVersion: 0,
                    specHost: draft.specHost || "id1a3.classe.cornell.edu:spec",
                    requireSpecEnable: draft.requireSpecEnable ?? true,
                    systemName: draft.systemName || "RAMS4_CHESS",
                    controllerHost: draft.controllerHost || "10.0.0.1",
                    axisCount: draft.axisCount ?? 5,
                    taskCount: draft.taskCount ?? 5,
                    axesSettings: draft.axesSettings && draft.axesSettings.length > 0 ? draft.axesSettings : [
                        { name: "A", max_velocity: 50, max_acceleration: 100 },
                        { name: "B", max_velocity: 50, max_acceleration: 100 },
                        { name: "RA", max_velocity: 10, max_acceleration: 20 },
                        { name: "RB", max_velocity: 10, max_acceleration: 20 },
                        { name: "TENS", max_velocity: 5, max_acceleration: 10 }
                    ],
                    signalSettings: draft.signalSettings && draft.signalSettings.length > 0 ? draft.signalSettings : [
                        { name: "LoadA", slope: 1.0, intercept: 0.0, channel: 0 },
                        { name: "LoadB", slope: 1.0, intercept: 0.0, channel: 1 },
                        { name: "Torque", slope: 1.0, intercept: 0.0, channel: 2 }
                    ]
                };

                // Fetch settings for the specific version attached to this experiment configuration
                const settingsRes = await fetchSettingsFromGateway(dir, fetched?.settingsVersion);

                let settingsToApply;
                if (settingsRes) {
                    settingsToApply = {
                        settingsVersion: settingsRes.version,
                        specHost: settingsRes.data.specHost || defaultSettings.specHost,
                        requireSpecEnable: settingsRes.data.requireSpecEnable ?? defaultSettings.requireSpecEnable,
                        systemName: settingsRes.data.systemName || defaultSettings.systemName,
                        controllerHost: settingsRes.data.controllerHost || defaultSettings.controllerHost,
                        axisCount: settingsRes.data.axisCount ?? defaultSettings.axisCount,
                        taskCount: settingsRes.data.taskCount ?? defaultSettings.taskCount,
                        axesSettings: settingsRes.data.axesSettings || defaultSettings.axesSettings,
                        signalSettings: settingsRes.data.signalSettings || defaultSettings.signalSettings
                    };

                    // Check if a fallback happened due to a missing version file
                    if (fetched && fetched.settingsVersion !== undefined && fetched.settingsVersion !== null && fetched.settingsVersion !== settingsRes.version) {
                        useConfigurationStore.getState().setSettingsFallbackActive({
                            expected: fetched.settingsVersion,
                            loaded: settingsRes.version
                        });
                    } else {
                        useConfigurationStore.getState().setSettingsFallbackActive(null);
                    }
                } else if (fetched && (fetched.specHost || fetched.axesSettings)) {
                    // Backwards compatibility for legacy configurations containing inline settings
                    settingsToApply = {
                        settingsVersion: 0,
                        specHost: fetched.specHost || defaultSettings.specHost,
                        requireSpecEnable: fetched.requireSpecEnable ?? defaultSettings.requireSpecEnable,
                        systemName: fetched.systemName || defaultSettings.systemName,
                        controllerHost: fetched.controllerHost || defaultSettings.controllerHost,
                        axisCount: fetched.axisCount ?? defaultSettings.axisCount,
                        taskCount: fetched.taskCount ?? defaultSettings.taskCount,
                        axesSettings: fetched.axesSettings || defaultSettings.axesSettings,
                        signalSettings: fetched.signalSettings || defaultSettings.signalSettings
                    };
                    useConfigurationStore.getState().setSettingsFallbackActive(null);
                } else {
                    // If no settings exist on server disk, auto-create settings0.json and post immediately
                    settingsToApply = { ...defaultSettings };
                    try {
                        const postRes = await postSettingsToGateway(dir, defaultSettings);
                        if (postRes && postRes.success) {
                            settingsToApply.settingsVersion = postRes.version;
                        }
                    } catch (err) {
                        console.warn("Failed to auto-create missing settings file on server", err);
                    }

                    if (fetched && fetched.settingsVersion !== undefined && fetched.settingsVersion !== null && fetched.settingsVersion !== settingsToApply.settingsVersion) {
                        useConfigurationStore.getState().setSettingsFallbackActive({
                            expected: fetched.settingsVersion,
                            loaded: settingsToApply.settingsVersion
                        });
                    } else {
                        useConfigurationStore.getState().setSettingsFallbackActive(null);
                    }
                }

                const normalizedFetched = fetched ? normalizeConfig(fetched) : null;

                if (normalizedFetched) {
                    // Loaded existing JSON configuration
                    const effectiveSettingsVersion = (settingsRes && !settingsRes.isFallback)
                        ? (normalizedFetched.settingsVersion ?? settingsToApply.settingsVersion)
                        : settingsToApply.settingsVersion;

                    const mergedSaved = {
                        ...normalizedFetched,
                        requiredAxes: normalizedFetched.requiredAxes || ["A", "B", "RA", "RB"],
                        daqFrequency: normalizedFetched.daqFrequency ?? 1,
                        samplePoints: normalizedFetched.samplePoints ?? 1000,
                        handlerProfiles: normalizedFetched.handlerProfiles || [],
                        xrayProfiles: normalizedFetched.xrayProfiles || [],
                        ...settingsToApply,
                        settingsVersion: effectiveSettingsVersion
                    };
                    updateDraft({
                        requiredAxes: mergedSaved.requiredAxes,
                        daqFrequency: mergedSaved.daqFrequency,
                        samplePoints: mergedSaved.samplePoints,
                        handlerProfiles: mergedSaved.handlerProfiles,
                        xrayProfiles: mergedSaved.xrayProfiles,
                        ...settingsToApply,
                        settingsVersion: effectiveSettingsVersion
                    });
                    setSavedConfig(mergedSaved);
                } else {
                    // Initialize blank default setup config
                    const defaults = {
                        cycleNumber: draft.cycleNumber,
                        userId: draft.userId,
                        sampleName: draft.sampleName,
                        experimentNumber: draft.experimentNumber,
                        configDirectory: draft.configDirectory,
                        requiredAxes: ["A", "B", "RA", "RB"],
                        daqFrequency: 1,
                        samplePoints: 1000,
                        handlerProfiles: [],
                        xrayProfiles: [],
                        ...settingsToApply
                    };
                    updateDraft({
                        requiredAxes: ["A", "B", "RA", "RB"],
                        daqFrequency: 1,
                        samplePoints: 1000,
                        handlerProfiles: [],
                        xrayProfiles: [],
                        ...settingsToApply
                    });
                    setSavedConfig(defaults);
                }
                setLastLoadedPath(`${dir}::${exp}`);
                commitPathRefs();
            } catch (err) {
                console.error("Failed to fetch path config from gateway", err);
            }
        };

        loadConfig();
    }, [draft.configDirectory, draft.experimentNumber, lastLoadedPath]);

    const revertPathSelectors = () => {
        updateDraft({
            cycleNumber: lastCycle.current,
            userId: lastBtr.current,
            sampleName: lastSample.current,
            experimentNumber: lastExp.current,
            configDirectory: lastManualPath.current
        });
        setSelectedStation(lastStation.current);
        setIsManualPath(lastIsManualPath.current);
    };

    // Transition execution triggers
    const executeCycleChange = async (val: string) => {
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
        lastCycle.current = val;
        lastStation.current = "";
        lastBtr.current = "";
        lastSample.current = "";
        lastExp.current = "";
        lastManualPath.current = "";
    };

    const executeStationChange = async (val: string) => {
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
                const btrs = await fetchDirItems('btr', draft.cycleNumber + "/" + val);
                setBtrOptions(btrs);
            } catch (error) {
                console.error("Failed to load users for station", error);
            }
        }
        lastStation.current = val;
        lastBtr.current = "";
        lastSample.current = "";
        lastExp.current = "";
        lastManualPath.current = "";
    };

    const executeBtrChange = async (val: string) => {
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
                const samples = await fetchDirItems('sample', draft.cycleNumber + "/" + selectedStation + "/" + val);
                setSampleOptions(samples);
            } catch (error) {
                console.error("Failed to load samples for user/btr", error);
            }
        }
        lastBtr.current = val;
        lastSample.current = "";
        lastExp.current = "";
        lastManualPath.current = "";
    };

    const executeSampleChange = async (val: string) => {
        const updateAndFetchDir = async (sampleVal: string) => {
            const fullDir = `/nfs/chess/aux/cycles/${draft.cycleNumber}/${selectedStation}/${draft.userId}/metadata/${sampleVal}/`;
            updateDraft({
                sampleName: sampleVal,
                experimentNumber: "",
                configDirectory: fullDir
            });
            setExperimentOptions([]);
            try {
                const exps = await fetchDirItems('experiment', draft.cycleNumber + "/" + selectedStation + "/" + draft.userId + "/metadata/" + sampleVal);
                setExperimentOptions(exps);
            } catch (error) {
                console.error("Failed to load experiments for sample", error);
            }
            lastSample.current = sampleVal;
            lastExp.current = "";
            lastManualPath.current = fullDir;
        };

        if (val === "new-sample-action") {
            const newName = prompt("Enter new sample name:");
            if (newName && newName.trim()) {
                const cleaned = newName.trim();
                if (!sampleOptions.includes(cleaned)) {
                    setSampleOptions(prev => [...prev, cleaned]);
                }
                await updateAndFetchDir(cleaned);
            } else {
                revertPathSelectors();
            }
        } else {
            if (val) {
                await updateAndFetchDir(val);
            } else {
                updateDraft({ sampleName: "", configDirectory: "" });
                setExperimentOptions([]);
                lastSample.current = "";
                lastExp.current = "";
                lastManualPath.current = "";
            }
        }
    };

    const executeExperimentChange = (val: string) => {
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
            lastExp.current = nextExpStr;
        } else {
            updateDraft({ experimentNumber: val });
            lastExp.current = val;
        }
    };

    const executeManualDirectoryChange = (val: string) => {
        updateDraft({ configDirectory: val });
        const parsed = parseDirectoryPath(val);
        if (parsed) {
            setSelectedStation(parsed.station);
            updateDraft({
                cycleNumber: parsed.cycle,
                userId: parsed.btr,
                sampleName: parsed.sample
            });
            lastCycle.current = parsed.cycle;
            lastStation.current = parsed.station;
            lastBtr.current = parsed.btr;
            lastSample.current = parsed.sample;
        }
        lastManualPath.current = val;
    };

    const executeManualToggleClick = async () => {
        if (isManualPath) {
            setIsManualPath(false);
            lastIsManualPath.current = false;
            if (draft.configDirectory) {
                const parsed = parseDirectoryPath(draft.configDirectory);
                if (parsed) {
                    try {
                        const stations = await fetchDirItems('station', parsed.cycle);
                        setStationOptions(stations);
                        
                        const btrs = await fetchDirItems('btr', parsed.cycle + "/" + parsed.station);
                        setBtrOptions(btrs);
                        
                        const samples = await fetchDirItems('sample', parsed.cycle + "/" + parsed.station + "/" + parsed.btr);
                        setSampleOptions(samples);
                        
                        const exps = await fetchDirItems('experiment', parsed.cycle + "/" + parsed.station + "/" + parsed.btr + "/metadata/" + parsed.sample);
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
                lastIsManualPath.current = true;
            } else {
                setShowManualWarningModal(true);
            }
        }
    };

    const isMechTestDirty = useMechanicalTestStore(state => state.isDirty);
    const isAnyDirty = isDirty || isMechTestDirty;

    // User change interceptors (gate with Discard modal if dirty)
    const handleCycleChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'cycle', val });
            setShowDiscardModal(true);
        } else {
            executeCycleChange(val);
        }
    };

    const handleStationChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'station', val });
            setShowDiscardModal(true);
        } else {
            executeStationChange(val);
        }
    };

    const handleBtrChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'btr', val });
            setShowDiscardModal(true);
        } else {
            executeBtrChange(val);
        }
    };

    const handleSampleChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'sample', val });
            setShowDiscardModal(true);
        } else {
            executeSampleChange(val);
        }
    };

    const handleExperimentChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'experiment', val });
            setShowDiscardModal(true);
        } else {
            executeExperimentChange(val);
        }
    };

    const handleManualDirectoryChange = (val: string) => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'manual', val });
            setShowDiscardModal(true);
        } else {
            executeManualDirectoryChange(val);
        }
    };

    const handleManualToggleClick = () => {
        if (isAnyDirty) {
            setPendingPathChange({ type: 'manualToggle', val: null });
            setShowDiscardModal(true);
        } else {
            executeManualToggleClick();
        }
    };

    const handleConfirmDiscard = async () => {
        setShowDiscardModal(false);

        // Reset configuration draft and sequence cards to clean saved baselines
        if (savedConfig) {
            updateDraft(JSON.parse(JSON.stringify(savedConfig)));
        }
        const mechStore = useMechanicalTestStore.getState();
        mechStore.setCards(JSON.parse(JSON.stringify(mechStore.savedCards)));

        if (pendingPathChange) {
            const { type, val } = pendingPathChange;
            switch (type) {
                case 'cycle':
                    await executeCycleChange(val);
                    break;
                case 'station':
                    await executeStationChange(val);
                    break;
                case 'btr':
                    await executeBtrChange(val);
                    break;
                case 'sample':
                    await executeSampleChange(val);
                    break;
                case 'experiment':
                    executeExperimentChange(val);
                    break;
                case 'manual':
                    executeManualDirectoryChange(val);
                    break;
                case 'manualToggle':
                    await executeManualToggleClick();
                    break;
            }
        }
        setPendingPathChange(null);
    };

    const handleCancelDiscard = () => {
        setShowDiscardModal(false);
        revertPathSelectors();
        setPendingPathChange(null);
    };

    const handleConfirmManualProceed = () => {
        if (dontShowWarningAgain) {
            sessionStorage.setItem('dismissManualWarning', 'true');
        }
        setIsManualPath(true);
        lastIsManualPath.current = true;
        setShowManualWarningModal(false);
    };



    const proceedSave = async () => {
        try {
            const prunedPayload = pruneConfigForSave(draft);
            await postConfigToGateway(prunedPayload);
            const name = "rams4/" + draft.sampleName.trim() + `/config${draft.experimentNumber.trim()}.json`;
            console.log(`Successfully saved and synced config: ${name}`);
            alert(`Configuration successfully saved to: ${name}`);
            
            // Sync is baseline clean
            setSavedConfig(JSON.parse(JSON.stringify(draft)));
            commitPathRefs();
        } catch (error) {
            console.error('Failed to sync configuration to backend gateway', error);
            alert('Failed to sync to the backend gateway.');
        }
    };

    const handleSave = async () => {
        const allErrors = Object.values(validationErrors).flat();
        if (allErrors.length > 0) {
            setShowConfirmDialog(true);
            return;
        }

        await proceedSave();
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

    return (
        <div className="flex flex-col gap-2 w-full max-w-5xl mx-auto min-w-[800px] h-full min-h-0 text-left">
            {/* Top Toolbar Header (Always Visible) */}
            <div className="flex items-center justify-between pb-2 border-b border-mauve-200 shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-xs font-bold text-mauve-850 flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-mauve-650" />
                        Configure
                    </h2>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                    {/* Inline Path Selectors with Scroll & Fade Mask */}
                    <div className="relative h-9 flex items-center shrink min-w-0">
                        {isManualPath ? (
                            <div className="mb-0 mr-4 flex items-center gap-2 min-w-lg max-w-full md:w-2xl">
                                <span className="shrink-0 text-xs text-mauve-850 font-semibold">Directory:</span>
                                <Input
                                    value={draft.configDirectory}
                                    onChange={(e: any) => handleManualDirectoryChange(e.target.value)}
                                    placeholder="/nfs/chess/aux/cycles/..."
                                    className="h-7 w-full bg-white border-mauve-200 rounded-lg text-xs px-2.5 shadow-sm focus-visible:ring-mauve-400"
                                />
                            </div>
                        ) : (
                            <div className="relative flex items-center">
                                <div
                                    ref={scrollRef}
                                    className="flex flex-row items-center gap-3.5 overflow-x-auto sleek-scrollbar pb-1 pt-0.5 pr-4 font-semibold text-mauve-650 text-xs max-w-xl md:max-w-full"
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
                                            <SelectTrigger className="h-7 w-[160px] bg-white border-mauve-200 rounded-lg text-xs px-2 shadow-sm disabled:opacity-50">
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
                            </div>
                        )}
                    </div>

                    {/* Manual Path Mode Toggle Button - shifted to the right of path selector */}
                    <div className="flex items-center pb-1 pt-0.5">
                        <TooltipProvider delayDuration={350}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        onClick={handleManualToggleClick}
                                        className={`h-7 w-7 p-0 rounded-lg border transition-colors shadow-sm shrink-0 ${
                                            isManualPath
                                                ? 'bg-mauve-600 text-white hover:bg-mauve-700 border-transparent'
                                                : 'bg-white text-mauve-600 hover:bg-mauve-50 border-mauve-200'
                                        }`}
                                    >
                                        <PencilLine className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-[10px] p-2">
                                    {isManualPath ? "Switch back to path select dropdowns" : tooltips.manualPath}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Attached Tab Card Container */}
            <div className="flex flex-col flex-1 min-h-0 bg-white rounded-md border border-mauve-200 overflow-hidden">
                {/* Tab Header Bar (Safari-style tabs tray) */}
                <div className="flex items-center border-b border-mauve-150 px-4 py-2 bg-mauve-50/40 shrink-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="bg-mauve-100/50 p-1 gap-1.5 rounded-md border border-mauve-200 flex w-fit">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="py-1 px-3.5 rounded-sm text-xs transition-all cursor-pointer font-semibold text-mauve-650 hover:bg-white/40 data-[state=active]:bg-white data-[state=active]:text-mauve-850 dark:data-[state=active]:text-primary dark:data-[state=active]:bg-primary/15 data-[state=active]:shadow-sm border border-transparent"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    {/* Save Button */}
                    <TooltipProvider delayDuration={350}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="secondary"
                                        onClick={handleSave}
                                        disabled={!isDirty}
                                        className="h-7 mx-2 shadow-sm text-xs font-semibold rounded-lg"
                                    >
                                        {isDirty ? (
                                            <Save className="h-3.5 w-3.5" />
                                        ) : (
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                        )}
                                        Save Configuration
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] p-2">
                                {tooltips.saveConfig}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Tab Content view */}
                <div className="flex-1 overflow-y-auto px-5 pt-3 pb-1 min-h-0">
                    {draft.configDirectory && draft.experimentNumber ? (
                        activeTab && renderTabContent()
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-mauve-200 rounded-sm p-8 text-center bg-mauve-50/10">
                            <div className="h-10 w-10 rounded-full bg-mauve-100 flex items-center justify-center mb-3">
                                <PencilLine className="h-5 w-5 text-mauve-650" />
                            </div>
                            <h3 className="text-sm font-bold text-mauve-850">Set Configuration Path</h3>
                            <p className="text-xs text-mauve-600 max-w-xs mt-1 leading-relaxed">
                                Please select a Cycle, Station, BTR, Sample, and Experiment to create or load a configuration.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Validation Error Modal */}
            <WarningModal
                isOpen={showConfirmDialog}
                title="Cannot Save Configuration"
                description="Please resolve all validation errors before saving."
                confirmText="OK"
                cancelText=""
                onConfirm={() => setShowConfirmDialog(false)}
                onCancel={() => setShowConfirmDialog(false)}
            >
                <div className="bg-red-50/50 border border-red-100 rounded-sm p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                    <span className="text-xs font-bold text-red-800">Please fix the following fields:</span>
                    <ul className="list-disc list-inside text-xs text-red-700 space-y-1.5 pl-1">
                        {Object.values(validationErrors).flat().map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            </WarningModal>

            {/* Path Selector Discard Changes Warning Dialog */}
            <WarningModal
                isOpen={showDiscardModal}
                title="Discard Changes?"
                description={
                    isDirty && isMechTestDirty
                        ? "You have unsaved changes in both your configuration and mechanical test. Changing the path will discard all unsaved changes."
                        : isMechTestDirty
                        ? "You have unsaved changes in your current mechanical test. Changing the path will discard these changes."
                        : "You have unsaved changes in your current configuration. Changing the path will discard these changes."
                }
                confirmText="Discard & Proceed"
                cancelText="Keep Changes"
                onConfirm={handleConfirmDiscard}
                onCancel={handleCancelDiscard}
            />

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
                    <label htmlFor="dontShowAgain" className="text-xs text-gray-550 font-medium select-none cursor-pointer">
                        Don't show warning again for this session
                    </label>
                </div>
            </WarningModal>
        </div>
    );
};

// Reusable Warning Modal Sub-component

