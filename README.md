# RAMS4 GUI

---

## Setup & Running Locally

### Prerequisite

- [Node.js](https://nodejs.org/en) (v20+)

### Install & Run

```bash
git clone https://github.com/khakis23/RAMS4-GUI.git
cd RAMS4-GUI
npm install
npm run dev
```

Navigate to the `localhost` link provided in the terminal.


---

## Quick Adjustments

### Changing Tooltip Descriptions

All tooltip descriptions are centrally located at `src/config/tooltips.ts`. Any changes made here will automatically reflect in the UI.


### Setting Parameter Limits

Numeric fields limits are centrally located at `src/config/parameterLimits.ts`. These values will prevent the user from saving fields outside of these limits.


---

## User Feedback — TODO

### Essential Existing Features

#### Manual Path Configuration
TODO

#### Sequence Grouping & Looping
TODO

#### Custom Sequence Step
TODO

#### Sequence Builder Workflow
TODO


### Future Features & User Wishlist

#### Test Sequence Visual Verification
A viewable plot or visualization displaying the steps of the entire test sequence.
- quick & easy verification for scientist
- more user friendly
- requested by several users

#### Status Bar
TODO

#### Streamline Settings for Advanced Users
TODO


---

## Architecture

### State Management
All configurations, settings, and sequences are globally stored in local storage using Zustand. A draft system is utilized that gets updated in real time as the user interacts, then that draft is sent over an HTTP request to save it. 

#### State Workflow
```
User Interaction ——>  Zustand Draft  <——>  Backend
                    (Browser Storage)   (Disk Storage)
```

#### Change Tracking
Both stores maintain copies of the disk state, and when a UI change is triggered, the draft gets compared against the disk state—setting the `isDirty` flag. A dirty state can then be saved to disk. On a successful HTTP save request, the flag is reset, and the disk state copy is updated.


### FileTree
The file organization is based on a feature-base architecture, so each directory within `feature/` contains all of the core functionality for that feature.

```txt
src/
├── api/                             # REST API client modules
├── config/                          
│   ├── parameterLimits.ts           # (Edit me!) Schema validation bounds (min/max/default)
│   └── tooltips.ts                  # (Edit me!) UI help tooltips
├── feature/                         
│   ├── configuration/               # Configuration & Settings feature code
│   └── sequence/                    # Test Sequence Builder feature code
├── store/                           # Zustand global state management
├── test/                            
├── layout/                          # App layout shell, sidebar & header menus
└── components/                      # Shared UI component library
```


---

## API Endpoints

### Directories 

#### GET /api/directory 
- Query Parameters:
  - `action`: "list"
  - `path`: Relative filesystem path
  - `type`: Directory tier level
    ('cycle' | 'station' | 'btr' | 'sample' | 'experiment')
- Response Payload:
  - String array of available directory names (ex. `['sjobs-123', 'tcook-456', 'jternus789']`)


### Configurations

#### POST /api/config
- Query Parameters:
  - `path`: Relative filesystem path
- Request Payload:
  - Complete [Configuration payload](#configuration-and-settings-payload)

#### GET /api/config
- Query Parameters:
  - `path`: Relative filesystem path
- Response Payload:
  - if experiment exists: [Configuration payload](#configuration-and-settings-payload)
  - else: `null`


### Settings

#### POST /api/settings
- Query Parameters:
  - `path`: Relative filesystem path
- Request Payload:
  - Complete [Settings payload](#configuration-and-settings-payload)
- Response Payload:
  - `version`: The version number assigned by the backend

#### GET /api/settings
- Query Parameters:
  - `path`: Relative filesystem path
  - `action`: `list` (optional)
    - Discover and list the settings version at the `path`
- Response Payload:
  - if `action` provided: array of version numbers (g.g, `[0,1,3]`)
  - else: [Settings payload](#configuration-and-settings-payload)

### Sequence

#### POST /api/mechtest
- Query Parameters:
  - `path`: Relative filesystem path
- Request Payload:
  - Complete [Sequence Builder Payload](#sequence-builder-payload)

#### GET /api/mechtest
- Query Parameters:
  - `path`: Relative filesystem path
- Response Payload:
  - Complete [Sequence Builder Payload](#sequence-builder-payload)


---

## Schemas and JSON Payloads

### Sequence Builder Payload

A test sequence JSON is exchanged between the frontend and backend through the 
`mechanicalTestApi.ts`.

#### Ramp

| Parameter | Type | Required | Options / Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `axis` | Enum | Yes | `A`, `B`, `RA`, `RB`, `TENS` | Target actuator axis. |
| `mode` | Enum | Yes | `relative`, `absolute` | Coordinate mode (`relative` to current position vs `absolute`). |
| `control` | Enum | Yes | `displacement`, `load`, `strain` | Closed-loop feedback control mode. |
| `target` | Number | Yes | Target value | Target endpoint (mm for displacement, N for load, strain for strain). |
| `dispToggle` | Enum | If Displacement | `time`, `velocity` | Toggle between setting total ramp duration vs velocity. |
| `time` | Number | `if dispToggle == time` | Seconds | Total time duration of ramp (used when `dispToggle: "time"`). |
| `velocity` | Number | `if dispToggle == null` | mm/s, N/s, or s⁻¹ | Rate of ramp motion (used when `dispToggle: "velocity"` or load/strain control). |
| `max_displacement` | Number | Yes | Default: `1.0` mm | Maximum safety displacement limit during ramp. |
| `enable_dic` | Boolean | Yes | Default: `false` | Trigger DIC image acquisition during this ramp. |
| `skipDICpos` | Boolean | Yes | Default: `false` | Skip initial position capture for DIC. |
| `incrementSeg` | Boolean | Yes | Default: `false` | Increment segment counter upon completion. |
| `wait` | Boolean | Yes | Default: `true` | Block next step execution until target is reached. |

Example: 
```json
[
    {
    "ramp": {
      "target": 1,
      "time": 1,
      "max_displacement": 1,
      "axis": "A",
      "mode": "absolute",
      "control": "displacement",
      "dispToggle": "time",
      "enable_dic": false,
      "skipDICpos": false,
      "incrementSeg": false,
      "wait": true,
      "velocity": null
    }
  },
  {
    "ramp": {
      "target": 1,
      "time": null,
      "max_displacement": 1,
      "axis": "A",
      "mode": "absolute",
      "control": "displacement",
      "dispToggle": "velocity",
      "enable_dic": false,
      "skipDICpos": false,
      "incrementSeg": false,
      "wait": true,
      "velocity": 1
    }
  },
]
```

#### Dwell

| Parameter | Type | Required | Units / Options | Description |
| :--- | :--- | :---: | :---: | :--- |
| `axis` | Enum | Yes | `A`, `B`, `RA`, `RB`, `TENS` | Actuator axis to hold. |
| `control` | Enum | Yes | `load`, `strain` | Closed-loop control mode for holding. |
| `target` | Number | Yes | N or strain | Target load or strain value to maintain. |
| `velocity` | Number | Yes | N/s or s⁻¹ | Approach velocity to reach the hold target. |
| `time` | Number | Yes | seconds | Total hold duration in seconds. |
| `wait` | Boolean | Yes | Default: `true` | Wait for full hold duration before continuing. |

Example:
```json
[
  {
    "dwell": {
      "target": 1,
      "velocity": 1,
      "time": 1,
      "axis": "A",
      "control": "load",
      "wait": true
    }
  }
]
```

#### Cycle

| Parameter | Type | Required | Options / Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `axis` | Enum | Yes | `A`, `B`, `RA`, `RB`, `TENS` | Actuator axis. |
| `control` | Enum | Yes | `displacement`, `load`, `strain` | Control feedback variable. |
| `mode` | Enum | Yes | `relative`, `absolute` | Limit boundary reference frame. |
| `upper` | Number | Yes | Units of control | Upper cyclic limit. |
| `lower` | Number | Yes | Units of control | Lower cyclic limit. |
| `frequency` | Number | Yes | Hz | Cyclic loading frequency. |
| `countMode` | Enum | Yes | `relative`, `absolute` | Cycle counter evaluation mode. |
| `cycleEnd` | Number | Yes | count | Target total number of cycles to execute. |
| `ampScale` | Number | Yes | Default: `0.95` | Amplitude scaling factor ($0.0 - 1.0$). |
| `discoverEndpoints` | Boolean | Yes | Default: `false` | Dynamically discover mechanical compliance endpoints. |
| `recallEndpoints` | Boolean | Yes | Default: `false` | Recall previously saved endpoint positions. |
| `enable DIC` | Boolean | Yes | Default: `false` | Enable DIC acquisition during cyclic loading. |
| `wait` | Boolean | Yes | Default: `true` | Wait for cyclic sequence completion. |
| `manualDispUpper` | Number | No | `null` | Motor displacement limit at the upper cycle bound. |
| `manualDispLower` | Number | No | `null` | Motor displacement limit at the lower cycle bound. |

Example:
```json
[
  {
    "cycle": {
      "upper": 1,
      "lower": 1,
      "frequency": 1,
      "cycleEnd": 1,
      "ampScale": 0.95,
      "manualDispUpper": null,
      "manualDispLower": null,
      "axis": "A",
      "mode": "absolute",
      "control": "displacement",
      "countMode": "relative",
      "discoverEndpoints": false,
      "recallEndpoints": false,
      "enable DIC": false,
      "wait": true
    }
  },
]
```

#### Take

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `profileID` | String | Yes | Unique ID of the X-ray Scan Profile to trigger or `"dic"`. |
| `imgMode` | String | `if profileID is (time-series or rotation-series)` | Image modality (`ff` Far-Field, `nf` Near-Field, `tomo` Tomography, `dic` DIC). |
| `pauseTsDaq` | Boolean | Yes | Default: `false` — Pause time-series DAQ while taking image. |

Example X-ray: 
```json
[
  {
    "take": {
      "profileID": "xrayProfile1784655169284",
      "pauseTsDaq": false,
      "imgMode": "nf"
    }
  }
]
```

Example DIC: 

```json
[
  {
    "take": {
      "profileID": "dic",
      "pauseTsDaq": false
    }
  }
]
```

#### Take While

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `take` | JSON Object | Yes | JSON object matching `take` schema. |
| `step.type` | Enum | Yes | Inner command type (`ramp`, `dwell`, `cycle`). |
| `step.data` | JSON Object | Yes | JSON object matching the command schema (`ramp`, `dwell`, `cycle`). |

Example:
```json
[
    {
    "takeWhile": {
      "take": {
        "profileID": "xrayProfile1784655183509",
        "imgMode": null,
        "pauseTsDaq": false
      },
      "step": {
        "type": "dwell",
        "data": {
          "velocity": 1,
          "wait": true,
          "target": 1,
          "time": 1,
          "axis": "A",
          "control": "load"
        }
      }
    }
  }
]
```

#### Group

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `group` | JSON Object | Yes | | Contains a list of steps and can be looped. |
| `group.loops` | Number | Yes | `1` | The number of times to loop the group. |
| `group.steps` | List | Yes | `[]` | The list of steps or groups contained by the outer group |

**NOTE:** Groups can be **nested a _max_ of _twice_.**


Example: 

```json
[
  // Single Nested Group Containing 1 item: [take]
  {
    "group": {
      "loops": 99,
      "steps": [
        {
          "take": {
            "profileID": "xrayProfile1784655183509",
            "pauseTsDaq": false
          }
        }
      ]
    }
  },
  
  // Double Nested Group Containing 2 items: [take, inner group]
  {
    "group": {
      "loops": 1,
      "steps": [

        // Item 1: Inner Group Containing 1 item: [take]
        {
          "group": {
            "loops": 1,
            "steps": [
              {
                "take": {
                  "profileID": "xrayProfile1784655183509",
                  "pauseTsDaq": false
                }
              }
            ]
          }
        },

    	// Item 2
        {
          "take": {
            "profileID": "xrayProfile1784655183509",
            "pauseTsDaq": false
          }
        }
      ]
    }
  }
]
```

### Configuration and Settings Payload

Configuration and settings are stored together in local storage but are separate payloads. Configurations belong to each user and experiment, while settings are expected to be global.

#### Config 

| Parameter | Type | Default / Options | Description |
| :--- | :--- | :---: | :--- |
| `cycleNumber` | String | | Cycle identifier string (e.g., `"2026-2"`). |
| `sampleName` | String | | Sample specimen name (e.g., `"titanium_specimen_02"`). |
| `userId` | String | | User ID / BTR string (e.g., `"sjobs-123"`). |
| `experimentNumber` | String | | Experiment number string (e.g., `"1"`). |
| `configDirectory` | String | | Full filesystem directory path for experiment metadata. |
| `requiredAxes` | List of Enums | `A`, `B`, `RA`, `RB`, `TENS` | Active hardware axes required for experiment execution. |
| `daqFrequency` | Number | kHz | Primary DAQ sampling frequency in kHz. |
| `samplePoints` | Number | points | Buffer sample points captured per DAQ trigger. |
| `settingsVersion` | Number | | Version integer of the linked hardware settings file. |
| `handlerProfiles` | List of Objects | `[]` | Array of DAQ Handler Profile JSON objects ([see DAQ Handler Profiles](#daq-handler-profiles)). |
| `xrayProfiles` | List of Objects | `[]` | Array of X-ray Scan Profile JSON objects ([see X-ray Scan Profiles](#x-ray-scan-profiles)). |
| `dicEnabled` | Boolean | `false` | Enable DIC acquisition parameters. |
| `dicX` | Number / null | `null` | DIC X position stage alignment in mm. |
| `dicZ` | Number / null | `null` | DIC Z position stage alignment in mm. |
| `dicAngle` | Number / null | `null` | DIC rotation angle in degrees. |
| `dicExposureTime` | Number / null | `null` | Optional DIC exposure time per image frame in seconds. |
| `dicStepSize` | Number / null | `null` | Optional DIC step size between exposures in mm. |

Example:

```json
{
  "cycleNumber": "2026-2",
  "userId": "sjobs-123",
  "sampleName": "titanium_specimen_02",
  "experimentNumber": "1",
  "configDirectory": "/nfs/chess/aux/cycles/2026-2/id1a3/sjobs-123/metadata/titanium_specimen_02",
  "requiredAxes": ["A", "B", "RA"],
  "daqFrequency": 10,
  "samplePoints": 500,
  "settingsVersion": 1,
  "dicEnabled": true,
  "dicX": 10.5,
  "dicZ": -5.0,
  "dicAngle": 45.0,
  "dicExposureTime": 0.5,
  "dicStepSize": 0.1,
  "handlerProfiles": [
    {
      "mode": "time-series",
      "filename": "ts_specimen_1",
      "verboseAxis": "-1",
      "verboseSystem": -1,
      "verboseTask": "-1",
      "verboseIO": -1,
      "verboseAi": ["LoadA"],
      "frequency": 10,
      "cycles": []
    }
  ],
  "xrayProfiles": [
    {
      "id": "xrayProfile1784806481919",
      "name": "rot",
      "mode": "rotation-series",
      "ctime": 1,
      "beamHeight": 1,
      "beamWidth": 1,
      "atten": 1,
      "ramsx": 1,
      "layerRanges": [
        {
          "omeStart": 0,
          "omeStop": 180,
          "numPoints": 180,
          "layerStart": 0,
          "layerEnd": 5,
          "numLayers": 3
        }
      ]
    }
  ]
}
```


#### Settings

| Parameter | Type | Default / Options | Description |
| :--- | :--- | :---: | :--- |
| `specHost` | String | | SPEC hostname & port string. |
| `requireSpecEnable` | Boolean | Default: `true` | Require SPEC host connection validation before test execution. |
| `systemName` | String | | Global system hardware identifier (e.g., `"RAMS4_CHESS"`). |
| `controllerHost` | String | | Aerotech motion controller IP address (e.g., `"10.0.0.1"`). |
| `axisCount` | Number | Default: `5` | Total number of configured motor axes. |
| `taskCount` | Number | Default: `5` | Total number of configured system task slots. |
| `axesSettings` | List of Objects | | Array of motor axis limit objects containing `{ name, max_velocity, max_acceleration }`. |
| `signalSettings` | List of Objects | | Array of signal calibration objects containing `{ name, slope, intercept, channel }`. |

Example:

```json
{
  "specHost": "id1a3.classe.cornell.edu:spec",
  "requireSpecEnable": true,
  "systemName": "RAMS4_CHESS",
  "controllerHost": "10.0.0.1",
  "axisCount": 5,
  "taskCount": 5,
  "axesSettings": [
    {
      "name": "A",
      "max_velocity": 50,
      "max_acceleration": 100
    },
    {
      "name": "B",
      "max_velocity": 50,
      "max_acceleration": 100
    }
  ],
  "signalSettings": [
    {
      "name": "LoadA",
      "slope": 1.0,
      "intercept": 0.0,
      "channel": 0
    },
    {
      "name": "Strain",
      "slope": 1.0,
      "intercept": 0.0,
      "channel": 1
    }
  ]
}
```


### DAQ Handler Profiles

`handlerProfiles` are a part of the configuration JSONs changed by the configuration API.

#### Advanced
All the DAQ Handler Profiles have these advanced parameters.

| Parameter | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `verboseAxis` | Number | Yes | Motor stage signal logging detail: `-1` (Disabled), `0` (Basic: Position, Velocity, Acceleration), `1` (Standard: Commands & Primary Feedback), `2` (Full Diagnostic: Errors & Motor Temp). |
| `verboseSystem` | Number | `-1` | Controller system timer detail: `-1` (Disabled), `0` (Basic Timer), `1` (Detailed Performance). |
| `verboseTask` | Number | `-1` | Controller background task script logging detail: `-1` (Disabled), `0` (Task State & Mode), `1` (Errors & Warnings), `2` (Program Line Number). |
| `verboseIO` | Number | `-1` | Hardware digital & analog pin logging detail: `-1` (Disabled), `0` (Primary Analog Pins), `1`-`2` (Full Channel States). |
| `verboseAi` | List of Enums | [] | Active logging inputs. |


#### Time Series

| Parameter | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `filename` | String | Yes | Filename used for save in data location (holding_bay). |
| `frequency` | Number | Yes | Frequency (Hz) that this DAQ save data at. |
| `cycles` | List of JSON Objects | No | Defined range that the DAQ will run at for experiment. JSON Objects containing {`start`, `stop`, `step`}. |



Example:

```json
"handlerProfiles": [
  {
    "mode": "time-series",
    "filename": "timeseries_test_1-2",
    "verboseAxis": "-1",
    "verboseSystem": -1,
    "verboseTask": "-1",
    "verboseIO": -1,
    "verboseAi": ["LoadA"],
    "frequency": 1000,
    "cycles": [
      {
        "start": 1,
        "stop": 10,
        "step": 1
      }
    ]
  }
]
```

#### Peak Valley

| Parameter | Type | Required | Options / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `filename` | String | Yes |  | Filename used for save in data location (holding_bay). |
| `signalAxis` | Enum | Yes | `A`, `B`, `RA`, `RB`, `TENS` | Axis driving signal wave. |
| `signalItem` | Enum | Yes | `PositionFeedback`, `VelocityFeedback`, `AccelerationFeedback` | Controller feedback signal type | 
| `signalProminence` | Number | Yes | | Minimum amplitude threshold required to identify a peak/valley. |


Example: 

```json
  "handlerProfiles": [
    {
      "mode": "peak-valley",
      "filename": "peakvalley_test_1-1",
      "verboseAxis": "-1",
      "verboseSystem": -1,
      "verboseTask": "-1",
      "verboseIO": -1,
      "verboseAi": [],
      "signalAxis": "A",
      "signalItem": "VelocityFeedback",
      "signalProminence": 0
    }
  ],
```


#### Position Synchronized Output (PSO)

| Parameter | Type | Required | Options / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `filename` | String | Yes |  | Filename used for save in data location (holding_bay). |
| `psoAxis` | Enum | Yes | `A`, `B`, `RA`, `RB` | The axis that generates pulses. |

Example: 

```json
"handlerProfiles": [
  {
    "mode": "pso",
    "filename": "pso_test_1-1",
    "verboseAxis": "2",
    "verboseSystem": 0,
    "verboseTask": "1",
    "verboseIO": 1,
    "verboseAi": ["LoadA", "Strain", "SpecComm"],
    "psoAxis": "A"
  }
],
```


### X-ray Scan Profiles

`xrayProfiles` are a part of the configuration JSONs changed by the configuration API.


#### Base X-ray Profile Configuration
The following parameters are present in every X-ray profile.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | User-facing name used for easy user-identification |
| `ctime` | Number | Yes | Exposure time (s) |
| `atten` | Number | Yes | Attenuated foil thickness (mm) |
| `beamHeight` | Number | Yes | Beam Height (mm) |
| `beamWidth` | Number | Yes | Beam Width (mm) |



#### Rotation Series

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ramsx` | Number | Yes | Reference X position (mm) |
| `layerRanges` | List of Objects | Yes (**at least 1 list item**) | Contains the following **required** **numeric** items per object for building layers: {`omeStart`, `omeStop`, `numPoints`, `layerStart`, `layerEnd`, `numLayers`}. |

Example:

```json
"xrayProfiles": [
    {
      "id": "xrayProfile1784806481919",
      "name": "rot",
      "mode": "rotation-series",
      "ctime": 1,
      "beamHeight": 1,
      "beamWidth": 1,
      "atten": 1,
      "ramsx": 1,
      "layerRanges": [
        {
          "omeStart": 1,
          "omeStop": 1,
          "numPoints": 1,
          "layerStart": 1,
          "layerEnd": 1,
          "numLayers": 1
        }
      ]
    },
]
```

#### Stills

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| stillPoints | List of Objects | Yes (**at least 1 list item**) |  Contains the following **required** **numeric** items per object: {`ramsx`, `ramsz`, `ome`, `numPoints`}. |


Example: 

```json
"xrayProfiles": [
    {
      "id": "xrayProfile1784806518438",
      "name": "stills",
      "mode": "stills",
      "ctime": 1,
      "beamHeight": 1,
      "beamWidth": 1,
      "atten": 1,
      "stillPoints": [
        {
          "ramsx": 1,
          "ramsz": 1,
          "ome": 1,
          "numPoints": 1
        }
      ]
    },
]
```


#### Mapscan

Main Profile:
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ramsx` | Number | Yes | Reference X position (mm) |
| `ramsz` | Number | Yes | Reference Z position (mm) |
| `ome` | Number | Yes | Reference Angle position (º) |
| `mapscanAxes` | List of Objects | Yes (**at least 1 list item**) | Contains **1 or 2** axe(s) |

`mapscanAxes` Object Item:
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `axisName` | Enum | Yes | The moving axis name: `ramsz`, `ramsz`, or `ome`. |
| `start` | Number | Yes | Start position (mm) |
| `stop` | Number | Yes | Stop position (mm) |
| `points` | Number | Yes | Number of points along the axis. |

Example:

```json
"xrayProfiles": [
  {
      "id": "xrayProfile1784678083915",
      "name": "map",
      "mode": "mapscan",
      "ctime": 1,
      "beamHeight": 1,
      "beamWidth": 1,
      "atten": 1,
      "ramsx": 1,
      "ramsz": 1,
      "ome": 1,
      "mapscanAxes": [
        {
          "axisName": "ramsz",
          "start": 2,
          "stop": 1,
          "points": 1
        },
        {
          "axisName": "ramsx",
          "start": 1,
          "stop": 1,
          "points": 1
        }
      ]
    }
  ],
```
