// Health check function to test backend connectivity
export const testBackendConnection = async () => {
    try {
        console.log('🔍 Testing backend connection...');
        
        const response = await fetch('http://localhost:5000/api/test', {
            method: 'GET',
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Backend connection test successful:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Backend connection test failed:', error);
        return { 
            success: false, 
            error: error.message.includes('Failed to fetch') 
                ? 'Cannot connect to backend. Make sure it\'s running on http://localhost:5000'
                : error.message
        };
    }
};

export const generateLocatorsForApp = async (payload, useTestEndpoint = false) => {
    try {
        console.log('🔄 Making API request to backend...');
        console.log('📋 Payload:', payload);
        
        // Use test endpoint if requested, otherwise use real endpoint
        const apiUrl = useTestEndpoint 
            ? 'http://localhost:5000/api/generate-locators-test' 
            : 'http://localhost:5000/api/generate-locators';
            
        console.log('🌐 URL:', apiUrl);
          // Set timeout based on mode - much longer for multi-page to handle high-volume data
        const timeoutMs = useTestEndpoint 
            ? 30000 // 30 seconds for test endpoint
            : (payload.singlePageMode ? 300000 : 1200000); // 5min for single, 20min for multi-page
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('⏰ Request timeout triggered');
            controller.abort();
        }, timeoutMs);
        
        console.log(`⏱️  Request timeout set to ${timeoutMs/1000} seconds`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        console.log(`📡 Response received - Status: ${response.status} ${response.statusText}`);
        console.log(`📊 Response headers:`, response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ API response parsed successfully');
        console.log('📊 Response data keys:', Object.keys(data));
        
        if (data.success) {
            console.log(`🎯 Success: ${data.data.length} locators found`);
        } else {
            console.log(`❌ API returned error: ${data.error}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error in generateLocatorsForApp:', error);
        console.error('🔍 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        let errorMessage = 'Unknown error occurred';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout: The operation took too long to complete. Try using single-page mode or a simpler URL.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to backend server. Make sure the backend is running on http://localhost:5000';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Network error: Check your internet connection and backend server status.';
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Backend server is not running. Please start the backend server first.';
        } else {
            errorMessage = error.message;
        }
        
        return { 
            success: false, 
            error: errorMessage,
            originalError: error.message
        };
    }
};