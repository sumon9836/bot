const { requireAdmin } = require('../../lib/auth');
const { fetchProxy } = require('../../lib/proxy');
const { handleOptions, json, error, parseBody } = require('../../lib/http');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'POST') {
        return error(res, 405, 'Method not allowed');
    }
    
    if (!requireAdmin(req, res)) return;
    
    try {
        const body = await parseBody(req);
        
        if (!body.number) {
            return error(res, 400, 'Phone number required');
        }
        
        console.log(`🚫 Blocking user: ${body.number}`);
        const result = await fetchProxy(`/block?number=${encodeURIComponent(body.number)}`);
        
        if (typeof result.data === 'object') {
            return json(res, 200, result.data);
        } else if (typeof result.data === 'string') {
            try {
                const jsonData = JSON.parse(result.data);
                return json(res, 200, jsonData);
            } catch (e) {
                return res.status(200).send(result.data);
            }
        } else {
            return json(res, 200, {});
        }
    } catch (error) {
        console.error('Block API Error:', error.message);
        return json(res, 500, {
            error: 'Block request failed',
            message: error.message
        });
    }
};