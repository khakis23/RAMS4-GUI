import assert from 'node:assert';
import { xrayProfileSchema, xrayFormSchema } from '../feature/configuration/profileSchemas/xraySchema.ts';

const runTest = (name: string, fn: () => void) => {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (err: any) {
        console.error(`✗ ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
};

console.log("\nRunning X-ray Profile Validation Suite...\n");

// Stills Mode Tests
runTest('Stills: Valid stills profile with point list coordinates', () => {
    const validStills = {
        id: "xray-1",
        name: "Static Points Scan",
        mode: "stills",
        ctime: 1.0,
        atten: 0,
        beamHeight: 0.5,
        beamWidth: 0.5,
        stillPoints: [
            {
                ramsx: 10.5,
                ramsz: 20.0,
                ome: 0,
                numPoints: 1
            }
        ]
    };
    const result = xrayProfileSchema.safeParse(validStills);
    assert.strictEqual(result.success, true, "Stills profile with point coordinates should be valid");
});

runTest('Stills: Invalid stills profile with zero points (must fail completeness validation)', () => {
    const emptyStills = {
        id: "xray-2",
        name: "Empty Stills",
        mode: "stills",
        ctime: 1.0,
        atten: 0,
        beamHeight: 0.5,
        beamWidth: 0.5,
        stillPoints: []
    };
    const result = xrayProfileSchema.safeParse(emptyStills);
    assert.strictEqual(result.success, false, "Stills profile with zero points must fail validation");
});

// Mapscan Mode Tests
runTest('Mapscan: Valid 1-axis line scan mapscan profile', () => {
    const valid1AxisMapscan = {
        id: "xray-3",
        name: "1D Line Scan",
        mode: "mapscan",
        ctime: 0.5,
        atten: 0,
        beamHeight: 1.0,
        beamWidth: 1.0,
        ramsx: 0,
        ramsz: 0,
        ome: 0,
        mapscanAxes: [
            {
                axisName: "ramsx",
                start: -5.0,
                stop: 5.0,
                points: 20
            }
        ]
    };
    const result = xrayProfileSchema.safeParse(valid1AxisMapscan);
    assert.strictEqual(result.success, true, "Mapscan with 1 moving axis should be valid");
});

runTest('Mapscan: Valid 2-axis grid mesh mapscan profile', () => {
    const valid2AxisMapscan = {
        id: "xray-4",
        name: "2D Mesh Scan",
        mode: "mapscan",
        ctime: 0.5,
        atten: 0,
        beamHeight: 1.0,
        beamWidth: 1.0,
        ramsx: 0,
        ramsz: 0,
        ome: 0,
        mapscanAxes: [
            {
                axisName: "ramsx",
                start: -5.0,
                stop: 5.0,
                points: 20
            },
            {
                axisName: "ramsz",
                start: -2.0,
                stop: 2.0,
                points: 10
            }
        ]
    };
    const result = xrayProfileSchema.safeParse(valid2AxisMapscan);
    assert.strictEqual(result.success, true, "Mapscan with 2 moving axes should be valid");
});

runTest('Mapscan: Invalid mapscan profile with 3 moving axes (must fail hard limit of 2)', () => {
    const invalid3AxisMapscan = {
        id: "xray-5",
        name: "Over-limit 3D Mesh",
        mode: "mapscan",
        ctime: 0.5,
        atten: 0,
        beamHeight: 1.0,
        beamWidth: 1.0,
        ramsx: 0,
        ramsz: 0,
        ome: 0,
        mapscanAxes: [
            { axisName: "ramsx", start: 0, stop: 10, points: 5 },
            { axisName: "ramsz", start: 0, stop: 10, points: 5 },
            { axisName: "ome", start: 0, stop: 180, points: 18 }
        ]
    };
    const result = xrayProfileSchema.safeParse(invalid3AxisMapscan);
    assert.strictEqual(result.success, false, "Mapscan exceeding 2 axes must fail validation");
});

runTest('Mapscan: Invalid mapscan profile missing required reference coordinates', () => {
    const missingRefMapscan = {
        id: "xray-6",
        name: "Missing Reference Z",
        mode: "mapscan",
        ctime: 0.5,
        atten: 0,
        beamHeight: 1.0,
        beamWidth: 1.0,
        ramsx: 0,
        ramsz: null,
        ome: 0,
        mapscanAxes: [
            { axisName: "ramsx", start: 0, stop: 5, points: 10 }
        ]
    };
    const result = xrayProfileSchema.safeParse(missingRefMapscan);
    assert.strictEqual(result.success, false, "Mapscan missing reference Z must fail validation");
});

// Rotation Series Mode Tests
runTest('Rotation Series: Valid rotation series profile with layer ranges', () => {
    const validRotation = {
        id: "xray-7",
        name: "Tomography Series",
        mode: "rotation-series",
        ctime: 0.1,
        atten: 0,
        beamHeight: 0.2,
        beamWidth: 0.2,
        ramsx: 15.0,
        layerRanges: [
            {
                omeStart: 0,
                omeStop: 180,
                numPoints: 360,
                layerStart: -1.0,
                layerEnd: 1.0,
                numLayers: 5
            }
        ]
    };
    const result = xrayProfileSchema.safeParse(validRotation);
    assert.strictEqual(result.success, true, "Rotation series with layer ranges should be valid");
});

runTest('Rotation Series: Invalid rotation series with zero layer ranges (must fail completeness validation)', () => {
    const emptyRotation = {
        id: "xray-8",
        name: "Empty Rotation",
        mode: "rotation-series",
        ctime: 0.1,
        atten: 0,
        beamHeight: 0.2,
        beamWidth: 0.2,
        ramsx: 15.0,
        layerRanges: []
    };
    const result = xrayProfileSchema.safeParse(emptyRotation);
    assert.strictEqual(result.success, false, "Rotation series with zero layer ranges must fail validation");
});

runTest('Rotation Series: Invalid rotation series missing Reference X', () => {
    const missingXRotation = {
        id: "xray-9",
        name: "Missing Reference X",
        mode: "rotation-series",
        ctime: 0.1,
        atten: 0,
        beamHeight: 0.2,
        beamWidth: 0.2,
        ramsx: null,
        layerRanges: [
            {
                omeStart: 0,
                omeStop: 180,
                numPoints: 360,
                layerStart: 0,
                layerEnd: 0,
                numLayers: 1
            }
        ]
    };
    const result = xrayProfileSchema.safeParse(missingXRotation);
    assert.strictEqual(result.success, false, "Rotation series missing reference X must fail validation");
});

// Form Schema Array Tests
runTest('Form Schema: Array of valid X-ray profiles', () => {
    const validForm = {
        xrayProfiles: [
            {
                id: "xray-10",
                name: "Stills Profile",
                mode: "stills",
                ctime: 1.0,
                atten: 0,
                beamHeight: 1.0,
                beamWidth: 1.0,
                stillPoints: [{ ramsx: 0, ramsz: 0, ome: 0, numPoints: 1 }]
            },
            {
                id: "xray-11",
                name: "Mapscan Profile",
                mode: "mapscan",
                ctime: 0.5,
                atten: 0,
                beamHeight: 1.0,
                beamWidth: 1.0,
                ramsx: 0,
                ramsz: 0,
                ome: 0,
                mapscanAxes: [{ axisName: "ramsx", start: 0, stop: 10, points: 5 }]
            }
        ]
    };
    const result = xrayFormSchema.safeParse(validForm);
    assert.strictEqual(result.success, true, "X-ray form containing valid profiles should pass");
});

console.log("\nAll X-ray Profile validation rules passed successfully!\n");
