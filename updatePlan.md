# Update Plan

## Notes

### Kevin Notes

Meeting Feedback:

Next Steps --
Abstraction of Configuration for UX
Backend Data Storage

The current GUI is close to 1-to-1 with the configuration files. We should expand the allowed config to allow for configuration of all necessary settings, even if they are not currently kept in the same kinds of JSON files. We should also collapse / remove some fields, & give some better options for fields that we want to keep. Specifically we also need to figure out what kind of UX we even want for something like "Required Axes".

We discussed creating a folder in the BTR folder that would hold the configuration states. This would be controlled by us -- we would need to validate it on load, though. Then we discussed that we will need to make sure an ~immutable copy of the configuration is linked to the specific mech-test. Should talk to @Kelly Nygren about how the data linkages should be structured / what is happening now -- the rams4 system already does logging, but I think we need to do a little more on the mech-test level.



UI Feedback --
- There are places that could be a little more idiomatic. Shadcn can help with those component.
- Definitely need some tooltips for some things. Perhaps some renaming. Give it a try with the expectation that it will be corrected.



Code Review Feedback --

Overall -- not bad. Very good for your first web app.

Unfortunately, I have to recommend that you get rid of the dynamic Schema rendering. To get the right UX, you are going to have to "hard code" the components. You will find that this level of metaprogramming will quickly become worse, regular programming as the complexity grows :). I would recommend you look into "type discriminators" and make something like:
```
TimeSeriesConfig = {
type = "time-series";
...
}

PSOConfig = {
type = "pso-config";
...
}

...
```
type HandlerConfig = TimeSeriesConfig | PSOConfig | ...; And then just key off of the type like you do with switch (activeTab) ...



And the last thing -- Make a clear distinction in your code between the config that you are currently editing and a valid, existing configuration. This is usually done by having a "draft" config that a Partial<Config> or something to that effect. Then, in your front-end app, you can save the draft config to the local storage and have operations of loading a full config from the server into the draft, or validating a draft to turn it into a real config and then saving it. It may seem minor, but it will be a good practice. (edited)


### My Notes:
- Setup in GUI
- Run in python script
- Storage in holding_bay
- Required axes??
- Do settings
- Tooltips/hover card components


## Goal

A more intuitive UI with shadcn components that handles all the possible configuration steps, saves them to linux server per user,
and can be run using a python script.

## Steps

### 1. Organize fields for GUI
Some sort of dynamic form or auto-complete situation at the top for path:
- Sample Name
- User ID
- Cycle
- Experiment number?

DAQ
- required axes?? (not checkboxes!)
- frequency_khz
- handlers (form)

X-ray
- array form

DIC
- positions
- info section? (optional)

### 2. Refactor code & reorganize GUI for configuration 
- remove legacy components
- reconfigure subsections—like the view instide the tab area
- reorganize sections to reflect #1 above
- add tooltips for each option

### 3. Redesign the local storage
- locally store everything in a `draft`
  - `onSave`:
    - apply verification (not sure how were going to do this yet)
    - save as an actual config to...?
