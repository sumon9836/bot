const { handleOptions, json } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return json(res, 405, { error: 'Method not allowed' });
    }
    
    return json(res, 200, {
        status: 'online',
        timestamp: new Date().toISOString()
    });
};