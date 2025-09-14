const { handleOptions, json, clearCookie } = require('../../lib/http');

module.exports = async function logout(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'POST') {
        return json(res, 405, { error: 'Method not allowed' });
    }
    
    clearCookie(res, 'admin_session');
    
    return json(res, 200, { 
        success: true, 
        message: 'Logout successful' 
    });
};