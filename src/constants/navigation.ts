import { Views } from '../types/views.ts'


export interface NavigationItem {
    name: string;
    view: Views;
    desc: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    { name: 'Home', view: 'home', desc: 'Return to dashboard view' },
    { name: 'Sequence Builder', view: 'sequenceBuilder', desc: 'Create, edit, and import test sequences' },
    { name: 'Run Sequence', view: 'runSequence', desc: 'Execute test sequence' },
    { name: 'Manual Control', view: 'manualControl', desc: 'Interface with hardware' },
    { name: 'Configure', view: 'configure', desc: 'Configure DIC, X-ray, and experiment parameters' },
    { name: 'View Data', view: 'viewData', desc: 'Visualize data from performed tests' },
];
