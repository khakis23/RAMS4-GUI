import { z } from 'zod';

// Validation preprocessors following the safe required/nullable number trend in daqSchema.ts
const safeNullableNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
    z.number().optional()
) as z.ZodType<number | undefined, any, any>;

const safeRequiredNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? 0 : Number(val)),
    z.number()
) as z.ZodType<number, any, any>;

const stillPointSchema = z.object({
    ramsx: safeRequiredNumber,
    ramsz: safeRequiredNumber,
    ome: safeRequiredNumber,
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? 1 : Number(val)),
        z.number().int().min(1, "Must be 1 or more images.")
    )
});

export const xrayProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Profile Name is required."),
    mode: z.enum(['rotation-series', 'stills', 'tseries', 'dscan', 'mesh']),
    
    // Shared parameters
    ramsx: safeRequiredNumber,
    ramsz: safeRequiredNumber,
    ome: safeRequiredNumber,
    ctime: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? 0.1 : Number(val)),
        z.number().min(0.0001, "Exposure Time must be greater than 0.")
    ),
    beamHeight: safeRequiredNumber.refine(val => val >= 0, "Beam Height must be 0 or positive."),
    beamWidth: safeRequiredNumber.refine(val => val >= 0, "Beam Width must be 0 or positive."),
    atten: safeRequiredNumber.refine(val => val >= 0, "Attenuation must be 0 or positive."),
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? 1 : Number(val)),
        z.number().int().min(1, "Num Points must be 1 or more.")
    ),

    // Optional fields with Zod refine checks or validation
    omeStart: safeNullableNumber,
    omeStop: safeNullableNumber,
    layerStart: safeNullableNumber,
    layerEnd: safeNullableNumber,
    numLayers: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number().int().min(1, "Must be at least 1 layer.").optional()
    ),

    stillPoints: z.array(stillPointSchema).optional(),

    axis1Name: z.string().optional(),
    axis1Start: safeNullableNumber,
    axis1Stop: safeNullableNumber,
    axis1Images: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number().int().min(1, "Must be at least 1 image.").optional()
    ),

    axis2Name: z.string().optional(),
    axis2Start: safeNullableNumber,
    axis2Stop: safeNullableNumber,
    axis2Images: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number().int().min(1, "Must be at least 1 image.").optional()
    ),
}).superRefine((data, ctx) => {
    // Mode-specific validation checks
    if (data.mode === 'rotation-series') {
        if (data.omeStart === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Initial Angle is required for Rotation Series.", path: ["omeStart"] });
        }
        if (data.omeStop === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Final Angle is required for Rotation Series.", path: ["omeStop"] });
        }
        if (data.layerStart === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Layer Start is required.", path: ["layerStart"] });
        }
        if (data.layerEnd === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Layer End is required.", path: ["layerEnd"] });
        }
        if (data.numLayers === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Num Layers is required.", path: ["numLayers"] });
        }
    } else if (data.mode === 'dscan') {
        if (!data.axis1Name) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Moving Axis 1 is required.", path: ["axis1Name"] });
        }
        if (data.axis1Start === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start limit is required.", path: ["axis1Start"] });
        }
        if (data.axis1Stop === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stop limit is required.", path: ["axis1Stop"] });
        }
        if (data.axis1Images === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Num Images is required.", path: ["axis1Images"] });
        }
    } else if (data.mode === 'mesh') {
        if (!data.axis1Name) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Moving Axis 1 is required.", path: ["axis1Name"] });
        }
        if (data.axis1Start === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start limit is required.", path: ["axis1Start"] });
        }
        if (data.axis1Stop === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stop limit is required.", path: ["axis1Stop"] });
        }
        if (data.axis1Images === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Num Images is required.", path: ["axis1Images"] });
        }
        if (!data.axis2Name) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Moving Axis 2 is required.", path: ["axis2Name"] });
        }
        if (data.axis2Start === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start limit is required.", path: ["axis2Start"] });
        }
        if (data.axis2Stop === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stop limit is required.", path: ["axis2Stop"] });
        }
        if (data.axis2Images === undefined) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Num Images is required.", path: ["axis2Images"] });
        }
    }
});

export const xrayFormSchema = z.object({
    xrayProfiles: z.array(xrayProfileSchema),
});
