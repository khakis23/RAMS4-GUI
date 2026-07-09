import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// TOODO TEMP!
const mockGatewayPlugin = () => {
    return {
        name: 'mock-gateway-plugin',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
                if (url.pathname === '/mock-gateway-api') {
                    const queryPath = url.searchParams.get('path');
                    const mockStorageRoot = path.resolve(__dirname, './mock_gateway_storage');

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