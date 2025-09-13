const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://ballast.proxy.rlwy.net:23161';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sumon2008';

// Simple session store (in production, use Redis or database)
const sessions = new Set();

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

// Generate simple session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Parse cookies from request
function parseCookies(req) {
    const cookies = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            cookies[parts[0]] = parts[1];
        });
    }
    return cookies;
}

// Check if user has valid session
function isAuthenticated(req) {
    const cookies = parseCookies(req);
    const sessionId = cookies.admin_session;
    return sessionId && sessions.has(sessionId);
}

// Send authentication required response
function sendAuthRequired(req, res) {
    res.writeHead(401, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
    });
    res.end(JSON.stringify({
        error: 'Authentication required',
        message: 'Please login to access admin features'
    }));
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
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 - Forbidden');
        return;
    }
    
    fs.readFile(safePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // For HTML routes, serve index.html for client-side routing
                // For asset requests, return 404
                const ext = path.extname(requestPath).toLowerCase();
                if (ext && (ext === '.css' || ext === '.js' || ext === '.png' || ext === '.jpg' || ext === '.gif' || ext === '.svg' || ext === '.ico')) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 - File not found');
                } else {
                    // Serve index.html for HTML routes
                    const indexPath = path.join(publicDir, 'index.html');
                    fs.readFile(indexPath, (err, content) => {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('404 - File not found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(content);
                        }
                    });
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Server error');
            }
        } else {
            const contentType = getContentType(requestPath);
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
        console.log(`Making API request to: ${fullUrl}`);
        const client = fullUrl.startsWith('https:') ? https : http;
        
        const req = client.get(fullUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`API Response status: ${res.statusCode}, data length: ${data.length}`);
                
                // For banlist endpoints, if we get HTML or error, return empty object
                if ((endpoint.includes('banlist') || endpoint.includes('blocklist')) && 
                    (res.statusCode !== 200 || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html'))) {
                    console.log('Banlist endpoint returned HTML or error, returning empty object');
                    resolve({ data: {}, status: 200 });
                    return;
                }
                
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ data: jsonData, status: res.statusCode });
                } catch (error) {
                    console.log('Failed to parse JSON response:', error.message);
                    
                    // For banlist endpoints, return empty object on parse error
                    if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                        resolve({ data: {}, status: 200 });
                    } else {
                        resolve({ data: data, status: res.statusCode });
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('API request error:', error.message);
            
            // For banlist endpoints, return empty object on network error
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                resolve({ data: {}, status: 200 });
            } else {
                reject(error);
            }
        });
        
        req.setTimeout(30000, () => {
            console.log('API request timeout');
            req.destroy();
            
            // For banlist endpoints, return empty object on timeout
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                resolve({ data: {}, status: 200 });
            } else {
                reject(new Error('Request timeout'));
            }
        });
    });
}

// Handle API requests
async function handleAPIRequest(res, endpoint) {
    try {
        const result = await makeAPIRequest(endpoint);
        
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        
        // Handle different response types
        if (typeof result.data === 'object') {
            res.end(JSON.stringify(result.data));
        } else if (typeof result.data === 'string') {
            // If the backend returns HTML or non-JSON, return empty object for banlist
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                res.end(JSON.stringify({}));
            } else {
                try {
                    // Try to parse as JSON first
                    const jsonData = JSON.parse(result.data);
                    res.end(JSON.stringify(jsonData));
                } catch (e) {
                    // If not JSON, return as text response
                    res.end(result.data);
                }
            }
        } else {
            res.end(JSON.stringify({}));
        }
    } catch (error) {
        console.error('API Error:', error.message);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Return appropriate empty response for banlist endpoints
        if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
            res.end(JSON.stringify({}));
        } else {
            res.end(JSON.stringify({
                error: 'API request failed',
                message: error.message
            }));
        }
    }
}

// Handle POST request body
function parsePostBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                try {
                    // Try URL-encoded format
                    const params = new URLSearchParams(body);
                    const result = {};
                    for (const [key, value] of params) {
                        result[key] = value;
                    }
                    resolve(result);
                } catch (e2) {
                    resolve({});
                }
            }
        });
        req.on('error', reject);
    });
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
        } else if (pathname === '/api/sessions') {
            console.log('📊 Fetching sessions...');
            await handleAPIRequest(res, '/sessions');
        } else if (pathname === '/api/admin/login' && req.method === 'POST') {
            const body = await parsePostBody(req);
            if (body.password === ADMIN_PASSWORD) {
                const sessionId = generateSessionId();
                sessions.add(sessionId);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `admin_session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`,
                    'Access-Control-Allow-Credentials': 'true'
                });
                res.end(JSON.stringify({ success: true, message: 'Login successful' }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid password' }));
            }
        } else if (pathname === '/api/admin/logout' && req.method === 'POST') {
            const cookies = parseCookies(req);
            const sessionId = cookies.admin_session;
            if (sessionId) {
                sessions.delete(sessionId);
            }
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
            });
            res.end(JSON.stringify({ success: true, message: 'Logout successful' }));
        } else if (pathname === '/api/admin/block' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(req, res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`🚫 Blocking user: ${body.number}`);
            await handleAPIRequest(res, `/block?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/admin/delete' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(req, res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`🗑️ Deleting/Logging out user: ${body.number}`);
            await handleAPIRequest(res, `/delete?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/admin/unblock' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(req, res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`✅ Unblocking user: ${body.number}`);
            await handleAPIRequest(res, `/unblock?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/banlist') {
            console.log('📋 Fetching public banlist...');
            await handleAPIRequest(res, '/banlist');
        } else if (pathname === '/api/admin/banlist') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(req, res);
                return;
            }
            console.log('📋 Fetching admin banlist...');
            await handleAPIRequest(res, '/banlist');
        } else if (pathname === '/api/admin/blocklist') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(req, res);
                return;
            }
            console.log('📋 Fetching blocklist...');
            await handleAPIRequest(res, '/blocklist');
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
    } else if (pathname === '/admin') {
        // Check if user is authenticated
        if (!isAuthenticated(req)) {
            // Serve login page instead of admin page
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>𝐊ąìʂҽղ-𝐌𝐃 | Admin Login</title>
                    <link rel="stylesheet" href="styles.css">
                </head>
                <body>
                    <div class="container">
                        <div style="max-width: 400px; margin: 100px auto; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(12px);">
                            <h1 style="text-align: center; color: #fff; margin-bottom: 30px;">🔒 Admin Login</h1>
                            <form id="loginForm" style="display: flex; flex-direction: column; gap: 20px;">
                                <input type="password" id="password" placeholder="Admin Password" required style="padding: 15px; border: none; border-radius: 10px; background: rgba(255,255,255,0.2); color: #fff; font-size: 16px;">
                                <button type="submit" style="padding: 15px; border: none; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; font-size: 16px; cursor: pointer;">Login</button>
                            </form>
                            <p style="text-align: center; margin-top: 20px;"><a href="/" style="color: #6366f1;">← Back to Dashboard</a></p>
                        </div>
                    </div>
                    <script>
                        document.getElementById('loginForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const password = document.getElementById('password').value;
                            try {
                                const response = await fetch('/api/admin/login', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ password }),
                                    credentials: 'include'
                                });
                                const data = await response.json();
                                if (data.success) {
                                    window.location.reload();
                                } else {
                                    alert('Invalid password');
                                }
                            } catch (error) {
                                alert('Login failed');
                            }
                        });
                    </script>
                </body>
                </html>
            `);
            return;
        }
        serveStaticFile(res, '/admin.html');
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
