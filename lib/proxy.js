const API_BASE_URL = process.env.API_URL || 'http://ballast.proxy.rlwy.net:23161';

async function fetchProxy(endpoint, options = {}) {
    const timeout = options.timeout || 9000; // 9 seconds for Vercel limits
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${fullUrl}`);
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            signal: controller.signal,
            ...options
        });
        
        clearTimeout(timeoutId);
        
        console.log(`API Response status: ${response.status}`);
        
        // Get response text first
        const text = await response.text();
        console.log(`API Response data length: ${text.length}`);
        
        // For banlist/blocklist endpoints, handle non-JSON responses gracefully
        if ((endpoint.includes('banlist') || endpoint.includes('blocklist')) && 
            (!response.ok || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'))) {
            console.log('Blocklist endpoint returned HTML or error, returning empty object');
            return { data: {}, status: 200 };
        }
        
        // Try to parse as JSON
        try {
            const jsonData = JSON.parse(text);
            return { data: jsonData, status: response.status };
        } catch (parseError) {
            console.log('Failed to parse JSON response:', parseError.message);
            
            // For banlist endpoints, return empty object on parse error
            if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
                return { data: {}, status: 200 };
            }
            
            // For other endpoints, return the raw text
            return { data: text, status: response.status };
        }
        
    } catch (error) {
        console.log('API request error:', error.message);
        
        // For banlist/blocklist endpoints, return empty object on network error
        if (endpoint.includes('banlist') || endpoint.includes('blocklist')) {
            return { data: {}, status: 200 };
        }
        
        throw error;
    }
}

module.exports = {
    fetchProxy
};