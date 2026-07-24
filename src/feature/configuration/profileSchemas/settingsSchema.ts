import { z } from 'zod';
import { PARAMETER_LIMITS } from '../../../config/parameterLimits.ts';

export const axisSettingSchema = z.object({
    name: z.string().min(1, "Axis name is required."),
    max_velocity: z.number().min(PARAMETER_LIMITS.settings.maxVelocity.min, "Velocity must be positive."),
    max_acceleration: z.number().min(PARAMETER_LIMITS.settings.maxAcceleration.min, "Acceleration must be positive.")
});

export const signalSettingSchema = z.object({
    name: z.string().min(1, "Signal name is required."),
    slope: z.number(),
    intercept: z.number(),
    channel: z.number().min(PARAMETER_LIMITS.settings.signalChannel.min, "Channel must be non-negative.")
});

export const settingsSchema = z.object({
    specHost: z.string().min(1, "SPEC Host is required."),
    requireSpecEnable: z.boolean(),
    systemName: z.string().min(1, "System Name is required."),
    controllerHost: z.string().min(1, "Hostname is required."),
    axisCount: z.number().min(PARAMETER_LIMITS.settings.axisCount.min, `Must have at least ${PARAMETER_LIMITS.settings.axisCount.min} axis.`),
    taskCount: z.number().min(PARAMETER_LIMITS.settings.taskCount.min, `Must have at least ${PARAMETER_LIMITS.settings.taskCount.min} task.`),
    axesSettings: z.array(axisSettingSchema)
        .min(1, "At least one axis is required.")
        .refine((axes) => {
            const names = axes.map(a => a.name.trim().toUpperCase()).filter(Boolean);
            return names.length === new Set(names).size;
        }, { message: "Axis names must be unique." }),
    signalSettings: z.array(signalSettingSchema).min(1, "At least one input signal is required.")
});

