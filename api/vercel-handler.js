
const url = require('url');
const path = require('path');
const fs = require('fs');

const API_BASE_URL = process.env.API_URL || 'http://ballast.proxy.rlwy.net:23161';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sumon2008';

// Simple session store for Vercel (using a Map with timestamps for basic persistence)
const sessions = new Map();

// Clean expired sessions (basic cleanup for stateless functions)
function cleanExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, timestamp] of sessions.entries()) {
        if (now - timestamp > 3600000) { // 1 hour expiry
            sessions.delete(sessionId);
        }
    }
}

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
    cleanExpiredSessions();
    const cookies = parseCookies(req);
    const sessionId = cookies.admin_session;
    if (!sessionId || !sessions.has(sessionId)) {
        return false;
    }
    
    // Check if session is still valid (not expired)
    const sessionTime = sessions.get(sessionId);
    const now = Date.now();
    if (now - sessionTime > 3600000) { // 1 hour expiry
        sessions.delete(sessionId);
        return false;
    }
    
    return true;
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
        console.log(`Making API request to: ${fullUrl}`);
        const client = fullUrl.startsWith('https:') ? https : http;
        
        const req = client.get(fullUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`API Response status: ${res.statusCode}, data length: ${data.length}`);
                
                // For banlist/blocklist endpoints, if we get HTML or error, return empty object
                if ((endpoint.includes('banlist') || endpoint.includes('blocklist')) && 
                    (res.statusCode !== 200 || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html'))) {
                    console.log('Blocklist endpoint returned HTML or error, returning empty object');
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
            
            // For banlist/blocklist endpoints, return empty object on network error
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                resolve({ data: {}, status: 200 });
            } else {
                reject(error);
            }
        });
        
        req.setTimeout(30000, () => {
            console.log('API request timeout');
            req.destroy();
            
            // For banlist/blocklist endpoints, return empty object on timeout
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
        
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle different response types
        if (typeof result.data === 'object') {
            res.send(JSON.stringify(result.data));
        } else if (typeof result.data === 'string') {
            // If the backend returns HTML or non-JSON, return empty object for banlist
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                res.send(JSON.stringify({}));
            } else {
                try {
                    // Try to parse as JSON first
                    const jsonData = JSON.parse(result.data);
                    res.send(JSON.stringify(jsonData));
                } catch (e) {
                    // If not JSON, return as text response
                    res.send(result.data);
                }
            }
        } else {
            res.send(JSON.stringify({}));
        }
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Return appropriate empty response for banlist endpoints
        if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
            res.send(JSON.stringify({}));
        } else {
            res.send(JSON.stringify({
                error: 'API request failed',
                message: error.message
            }));
        }
    }
}

// Send authentication required response
function sendAuthRequired(res) {
    res.status(401);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send(JSON.stringify({
        error: 'Authentication required',
        message: 'Please login to access admin features'
    }));
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
        } else if (pathname === '/api/admin/login' && req.method === 'POST') {
            const body = await parsePostBody(req);
            if (body.password === ADMIN_PASSWORD) {
                const sessionId = generateSessionId();
                sessions.set(sessionId, Date.now()); // Store with timestamp
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Set-Cookie', `admin_session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.send(JSON.stringify({ success: true, message: 'Login successful' }));
            } else {
                res.status(401);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ error: 'Invalid password' }));
            }
        } else if (pathname === '/api/admin/logout' && req.method === 'POST') {
            const cookies = parseCookies(req);
            const sessionId = cookies.admin_session;
            if (sessionId) {
                sessions.delete(sessionId);
            }
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
            res.send(JSON.stringify({ success: true, message: 'Logout successful' }));
        } else if (pathname === '/api/admin/block' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.status(400);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`🚫 Blocking user: ${body.number}`);
            await handleAPIRequest(res, `/block?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/admin/delete' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.status(400);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`🗑️ Deleting/Logging out user: ${body.number}`);
            await handleAPIRequest(res, `/delete?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/admin/unblock' && req.method === 'POST') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(res);
                return;
            }
            const body = await parsePostBody(req);
            if (!body.number) {
                res.status(400);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ error: 'Phone number required' }));
                return;
            }
            console.log(`✅ Unblocking user: ${body.number}`);
            await handleAPIRequest(res, `/unblock?number=${encodeURIComponent(body.number)}`);
        } else if (pathname === '/api/banlist') {
            console.log('📋 Fetching public banlist...');
            await handleAPIRequest(res, '/blocklist');
        } else if (pathname === '/api/admin/banlist') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(res);
                return;
            }
            console.log('📋 Fetching admin banlist...');
            await handleAPIRequest(res, '/blocklist');
        } else if (pathname === '/api/admin/blocklist') {
            if (!isAuthenticated(req)) {
                sendAuthRequired(res);
                return;
            }
            console.log('📋 Fetching blocklist...');
            await handleAPIRequest(res, '/blocklist');
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
    } else if (pathname === '/admin') {
        // Check if user is authenticated
        if (!isAuthenticated(req)) {
            // Serve login page instead of admin page
            res.status(200);
            res.setHeader('Content-Type', 'text/html');
            res.send(`
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
        // Serve admin dashboard (create inline since admin.html might not exist)
        res.status(200);
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>𝐊ąìʂҽղ-𝐌𝐃 | Admin Dashboard</title>
                <link rel="stylesheet" href="styles.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            </head>
            <body>
                <div class="container">
                    <header class="header">
                        <div class="header-content">
                            <div class="header-left">
                                <i class="fab fa-whatsapp header-icon"></i>
                                <h1>𝐊ąìʂҽղ-𝐌𝐃 Admin</h1>
                                <p class="header-subtitle">Advanced Bot Management</p>
                            </div>
                            <div class="header-right">
                                <button id="logoutBtn" class="btn btn-secondary">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>
                    <main class="main-content">
                        <div style="text-align: center; padding: 40px; color: white;">
                            <h2>🔐 Admin Dashboard</h2>
                            <p>You are successfully logged in to the admin panel.</p>
                            <a href="/" class="btn btn-primary" style="display: inline-block; margin-top: 20px;">
                                <i class="fas fa-home"></i>
                                Go to Main Dashboard
                            </a>
                        </div>
                    </main>
                </div>
                <script>
                    document.getElementById('logoutBtn').addEventListener('click', async () => {
                        try {
                            await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                            window.location.href = '/';
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        // Serve static files
        const filePath = pathname === '/' ? '/index.html' : pathname;
        serveStaticFile(res, filePath);
    }
};
