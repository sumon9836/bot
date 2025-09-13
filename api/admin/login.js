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