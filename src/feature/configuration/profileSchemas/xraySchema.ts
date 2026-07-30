import { z } from 'zod';
import { PARAMETER_LIMITS } from '../../../config/parameterLimits.ts';

// Validation preprocessors following the safe required/nullable number trend in daqSchema.ts
const safeNullableNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? null : Number(val)),
    z.number().nullable().optional()
) as z.ZodType<number | null | undefined, any, any>;

const safeRequiredNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? null : Number(val)),
    z.number().nullable().optional()
) as z.ZodType<number | null | undefined, any, any>;

const stillPointSchema = z.object({
    ramsx: safeNullableNumber,
    ramsz: safeNullableNumber,
    ome: safeNullableNumber,
    numPoints: safeNullableNumber
});

export const mapscanAxisSchema = z.object({
    axisName: z.string().min(1, "Moving Axis is required."),
    start: safeNullableNumber,
    stop: safeNullableNumber,
    points: safeNullableNumber
});

export const rotationLayerRangeSchema = z.object({
    omeStart: safeNullableNumber,
    omeStop: safeNullableNumber,
    numPoints: safeNullableNumber,
    layerStart: safeNullableNumber,
    layerEnd: safeNullableNumber,
    numLayers: safeNullableNumber
});

export const xrayProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Profile Name is required."),
    mode: z.enum(['rotation-series', 'stills', 'mapscan', 'tseries', 'dscan', 'mesh']),
    
    // Shared general parameters
    ctime: safeNullableNumber,
    beamHeight: safeNullableNumber,
    beamWidth: safeNullableNumber,
    atten: safeNullableNumber,

    // Shared reference coordinates
    ramsx: safeNullableNumber,
    ramsz: safeNullableNumber,
    ome: safeNullableNumber,

    stillPoints: z.array(stillPointSchema).optional(),
    mapscanAxes: z.array(mapscanAxisSchema).max(PARAMETER_LIMITS.xray.mapscan.maxAxes, `Maximum ${PARAMETER_LIMITS.xray.mapscan.maxAxes} axes allowed for Mapscan.`).optional(),
    layerRanges: z.array(rotationLayerRangeSchema).optional()
}).superRefine((data, ctx) => {
    if (data.ctime === null || data.ctime === undefined || data.ctime <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Exposure Time must be greater than 0.",
            path: ["ctime"]
        });
    }
    if (data.beamHeight !== null && data.beamHeight !== undefined && data.beamHeight < PARAMETER_LIMITS.xray.beamHeight.min) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Beam Height must be 0 or positive.",
            path: ["beamHeight"]
        });
    }
    if (data.beamWidth !== null && data.beamWidth !== undefined && data.beamWidth < PARAMETER_LIMITS.xray.beamWidth.min) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Beam Width must be 0 or positive.",
            path: ["beamWidth"]
        });
    }
    if (data.atten !== null && data.atten !== undefined && data.atten < PARAMETER_LIMITS.xray.attenuation.min) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Attenuation must be 0 or positive.",
            path: ["atten"]
        });
    }

    if (data.mode === 'stills') {
        if (!data.stillPoints || data.stillPoints.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Stills profile must contain at least one point.",
                path: ["stillPoints"]
            });
        }
    } else if (data.mode === 'mapscan') {
        if (data.ramsx === undefined || data.ramsx === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reference X is required.", path: ["ramsx"] });
        }
        if (data.ramsz === undefined || data.ramsz === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reference Z is required.", path: ["ramsz"] });
        }
        if (data.ome === undefined || data.ome === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reference Angle is required.", path: ["ome"] });
        }
    } else if (data.mode === 'rotation-series') {
        if (data.ramsx === undefined || data.ramsx === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reference X is required.", path: ["ramsx"] });
        }
        if (!data.layerRanges || data.layerRanges.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Rotation Series profile must contain at least one layer range.",
                path: ["layerRanges"]
            });
        }
    }
});

export const xrayFormSchema = z.object({
    xrayProfiles: z.array(xrayProfileSchema),
});
