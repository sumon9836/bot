const url = require('url');
const path = require('path');
const fs = require('fs');

const API_BASE_URL = process.env.API_BASE_URL || 'http://ballast.proxy.rlwy.net:23161';

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// Get content type based on file extension
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'text/plain';
}

// Serve static files safely
function serveStaticFile(res, filePath) {
    // Sanitize the file path to prevent directory traversal
    const requestPath = decodeURIComponent(filePath).replace(/^\/+/, '');
    const publicDir = path.join(__dirname, '../public');
    const safePath = path.resolve(publicDir, requestPath);
    
    // Ensure the resolved path is within the public directory
    const relativePath = path.relative(publicDir, safePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.status(403).send('403 - Forbidden');
        return;
    }
    
    try {
        const content = fs.readFileSync(safePath);
        const contentType = getContentType(requestPath);
        res.setHeader('Content-Type', contentType);
        res.status(200).send(content);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // For HTML routes, serve index.html for client-side routing
            // For asset requests, return 404
            const ext = path.extname(requestPath).toLowerCase();
            if (ext && (ext === '.css' || ext === '.js' || ext === '.png' || ext === '.jpg' || ext === '.gif' || ext === '.svg' || ext === '.ico')) {
                res.status(404).send('404 - File not found');
            } else {
                // Serve index.html for HTML routes
                try {
                    const indexPath = path.join(publicDir, 'index.html');
                    const content = fs.readFileSync(indexPath);
                    res.setHeader('Content-Type', 'text/html');
                    res.status(200).send(content);
                } catch (indexErr) {
                    res.status(404).send('404 - File not found');
                }
            }
        } else {
            res.status(500).send('500 - Server error');
        }
    }
}

// Make API request to backend
async function makeAPIRequest(endpoint) {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
        const fullUrl = `${API_BASE_URL}${endpoint}`;
        const client = fullUrl.startsWith('https:') ? https : http;
        
        const req = client.get(fullUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ data: jsonData, status: res.statusCode });
                } catch (error) {
                    resolve({ data: data, status: res.statusCode });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Handle API requests
async function handleAPIRequest(res, endpoint) {
    try {
        const result = await makeAPIRequest(endpoint);
        
        res.status(result.status);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (typeof result.data === 'object') {
            res.send(JSON.stringify(result.data));
        } else {
            res.send(result.data);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(JSON.stringify({
            error: 'API request failed',
            message: error.message
        }));
    }
}

// Vercel handler function
module.exports = async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).end();
        return;
    }

    // API routes
    if (pathname.startsWith('/api/')) {
        if (pathname === '/api/pair' && query.number) {
            console.log(`🔗 Pairing request for: ${query.number}`);
            await handleAPIRequest(res, `/pair?number=${encodeURIComponent(query.number)}`);
        } else if (pathname === '/api/sessions') {
            console.log('📊 Fetching sessions...');
            await handleAPIRequest(res, '/sessions');
        } else if (pathname === '/api/health') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(200).send(JSON.stringify({
                status: 'online',
                timestamp: new Date().toISOString()
            }));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(400).send(JSON.stringify({ error: 'Invalid API request' }));
        }
    } else {
        // Serve static files
        const filePath = pathname === '/' ? '/index.html' : pathname;
        serveStaticFile(res, filePath);
    }
};
