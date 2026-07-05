import { GlobalConfig, HandlerProfile } from '../../../store/useConfigurationStore';

/**
 * Safely converts any value to a number. If it evaluates to NaN, returns the fallback value.
 * This prevents NaN from being serialized as null in JSON payloads.
 */
const toSafeNum = (val: any, fallback = 0): number => {
    if (val === undefined || val === null || String(val).trim() === '') {
        return fallback;
    }
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
};

/**
 * Transforms the frontend store values (unified GlobalConfig) into the exact JSON shape the Python Gateway API expects.
 */
export const compileToBackendPayload = (
    config: GlobalConfig
) => {
    return {
        cycle: config.cycleNumber,
        newsample: config.sampleName,
        required_axes: config.requiredAxes,
        frequency_kHz: toSafeNum(config.daqFrequency, 0),
        sample_pts: toSafeNum(config.samplePoints, 0),
        handlers: config.handlerProfiles.map((p: HandlerProfile) => {
            // Support both single levels (e.g. 1) and raw coordinate lists per axis (e.g. [1,1,0,0,0])
            const cleanAxis = p.verboseAxis ? p.verboseAxis.replace(/[\[\]]/g, '').trim() : '';
            const axisPayload = (cleanAxis.includes(',') || cleanAxis.includes(' '))
                ? cleanAxis.split(',').map((val) => toSafeNum(val, 0))
                : toSafeNum(cleanAxis, -1);

            const cleanTask = p.verboseTask ? p.verboseTask.replace(/[\[\]]/g, '').trim() : '';
            const taskPayload = (cleanTask.includes(',') || cleanTask.includes(' '))
                ? cleanTask.split(',').map((val) => toSafeNum(val, 0))
                : toSafeNum(cleanTask, -1);

            // Parse verboseAi string back into list format containing aliases (strings) and indices (arrays of numbers)
            const cleanAi = p.verboseAi
                ? p.verboseAi.split(',').map(x => {
                    const trimmed = x.trim();
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                        return trimmed.replace(/[\[\]]/g, '').replace(',', ' ').split(/\s+/).map(n => toSafeNum(n, 0));
                    }
                    return trimmed;
                }).filter(Boolean)
                : null;

            const profilePayload: any = {
                mode: p.mode,
                filename: p.filename,
                signalLoad: p.signalLoad || null,
                signalStrain: p.signalStrain || null,
                verbose: {
                    axis: axisPayload,
                    system: toSafeNum(p.verboseSystem, 0),
                    task: taskPayload,
                    IO: toSafeNum(p.verboseIO, -1),
                    Ai: cleanAi
                }
            };

            // Time-Series Mode parameters mapping
            if (p.mode === 'time-series') {
                profilePayload.frequency = (p.frequency !== undefined && String(p.frequency).trim() !== '') 
                     ? toSafeNum(p.frequency, 0) 
                     : null;
                profilePayload.cycles = p.cycles && p.cycles.length > 0
                    ? p.cycles.map(c => {
                        if (c.start === c.stop) return c.start;
                        if (c.step === 1) return [c.start, c.stop];
                        return [c.start, c.stop, c.step];
                    })
                    : null;
            }
            
            // Peak-Valley Mode parameters mapping
            else if (p.mode === 'peak-valley') {
                profilePayload.signal = {
                    axis: toSafeNum(p.signalAxis, 0),
                    item: p.signalItem || 'PositionFeedback',
                    prominence: toSafeNum(p.signalProminence, 0)
                };
            }
            
            // PSO Mode parameters mapping
            else if (p.mode === 'pso') {
                profilePayload.psoAxis = toSafeNum(p.psoAxis, 0);
            }

            return profilePayload;
        })
    };
};
