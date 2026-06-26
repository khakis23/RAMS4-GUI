import { FieldSchema } from '../../../types/schema';

export const daqHandlerSchema: FieldSchema[] = [
    // BASE PARAMETERS
    {
        id: 'mode',
        label: 'Handler Mode',
        type: 'dropdown',
        width: 'full',
        options: [
            { id: 'time-series', label: 'Time Series' },
            { id: 'peak-valley', label: 'Peak Valley' },
            { id: 'pso', label: 'PSO' }
        ]
    },
    {
        id: 'filename',
        label: 'Base Filename (.h5)',
        type: 'text',
        placeholder: 'Enter base filename...',
        width: 'large'
    },
    {
        id: 'signalLoad',
        label: 'Primary Load Cell Signal',
        type: 'text',
        placeholder: 'e.g. LoadA',
        required: false,
        width: 'medium'
    },
    {
        id: 'signalStrain',
        label: 'Primary Strain Extensometer Signal',
        type: 'text',
        placeholder: 'e.g. Strain',
        required: false,
        width: 'medium'
    },

    // VERBOSE CONFIGURATION (Always visible)
    {
        id: 'verboseAxis',
        label: 'Verbose: Axis ID(s)',
        type: 'text',
        placeholder: 'e.g. 0',
        width: 'medium'
    },
    {
        id: 'verboseSystem',
        label: 'Verbose: System Logging Level',
        type: 'number',
        width: 'small'
    },
    {
        id: 'verboseTask',
        label: 'Verbose: Task Logging Level',
        type: 'text',
        placeholder: 'e.g. -1',
        required: false,
        width: 'small'
    },
    {
        id: 'verboseIO',
        label: 'Verbose: I/O Logging Level',
        type: 'number',
        placeholder: 'e.g. -1',
        required: false,
        width: 'small'
    },
    {
        id: 'verboseAi',
        label: 'Verbose: Analog Input Signals',
        type: 'text',
        required: false,
        width: 'medium'
    },

    // TIME-SERIES MODE PARAMETERS
    {
        id: 'frequency',
        label: 'Downsampled Frequency (Hz)',
        type: 'number',
        placeholder: 'e.g. 50',
        required: false,
        width: 'small',
        showIf: (data) => data.mode === 'time-series'
    },
    {
        id: 'cycles',
        label: 'Cycles to Record',
        type: 'text',
        placeholder: 'e.g. [0, 10]',
        required: false,
        width: 'medium',
        showIf: (data) => data.mode === 'time-series'
    },

    // PEAK-VALLEY MODE PARAMETERS (Signal Configuration)
    {
        id: 'signalAxis',
        label: 'Signal: Target Axis',
        type: 'text',
        placeholder: 'e.g. 0',
        width: 'small',
        showIf: (data) => data.mode === 'peak-valley'
    },
    {
        id: 'signalItem',
        label: 'Signal: Feedback Type',
        type: 'dropdown',
        width: 'medium',
        options: [
            { id: 'PositionFeedback', label: 'Position Feedback' },
            { id: 'VelocityFeedback', label: 'Velocity Feedback' },
            { id: 'AccelerationFeedback', label: 'Acceleration Feedback' }
        ],
        showIf: (data) => data.mode === 'peak-valley'
    },
    {
        id: 'signalProminence',
        label: 'Signal: Prominence Threshold',
        type: 'number',
        placeholder: 'e.g. 0.1',
        width: 'small',
        showIf: (data) => data.mode === 'peak-valley'
    },

    // PSO MODE PARAMETERS
    {
        id: 'psoAxis',
        label: 'PSO Tracking Axis',
        type: 'text',
        placeholder: 'e.g. 0',
        width: 'medium',
        showIf: (data) => data.mode === 'pso'
    }
];
