import { GlobalConfig } from "@/types/config";

/**
 * Recursively removes null and undefined values from an object or array.
 * @param obj The object or array to clean
 * @returns A new object or array with all null and undefined values removed.
 */
export const removeNulls = (obj: any): any => {
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

/**
 * Prepares the global configuration payload for saving to the backend gateway.
 * Prunes empty optional parameters and dynamic empty arrays that should not be transmitted.
 * 
 * @param config The current draft GlobalConfig state.
 * @returns A deep copy of the configuration payload with all undefined/null fields removed.
 */
export const pruneConfigForSave = (config: GlobalConfig): Partial<GlobalConfig> => {
    const cleanConfig = JSON.parse(JSON.stringify(config));

    // Prune handlerProfiles
    if (cleanConfig.handlerProfiles) {
        const totalCount = cleanConfig.handlerProfiles.length;
        cleanConfig.handlerProfiles = cleanConfig.handlerProfiles.map((hp: any, idx: number) => {
            const daqType = hp.mode === 'time-series' 
                ? 'timeseries' 
                : (hp.mode === 'peak-valley' ? 'peakvalley' : 'pso');
            const sample = (cleanConfig.sampleName || '').trim();
            const exp = (cleanConfig.experimentNumber || '').trim();
            const autoName = `${sample}_${daqType}_${exp}-${totalCount - idx}`;
            const resolvedName = (hp.filename && hp.filename.trim() !== '') ? hp.filename.trim() : autoName;

            const cleanHp: any = {
                mode: hp.mode,
                filename: resolvedName,
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

    if (cleanConfig.dicProfiles) {
        cleanConfig.dicProfiles = cleanConfig.dicProfiles.map((dp: any) => ({
            id: dp.id,
            name: dp.name,
            mode: dp.mode,
            ctime: dp.ctime,
            stillPoints: (dp.stillPoints || []).map((sp: any) => ({
                ramsx: sp.ramsx,
                ramsz: sp.ramsz,
                ome: sp.ome,
                numPoints: sp.numPoints
            }))
        }));
    }

    return removeNulls(cleanConfig);
};

export const normalizeConfig = (config: any) => {
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

    if (cleanConfig.dicProfiles) {
        cleanConfig.dicProfiles = cleanConfig.dicProfiles.map((dp: any) => ({
            id: dp.id,
            name: dp.name,
            mode: dp.mode || 'stills',
            ctime: dp.ctime ?? null,
            stillPoints: dp.stillPoints || []
        }));
    }

    return cleanConfig;
};

export const deepEqual = (a: any, b: any): boolean => {
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
