import { z } from 'zod';
import { PARAMETER_LIMITS } from '../../../config/parameterLimits.ts';

const safeRequiredNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
    z.number({ message: "Value is required." })
) as z.ZodType<number, any, any>;

export const dicStillPointSchema = z.object({
    ramsx: safeRequiredNumber,
    ramsz: safeRequiredNumber,
    ome: safeRequiredNumber,
    numPoints: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Images is required." }).int().min(PARAMETER_LIMITS.xray.stills.numPoints.min, `Must be ${PARAMETER_LIMITS.xray.stills.numPoints.min} or more images.`)
    )
});

export const dicProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Profile Name is required."),
    mode: z.literal('stills'),
    ctime: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)),
        z.number({ message: "Exposure Time is required." }).min(PARAMETER_LIMITS.xray.exposureTime.min, "Exposure Time must be greater than 0.")
    ),
    stillPoints: z.array(dicStillPointSchema).optional()
}).superRefine((data, ctx) => {
    if (!data.stillPoints || data.stillPoints.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "DIC Stills profile must contain at least one point.",
            path: ["stillPoints"]
        });
    }
});

export const dicFormSchema = z.object({
    dicProfiles: z.array(dicProfileSchema),
});

