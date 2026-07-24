/**
 * SCIENTIST-FRIENDLY PARAMETER LIMITS CONFIGURATION
 * 
 * Central configuration for numeric validation boundaries (minimums, maximums,
 * steps, defaults) across mechanical steps, X-ray scan profiles, DAQ, and hardware.
 */

export const PARAMETER_LIMITS = {
    // =========================================================================
    // 1. MECHANICAL TEST BUILDER STEPS
    // =========================================================================
    mechTest: {
        ramp: {
            time: { min: 0.001, max: 86400 },
            velocityLoad: { min: 0.001, max: 10000 },
            velocityStrain: { min: 0.00001, max: 1.0 },
            velocityDisplacement: { min: 0.0001, max: 500 },
            maxDisplacement: { min: 0.001, max: 1000, default: 1.0 },
        },
        dwell: {
            time: { min: 0.1, max: 86400 },
            velocityLoad: { min: 0.001, max: 10000 },
            velocityStrain: { min: 0.00001, max: 1.0 },
        },
        cycle: {
            frequency: { min: 0.001, max: 100 },
            cycleEnd: { min: 1, max: 10000000 },
            ampScale: { min: 0.01, max: 2.0, default: 0.95 },
        },
        group: {
            loops: { min: 1, max: 100000, default: 1 },
            maxNestingDepth: 2,
        }
    },

    // =========================================================================
    // 2. X-RAY SCAN PROFILES
    // =========================================================================
    xray: {
        exposureTime: { min: 0.0001, max: 3600 },
        beamHeight: { min: 0.0, max: 25.0 },
        beamWidth: { min: 0.0, max: 25.0 },
        attenuation: { min: 0.0, max: 50.0, step: 0.1 },
        stills: {
            numPoints: { min: 1, max: 10000 },
        },
        mapscan: {
            points: { min: 1, max: 10000 },
            maxAxes: 2,
        },
        rotation: {
            numPoints: { min: 1, max: 10000 },
            numLayers: { min: 1, max: 1000 },
        }
    },

    // =========================================================================
    // 3. DATA ACQUISITION (DAQ)
    // =========================================================================
    daq: {
        daqFrequency: { min: 1, max: 250000 },
        samplePoints: { min: 100, max: 10000000 },
        cycleRange: {
            start: { min: 0, max: 10000000 },
            stop: { min: 0, max: 10000000 },
            step: { min: 1, max: 100000 },
        },
    },

    // =========================================================================
    // 4. SYSTEM & CONTROLLER SETTINGS
    // =========================================================================
    settings: {
        axisCount: { min: 1, max: 64 },
        taskCount: { min: 1, max: 64 },
        maxVelocity: { min: 0.0, max: 2000.0 },
        maxAcceleration: { min: 0.0, max: 10000.0 },
        signalChannel: { min: 0, max: 128 },
    }
} as const;
