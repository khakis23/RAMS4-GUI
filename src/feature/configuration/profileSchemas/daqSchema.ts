import { z } from 'zod';

export const cycleRangeSchema = z.object({
    start: z.number().min(0, "Must be positive."),
    stop: z.number().min(0, "Must be positive."),
    step: z.number().min(1, "Must be at least 1."),
});

export const handlerProfileSchema = z.object({
    mode: z.string().min(1, "Mode is required."),
    filename: z.string().min(1, "Name is required."),
    verboseAxis: z.string(),
    verboseSystem: z.number(),
    verboseTask: z.string(),
    verboseIO: z.number(),
    verboseAi: z.string(),
    aiLoadA: z.boolean().optional(),
    aiStrain: z.boolean().optional(),
    aiCustom: z.string().optional(),
    frequency: z.number().optional(),
    cycles: z.array(cycleRangeSchema).optional(),
    signalAxis: z.string().optional(),
    signalItem: z.string().optional(),
    signalProminence: z.number().optional(),
    psoAxis: z.string().optional(),
    signalLoad: z.string().optional(),
    signalStrain: z.string().optional(),
}).superRefine((data, ctx) => {
    // Mode-specific conditional validation rules
    if (data.mode === "time-series") {
        if (data.frequency === undefined || isNaN(data.frequency)) {
            ctx.addIssue({
                code: "custom",
                path: ["frequency"],
                message: "Frequency is required.",
            });
        }
    } else if (data.mode === "peak-valley") {
        if (!data.signalAxis || data.signalAxis.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["signalAxis"],
                message: "Signal Axis is required.",
            });
        }
        if (!data.signalItem || data.signalItem.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["signalItem"],
                message: "Signal Item is required.",
            });
        }
        if (data.signalProminence === undefined || isNaN(data.signalProminence)) {
            ctx.addIssue({
                code: "custom",
                path: ["signalProminence"],
                message: "Prominence is required.",
            });
        }
    } else if (data.mode === "pso") {
        if (!data.psoAxis || data.psoAxis.trim() === "") {
            ctx.addIssue({
                code: "custom",
                path: ["psoAxis"],
                message: "PSO Axis is required.",
            });
        }
    }
});

export const daqSchema = z.object({
    requiredAxes: z.array(z.string()).min(2, "At least two axes are required."),
    daqFrequency: z.number().min(1, "Sampling frequency is required."),
    samplePoints: z.number()
        .min(1, "Sample points are required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 100, {   // TODO placeholder test
            message: "Must be a number greater than or equal to 100."
        }),
    handlersProfile: z.array(handlerProfileSchema),
});
