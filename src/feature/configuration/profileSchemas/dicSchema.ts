import { z } from 'zod';

const safeNullableNumber = z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)) ? null : Number(val)),
    z.number().nullable().optional()
) as z.ZodType<number | null | undefined, any, any>;

export const dicFormSchema = z.object({
    dicEnabled: z.boolean().default(false),
    dicX: safeNullableNumber,
    dicZ: safeNullableNumber,
    dicAngle: safeNullableNumber,
    dicExposureTime: safeNullableNumber,
    dicStepSize: safeNullableNumber,
}).superRefine((data, ctx) => {
    if (data.dicEnabled) {
        if (data.dicX === null || data.dicX === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dicX'],
                message: 'X Position is required.'
            });
        }
        if (data.dicZ === null || data.dicZ === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dicZ'],
                message: 'Z Position is required.'
            });
        }
        if (data.dicAngle === null || data.dicAngle === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dicAngle'],
                message: 'Angle is required.'
            });
        }
    }
});
