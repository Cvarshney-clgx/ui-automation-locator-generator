// Simple test script to identify exactly where the backend hangs
const http = require('http');

function makeTestRequest() {
    console.log('🧪 Making test request to identify hang location...');
    
    const postData = JSON.stringify({
        url: 'https://example.com', // Simple page
        isMultipage: false, // Start with single page
        username: '',
        password: '',
        locatorFilters: {
            input: true,
            button: true,
            link: true
        }
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/generate-locators',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 60000 // 60 second timeout
    };

    const req = http.request(options, (res) => {
        let data = '';
        
        console.log(`📡 Response status: ${res.statusCode}`);
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('✅ Request completed successfully!');
                console.log(`📊 Results: ${result.success ? result.data.length : 0} locators`);
            } catch (e) {
                console.log('❌ Invalid JSON response:', e.message);
                console.log('Raw response:', data.substring(0, 500));
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Request failed:', err.message);
        
        if (err.code === 'ECONNREFUSED') {
            console.log('💡 Make sure backend server is running: node server.js');
        }
    });

    req.on('timeout', () => {
        console.log('⏰ Request timed out - backend is likely hanging');
        console.log('💡 Check the backend console for the last debug message');
        req.destroy();
    });

    req.write(postData);
    req.end();
}

// Test with multi-page (this is where the hang occurs)
function makeMultipageTest() {
    console.log('\n🧪 Making MULTIPAGE test request (this should hang)...');
    
    const postData = JSON.stringify({
        url: 'https://demoqa.com',
        isMultipage: true, // This is where it hangs
        username: '',
        password: '',
        locatorFilters: {
            input: true,
            button: true,
            link: true
        }
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/generate-locators',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 120000 // 2 minute timeout
    };

    console.log('📡 Sending multipage request - watch backend console for hang location...');
    
    const req = http.request(options, (res) => {
        let data = '';
        
        console.log(`📡 Response status: ${res.statusCode}`);
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('✅ Multipage request completed successfully!');
                console.log(`📊 Results: ${result.success ? result.data.length : 0} locators`);
            } catch (e) {
                console.log('❌ Invalid JSON response:', e.message);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Multipage request failed:', err.message);
    });

    req.on('timeout', () => {
        console.log('⏰ MULTIPAGE REQUEST TIMED OUT');
        console.log('💡 The backend hung after "Crawling completed. Found 50 pages."');
        console.log('💡 Check the backend console to see the last debug message');
        console.log('💡 This will show exactly where in the processing it got stuck');
        req.destroy();
    });

    req.write(postData);
    req.end();
}

console.log('🚀 Backend Hang Debugging Tool');
console.log('==============================');
console.log('This will help identify exactly where the backend hangs');
console.log('Make sure the backend server is running first!\n');

// Wait a moment then make the multipage test (the problematic one)
setTimeout(() => {
    makeMultipageTest();
}, 1000);

// Keep process alive to see the timeout
setTimeout(() => {
    console.log('\n⏰ Test completed - check backend console logs for hang location');
    process.exit(0);
}, 130000); // Exit after 2+ minutes
