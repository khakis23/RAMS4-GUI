import { FieldSchema} from "../../../types/schema.ts";


export const xraySchema: FieldSchema[] = [
    {
        id: 'ramsx',
        label: 'X Position (mm)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'ramsz',
        label: 'Z Position (mm)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'ome_start',
        label: 'Initial Angle (ω₀ º)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'ome_start',
        label: 'Final Angle (ω º)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'ctime',
        label: 'Exposure Time (s)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'beam_height',
        label: 'Beam Height (mm)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'beam_width',
        label: 'Beam Width (mm)',
        type: 'number',
        width: 'small',
        required: true,
    },
    {
        id: 'atten',
        label: 'Attenuation (mm)',
        type: 'number',
        width: 'small',
        required: true,
    },
];
