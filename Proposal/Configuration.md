# Configuration Section

---

## Configuration Data and files

### Backend Files

The following files are example files that are used to configure the backend.

#### Data Acquisition Config: `daq_config.json`
Configure the DAQ sampling parameters, modes, and file naming.

```json
{
"sample_pts": 1000,
"frequency_kHz": 1,
"rglobal": [],
"iglobal": [0],
"output_directory": "./",

"handlers": [
  {
  "mode": "peak-valley",
  "filename": "peak_valley_001",
  "signal":
    {
      "axis": 3, 
      "item": "PositionFeedback", 
      "prominence": 0.005
    },
  "verbose": 
    {
      "axis": [0,0,0,1,0], 
      "IO": 0, 
      "system": 0, 
      "task": -1
    }
  },
  {
  "mode": "time-series",
  "filename": "time_series_001",
  "frequency": 500,
  "cycles": [[1,10],15,[20,100,10],2005],
  "verbose": 
    {
      "axis": 0, 
      "IO": 0, 
      "system": 0, 
      "task": -1
    }
  }
]
}
```

##### Mechanical Workflow Config: `mech_workflow_config.json`
This JSON file links the directories and other config files needed to run a test,
along with the experiment and file naming schemes, and the signal aliases.

```json
{
    "mech_test_array": "_take_debug.txt",
    "newsample": "align-0312-1",

    "xray_array": "ff_data_array.txt",
    "dic_position": "_dic_position.json",
    "require_spec_enable": false,

    "rams_config": "./examples/files/RAMS_CHESS.json",
    "rams_daq_config": "./examples/files/daq_config.json",
    "rams_required_axis_enabled": ["RT", "RB", "A", "B"],

    "user_id": "shade-4133-d",
    "cycle": "2026-1",

    "sample_directory": "/nfs/chess/aux/cycles/$cycle$/id1a3/$user_id$/$newsample$/",
    "user_directory": "/nfs/chess/aux/cycles/$cycle$/id1a3/$user_id$/holding_bay/",

    "spec_host": "id1a3.classe.cornell.edu:spec",
    "signal_aliases": {
        "load": "LoadA",
        "strain": "Strain",
        "spectolf": "SpecToLF",
        "lftospec": "LFToSpec"
    }
}

```

#### X-ray Scan Table: `ff/nf_array.txt`
A space-delimited text file that defines the x-ray scan parameters.

5 Layers with Varying Positions Example:
```text
# ramsx  ramsz  ome_start  ome_stop  num_points  ctime  beam_height  beam_width  atten
0.0      0.0    -180.0     180.0     3600        0.1    0.05         0.5         0.5
0.0 1.0 -180.0 180.0 3600 0.1 0.05 0.5 0.5
0.0 2.0 -180.0 180.0 3600 0.1 0.05 0.5 0.5
0.0 3.0 -180.0 180.0 3600 0.1 0.05 0.5 0.5
0.0 4.0 -180.0 180.0 3600 0.1 0.05 0.5 0.5
```


### Frontend Data

The frontend data is entered by the user in the GUI. It is locally stored in the browser, 
and eventually it is sent to the Gateway for processing.

#### General Config 
Locally saved as `general-config-storage`

```javascript
cycleNumber: string;   // ex. 2026-02
sampleName: string;
requiredAxes: string[];
```

#### DAQ Config
Locally saved as `daq-config-storage`

```javascript
// General DAQ settings
frequency: string;
samplePoints: number;

DAQProfile {
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
    verboseAi: string;

    // Time-series specific fields
    frequency?: number;
    cycles?: string;

    // Peak-valley specific fields
    signalAxis?: string;
    signalItem?: string;
    signalProminence?: number;

    // PSO specific fields
    psoAxis?: string;
}
```

#### X-ray Config
Locally saved as `xray-config-storage`

```javascript
XrayProfile {
    x: number;
    z: number;
    ome_0: number;
    ome_f: number;
    ctime: number;
    beam_h: number;
    beam_w: number;
    atten: number;
}
```

### Gateway Processing

The Gateway is responsible for handling communication between the frontend and backend,
and translating the _frontend data_ into the corresponding _backend files_.

#### /api/config POST
When the user saves or loads a new configuration, the POST request will trigger.

Query Parameters:
- `user_id`: <(string)>
- `file_type`: <(string)>
- `config_name`: <(string)>

