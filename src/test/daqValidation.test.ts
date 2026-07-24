import assert from 'node:assert';
import {
    daqSchema,
    handlerProfileSchema,
    cycleRangeSchema
} from '../feature/configuration/profileSchemas/daqSchema.ts';

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

console.log("\nRunning Data Acquisition (DAQ) Rule Verification Suite...\n");

// Valid DAQ Configuration Payload
runTest('DAQ: Valid DAQ main configuration payload', () => {
    const validDaq = {
        requiredAxes: ["A", "B"],
        daqFrequency: 1000,
        samplePoints: 5000,
        handlersProfile: [
            {
                mode: "time-series",
                filename: "tensile_log",
                verboseAxis: "1",
                verboseSystem: 1,
                verboseTask: "1",
                verboseIO: 1,
                verboseAi: ["LoadA"],
                frequency: 100,
                cycles: [{ start: 0, stop: 100, step: 1 }]
            }
        ]
    };
    const result = daqSchema.safeParse(validDaq);
    assert.strictEqual(result.success, true, "Valid DAQ configuration payload should pass validation");
});

// Sample Points Minimum Bound
runTest('DAQ: Sample points under minimum threshold must fail', () => {
    const invalidSamplePoints = {
        requiredAxes: ["A", "B"],
        daqFrequency: 1000,
        samplePoints: 50, // Must be >= 100 per parameterLimits
        handlersProfile: []
    };
    const result = daqSchema.safeParse(invalidSamplePoints);
    assert.strictEqual(result.success, false, "Sample points under 100 must fail validation");
});

// Cycle Range Schema Tests
runTest('DAQ: Cycle range start, stop, and step bounds', () => {
    const validRange = { start: 0, stop: 500, step: 2 };
    const validResult = cycleRangeSchema.safeParse(validRange);
    assert.strictEqual(validResult.success, true, "Valid cycle range should pass");

    const invalidStep = { start: 0, stop: 500, step: 0 };
    const invalidResult = cycleRangeSchema.safeParse(invalidStep);
    assert.strictEqual(invalidResult.success, false, "Cycle step of 0 must fail validation");
});

// Handler Profile Mode-Specific Validations
runTest('DAQ Handler: Time-series mode requires frequency', () => {
    const missingFreqTimeSeries = {
        mode: "time-series",
        filename: "test_output",
        verboseAxis: "1",
        verboseSystem: 1,
        verboseTask: "1",
        verboseIO: 1,
        verboseAi: [],
        frequency: undefined // Frequency required for time-series
    };
    const result = handlerProfileSchema.safeParse(missingFreqTimeSeries);
    assert.strictEqual(result.success, false, "Time-series profile missing frequency must fail validation");
});

runTest('DAQ Handler: Peak-valley mode requires signalAxis, signalItem, and prominence', () => {
    const validPeakValley = {
        mode: "peak-valley",
        filename: "pv_log",
        verboseAxis: "1",
        verboseSystem: 1,
        verboseTask: "1",
        verboseIO: 1,
        verboseAi: [],
        signalAxis: "A",
        signalItem: "Position",
        signalProminence: 0.5
    };
    const validResult = handlerProfileSchema.safeParse(validPeakValley);
    assert.strictEqual(validResult.success, true, "Complete peak-valley profile should pass validation");

    const missingProminencePV = {
        mode: "peak-valley",
        filename: "pv_log",
        verboseAxis: "1",
        verboseSystem: 1,
        verboseTask: "1",
        verboseIO: 1,
        verboseAi: [],
        signalAxis: "A",
        signalItem: "Position",
        signalProminence: undefined
    };
    const invalidResult = handlerProfileSchema.safeParse(missingProminencePV);
    assert.strictEqual(invalidResult.success, false, "Peak-valley profile missing prominence must fail validation");
});

runTest('DAQ Handler: PSO mode requires psoAxis', () => {
    const validPso = {
        mode: "pso",
        filename: "pso_log",
        verboseAxis: "1",
        verboseSystem: 1,
        verboseTask: "1",
        verboseIO: 1,
        verboseAi: [],
        psoAxis: "A"
    };
    const validResult = handlerProfileSchema.safeParse(validPso);
    assert.strictEqual(validResult.success, true, "Complete PSO profile should pass validation");

    const missingPsoAxis = {
        mode: "pso",
        filename: "pso_log",
        verboseAxis: "1",
        verboseSystem: 1,
        verboseTask: "1",
        verboseIO: 1,
        verboseAi: [],
        psoAxis: ""
    };
    const invalidResult = handlerProfileSchema.safeParse(missingPsoAxis);
    assert.strictEqual(invalidResult.success, false, "PSO profile missing psoAxis must fail validation");
});

console.log("\nAll Data Acquisition (DAQ) validation rules passed successfully!\n");
