const { requireAdmin } = require('../../lib/auth');
const { fetchProxy } = require('../../lib/proxy');
const { handleOptions, json, error } = require('../../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }
    
    if (!requireAdmin(req, res)) return;
    
    try {
        console.log('📋 Fetching blocklist...');
        const result = await fetchProxy('/blocklist');
        
        if (typeof result.data === 'object') {
            return json(res, 200, result.data);
        } else {
            return json(res, 200, {});
        }
    } catch (error) {
        console.error('Blocklist API Error:', error.message);
        return json(res, 200, {});
    }
};