import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

const seedMockGateway = () => {
    const root = path.resolve(__dirname, './mock_gateway_storage/nfs/chess/aux/cycles');
    if (fs.existsSync(root)) return; // already seeded

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
                val.forEach(expNum => {
                    const expFile = path.join(metadataPath, `config${expNum}.json`);
                    const mockPayload = {
                        cycleNumber: base.includes('2026-2') ? '2026-2' : '2026-1',
                        userId: base.split(path.sep).slice(-2)[0],
                        sampleName: key,
                        experimentNumber: expNum,
                        configDirectory: metadataPath.replace(path.resolve(__dirname, './mock_gateway_storage'), '') + '/',
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
                            { mode: "time-series", filename: "ts_specimen_1", verboseAxis: "A", verboseSystem: 1, verboseTask: "A", verboseIO: 0, verboseAi: "A", frequency: 10 }
                        ];
                    }
                    fs.writeFileSync(expFile, JSON.stringify(mockPayload, null, 2), 'utf8');
                });
            } else if (typeof val === 'object') {
                createStructure(currentPath, val);
            }
        });
    };

    createStructure(root, structure);
};

// Seed mock gateway directory structure on load
seedMockGateway();

const mockGatewayPlugin = () => {
    return {
        name: 'mock-gateway-plugin',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
                if (url.pathname === '/mock-gateway-api') {
                    const queryPath = url.searchParams.get('path');
                    const action = url.searchParams.get('action');
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
                                const items = dirents
                                    .map(dirent => {
                                        if (dirent.isFile() && dirent.name.startsWith('config') && dirent.name.endsWith('.json')) {
                                            const match = dirent.name.match(/^config(\d+)\.json$/);
                                            return match ? match[1] : dirent.name;
                                        }
                                        return dirent.name;
                                    })
                                    .filter(name => !name.startsWith('.') && name !== 'metadata');

                                items.sort();
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
                                    const filePath = payload.configDirectory + `config${payload.experimentNumber}.json`;
                                    const cleanPath = filePath.replace(/^\//, '');
                                    const targetFile = path.join(mockStorageRoot, cleanPath);

                                    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                                    fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), 'utf8');

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