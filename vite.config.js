import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

const seedMockGateway = () => {
    const mockStorageRoot = path.resolve(__dirname, './mock_gateway_storage');
    const cyclesRoot = path.join(mockStorageRoot, 'nfs/chess/aux/cycles');

    const structure = {
        '2026-2': {
            'id1a3': {
                'sjobs-123': {
                    'titanium_specimen_02': ['1', '2', '3'],
                    'titanium_tensile_01': ['1', '2', '3', '4']
                },
                'tcook-456': {
                    'aluminum_shear_02': ['1', '2', '3'],
                    'nickel_superalloy_01': ['1', '2'],
                    'copper_alloy_01': ['1', '2']
                },
                'jternus789': {
                    'nickel_superalloy_04': ['1', '2'],
                    'copper_alloy_03': ['1', '2']
                }
            },
            'id1b3': {}
        },
        '2026-1': {
            'id1a3': {
                'assmith-10001-a': {
                    'zircaloy_tube_02': ['1', '2'],
                    'glassy_carbon_pillar_05': ['1', '2', '3', '4'],
                    'ti_64_printed_tensile_11': ['1', '2']
                }
            },
            'id1b3': {
                'jdeer-4453-6b': {}
            }
        }
    };

    const createStructure = (base, obj) => {
        Object.entries(obj).forEach(([key, val]) => {
            const currentPath = path.join(base, key);
            fs.mkdirSync(currentPath, { recursive: true });

            if (Array.isArray(val)) {
                const metadataPath = path.join(base, 'metadata', key);
                fs.mkdirSync(metadataPath, { recursive: true });
                
                // Seed hardware settings directory (RAMS-settings/settings0.json) under station/hutch level
                const stationMatch = base.match(/(?:nfs\/chess\/aux\/)?cycles\/[^\/]+\/([^\/]+)/);
                if (stationMatch) {
                    const stationDir = base.substring(0, base.indexOf(stationMatch[1]) + stationMatch[1].length);
                    const settingsDir = path.join(stationDir, 'RAMS-settings');
                    fs.mkdirSync(settingsDir, { recursive: true });
                    const settingsFile = path.join(settingsDir, 'settings0.json');
                    if (!fs.existsSync(settingsFile)) {
                        fs.writeFileSync(settingsFile, JSON.stringify({
                            specHost: "id1a3.classe.cornell.edu:spec",
                            requireSpecEnable: true,
                            systemName: "RAMS4_CHESS",
                            controllerHost: "10.0.0.1",
                            axisCount: 5,
                            taskCount: 5,
                            axesSettings: [
                                { name: "A", max_velocity: 50, max_acceleration: 100 },
                                { name: "B", max_velocity: 50, max_acceleration: 100 },
                                { name: "RA", max_velocity: 10, max_acceleration: 20 },
                                { name: "RB", max_velocity: 10, max_acceleration: 20 },
                                { name: "TENS", max_velocity: 5, max_acceleration: 10 }
                            ],
                            signalSettings: [
                                { name: "Load A", slope: 1.0, intercept: 0.0, channel: 0 },
                                { name: "Load B", slope: 1.0, intercept: 0.0, channel: 1 },
                                { name: "Torque", slope: 1.0, intercept: 0.0, channel: 2 }
                            ]
                        }, null, 2), 'utf8');
                    }
                }

                val.forEach(expNum => {
                    const expFile = path.join(metadataPath, `config${expNum}.json`);
                    const mechFile = path.join(metadataPath, `mechTest${expNum}.json`);

                    if (!fs.existsSync(expFile)) {
                        const mockPayload = {
                            cycleNumber: base.includes('2026-2') ? '2026-2' : '2026-1',
                            userId: base.split(path.sep).slice(-2)[0],
                            sampleName: key,
                            experimentNumber: expNum,
                            configDirectory: metadataPath.replace(mockStorageRoot, '').replace(/^\//, '/') + '/',
                            requiredAxes: ["A", "B", "RA", "RB"],
                            daqFrequency: 1,
                            samplePoints: 1000,
                            handlerProfiles: [],
                            xrayProfiles: []
                        };
                        if (key === 'titanium_specimen_02' && expNum === '1') {
                            mockPayload.daqFrequency = 10;
                            mockPayload.samplePoints = 500;
                            mockPayload.requiredAxes = ["A", "B", "RA"];
                            mockPayload.handlerProfiles = [
                                { mode: "time-series", filename: "ts_specimen_1", verboseAxis: "A", verboseSystem: 1, verboseTask: "A", verboseIO: 0, verboseAi: ["LoadA"], frequency: 10 }
                            ];
                            mockPayload.xrayProfiles = [
                                {
                                    id: "rotation-1",
                                    name: "Rotation Series Profile",
                                    mode: "rotation-series",
                                    ramsx: 10.5,
                                    ctime: 0.5,
                                    beamHeight: 1.0,
                                    beamWidth: 2.0,
                                    atten: 0,
                                    layerRanges: [
                                        { omeStart: 0, omeStop: 180, numPoints: 180, layerStart: 0, layerEnd: 5, numLayers: 3 }
                                    ]
                                }
                            ];
                        }
                        fs.writeFileSync(expFile, JSON.stringify(mockPayload, null, 2), 'utf8');
                    }

                    if (!fs.existsSync(mechFile) && key === 'titanium_specimen_02' && expNum === '1') {
                        fs.writeFileSync(mechFile, JSON.stringify([
                            {
                                id: "step-1",
                                type: "ramp",
                                data: {
                                    axis: "A",
                                    mode: "relative",
                                    control: "displacement",
                                    target: 5.0,
                                    dispToggle: "time",
                                    time: 60.0,
                                    velocity: null,
                                    max_displacement: 10.0,
                                    enable_dic: true,
                                    skipDICpos: false,
                                    incrementSeg: false,
                                    wait: true
                                }
                            },
                            {
                                id: "step-2",
                                type: "take",
                                data: {
                                    profileID: "rotation-1",
                                    imgMode: "rotation-series",
                                    pauseTsDaq: false
                                }
                            }
                        ], null, 2), 'utf8');
                    }
                });
            } else if (typeof val === 'object') {
                createStructure(currentPath, val);
            }
        });
    };

    createStructure(cyclesRoot, structure);
};

// Seed mock gateway directory structure on load
seedMockGateway();

const mockGatewayPlugin = () => {
    return {
        name: 'mock-gateway-plugin',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
                if (url.pathname.startsWith('/api/') || url.pathname === '/mock-gateway-api') {
                    const queryPath = url.searchParams.get('path');
                    const action = url.searchParams.get('action');
                    const queryType = url.searchParams.get('type');
                    const mockStorageRoot = path.resolve(__dirname, './mock_gateway_storage');

                    if (action === 'list') {
                        if (!queryPath) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Missing path parameter' }));
                            return;
                        }

                        const cleanPath = queryPath.replace(/^\//, '');
                        const targetDir = path.join(mockStorageRoot, cleanPath);

                        if (fs.existsSync(targetDir)) {
                            try {
                                const dirents = fs.readdirSync(targetDir, { withFileTypes: true });
                                let items;

                                if (queryType === 'experiment') {
                                    items = dirents
                                        .filter(dirent => dirent.isFile() && /^config\d+\.json$/.test(dirent.name))
                                        .map(dirent => {
                                            const match = dirent.name.match(/^config(\d+)\.json$/);
                                            return match ? match[1] : dirent.name;
                                        });
                                    items.sort((a, b) => Number(a) - Number(b));
                                } else if (queryType === 'settings') {
                                    // TEMPORARY MOCK GATEWAY FILE LISTING (TO BE IMPLEMENTED IN PYTHON BACKEND)
                                    items = dirents
                                        .filter(dirent => dirent.isFile() && /^settings\d+\.json$/.test(dirent.name))
                                        .map(dirent => {
                                            const match = dirent.name.match(/^settings(\d+)\.json$/);
                                            return match ? parseInt(match[1], 10) : -1;
                                        })
                                        .filter(n => n >= 0);
                                    items.sort((a, b) => a - b);
                                } else {
                                    items = dirents
                                        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'metadata' && dirent.name !== 'RAMS-settings')
                                        .map(dirent => dirent.name);
                                    items.sort();
                                }

                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(items));
                            } catch (err) {
                                res.statusCode = 500;
                                res.end(JSON.stringify({ error: 'Failed to read directory' }));
                            }
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify([]));
                        }
                    } else {
                        // GET/POST operations
                        if (req.method === 'GET') {
                            if (!queryPath) {
                                res.statusCode = 400;
                                res.end(JSON.stringify({ error: 'Missing path parameter' }));
                                return;
                            }

                            const cleanPath = queryPath.replace(/^\//, '');
                            const targetFile = path.join(mockStorageRoot, cleanPath);

                            if (fs.existsSync(targetFile)) {
                                try {
                                    const data = fs.readFileSync(targetFile, 'utf8');
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(data);
                                } catch (err) {
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Failed to read file' }));
                                }
                            } else {
                                res.statusCode = 404;
                                res.end(JSON.stringify({ error: 'File not found' }));
                            }
                        } else if (req.method === 'POST') {
                            let body = '';
                            req.on('data', chunk => { body += chunk; });
                            req.on('end', () => {
                                try {
                                    const payload = JSON.parse(body);
                                    let targetFile;
                                    let dataToWrite;

                                    if (payload.customFilePath && payload.customFilePath.endsWith('settings_auto_increment')) {
                                        // TEMPORARY MOCK GATEWAY AUTO-INCREMENTING FILE SAVE (TO BE IMPLEMENTED IN PYTHON BACKEND)
                                        const cleanDirPath = payload.customFilePath.replace('settings_auto_increment', '').replace(/^\//, '');
                                        const settingsDir = path.join(mockStorageRoot, cleanDirPath);
                                        fs.mkdirSync(settingsDir, { recursive: true });

                                        const files = fs.readdirSync(settingsDir);
                                        const numbers = files
                                            .map(f => {
                                                const m = f.match(/^settings(\d+)\.json$/);
                                                return m ? parseInt(m[1], 10) : -1;
                                            })
                                            .filter(n => n >= 0);
                                        const nextVer = numbers.length > 0 ? Math.max(...numbers) + 1 : 0;

                                        targetFile = path.join(settingsDir, `settings${nextVer}.json`);
                                        dataToWrite = payload.data;

                                        fs.writeFileSync(targetFile, JSON.stringify(dataToWrite, null, 2), 'utf8');

                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(JSON.stringify({ success: true, version: nextVer, savedPath: targetFile }));
                                        return;
                                    }

                                    if (payload.customFilePath && payload.data) {
                                        const cleanPath = payload.customFilePath.replace(/^\//, '');
                                        targetFile = path.join(mockStorageRoot, cleanPath);
                                        dataToWrite = payload.data;
                                    } else {
                                        const filePath = payload.configDirectory + `config${payload.experimentNumber}.json`;
                                        const cleanPath = filePath.replace(/^\//, '');
                                        targetFile = path.join(mockStorageRoot, cleanPath);
                                        dataToWrite = payload;
                                    }

                                    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                                    fs.writeFileSync(targetFile, JSON.stringify(dataToWrite, null, 2), 'utf8');

                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ success: true, savedPath: targetFile }));
                                } catch (err) {
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Failed to write file' }));
                                }
                            });
                        }
                    }
                } else {
                    next();
                }
            });
        }
    };
};

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        mockGatewayPlugin(),
    ],
    base: '/RAMS4-GUI/',
    server: {
        watch: {
            ignored: ['**/mock_gateway_storage/**']
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8087',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            }
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})