```json
{
  "cycle": <(string)>,
  "newsample": <(string)>,
  "required_axes": ["RT", "RB", "A", "B"],
  "frequency_kHz": <(number)>,
  "sample_pts": <(number)>,
  "handlers": [
    {
      "mode": "peak-valley",
      "filename": "peak_valley_001",
      "signal":{"axis": 3, "item": "PositionFeedback", "prominence": 0.005},
      "verbose": {"axis": [0,0,0,1,0], "IO": 0, "system": 0, "task": -1}
    },
    ...
  ],
//  xray_profiles: [
//    {
//      "x": <(number)>,
//      "z": <(number)>,
//      "ome_start": <(number)>,
//      "ome_stop": <(number)>,
//      "num_points": <(number)>,
//      "ctime": <(number)>,
//      "beam_height": <(number)>,
//      "beam_width": <(number)>,
//      "atten": <(number)>
//    },
//    ...
//  ],
  //  "dic_profilse": [
  //    {
  //      "x": <(number)>,
  //      "z": <(number)>,
  //      "omega": <(number)>,
  //      "num_points": <(number)>,
  //      "ctime": <(number)>,
  //      "beam_height": <(number)>,
  //      "beam_width": <(number)>,
  //      "atten": <(number)>
  //    },
  //    ...
  //  ],
}
```

---


## User Storage Directory

A directory in the GUI will store the user's data files. Within the directory, there
will be subdirectories for each type of data file. Dropdown menus will be populated
with the names of the items in each subdirectory.

```text
.
└── User/
    ├── configurations/
    │   ├── config1.json   # includes DAQ Handlers
    │   ├── config2.json   
    │   └── ...
    ├── xray_profiles/
    │   ├── daq1.json
    │   └── ...
    └── dic_profiles/
        ├── dic1.json
        └── ...
```

### Gateway & Accessing Data

The same gateway that processes the data will also handle storing the data.

#### api/userData GET

When a user signs in, all the datafiles will be fetched into the GUI's memory.

```json
{
  "configurations": [<JSON configurations>, ...],
  "xrayProfiles": [<JSON xray profiles>, ...],
  "dicProfiles": [<JSON dic profiles>, ...]
}
```

#### api/userData POST

If a user edits, deletes, or creates a datafile, the POST request will handle the
changes.

Query Parameters:
- `update_type`: <'add' | 'edit' | 'delete'>

`add`
```json
{
  "filename": <example.json (string)>,
  "data": <full JSON data>
}
```

`delete`
```json
{
  "filename": <example.json (string)>
}
```

```edit``` (same as `add`)
```json
{
  "filename": <example.json (string)>,
  "data": <full JSON data>
}
```

### File Structure
```text
.
└── api_gateway/
    ├── run.py
    ├── config.py
    ├── Users/
    │   ├── user1/
    │   ├── user2/
    │   └── ...
    └── src/
        ├── main.py
        ├── routes/
        │   ├── control.py
        │   ├── sequence_builder.py
        │   └── user_config.py
        ├── sockets/
        │   └── streamer.py
        ├── validation/
        │   ├── control_schemas.py
        │   ├── sequence_schemas.py
        │   └── user_config_schema.py
        ├── translation/
        │   ├── control_trans.py
        │   ├── sequence_trans.py
        │   └── user_config_trans.py
        ├── rams/
        │   ├── manager.py
        │   ├── file_handler.py
        │   └── ...
        └── ...
```


---

## Profiles & Schemas Setup

In the GUI, profiles are defined as series of parameters that are optionally dynamically
available depending on a previous parameter. For example, an imaginary profile may have a 
dropdown requiring the user to choose from a list of fruits: `[apple, banana, cherry]`.
If the user chooses `apple` or `banana`, then the profile will dynamically add a new
number input field asking the user to enter the amount of peanut butter. This does not 
happen if the user chooses `cherry`. In terms of graph theory, this is a classic example
of a directed acyclic graph. The GUI uses a simple key-value based schema to represent
the graph.


### Building a Schema

```typescript
const schema: FieldSchema[] = [
    {
        id: "fruit", 
        label: "Fruit",
        type: "dropdown",
        width: "full",
        placeholder: "Select a fruit...",
        options: [
            { id: 'apple', label: 'Apple' },
            { id: 'banana', label: 'Banana' },
            { id: 'cherry', label: 'Cherry' }
        ]
    },
    {
        id: "pb_amt",
        label: "Peanut Butter Amount (g)",
        type: "number",
        width: "medium",
        placeholder: "ex. 105",
        required: true,
        showIf: (data) => data.fruit === "apple" || data.fruit === "banana"
    }
]
```
