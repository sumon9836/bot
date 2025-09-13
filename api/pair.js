const { fetchProxy } = require('../lib/proxy');
const { handleOptions, json, error } = require('../lib/http');

function validatePhoneNumber(number) {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Check if it's a valid phone number (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return { valid: false, error: 'Phone number must be 10-15 digits' };
    }
    
    return { valid: true, number: cleaned };
}

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) return;
    
    if (req.method !== 'GET') {
        return error(res, 405, 'Method not allowed');
    }
    
    try {
        // Parse URL to extract query parameters properly
        const url = new URL(req.url, `http://${req.headers.host}`);
        const rawNumber = url.searchParams.get('number');
        
        if (!rawNumber || typeof rawNumber !== 'string' || rawNumber.trim() === '') {
            return json(res, 400, {
                error: 'Phone number is required',
                message: 'Please provide a valid phone number'
            });
        }
        
        // Validate phone number format
        const validation = validatePhoneNumber(rawNumber.trim());
        if (!validation.valid) {
            return json(res, 400, {
                error: 'Invalid phone number format',
                message: validation.error
            });
        }
        
        const number = validation.number;
        console.log(`🔗 Pairing request for: ${number}`);
        
        // Make API request with proper error handling
        const result = await fetchProxy(`/pair?number=${encodeURIComponent(number)}`);
        
        if (result && result.data) {
            // Handle different response types
            if (typeof result.data === 'object') {
                return json(res, 200, result.data);
            } else if (typeof result.data === 'string') {
                try {
                    const jsonData = JSON.parse(result.data);
                    return json(res, 200, jsonData);
                } catch (e) {
                    // Handle plain string response (like pairing code)
                    const responseData = {
                        code: result.data.trim(),
                        status: 'success',
                        number: number
                    };
                    return json(res, 200, responseData);
                }
            }
        }
        
        // Default success response
        return json(res, 200, { 
            message: 'Pairing request sent successfully', 
            status: 'pending',
            number: number
        });
        
    } catch (err) {
        console.error('Pair API Error:', err);
        
        // Handle specific error types
        if (err.message && err.message.includes('400')) {
            return json(res, 400, {
                error: 'Invalid request',
                message: 'The phone number provided is invalid or already paired'
            });
        }
        
        if (err.message && err.message.includes('404')) {
            return json(res, 404, {
                error: 'Service unavailable',
                message: 'WhatsApp pairing service is currently unavailable'
            });
        }
        
        return json(res, 500, {
            error: 'Pairing request failed',
            message: err.message || 'Network error occurred. Please try again.'
        });
    }
};