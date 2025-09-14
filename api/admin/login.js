const { checkAdminPassword, signJWT } = require('../../lib/auth');
const { handleOptions, json, error, parseBody, setSecureCookie } = require('../../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'POST') {
        return error(res, 405, 'Method not allowed');
    }
    
    try {
        const body = await parseBody(req);
        
        if (!body.password) {
            return error(res, 400, 'Password is required');
        }
        
        if (checkAdminPassword(body.password)) {
            const token = signJWT({ user: 'admin' });
            setSecureCookie(res, 'admin_session', token, 3600); // 1 hour
            
            return json(res, 200, { 
                success: true, 
                message: 'Login successful' 
            });
        } else {
            return error(res, 401, 'Invalid password');
        }
    } catch (err) {
        console.error('Login error:', err);
        return error(res, 500, 'Login failed');
    }
};
const { handleOptions, json, setCookie, parseBody } = require('../../lib/http');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sumon2008';
const JWT_SECRET = process.env.JWT_SECRET || 'vercel-jwt-secret-2025';

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'POST') {
        return json(res, 405, { error: 'Method not allowed' });
    }
    
    try {
        const body = await parseBody(req);
        
        if (!body.password) {
            return json(res, 400, { 
                success: false, 
                error: 'Password required' 
            });
        }
        
        if (body.password !== ADMIN_PASSWORD) {
            return json(res, 401, { 
                success: false, 
                error: 'Invalid password' 
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { admin: true, timestamp: Date.now() },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Set cookie
        setCookie(res, 'admin_session', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return json(res, 200, { 
            success: true, 
            message: 'Login successful' 
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return json(res, 500, { 
            success: false, 
            error: 'Internal server error' 
        });
    }
};
