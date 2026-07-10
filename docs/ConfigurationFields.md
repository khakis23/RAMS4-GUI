# RAMS4 Configuration Fields Reference

This table lists every configuration field defined in the RAMS4 front-end 
application, along with its input type, front-end value name, tooltip 
description, and editable slots for backend mapping. Rows with blank _Input Type_ 
are not implemented in the GUI yet.


| Field                                | Input Type                      | Backend File Name | Backend Value Name | Description | Notes |
|:-------------------------------------|:--------------------------------| :--- | :--- | :--- | :--- |
| **Cycle Number**                     | Dropdown Select                 | `mech_workflow_config.json` | `cycle` | The current experimental cycle or run identifier (e.g. "2026-2"). | |
| **User ID**                          | Dropdown Select                 | `mech_workflow_config.json` | `user_id` | The identifier of the researcher conducting the experiment. | |
| **Sample Name**                      | Dropdown Select / Text Dialog   | `mech_workflow_config.json` | `newsample` | The name or identifier of the material specimen being tested. | |
| **Experiment Number**                | Dropdown Select / Text Dialog   | | |  | |
| **Required Axes**                    |                                 | `mech_workflow_config.json` | `rams_required_axis_enabled` | Which mechanical axes are active/required for the specific test geometry (e.g., ["A", "B"]). | |
| **Sampling Frequency**               | Dropdown Select                 | `daq_config.json` | `frequency_kHz` | Rate at which sensor measurements are captured. | |
| **Sample Points**                    | Number Input                    | `daq_config.json` | `sample_pts` | Number of buffer data points retained during test runs. | |
| **DAQ Profile Mode**                 | Dropdown Select                 | `daq_config.json` | `mode` | Operating mode for data acquisition. Time-series logs raw signals; Peak-valley captures wave peaks/valleys; PSO logs at spatial hardware triggers. | |
| **DAQ Profile Name**                 | Text Input                      | `daq_config.json` | `filename` | The base output filename (saved as .h5). The backend automatically appends an incrementing index counter suffix. | |
| **DAQ Profile Frequency (Hz)**       | Number Input                    | `daq_config.json` | `frequency` | The logging write rate in Hz. This must be less than or equal to the master DAQ sampling frequency. | |
| **DAQ Profile Cycles Configuration** | Field Array (Start, Stop, Step) | `daq_config.json` | `cycles` | Specifies which cycle ranges are logged. Supports ranges [start, stop], range steps [start, stop, step], and single cycles. | |
| **DAQ Profile Signal Axis**          | Text Input                      | `daq_config.json` | `axis` | The mechanical axis driving the cycle wave monitored by the peak-finding algorithm. | |
| **DAQ Profile Signal Item**          | Dropdown Select                 | `daq_config.json` | `item` | The controller feedback signal type to trace for wave detection: Position, Velocity, or Acceleration. | |
| **DAQ Profile Prominence**           | Number Input                    | `daq_config.json` | `prominence` | The minimum amplitude threshold required to identify a wave peak/valley, filtering out high-frequency noise. | |
| **DAQ Profile PSO Axis**             | Text Input                      | `daq_config.json` | `pso_axis` | The mechanical axis that generates spatial hardware pulses to trigger data capture. | |
| **DAQ Profile Axis Logging Level**   | Dropdown Select                 | `daq_config.json` | `axis` | Telemetry details to collect for physical axes, ranging from basic feedback to commands and diagnostics. | |
| **DAQ Profile Task Logging Level**   | Dropdown Select                 | `daq_config.json` | `task` | Telemetry level for controller automation script execution tasks, from states to execution pointers. | |
| **DAQ Profile System Logging Level** | Dropdown Select                 | `daq_config.json` | `system` | Diagnostics level for controller CPU and hardware system telemetry timers. | |
| **DAQ Profile I/O Logging Level**    | Dropdown Select                 | `daq_config.json` | `IO` | Telemetry level for general controller I/O board registers, including analog and digital inputs/outputs. | |
| **DAQ Profile Analog Inputs**        | Checkboxes & Text Input         | `daq_config.json` | `ai` | Active analog input logs. Check to enable standard sensors or enter custom raw indexes (e.g. [1,0]). | |
| **X-ray Profile Name**               | Text Input                      | `mech_workflow_config.json` | `xray_array` | The file path to the X-ray scan coordinate grid (e.g., "ff_elastic_array.txt"). | |
| **X-ray Profile X Position (mm)**    | Text/Number Input               | `ff_elastic_array.txt` | `ramsx` | The X-coordinate position of the specimen stages for this scan layer in mm. | |
| **X-ray Profile Z Position (mm)**    | Text/Number Input               | `ff_elastic_array.txt` | `ramsz` | The Z-coordinate position of the specimen stages for this scan layer in mm. | |
| **X-ray Profile Initial Angle (º)**  | Text/Number Input               | `ff_elastic_array.txt` | `ome_start` | The starting rotation angle (Omega) of the stage for this fly scan layer in degrees. | |
| **X-ray Profile Final Angle (º)**    | Text/Number Input               | `ff_elastic_array.txt` | `ome_stop` | The ending rotation angle (Omega) of the stage for this fly scan layer in degrees. | |
| **X-ray Profile Exposure Time (s)**  | Text/Number Input               | `ff_elastic_array.txt` | `ctime` | Exposure count time per step in seconds. | |
| **X-ray Profile Attenuation (mm)**   | Text/Number Input               | `ff_elastic_array.txt` | `atten` | The attenuator foil thickness in mm. Must be in 0.25 mm increments from 0 to 20 mm. | |
| **X-ray Profile Beam Height (mm)**   | Text/Number Input               | `ff_elastic_array.txt` | `beam_height` | Vertical slit height of the incident X-ray beam in mm. | |
| **X-ray Profile Beam Width (mm)**    | Text/Number Input               | `ff_elastic_array.txt` | `beam_width` | Horizontal slit width of the incident X-ray beam in mm. | |
| **Spec Host**                        | Text (IP Addr.)                 | `mech_workflow_config.json` | `spec_host` | The network address of the external SPEC server (e.g. id1a3.classe.cornell.edu:spec). | |
| **Require Spec Enable**              | Toggle switch                   | `mech_workflow_config.json` | `require_spec_enable` | If enabled, the system requires connection to SPEC to proceed with scans. | |
| **System Name**                      | Text                            | `RAMS_CHESS.json` | `system_name` | Name of the mechanical testing system (e.g. RAMS4_CHESS). | |
| **Hostname**                         | Text (IP Addr.)                 | `RAMS_CHESS.json` | `host` | Network IP address of the Aerotech controller. | |
| **Axis Count**                       | Number                          | `RAMS_CHESS.json` | `axis_count` | The total number of mechanical axes available on the controller. | |
| **Task Count**                       | Number                          | `RAMS_CHESS.json` | `task_count` | The total number of concurrent execution tasks supported by the controller. | |
| **Axis Name '**                      | Dropdown (A,B,RA,RB,TENS)       | `RAMS_CHESS.json` | `name` | Physical name designation of the axis (e.g., RT, RB, TEN, A, B). | |
| **Axis Max Velocity '**              | Number                          | `RAMS_CHESS.json` | `max_velocity` | Maximum safety velocity limit for the axis. | |
| **Axis Max Acceleration '**          | Number                          | `RAMS_CHESS.json` | `max_acceleration` | Maximum safety acceleration limit for the axis. | |
| **Input Signal Name "**              | Dropdown (LoadA, LoadB, Torque) | `RAMS_CHESS.json` | `name` | Designated name for the analog or digital channel (e.g., LoadA, Strain). | |
| **Input Signal Scale "**             | Number                          | `RAMS_CHESS.json` | `slope` | Calibration multiplier slope to convert voltage into engineering units. | |
| **Input Signal Offset "**            | Number                          | `RAMS_CHESS.json` | `intercept` | Calibration y-intercept offset value. | |
| **Input Signal Channel "**            | Number                          | `RAMS_CHESS.json` | `channel` | Board channel number on the controller for this signal. | |

