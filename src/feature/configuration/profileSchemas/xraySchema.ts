import { z } from 'zod';

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
        z.number({ message: "Images is required." }).int().min(1, "Must be 1 or more images.")
    )
});

export const mapscanAxisSchema = z.object({
    axisName: z.string().min(1, "Moving Axis is required."),
    start: safeRequiredNumber,
    stop: safeRequiredNumber,
    points: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Points is required." }).int().min(1, "Must be at least 1 point.")
    )
});

export const rotationLayerRangeSchema = z.object({
    omeStart: safeRequiredNumber,
    omeStop: safeRequiredNumber,
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Points is required." }).int().min(1, "Must be at least 1 point.")
    ),
    layerStart: safeRequiredNumber,
    layerEnd: safeRequiredNumber,
    numLayers: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Layers is required." }).int().min(1, "Must be at least 1 layer.")
    )
});

export const xrayProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Profile Name is required."),
    mode: z.enum(['rotation-series', 'stills', 'mapscan']),
    
    // Shared general parameters
    ctime: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Exposure Time is required." }).min(0.0001, "Exposure Time must be greater than 0.")
    ),
    beamHeight: safeRequiredNumber.refine(val => val >= 0, "Beam Height must be 0 or positive."),
    beamWidth: safeRequiredNumber.refine(val => val >= 0, "Beam Width must be 0 or positive."),
    atten: safeRequiredNumber.refine(val => val >= 0, "Attenuation must be 0 or positive."),

    // Shared reference coordinates
    ramsx: safeNullableNumber,
    ramsz: safeNullableNumber,
    ome: safeNullableNumber,

    stillPoints: z.array(stillPointSchema).optional(),
    mapscanAxes: z.array(mapscanAxisSchema).max(2, "Maximum 2 axes allowed for Mapscan.").optional(),
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
