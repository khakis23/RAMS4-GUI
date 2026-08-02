export interface XrayStillPoint {
    ramsx: number;
    ramsz: number;
    ome: number;
    numPoints: number;
}

export interface MapscanAxis {
    axisName: string;
    start: number;
    stop: number;
    points: number;
}

export interface RotationLayerRange {
    omeStart: number;
    omeStop: number;
    numPoints: number;
    layerStart: number;
    layerEnd: number;
    numLayers: number;
}

export interface XrayProfile {
    id: string;
    name: string;
    mode: 'rotation-series' | 'stills' | 'mapscan' | 'tseries' | 'dscan' | 'mesh';
    ramsx?: number | null;
    ramsz?: number | null;
    ome?: number | null;
    ctime?: number | null;
    beamHeight?: number | null;
    beamWidth?: number | null;
    atten?: number | null;
    numPoints?: number | null;

    /* Mode-specific optional parameters */
    omeStart?: number;
    omeStop?: number;
    layerStart?: number;
    layerEnd?: number;
    numLayers?: number;

    stillPoints?: XrayStillPoint[];
    mapscanAxes?: MapscanAxis[];
    layerRanges?: RotationLayerRange[];

    axis1Name?: string;
    axis1Start?: number;
    axis1Stop?: number;
    axis1Images?: number;

    axis2Name?: string;
    axis2Start?: number;
    axis2Stop?: number;
    axis2Images?: number;
}

export interface DicStillPoint {
    ramsx: number;
    ramsz: number;
    ome: number;
    numPoints: number;
}

export interface DicProfile {
    id: string;
    name: string;
    mode: 'stills';
    ctime: number;
    stillPoints: DicStillPoint[];
}

export interface AxisSetting {
    name: string;
    max_velocity: number;
    max_acceleration: number;
}

export interface SignalSetting {
    name: string;
    slope: number;
    intercept: number;
    channel: number;
}

/**
 * All configuration settings (metadata, DAQ, X-ray, and DIC) live here.
 * This represents the complete JSON payload that will be serialized and saved to the backend gateway.
 */
export interface GlobalConfig {
    // Metadata
    cycleNumber: string;
    sampleName: string;
    userId: string;
    experimentNumber: string;
    configDirectory: string;

    // DAQ
    requiredAxes: string[];
    daqFrequency: number;
    samplePoints: number;
    handlerProfiles: HandlerProfile[];

    // X-ray
    xrayProfiles: XrayProfile[];

    // DIC
    dicProfiles: DicProfile[];

    // Settings
    settingsVersion?: number;
    specHost: string;
    requireSpecEnable: boolean;
    systemName: string;
    controllerHost: string;
    axisCount: number;
    taskCount: number;
    axesSettings: AxisSetting[];
    signalSettings: SignalSetting[];
}

export interface HandlerProfileCycle {
    start: number;
    stop: number | 'inf';
    step: number;
}

export interface HandlerProfile {
    // General fields
    mode: string;
    filename: string;
    signalLoad?: string;
    signalStrain?: string;

    // Verbose fields
    verboseAxis: string;
    verboseSystem: number;
    verboseTask: string;
    verboseIO: number;
    verboseAi: string[];

    // Time-series specific fields
    frequency?: number;
    cycles?: HandlerProfileCycle[];

    // Peak-valley specific fields
    signalAxis?: string;
    signalItem?: string;
    signalProminence?: number;

    // PSO specific fields
    psoAxis?: string;
}
