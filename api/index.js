const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const API_BASE_URL = 'http://mainline.proxy.rlwy.net:35640';

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

// Serve static files
function serveStaticFile(res, filePath) {
    const publicPath = path.join(__dirname, '../public', filePath);
    
    fs.readFile(publicPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, serve index.html for client-side routing
                const indexPath = path.join(__dirname, '../public/index.html');
                fs.readFile(indexPath, (err, content) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 - File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Server error');
            }
        } else {
            const contentType = getContentType(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
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
        
        res.writeHead(result.status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        
        if (typeof result.data === 'object') {
            res.end(JSON.stringify(result.data));
        } else {
            res.end(result.data);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            error: 'API request failed',
            message: error.message
        }));
    }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API routes
    if (pathname.startsWith('/api/')) {
        if (pathname === '/api/pair' && query.number) {
            console.log(`🔗 Pairing request for: ${query.number}`);
            await handleAPIRequest(res, `/pair?number=${encodeURIComponent(query.number)}`);
        } else if (pathname === '/api/logout' && query.number) {
            console.log(`🚪 Logout request for: ${query.number}`);
            await handleAPIRequest(res, `/delete?number=${encodeURIComponent(query.number)}`);
        } else if (pathname === '/api/sessions') {
            console.log('📊 Fetching sessions...');
            await handleAPIRequest(res, '/sessions');
        } else if (pathname === '/api/health') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                status: 'online',
                timestamp: new Date().toISOString()
            }));
        } else {
            res.writeHead(400, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Invalid API request' }));
        }
    } else {
        // Serve static files
        const filePath = pathname === '/' ? '/index.html' : pathname;
        serveStaticFile(res, filePath);
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kaisen-MD Dashboard Server running on port ${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API Proxy: Forwarding /api/* to ${API_BASE_URL}`);
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

module.exports = server;