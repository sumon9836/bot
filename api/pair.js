const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }
    
    const { number } = req.query;
    
    if (!number) {
        return error(res, 400, 'Phone number is required');
    }
    
    try {
        console.log(`🔗 Pairing request for: ${number}`);
        const result = await fetchProxy(`/pair?number=${encodeURIComponent(number)}`);
        
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
        console.error('Pair API Error:', error.message);
        return json(res, 500, {
            error: 'Pairing request failed',
            message: error.message
        });
    }
};