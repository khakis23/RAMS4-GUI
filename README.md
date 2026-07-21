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


## API Requests

## Schemas & JSON Payloads

### Sequence Builder

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

**NOTE:** Groups can be **nested _twice_.**


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
