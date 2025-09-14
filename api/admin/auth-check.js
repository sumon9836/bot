
const jwt = require('jsonwebtoken');
const { handleOptions } = require('../../lib/http');

const JWT_SECRET = process.env.JWT_SECRET || 'vercel-jwt-secret-2025';

module.exports = async function authcheck(req, res) {
    if (handleOptions(req, res)) return;
    
    // Check if user is authenticated
    const token = req.cookies?.admin_session;
    
    if (!token) {
        // Not authenticated, redirect to login
        res.writeHead(302, {
            'Location': '/login',
            'Content-Type': 'text/html'
        });
        res.end();
        return;
    }
    
    try {
        // Verify JWT token
        jwt.verify(token, JWT_SECRET);
        
        // Authenticated, serve admin page
        res.writeHead(302, {
            'Location': '/admin.html',
            'Content-Type': 'text/html'
        });
        res.end();
        return;
        
    } catch (error) {
        // Invalid token, redirect to login
        res.writeHead(302, {
            'Location': '/login',
            'Content-Type': 'text/html'
        });
        res.end();
        return;
    }
};
