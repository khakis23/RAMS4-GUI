import { GeneralConfig } from '../../../store/configuration/useGeneralStore';
import { DAQSettings, HandlerProfile } from '../../../store/configuration/useDAQStore';

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
 * Transforms the frontend store values (General + DAQ) into the exact JSON shape the Python Gateway API expects.
 */
export const compileToBackendPayload = (
    general: GeneralConfig,
    daq: DAQSettings
) => {
    return {
        cycle: general.cycleNumber,
        newsample: general.sampleName,
        required_axes: general.requiredAxes,
        frequency_kHz: toSafeNum(daq.masterFrequency, 0),
        sample_pts: toSafeNum(daq.samplePoints, 0),
        handlers: daq.handlerProfiles.map((p: HandlerProfile) => {
            // Clean brackets [ ] from verboseAxis string if they exist, then split
            const cleanAxis = p.verboseAxis ? p.verboseAxis.replace(/[\[\]]/g, '').trim() : '';
            const axisList = (cleanAxis !== '')
                ? cleanAxis.split(',').map((val) => toSafeNum(val, 0))
                : [0, 0, 0, 0, 0];

            const profilePayload: any = {
                mode: p.mode,
                filename: p.filename,
                signalLoad: p.signalLoad || null,
                signalStrain: p.signalStrain || null,
                verbose: {
                    axis: axisList,
                    system: toSafeNum(p.verboseSystem, 0),
                    task: toSafeNum(p.verboseTask, -1),
                    IO: toSafeNum(p.verboseIO, -1),
                    Ai: p.verboseAi || null
                }
            };

            // Time-Series Mode parameters mapping
            if (p.mode === 'time-series') {
                profilePayload.frequency = (p.frequency !== undefined && String(p.frequency).trim() !== '') 
                    ? toSafeNum(p.frequency, 0) 
                    : null;
                profilePayload.cycles = (p.cycles && String(p.cycles).trim() !== '') 
                    ? p.cycles.replace(/[\[\]]/g, '').split(',').map((val) => toSafeNum(val, 0)) 
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
