import { FieldSchema } from "../../../types/schema.ts";

export const xraySchema: FieldSchema[] = [
    {
        id: 'x',
        label: 'X Position (mm)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'z',
        label: 'Z Position (mm)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'omeStart',
        label: 'Initial Angle (ω₀ º)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'omeStop',
        label: 'Final Angle (ω º)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'ctime',
        label: 'Exposure Time (s)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'beamHeight',
        label: 'Beam Height (mm)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'beamWidth',
        label: 'Beam Width (mm)',
        type: 'number',
        width: 'medium',
        required: true,
    },
    {
        id: 'atten',
        label: 'Attenuation (mm)',
        type: 'number',
        width: 'medium',
        required: true,
    },
];
