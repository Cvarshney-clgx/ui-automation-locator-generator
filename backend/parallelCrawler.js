const puppeteer = require('puppeteer');
const { crawlPages } = require('./crawlPages');

const parallelCrawl = async (baseUrl, username, password, maxTabs = 1, maxDepth = 2, locatorFilters = {}) => {
    console.log(`Starting crawler for: ${baseUrl}`);
    console.log('Locator filters:', locatorFilters);
    
    let browser;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Launching browser (attempt ${retryCount + 1}/${maxRetries})...`);
            
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-background-timer-throttling',
                    '--disable-renderer-backgrounding',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-background-networking',
                    '--memory-pressure-off',
                    '--max_old_space_size=4096'
                ],                protocolTimeout: 300000, // 5 minutes protocol timeout
                timeout: 90000, // 1.5 minutes for browser launch
                ignoreDefaultArgs: false
            });
            
            // Test browser connection immediately
            const version = await browser.version();
            console.log(`Browser launched successfully: ${version}`);
            break;
            
        } catch (launchError) {
            console.error(`Browser launch attempt ${retryCount + 1} failed:`, launchError.message);
            retryCount++;
            
            if (browser) {
                try {
                    await browser.close();
                } catch (closeError) {
                    console.error('Error closing failed browser:', closeError.message);
                }
                browser = null;
            }
            
            if (retryCount >= maxRetries) {
                throw new Error(`Failed to launch browser after ${maxRetries} attempts. Last error: ${launchError.message}`);
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    const visited = new Set();
    const results = [];

    try {
        console.log('Creating new page...');
        const page = await browser.newPage();
          // Set longer timeouts and better error handling
        await page.setDefaultTimeout(300000); // 5 minutes
        await page.setDefaultNavigationTimeout(300000); // 5 minutes
        
        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Enhanced request interception with better error handling
        try {
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                try {
                    const resourceType = req.resourceType();
                    if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                        req.abort();
                    } else {
                        req.continue();
                    }
                } catch (reqError) {
                    console.warn('Request interception error:', reqError.message);
                    try {
                        req.continue();
                    } catch (continueError) {
                        // Ignore if request is already handled
                    }
                }
            });
        } catch (interceptionError) {
            console.warn('Request interception setup failed:', interceptionError.message);
        }
          // Enhanced error handling for page events
        page.on('error', (err) => {
            console.error('Page crashed:', err.message);
        });
        
        page.on('pageerror', (err) => {
            // Suppress page errors (like JavaScript errors) to reduce console noise
            // console.warn('Page error:', err.message);
        });
        
        page.on('requestfailed', (req) => {
            // Suppress request failures (like CSS/image loading failures) to reduce console noise
            // console.warn('Request failed:', req.url(), req.failure()?.errorText);
        });
        
        page.on('pageerror', (err) => {
            // Suppress page errors (like JavaScript errors) to reduce console noise
            // console.error('Page error:', err.message);
        });
        
        console.log(`Navigating to ${baseUrl}...`);
        
        // Try navigation with multiple fallback strategies
        let navigationSuccess = false;
        const navigationStrategies = ['networkidle2', 'networkidle0', 'domcontentloaded', 'load'];
        
        for (const strategy of navigationStrategies) {
            try {                await page.goto(baseUrl, { 
                    waitUntil: strategy,
                    timeout: 180000 // 3 minutes navigation timeout
                });
                navigationSuccess = true;
                console.log(`Navigation successful with strategy: ${strategy}`);
                break;
            } catch (navError) {
                console.warn(`Navigation failed with ${strategy}:`, navError.message);
                if (strategy === navigationStrategies[navigationStrategies.length - 1]) {
                    throw navError;
                }
            }
        }
        
        if (!navigationSuccess) {
            throw new Error('All navigation strategies failed');
        }
        
        const title = await page.title();
        console.log(`Successfully loaded: ${title}`);
          // Start crawling with browser restart capability for protocol errors
        let crawlAttempts = 0;
        const maxCrawlAttempts = 2;
        
        while (crawlAttempts < maxCrawlAttempts) {
            try {
                console.log(`Starting crawl attempt ${crawlAttempts + 1}/${maxCrawlAttempts}`);
                await crawlPages(page, baseUrl, visited, results, 0, maxDepth, baseUrl, locatorFilters);
                break; // Success, exit loop
                
            } catch (crawlError) {
                crawlAttempts++;
                console.error(`Crawl attempt ${crawlAttempts} failed:`, crawlError.message);
                
                // Check if it's a protocol error requiring browser restart
                if (crawlError.message.includes('Browser connection lost') ||
                    crawlError.message.includes('Protocol error') ||
                    crawlError.message.includes('Target closed') ||
                    crawlError.message.includes('Session closed')) {
                    
                    console.log('Protocol error detected, attempting browser restart...');
                    
                    if (crawlAttempts < maxCrawlAttempts) {
                        try {
                            // Close current browser and page
                            await page.close().catch(() => {});
                            await browser.close().catch(() => {});
                            
                            // Wait before restart
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            
                            // Restart browser with same configuration
                            console.log('Restarting browser...');
                            browser = await puppeteer.launch({
                                headless: true,
                                args: [
                                    '--no-sandbox', 
                                    '--disable-setuid-sandbox',
                                    '--disable-dev-shm-usage',
                                    '--disable-web-security',
                                    '--disable-features=VizDisplayCompositor',
                                    '--disable-extensions',
                                    '--disable-plugins',
                                    '--disable-background-timer-throttling',
                                    '--disable-renderer-backgrounding',
                                    '--disable-backgrounding-occluded-windows',
                                    '--disable-background-networking',
                                    '--memory-pressure-off',
                                    '--max_old_space_size=4096'
                                ],                                protocolTimeout: 300000, // 5 minutes
                                timeout: 90000, // 1.5 minutes
                                ignoreDefaultArgs: false
                            });
                              // Create new page with same configuration
                            page = await browser.newPage();
                            await page.setDefaultTimeout(300000); // 5 minutes
                            await page.setDefaultNavigationTimeout(300000); // 5 minutes
                            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                            
                            // Re-setup request interception
                            try {
                                await page.setRequestInterception(true);
                                page.on('request', (req) => {
                                    try {
                                        const resourceType = req.resourceType();
                                        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                                            req.abort();
                                        } else {
                                            req.continue();
                                        }
                                    } catch (reqError) {
                                        try {
                                            req.continue();
                                        } catch (continueError) {
                                            // Ignore if request is already handled
                                        }
                                    }
                                });
                            } catch (interceptionError) {
                                console.warn('Request interception setup failed after restart:', interceptionError.message);
                            }
                              // Re-navigate to base URL
                            await page.goto(baseUrl, { 
                                waitUntil: 'networkidle2',
                                timeout: 180000 // 3 minutes navigation timeout
                            });
                            
                            console.log('Browser restarted successfully, continuing crawl...');
                            
                        } catch (restartError) {
                            console.error('Failed to restart browser:', restartError.message);
                            if (crawlAttempts >= maxCrawlAttempts) {
                                throw new Error(`Browser restart failed after protocol error: ${restartError.message}`);
                            }
                        }
                    } else {
                        throw new Error(`Max crawl attempts reached. Last error: ${crawlError.message}`);
                    }
                } else {
                    // Non-protocol error, continue with partial results
                    console.error('Non-protocol error during crawling, continuing with partial results');
                    break;
                }
            }
        }
        
        await page.close();
        console.log(`Crawling completed. Found ${results.length} pages.`);
        
    } catch (error) {
        console.error('Error during crawling:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Ensure browser is properly closed
        try {
            await browser.close();
        } catch (closeError) {
            console.error('Error closing browser:', closeError.message);
        }
    }
    
    return results;
};

module.exports = { parallelCrawl };