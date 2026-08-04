# Graphical User Interface for RAMS IV Load Frame

The RAMS IV GUI is a modern web interface that allows users to interact with the RAMS load frame system at CHESS.

---

## Technical Overview

The GUI sits above the existing Python interface, and does not replace its functionality. 

### File Structure

```txt
src/
├── api/                             # REST API client modules
├── config/                          
│   ├── parameterLimits.ts           # (Edit me!) Schema validation bounds (min/max/default)
│   └── tooltips.ts                  # (Edit me!) UI help tooltips
├── feature/
│   ├── configuration/               # Configuration & Settings feature
│   └── sequence/                    # Test Sequence Builder feature
├── layout/                          # App layout shell, sidebar & header menus
├── store/                           # Zustand global state management
├── types/
├── components/                      # Shared UI component library
└── test/
```

### Implemented Features

The features currently implemented:
- **Configuration**: Set essential per-experiment configurations and advanced settings.
- **Sequence Builder**: Build a complete mechanical test using an intuitive drag-and-drop editor.


## Getting Started

### Run Locally (with simulated backend)
This method is preferred since it shows the full functionality of the application.

#### Prerequisite

- [Node.js](https://nodejs.org/en) (v20+)

#### Install & Run

```bash
git clone https://github.com/khakis23/RAMS4-GUI.git
cd RAMS4-GUI
npm install
npm run dev
```

Navigate to the `localhost` link provided in the terminal.


### GitHub Pages (using fallback defaults)
[Navigate to this link!](https://khakis23.github.io/RAMS4-GUI/) Saving/loading features are using hardcoded defaults.

---


## Looking for detailed architecture specs or user guides?

Check out the [Wiki](https://github.com/khakis23/RAMS4-GUI/wiki/Home/) for more details!
