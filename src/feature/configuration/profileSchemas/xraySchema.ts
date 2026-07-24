import { z } from 'zod';
import { PARAMETER_LIMITS } from '../../../config/parameterLimits.ts';

// Validation preprocessors following the safe required/nullable number trend in daqSchema.ts
const safeNullableNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
    z.number().optional()
) as z.ZodType<number | undefined, any, any>;

const safeRequiredNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
    z.number({ message: "Value is required." })
) as z.ZodType<number, any, any>;

const stillPointSchema = z.object({
    ramsx: safeRequiredNumber,
    ramsz: safeRequiredNumber,
    ome: safeRequiredNumber,
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Images is required." }).int().min(PARAMETER_LIMITS.xray.stills.numPoints.min, `Must be ${PARAMETER_LIMITS.xray.stills.numPoints.min} or more images.`)
    )
});

export const mapscanAxisSchema = z.object({
    axisName: z.string().min(1, "Moving Axis is required."),
    start: safeRequiredNumber,
    stop: safeRequiredNumber,
    points: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Points is required." }).int().min(PARAMETER_LIMITS.xray.mapscan.points.min, `Must be at least ${PARAMETER_LIMITS.xray.mapscan.points.min} point.`)
    )
});

export const rotationLayerRangeSchema = z.object({
    omeStart: safeRequiredNumber,
    omeStop: safeRequiredNumber,
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Points is required." }).int().min(PARAMETER_LIMITS.xray.rotation.numPoints.min, `Must be at least ${PARAMETER_LIMITS.xray.rotation.numPoints.min} point.`)
    ),
    layerStart: safeRequiredNumber,
    layerEnd: safeRequiredNumber,
    numLayers: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Layers is required." }).int().min(PARAMETER_LIMITS.xray.rotation.numLayers.min, `Must be at least ${PARAMETER_LIMITS.xray.rotation.numLayers.min} layer.`)
    )
});

export const xrayProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Profile Name is required."),
    mode: z.enum(['rotation-series', 'stills', 'mapscan']),
    
    // Shared general parameters
    ctime: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Exposure Time is required." }).min(PARAMETER_LIMITS.xray.exposureTime.min, "Exposure Time must be greater than 0.")
    ),
    beamHeight: safeRequiredNumber.refine(val => val >= PARAMETER_LIMITS.xray.beamHeight.min, "Beam Height must be 0 or positive."),
    beamWidth: safeRequiredNumber.refine(val => val >= PARAMETER_LIMITS.xray.beamWidth.min, "Beam Width must be 0 or positive."),
    atten: safeRequiredNumber.refine(val => val >= PARAMETER_LIMITS.xray.attenuation.min, "Attenuation must be 0 or positive."),

    // Shared reference coordinates
    ramsx: safeNullableNumber,
    ramsz: safeNullableNumber,
    ome: safeNullableNumber,

    stillPoints: z.array(stillPointSchema).optional(),
    mapscanAxes: z.array(mapscanAxisSchema).max(PARAMETER_LIMITS.xray.mapscan.maxAxes, `Maximum ${PARAMETER_LIMITS.xray.mapscan.maxAxes} axes allowed for Mapscan.`).optional(),
    layerRanges: z.array(rotationLayerRangeSchema).optional()
}).superRefine((data, ctx) => {
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
        if (!data.mapscanAxes || data.mapscanAxes.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Mapscan profile must contain at least one axis.",
                path: ["mapscanAxes"]
            });
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
