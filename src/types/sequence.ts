export interface MechTestCard {
    id: string;
    type: 'ramp' | 'take' | 'dwell' | 'cycle' | 'group' | 'takeWhile' | 'custom';
    data: MechTestStepData;
}

export type MechTestStepData = 
    | MechRampData
    | MechTakeData
    | MechDwellData
    | MechCycleData
    | MechGroupData
    | MechTakeWhileData
    | MechCustomData
    | Record<string, any>; // Fallback during transition

export interface MechRampData {
    control?: 'displacement' | 'load';
    dispToggle?: 'time' | 'velocity';
    axis?: string;
    mode?: 'absolute' | 'relative';
    max_displacement?: number;
    enable_dic?: boolean;
    skipDICpos?: boolean;
    incrementSeg?: boolean;
    wait?: boolean;
    time?: number | null;
    velocity?: number | null;
}

export interface MechTakeData {
    incrementSeg?: boolean;
    pauseTsDaq?: boolean;
}

export interface MechDwellData {
    control?: 'displacement' | 'load';
    axis?: string;
    incrementSeg?: boolean;
    wait?: boolean;
}

export interface MechCycleData {
    control?: 'displacement' | 'load';
    axis?: string;
    mode?: 'absolute' | 'relative';
    countMode?: 'absolute' | 'relative';
    ampScale?: number;
    discoverEndpoints?: boolean;
    recallEndpoints?: boolean;
    "enable DIC"?: boolean;
    incrementSeg?: boolean;
    wait?: boolean;
}

export interface MechGroupData {
    loops?: number;
    cards?: MechTestCard[];
}

export interface MechTakeWhileData {
    take?: {
        data?: any;
    };
    step?: {
        type?: string;
        data?: any;
    };
}

export interface CustomParameter {
    key: string;
    type: 'Bool' | 'Number' | 'String';
    value: any;
}

export interface MechCustomData {
    commandName?: string;
    parameters?: CustomParameter[];
}
