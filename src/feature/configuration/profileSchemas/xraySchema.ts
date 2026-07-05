import { z } from 'zod';

export const xrayProfileSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required."),
    x: z.string()
        .min(1, "X Position is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number."),
    z: z.string()
        .min(1, "Z Position is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number."),
    omeStart: z.string()
        .min(1, "Initial Angle is required.")
        .refine(val => !isNaN(Number(val)), "Must be a number."),
    omeStop: z.string()
        .min(1, "Final Angle is required.")
        .refine(val => !isNaN(Number(val)), "Must be a number."),
    ctime: z.string()
        .min(1, "Exposure Time is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) > 0, "Must be a number greater than 0."),
    beamHeight: z.string()
        .min(1, "Beam Height is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number."),
    beamWidth: z.string()
        .min(1, "Beam Width is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number."),
    atten: z.string()
        .min(1, "Attenuation is required.")
        .refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a positive number."),
});

export const xrayFormSchema = z.object({
    xrayProfiles: z.array(xrayProfileSchema),
});
