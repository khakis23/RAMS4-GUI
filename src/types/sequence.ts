export type MechTestCard = 
    | { id: string; type: 'ramp'; data: MechRampData }
    | { id: string; type: 'take'; data: MechTakeData }
    | { id: string; type: 'dwell'; data: MechDwellData }
    | { id: string; type: 'cycle'; data: MechCycleData }
    | { id: string; type: 'group'; data: MechGroupData }
    | { id: string; type: 'takeWhile'; data: MechTakeWhileData }
    | { id: string; type: 'custom'; data: MechCustomData }
    | { id: string; type: string; data: Record<string, any> };

export type MechTestStepData = 
    | MechRampData
    | MechTakeData
    | MechDwellData
    | MechCycleData
    | MechGroupData
    | MechTakeWhileData
    | MechCustomData
    | Record<string, any>;

export interface MechRampData {
    control?: 'displacement' | 'load' | 'strain';
    dispToggle?: 'time' | 'velocity';
    axis?: string;
    mode?: 'absolute' | 'relative';
    target?: number;
    max_displacement?: number;
    enable_dic?: boolean;
    skipDICpos?: boolean;
    incrementSeg?: boolean;
    wait?: boolean;
    time?: number | null;
    velocity?: number | null;
}

export interface MechTakeData {
    profileID?: string;
    imgMode?: string;
    incrementSeg?: boolean;
    pauseTsDaq?: boolean;
}

export interface MechDwellData {
    control?: 'load' | 'strain';
    axis?: string;
    target?: number;
    velocity?: number;
    time?: number;
    incrementSeg?: boolean;
    wait?: boolean;
}

export interface MechCycleData {
    control?: 'displacement' | 'load' | 'strain';
    axis?: string;
    mode?: 'absolute' | 'relative';
    upper?: number;
    lower?: number;
    frequency?: number;
    countMode?: 'absolute' | 'relative';
    cycleEnd?: number;
    ampScale?: number;
    discoverEndpoints?: boolean;
    recallEndpoints?: boolean;
    "enable DIC"?: boolean;
    incrementSeg?: boolean;
    wait?: boolean;
    manualDispUpper?: number | null;
    manualDispLower?: number | null;
}

export interface MechGroupData {
    loops?: number;
    cards?: MechTestCard[];
}

export interface MechTakeWhileData {
    take?: {
        data?: MechTakeData;
    };
    step?: {
        type?: 'ramp' | 'dwell' | 'cycle';
        data?: MechRampData | MechDwellData | MechCycleData | any;
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
