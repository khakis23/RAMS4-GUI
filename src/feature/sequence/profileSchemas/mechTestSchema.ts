import { z } from 'zod';

export const rampSchema = z.object({
    axis: z.enum(['A', 'B', 'RA', 'RB', 'TENS'], { message: "Axis is required" }),
    mode: z.enum(['relative', 'absolute'], { message: "Mode is required" }),
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
    imgMode: z.string().min(1, "Image Mode is required").optional().nullable(),
    pauseTsDaq: z.boolean().default(false)
});

export const dwellSchema = z.object({
    axis: z.enum(['A', 'B', 'RA', 'RB', 'TENS'], { message: "Axis is required" }),
    control: z.enum(['load', 'strain'], { message: "Control is required" }),
    target: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Target is required" })
    ),
    velocity: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Velocity is required" })
    ),
    time: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Time is required" })
    ),
    wait: z.boolean().default(true)
});

export const cycleSchema = z.object({
    axis: z.enum(['A', 'B', 'RA', 'RB', 'TENS'], { message: "Axis is required" }),
    control: z.enum(['displacement', 'load', 'strain'], { message: "Control is required" }),
    mode: z.enum(['absolute', 'relative'], { message: "Mode is required" }),
    upper: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Upper limit is required" })
    ),
    lower: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Lower limit is required" })
    ),
    frequency: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Frequency is required" })
    ),
    countMode: z.enum(['absolute', 'relative'], { message: "Count mode is required" }),
    cycleEnd: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number({ message: "Count is required" })
    ),
    ampScale: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? 0.95 : Number(val),
        z.number({ message: "Amp scale must be a number" }).default(0.95)
    ),
    discoverEndpoints: z.boolean().default(false),
    recallEndpoints: z.boolean().default(false),
    "enable DIC": z.boolean().default(false),
    wait: z.boolean().default(true),
    manualDispUpper: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number().optional().nullable()
    ),
    manualDispLower: z.preprocess(
        (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val))) ? undefined : Number(val),
        z.number().optional().nullable()
    )
});

export const takeWhileSchema = z.object({
    take: z.object({
        data: takeSchema
    }),
    step: z.object({
        type: z.enum(['ramp', 'dwell', 'cycle']),
        data: z.any()
    }).superRefine((step, ctx) => {
        if (step.type === 'ramp') {
            const res = rampSchema.safeParse(step.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        } else if (step.type === 'dwell') {
            const res = dwellSchema.safeParse(step.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        } else if (step.type === 'cycle') {
            const res = cycleSchema.safeParse(step.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        }
    })
});

export interface MechTestCardData {
    id: string;
    type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile';
    data: any;
}

export const mechTestCardSchema: z.ZodType<MechTestCardData> = z.lazy(() =>
    z.object({
        id: z.string(),
        type: z.enum(['ramp', 'take', 'dwell', 'cycle', 'group', 'takeWhile']),
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
        } else if (card.type === 'dwell') {
            const res = dwellSchema.safeParse(card.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        } else if (card.type === 'cycle') {
            const res = cycleSchema.safeParse(card.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        } else if (card.type === 'takeWhile') {
            const res = takeWhileSchema.safeParse(card.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        } else if (card.type === 'group') {
            const groupDataSchema = z.object({
                loops: z.number().min(1).default(1),
                cards: z.array(mechTestCardSchema).min(1, "Group must contain at least one step")
            });
            const res = groupDataSchema.safeParse(card.data);
            if (!res.success) {
                res.error.issues.forEach(issue => {
                    ctx.addIssue({
                        ...issue,
                        path: ['data', ...issue.path]
                    });
                });
            }
        }
    })
);

const getMaxDepth = (cards: any[], currentDepth = 0): number => {
    let max = currentDepth;
    cards.forEach(card => {
        if (card.type === 'group' && card.data?.cards) {
            const depth = getMaxDepth(card.data.cards, currentDepth + 1);
            if (depth > max) {
                max = depth;
            }
        }
    });
    return max;
};

export const mechTestFormSchema = z.object({
    cards: z.array(mechTestCardSchema)
}).superRefine((form, ctx) => {
    const maxDepth = getMaxDepth(form.cards);
    if (maxDepth > 2) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cards'],
            message: `Nesting depth of groups exceeds the maximum limit of 2 (current depth: ${maxDepth})`
        });
    }
});
