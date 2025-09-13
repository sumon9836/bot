const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }
    
    try {
        console.log('📊 Fetching sessions...');
        const result = await fetchProxy('/sessions');
        
        if (typeof result.data === 'object') {
            return json(res, 200, result.data);
        } else if (typeof result.data === 'string') {
            try {
                const jsonData = JSON.parse(result.data);
                return json(res, 200, jsonData);
            } catch (e) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(result.data);
                return;
            }
        } else {
            return json(res, 200, {});
        }
    } catch (error) {
        console.error('Sessions API Error:', error.message);
        return json(res, 500, {
            error: 'Failed to fetch sessions',
            message: error.message
        });
    }
};