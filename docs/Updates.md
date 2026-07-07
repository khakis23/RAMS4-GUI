
## Questions

### 1. _What should in included in DIC?_

Currently, there exists the following:

`dic_positions.json`
```json
{
  "ramsx": 0.0,
  "ramsz": -4.0,
  "omega": 36.0,
  "info": "Standard DIC hutch setup"
}
```
`dic_array.txt`
```text
# ramsx  ramsz  ome   num_points  ctime  beam_height  beam_width  atten
0.0     -4.0   36.0  5           1.5    0.0          0.0         0.0
0.0     -4.0   90.0  5           1.5    0.0          0.0         0.0
```
   
### 2. _Are these all the settings that are needed for now?_
General
- spec Host: text
- require spec enable: toggle

RAMS
- System name ??
- hostname: text
- axis count: number
- task count: number
- for all axes:
    - max velocity: number
    - max acceleration: number
- input signals ??
    - channel??

DAQ
- ~~real global~~
- ~~integer global~~
    - Edit these manually in files
- Output Path: text

DIC
- anything?

Reference file:`RAMS_CHESS.json`
```json
{
  "system_name": "RAMSIV_CHESS",
  "host": "172.30.3.18",
  "axis_count": 5,
  "task_count": 4,
  "axis": [
    {"id": 0, "name": "RT", "units": "deg", "max_velocity": 0.45, "max_acceleration": 0.5},
    {"id": 1, "name": "RB", "units": "deg", "max_velocity": 0.45, "max_acceleration": 0.5},
    {"id": 2, "name": "TEN", "units": "deg", "max_velocity": 0.45, "max_acceleration": 0.5},
    {"id": 3, "name": "A", "units": "deg", "max_velocity": 0.45, "max_acceleration": 0.5},
    {"id": 4, "name": "B", "units": "deg", "max_velocity": 0.45, "max_acceleration": 0.5}
  ],
  "input_signals": [
    {"name": "loadA", "units": "N", "scale": 1100, "offset": -0.123, "axis": 0, "channel": 0},
    {"name": "loadB", "axis": 1, "channel": 1},
    {"name": "torque", "axis": 2, "channel": 0}
  ]
}
```

### 3. _Setting file will be stored globally at the path below?_
- `/nfs/chess/aux/cycles/2026-2/id3a/rams4-2026-2/holding_bay/rams4/setting.json`

Anytime the settings menu closes, the frontend will check if the settings draft
against the saved settings. If there are any differences, a request will be made to
save the new settings file. 


## Changes & Updates

### Saving a Configuration
#### 1. User click `save` which requests to save the file at the seelcted directory under the new experiment number.
   - ex.  `/nfs/chess/aux/cycles/2026-2/id3a/<user>/holding_bay/rams4/<sample-name>/config#.json`

When user saves or opens a config in the GUI, the backend must update the path 'pointers' to the current configuration files.

`config1.json`
```json
{
  "cycleNumber": "2026-2",
  "sampleName": "rams4-cablerelief",
  "userId": "rams4-2026-2",
  "experimentNumber": "1",
  "requiredAxes": ["A", "B", "RA", "RB"],
  "daqFrequency": 50,
  "samplePoints": 1000,
  "handlerProfiles": [ ... ],
  "xrayProfiles": [ ... ]
}
```

Example Directory:
```txt
.
└── holding_bay/
    └── rams4/
        ├── settings.json         # frontend file
        |   # These files below get updated when a new config is loaded/saved 
        ├── mech_workflow_config.json
        ├── daq_config.json
        ├── rams_chess.json
        ├── ...  # rest of backend files
        └── <sample-name>/
            ├── config1.json      # frontend file
            ├── config2.json      # frontend file
            └── ...
```
