const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'text/plain';
}

// Simple serverless function simulator
async function runServerlessFunction(functionPath, req, res) {
    try {
        // Clear require cache for all project files to ensure shared libs are updated
        for (const id of Object.keys(require.cache)) {
            if (id.startsWith(__dirname + path.sep)) {
                delete require.cache[id];
            }
        }
        
        const handler = require(functionPath);
        const exportedHandler = handler.default || handler;
        
        if (typeof exportedHandler === 'function') {
            await exportedHandler(req, res);
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid function export' }));
        }
    } catch (error) {
        console.error('Function error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Function execution failed',
            message: error.message 
        }));
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    // Handle API routes (serverless functions)
    if (pathname.startsWith('/api/')) {
        const functionPath = '.' + pathname + '.js';
        
        if (fs.existsSync(functionPath)) {
            await runServerlessFunction(functionPath, req, res);
            return;
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
            return;
        }
    }

    // Handle static files
    let filePath = '';
    
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (pathname === '/admin') {
        filePath = path.join(__dirname, 'public', 'login.html');
    } else {
        filePath = path.join(__dirname, 'public', pathname);
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - File not found');
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
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Development Server running on port ${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
    console.log('Press Ctrl+C to stop the server');
});

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