import { z } from 'zod';

export const rampSchema = z.object({
    axis: z.enum(['A', 'B', 'RA', 'RB', 'TENS'], { message: "Axis is required" }),
    mode: z.enum(['incremental', 'absolute'], { message: "Mode is required" }),
    control: z.enum(['displacement', 'load', 'strain'], { message: "Control is required" }),
    target: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Target is required" })
    ),
    time: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Time must be a number" }).optional().nullable()
    ),
    velocity: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Velocity must be a number" }).optional().nullable()
    ),
    dispToggle: z.enum(['time', 'velocity']).optional().nullable(),
    max_displacement: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Max displacement must be a number" }).default(1.0)
    ),
    enable_dic: z.boolean().default(false),
    skipDICpos: z.boolean().default(false),
    incrementSeg: z.boolean().default(false),
    wait: z.boolean().default(true)
}).superRefine((data, ctx) => {
    if (data.control === 'displacement') {
        if (data.dispToggle === 'time' && (data.time === undefined || data.time === null)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['time'],
                message: "Time is required"
            });
        }
        if (data.dispToggle === 'velocity' && (data.velocity === undefined || data.velocity === null)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['velocity'],
                message: "Velocity is required"
            });
        }
    } else {
        if (data.velocity === undefined || data.velocity === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['velocity'],
                message: "Velocity is required"
            });
        }
    }
});

export const takeSchema = z.object({
    profileID: z.string({ message: "Image Profile is required" }).min(1, "Image Profile is required"),
    imgMode: z.string().optional().nullable(),
    pauseTsDaq: z.boolean().default(false)
});

export const mechTestCardSchema = z.object({
    id: z.string(),
    type: z.enum(['ramp', 'take']),
    data: z.any()
}).superRefine((card, ctx) => {
    if (card.type === 'ramp') {
        const res = rampSchema.safeParse(card.data);
        if (!res.success) {
            res.error.issues.forEach(issue => {
                ctx.addIssue({
                    ...issue,
                    path: ['data', ...issue.path]
                });
            });
        }
    } else if (card.type === 'take') {
        const res = takeSchema.safeParse(card.data);
        if (!res.success) {
            res.error.issues.forEach(issue => {
                ctx.addIssue({
                    ...issue,
                    path: ['data', ...issue.path]
                });
            });
        }
    }
});

export const mechTestFormSchema = z.object({
    cards: z.array(mechTestCardSchema)
});
