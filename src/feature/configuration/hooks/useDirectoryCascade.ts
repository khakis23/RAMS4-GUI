import { useState, useEffect, useRef } from 'react';
import { fetchDirItems } from '@/api/configApi.ts';
import { useConfigurationStore } from '@/store/useConfigurationStore.ts';

export const parseDirectoryPath = (path: string) => {
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

export const useDirectoryCascade = (isManualPath: boolean) => {
    const [cycleOptions, setCycleOptions] = useState<string[]>([]);
    const [stationOptions, setStationOptions] = useState<string[]>([]);
    const [btrOptions, setBtrOptions] = useState<string[]>([]);
    const [sampleOptions, setSampleOptions] = useState<string[]>([]);
    const [experimentOptions, setExperimentOptions] = useState<string[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>("");

    const { draft, updateDraft } = useConfigurationStore();
    const hasLoadedInitial = useRef(false);

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
                    } else if (draft.cycleNumber) {
                        const stations = await fetchDirItems('station', draft.cycleNumber);
                        setStationOptions(stations);
                    }
                } else {
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
    }, [draft.configDirectory, updateDraft, draft.cycleNumber, isManualPath, selectedStation]);

    return {
        cycleOptions, setCycleOptions,
        stationOptions, setStationOptions,
        btrOptions, setBtrOptions,
        sampleOptions, setSampleOptions,
        experimentOptions, setExperimentOptions,
        selectedStation, setSelectedStation
    };
};
