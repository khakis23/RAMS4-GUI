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

## User Feedback Summary — TODO...

### Future Features & User Wishlist

#### Test Sequence Visual Verification
A viewable plot or visualization displaying the steps of the entire test sequence.
- quick & easy verification for scientist
- more user friendly
- requested by several users


### Essential Existing Features

TODO


---

## Architecture

TODO


---

## API Endpoints

### Directory 

#### GET /api/directory 
- Query Parameters:
  - `action`: "list"
  - `path`: URL-encoded relative filesystem path
  - `type`: Directory tier level
    ('cycle' | 'station' | 'btr' | 'sample' | 'experiment')
- Response Payload:
  - String array of available directory names (ex. `['sjobs-123', 'tcook-456', 'jternus789']`)


### Config
TODO

### Settings
TODO

### Sequence

#### GET /api/mechtest
- Query Parameters:
  - `path`: URL-encoded file path
    (e.g., `<path>.json`)
- Response Payload:
  - _Sequence Builder Payload_ (see _Schemas & JSON Payloads_)

#### POST /api/mechtest
- Request Payload:
  - A JSON containing the file path and Sequence Object
    (e.g., `customFilePath: <path>.json, data: <Sequence Payload>`)


---

## Schemas & JSON Payloads

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
| `profileID` | String | Yes | Unique ID of the X-ray Scan Profile to trigger. |
| `imgMode` | String | `if profileID is (time-series or rotation-series)` | Image modality (`ff` Far-Field, `nf` Near-Field, `tomo` Tomography, `dic` DIC). |
| `pauseTsDaq` | Boolean | Yes | Default: `false` — Pause time-series DAQ while taking image. |

Example:
```json
[
  {
    "take": {
      "profileID": "xrayProfile1784655169284",
      "pauseTsDaq": false,
      "imgMode": "nf"
    }
  },
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

### Configuration & Settings Payload

TODO!

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
