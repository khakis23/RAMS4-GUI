export const tooltips = {
    // --- PATH CONFIGURATION ---
    cycleNumber: "The current experimental cycle or run identifier (e.g. '2026-2').",
    userId: "The identifier of the researcher conducting the experiment.",
    sampleName: "The name or identifier of the material specimen being tested.",
    experimentNumber: "The experiment number index for this sample.",
    manualPath: "Direct path to the configuration directory on CHESS filesystem.",
    saveConfig: "Save the current configuration to the file path.",

    // --- OVERHEAD PROFILE SECTIONS ---
    daqSectionTitle: "Main configuration variables for setting master sampling rates and hardware buffer lengths.",
    daqProfilesHeader: "Configure various different methods for how data is acquired and saved.",
    xraySectionTitle: "Create various reusable X-ray scan tables that can be imported during the building of a mechanical test.",

    // --- DAQ MAIN SETTINGS ---
    daqFrequency: "Rate at which sensor measurements are sampled.",
    samplePoints: "Number of buffer data points retained during test runs.",

    // --- DAQ HANDLER PROFILE FIELDS ---
    daqProfileMode: "Operating mode for data acquisition. Time-series logs raw signals; Peak-valley captures wave peaks/valleys; PSO logs at spatial hardware triggers.",
    daqProfileFilename: "The base output filename. The backend automatically appends an incrementing index counter suffix (ex. filename_01.h5).",
    daqProfileFrequency: "The logging write rate of this profile in Hz. This must be less than or equal to the DAQ sampling frequency.",
    daqProfileCycles: "Specifies which cycle ranges are logged. Supports ranges [start, stop], range steps [start, stop, step], and single cycles.",
    daqProfileSignalAxis: "The mechanical axis driving the cycle wave monitored by the peak-finding algorithm.",
    daqProfileSignalItem: "The controller feedback signal type to trace for wave detection: Position, Velocity, or Acceleration.",
    daqProfileProminence: "The minimum amplitude threshold required to identify a wave peak/valley, filtering out high-frequency noise.",
    daqProfilePsoAxis: "The mechanical axis that generates spatial hardware pulses to trigger data capture.",
    daqProfileAxisLevel: "Telemetry details to collect for physical axes, ranging from basic feedback to commands and diagnostics.",
    daqProfileTaskLevel: "Telemetry level for controller automation script execution tasks, from states to execution pointers.",
    daqProfileSystemLevel: "Diagnostics level for controller CPU and hardware system telemetry timers.",
    daqProfileIOLevel: "Telemetry level for general controller I/O board registers, including analog and digital inputs/outputs.",
    daqProfileAnalogInputs: "Active analog input logs. Check to enable standard sensors or enter custom raw indexes (e.g. [1,0]).",

    // --- X-RAY SCAN PROFILE FIELDS ---
    xrayProfileName: "The file path to the X-ray scan coordinate grid (e.g. 'ff_elastic_array.txt').",
    xrayProfileX: "The X-coordinate position of the specimen stages for this scan layer in mm.",
    xrayProfileZ: "The Z-coordinate position of the specimen stages for this scan layer in mm.",
    xrayProfileOmeStart: "The starting rotation angle (Omega) of the stage for this fly scan layer in degrees.",
    xrayProfileOmeStop: "The ending rotation angle (Omega) of the stage for this fly scan layer in degrees.",
    xrayProfileCtime: "Exposure count time per step in seconds.",
    xrayProfileAtten: "The attenuator foil thickness in mm. Must be in 0.25 mm increments from 0 to 20 mm.",
    xrayProfileBeamHeight: "Vertical slit height of the incident X-ray beam in mm.",
    xrayProfileBeamWidth: "Horizontal slit width of the incident X-ray beam in mm.",

    // --- SETTINGS TAB FIELDS ---
    settingsSectionTitle: "Configuration variables for system networking, safety boundaries, and input channel scaling.",
    settingsSpecHost: "The network address of the external SPEC server (e.g. id1a3.classe.cornell.edu:spec).",
    settingsRequireSpecEnable: "If enabled, the system requires connection to SPEC to proceed with scans.",
    settingsSystemName: "Name of the mechanical testing system (e.g. RAMS4_CHESS).",
    settingsHostname: "Network IP address of the Aerotech controller.",
    settingsAxisCount: "The total number of mechanical axes available on the controller.",
    settingsTaskCount: "The total number of concurrent execution tasks supported by the controller.",
    
    // --- AXES MINI SECTION ---
    settingsAxisName: "Physical name designation of the axis (e.g. RT, RB, TEN, A, B).",
    settingsAxisMaxVelocity: "Maximum safety velocity limit for the axis.",
    settingsAxisMaxAcceleration: "Maximum safety acceleration limit for the axis.",
    
    // --- SIGNALS MINI SECTION ---
    settingsSignalName: "Designated name for the analog or digital channel (e.g. LoadA, Strain).",
    settingsSignalScale: "Calibration multiplier slope to convert voltage into engineering units.",
    settingsSignalOffset: "Calibration y-intercept offset value.",
    settingsSignalChannel: "Board channel number on the controller for this signal.",

    // --- NEW XRAY PROFILE TOOLTIPS ---
    xrayProfileMode: "Selects the scanning mode for the X-ray setup.",
    numPoints: "The number of images to expose/collect at each step.",
    xrayProfileOme: "The specimen stage rotation angle (Omega) in degrees.",
    xrayProfileLayerStart: "The starting Z position for layer-based scans in mm.",
    xrayProfileLayerEnd: "The ending Z position for layer-based scans in mm.",
    xrayProfileNumLayers: "The total number of Z-layers to collect.",
    xrayProfileAxis1Name: "The physical stage axis designated for scanning (Axis 1).",
    xrayProfileAxis2Name: "The physical stage axis designated for scanning (Axis 2).",
    xrayProfileAxisStart: "The start limit position for the moving axis.",
    xrayProfileAxisStop: "The stop limit position for the moving axis.",
    xrayProfileAxisImages: "The number of images/points to expose along this axis range.",
    xrayProfileStillPointX: "X stage coordinate (ramsx) for this still exposure point.",
    xrayProfileStillPointZ: "Z stage coordinate (ramsz) for this still exposure point.",
    xrayProfileStillPointOme: "Omega rotation angle (ome) for this still exposure point.",
    xrayProfileStillPointCount: "The number of images to expose at this still coordinate.",

    // --- MECHANICAL TEST BUILDER TOOLTIPS ---
    mechTestAxis: "The target motor axis to actuate.",
    mechTestMode: "Use an absolute target (from 0) or a relative target (from last target).",
    mechTestControl: "Feedback control mode driving the ramp.",
    mechTestTargetLoad: "Target load value in Newtons (N).",
    mechTestTargetStrain: "Target axial strain value in engineering strain (mm/mm).",
    mechTestTargetDisplacement: "Target stage position in millimeters (mm).",
    mechTestVelocityLoad: "Rate of loading in Newtons per second (N/s).",
    mechTestVelocityStrain: "Rate of deformation in axial strain per second (s^-1).",
    mechTestVelocityDisplacement: "Actuator travel speed in millimeters per second (mm/s).",
    mechTestTime: "Expected duration in seconds (s) to reach the target displacement.",
    mechTestMaxDisplacement: "Safety displacement ceiling (mm) that aborts the test if exceeded during loading.",
    mechTestEnableDic: "Triggers continuous optical DIC camera capture during the ramp.",
    mechTestSkipDicPosition: "Bypasses pre-test stage alignment and camera calibration steps to start DIC capture immediately.",
    mechTestIncrementSeg: "Increments the test segment index on completion to mark this step in the data logs.",
    mechTestWait: "Blocks the execution of the next sequence command until the step is fully complete.",
    mechTestImageProfile: "The configured scan profile defining target coordinates, layers, slits, or angles.",
    mechTestPauseDaq: "Temporarily halts time-series data acquisition while executing this scan.",
    mechTestImageModeFarFieldRotation: "Performs a rotational fly-scan targeting the far-field detector.",
    mechTestImageModeNearFieldRotation: "Slides the near-field beamstop into position to perform a fly-scan.",
    mechTestImageModeTomoRotation: "Retracts the beamstop and runs brightfield/darkfield calibration routines to scan.",
    mechTestImageModeSingleLayerRotation: "Runs only the first Z-height slice of the selected rotation series using the far-field detector.",
    mechTestImageModeDicStills: "Commands the specimen stage to a list of coordinates and triggers optical hutch cameras for surface strain mapping.",
    mechTestImageModeFarFieldStills: "Takes stationary, high-resolution X-ray exposures at a list of coordinates using the far-field detector.",
    mechTestImageModeNearFieldStills: "Slides the near-field beamstop in and takes stationary X-ray exposures at a list of coordinates."
};
