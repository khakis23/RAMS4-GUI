## Schemas

#### Schema key
- `*`: dropdown/field options (not fields)
- leaves and branches without `*`: fields
- all fields required unless they have a default

### Ramp

#### Schema
```text
.
└── ramp/
    ├── axis (dropdown)/
    │   ├── A*
    │   ├── B*
    │   ├── RA*
    │   ├── RB*
    │   └── TENS*
    ├── mode (dropdown)/
    │   ├── incremental*
    │   └── absolute*
    ├── control (dropdown)/
    │   ├── load*/
    │   │   ├── target (number) N
    │   │   └── velocity (number) N/s
    │   ├── strain*/
    │   │   ├── target (number)
    │   │   └── velocity (number)
    │   └── displacement*/
    │       ├── target (number) mm
    │       └── time/velocity (toggle switch — default either)/
    │           ├── time (number — same field, just new label and key) s
    │           └── velocity (number — same field, just new label and key) mm/s
    └── Advanced (accordion)/
        ├── max displacement (number — default 1.000 mm)
        ├── enable DIC (toggle switch — default off)
        ├── skip DIC position (toggle switch — default off)
        ├── increment segment (toggle switch — default off)
        └── wait (toggle switch — default on)
```

#### Tooltip descriptions
```text
Axis: The target motor axis to actuate.
Mode: Use an absolute target (from 0) or a relative target (from last target).
Control: Feedback control mode driving the ramp.
Target (Load): Target load value in Newtons (N).
Target (Strain): Target axial strain value in engineering strain (mm/mm).
Target (Displacement): Target stage position in millimeters (mm).
Velocity (Load Rate): Rate of loading in Newtons per second (N/s).
Velocity (Strain Rate): Rate of deformation in axial strain per second (s^-1).
Velocity (Displacement): Actuator travel speed in millimeters per second (mm/s).
Time: Expected duration in seconds (s) to reach the target displacement.
Max Displacement: Safety displacement ceiling (mm) that aborts the test if exceeded during loading.
Enable DIC: Triggers continuous optical DIC camera capture during the ramp.
Skip DIC Position: Bypasses pre-test stage alignment and camera calibration steps to start DIC capture immediately.
Increment Segment: Increments the test segment index on completion to mark this step in the data logs.
Wait: Blocks the execution of the next sequence command until the step is fully complete.
```

### Take

#### Schema
```txt
.
└── take/
    ├── Image Profile (dropdown — populate using all xray/DIC configured profiles)/
    │   ├── some_user_profile_name0* (mode=rotation-series)/
    │   │   └── Image Mode/
    │   │       ├── Far-Field* 
    │   │       ├── Near-Field*
    │   │       ├── Tomography* 
    │   │       └── Single Layer*
    │   ├── some_user_profile_name1* (mode=stills)/
    │   │   └── Image Mode/
    │   │       ├── DIC*
    │   │       ├── Far-Field*
    │   │       └── Near-Field*
    │   └── some_user_profile_name2* (rest of profile types do not have ImageMode dropdown)
    └── Pause DAQ (toggle switch — default off)
```

#### ToolTip descriptions
```txt
Image Profile: The configured scan profile defining target coordinates, layers, slits, or angles.
Far-Field (Rotation): Performs a rotational fly-scan targeting the far-field detector.
Near-Field (Rotation): Slides the near-field beamstop into position to perform a fly-scan.
Tomography (Rotation): Retracts the beamstop and runs brightfield/darkfield calibration routines to scan.
Single Layer (Rotation): Runs only the first Z-height slice of the selected rotation series using the far-field detector.
DIC (Stills): Commands the specimen stage to a list of coordinates and triggers optical hutch cameras for surface strain mapping.
Far-Field (Stills): Takes stationary, high-resolution X-ray exposures at a list of coordinates using the far-field detector.
Near-Field (Stills): Slides the near-field beamstop in and takes stationary X-ray exposures at a list of coordinates.
Pause DAQ: Temporarily halts time-series data acquisition while executing this scan.
```
