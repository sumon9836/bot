const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }
    
    // Safely extract number from query
    const number = req.query && req.query.number ? req.query.number : null;
    
    if (!number) {
        return error(res, 400, 'Phone number is required');
    }
    
    try {
        console.log(`🔗 Pairing request for: ${number}`);
        const result = await fetchProxy(`/pair?number=${encodeURIComponent(number)}`);
        
        if (result && result.data) {
            if (typeof result.data === 'object') {
                return json(res, 200, result.data);
            } else if (typeof result.data === 'string') {
                try {
                    const jsonData = JSON.parse(result.data);
                    return json(res, 200, jsonData);
                } catch (e) {
                    // If it's a plain string response (like pairing code)
                    return json(res, 200, { code: result.data, status: 'success' });
                }
            }
        }
        
        return json(res, 200, { message: 'Pairing request sent', status: 'pending' });
        
    } catch (err) {
        console.error('Pair API Error:', err);
        return json(res, 500, {
            error: 'Pairing request failed',
            message: err.message || 'Unknown error occurred'
        });
    }
};