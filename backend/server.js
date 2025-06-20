console.log('🚨🚨🚨 SERVER.JS IS STARTING! 🚨🚨🚨');
console.log('🚨🚨🚨 CURRENT WORKING DIRECTORY:', process.cwd());
console.log('🚨🚨🚨 __dirname:', __dirname);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { parallelCrawl } = require('./parallelCrawler');
console.log('🚨🚨🚨 ABOUT TO REQUIRE CRAWLPAGES.JS! 🚨🚨🚨');

// Force clear module cache for crawlPages.js before requiring
const path = require('path');
const crawlPagesPath = path.resolve(__dirname, './crawlPages.js');
delete require.cache[crawlPagesPath];
console.log('🚨🚨🚨 CLEARED MODULE CACHE FOR CRAWLPAGES.JS! 🚨🚨🚨');

const { crawlSinglePage } = require('./crawlPages');
console.log('🚨🚨🚨 CRAWLPAGES.JS REQUIRED SUCCESSFULLY! 🚨🚨🚨');
const { exportPOMFiles } = require('./pomExporter');
const { predictBestLocatorStrategy, generateOptimizedLocators } = require('./aiModel');
// const PORT = 5000;
// const HOST = "0.0.0.0"; // Allow all network traffic

const app = express();

// Enhanced CORS configuration - Allow all origins for development
app.use(cors({
    origin: true, // Allow all origins during development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Process cleanup handlers to prevent hanging browser processes
process.on('SIGINT', () => {
    console.log('\n⚠️ Received SIGINT, cleaning up...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️ Received SIGTERM, cleaning up...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    // Don't exit immediately, log and continue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit immediately, log and continue
});

// Enhanced health check endpoint
app.get('/api/test', (req, res) => {
    console.log('🏥 Health check requested');
    res.json({ 
        success: true, 
        message: 'Backend is responsive', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: [
            'GET /api/test - Health check',
            'POST /api/generate-locators - Generate locators',
            'POST /api/generate-locators-test - Test data'
        ]
    });
});

// Simple connectivity test endpoint  
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test XPath generation endpoint
app.post('/api/test-xpath', (req, res) => {
    console.log('🧪 XPath test endpoint called');
    
    try {
        const { getSmartXPath } = require('./crawlPages');
        
        // Test cases for our XPath optimization
        const testCases = [
            {
                name: 'Link with title matching text',
                element: {
                    tagName: 'a',
                    title: 'Home Page',
                    textContent: 'Home Page',
                    href: '/home'
                },
                expected: "//a[@title='Home Page']"
            },
            {
                name: 'Link with span child containing text',
                element: {
                    tagName: 'a',
                    textContent: 'Click Here',
                    href: '/click',
                    children: [
                        {
                            tagName: 'span',
                            textContent: 'Click Here'
                        }
                    ]
                },
                expected: "//span[normalize-space(text())='Click Here']"
            },
            {
                name: 'Simple link fallback',
                element: {
                    tagName: 'a',
                    textContent: 'Simple Link',
                    href: '/simple'
                },
                expected: "//a[normalize-space(text())='Simple Link']"
            }
        ];
        
        const results = testCases.map(testCase => {
            console.log(`🔍 Testing: ${testCase.name}`);
            const xpath = getSmartXPath(testCase.element, testCase.element.textContent);
            console.log(`📋 Generated XPath: ${xpath}`);
            console.log(`📋 Expected XPath: ${testCase.expected}`);
            
            return {
                name: testCase.name,
                element: testCase.element,
                generated: xpath,
                expected: testCase.expected,
                matches: xpath === testCase.expected
            };
        });
        
        console.log('🧪 XPath test results:', results);
        
        res.json({
            success: true,
            testResults: results,
            summary: {
                total: results.length,
                passed: results.filter(r => r.matches).length,
                failed: results.filter(r => !r.matches).length
            }
        });
        
    } catch (error) {
        console.error('❌ XPath test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint to return sample locator data
app.post('/api/generate-locators-test', async (req, res) => {
    console.log('🧪 Returning sample locator data for testing frontend');
    
    const sampleLocators = [
        {
            pageName: 'Practice Test Login',
            pageUrl: 'https://practicetestautomation.com/practice-test-login/',
            description: 'Username input field',
            type: 'id',
            value: 'username',
            xpath: '//input[@id="username"]',
            cssSelector: '#username',
            isInteractive: true,
            isUnique: true,
            depth: 0,
            confidence: 0.95,
            aiStrategy: 'ID',
            element: {
                tag: 'input',
                id: 'username',
                name: 'username',
                class: 'input',
                type: 'text',
                placeholder: 'Username'
            }
        },
        {
            pageName: 'Practice Test Login',
            pageUrl: 'https://practicetestautomation.com/practice-test-login/',
            description: 'Password input field',
            type: 'id',
            value: 'password',
            xpath: '//input[@id="password"]',
            cssSelector: '#password',
            isInteractive: true,
            isUnique: true,
            depth: 0,
            confidence: 0.95,
            aiStrategy: 'ID',
            element: {
                tag: 'input',
                id: 'password',
                name: 'password',
                class: 'input',
                type: 'password',
                placeholder: 'Password'
            }
        },
        {
            pageName: 'Practice Test Login',
            pageUrl: 'https://practicetestautomation.com/practice-test-login/',
            description: 'Submit button',
            type: 'id',
            value: 'submit',
            xpath: '//button[@id="submit"]',
            cssSelector: '#submit',
            isInteractive: true,
            isUnique: true,
            depth: 0,
            confidence: 0.95,
            aiStrategy: 'ID',
            element: {
                tag: 'button',
                id: 'submit',
                name: 'submit',
                class: 'btn btn-primary',
                type: 'submit'
            }
        }
    ];
    
    const pageGroups = [
        {
            pageName: 'Practice Test Login',
            pageUrl: 'https://practicetestautomation.com/practice-test-login/',
            depth: 0,
            locators: sampleLocators
        }
    ];
    
    res.json({
        success: true,
        message: `Found ${sampleLocators.length} quality locators across 1 pages (TEST DATA)`,
        data: sampleLocators,
        pageGroups: pageGroups,
        summary: {
            totalPages: 1,
            totalLocators: sampleLocators.length,
            interactiveElements: sampleLocators.filter(l => l.isInteractive).length,
            uniqueElements: sampleLocators.filter(l => l.isUnique).length,
            pagesWithLocators: pageGroups.length
        }
    });
});

// API Endpoint: Multi-page traversal and locator extraction
app.post('/api/generate-locators', async (req, res) => {
    // Dynamic timeout based on mode - longer for multi-page traversal
    const { singlePageMode = false } = req.body;
    const requestTimeout = singlePageMode ? 300000 : 600000; // 5min for single-page, 10min for multi-page
    req.setTimeout(requestTimeout);
    
    const { 
        url, 
        username, 
        password, 
        locatorFilters = {
            input: true,
            button: true,
            link: true,
            select: true,
            textarea: true,
            checkbox: true,
            radio: true,
            form: true
        }
    } = req.body;try {
        console.log(`🚀 Starting ${singlePageMode ? 'single-page' : 'multi-page'} traversal for: ${url}`);
        console.log('📋 Locator filters:', locatorFilters);
          // Enhanced timeout wrapper with better error handling
        const crawlWithTimeout = async () => {
            // Significantly increased timeout for multi-page mode to handle high-volume data processing
            const timeoutDuration = singlePageMode ? 270000 : 480000; // 4.5min for single page, 8min for multi-page
            let timeoutId;
            let isCompleted = false;
            
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    if (!isCompleted) {
                        reject(new Error(`Processing timeout - operation took longer than ${timeoutDuration/1000} seconds. This may happen with complex sites or slow network connections.`));
                    }
                }, timeoutDuration);
            });
            
            const crawlPromise = async () => {
                try {
                    let crawlResults;
                    if (singlePageMode) {
                        crawlResults = await crawlSinglePage(url, username, password, locatorFilters);
                    } else {
                        crawlResults = await parallelCrawl(url, username, password, 1, 3, locatorFilters);
                    }
                    isCompleted = true;
                    clearTimeout(timeoutId);
                    return crawlResults;
                } catch (error) {
                    isCompleted = true;
                    clearTimeout(timeoutId);
                    throw error;
                }
            };
            
            // Race between crawl and timeout
            return Promise.race([crawlPromise(), timeoutPromise]);
        };
        
        let results;
        try {
            results = await crawlWithTimeout();
        } catch (timeoutError) {
            // If timeout occurs, try to return whatever partial results we can
            console.error('⚠️ Crawling timeout occurred:', timeoutError.message);
            
            // Return a graceful error response instead of crashing
            return res.status(408).json({
                success: false,
                error: 'Request timeout: The site took too long to process. Please try again with a simpler page or check your internet connection.',
                details: timeoutError.message,
                suggestions: [
                    'Try using single-page mode for faster processing',
                    'Check if the URL is accessible and loads quickly in a browser',
                    'Some sites may have anti-bot protections that slow down automated crawling'
                ]
            });
        }        const outputDir = './generatedPOMs';
        exportPOMFiles(results, outputDir);

        // Transform data for frontend with better quality and deduplication
        const flattenedLocators = [];
        const globalSeenLocators = new Set(); // Global deduplication across all pages        console.log(`🔧 Processing ${results.length} pages for quality locators...`);
          // Optimized processing limits based on mode
        const MAX_PAGES_TO_PROCESS = singlePageMode ? results.length : Math.min(results.length, 25); // Increased from 10 to 25
        const MAX_LOCATORS_PER_PAGE = singlePageMode ? 1000 : 150; // Increased from 50 to 150
        
        console.log(`⚡ Processing up to ${MAX_PAGES_TO_PROCESS} pages with max ${MAX_LOCATORS_PER_PAGE} locators per page`);
        
        let processedPages = 0;
        let processedLocators = 0;
        let addedLocators = 0;
        let debugStats = {
            filteredOut: 0,
            qualityFiltered: 0,
            aiErrors: 0,
            duplicates: 0,
            added: 0
        };

        // Process only a subset to avoid hanging
        const pagesToProcess = results.slice(0, MAX_PAGES_TO_PROCESS);

        for (const page of pagesToProcess) {
            processedPages++;
            console.log(`📄 [${processedPages}/${results.length}] Processing page: ${(page.title || page.url || 'Unknown').substring(0, 50)}...`);
              if (page.locators && Array.isArray(page.locators)) {
                console.log(`  📍 Found ${page.locators.length} locators on this page`);
                
                // Limit locators per page to avoid processing too many
                const locatorsToProcess = page.locators.slice(0, MAX_LOCATORS_PER_PAGE);
                if (page.locators.length > MAX_LOCATORS_PER_PAGE) {
                    console.log(`  ⚠️  Limiting to first ${MAX_LOCATORS_PER_PAGE} locators (had ${page.locators.length})`);
                }                // Process in batches to avoid blocking
                for (let index = 0; index < locatorsToProcess.length; index++) {
                    processedLocators++;
                    
                    // Optimized heartbeat frequency - less console spam
                    if (processedLocators % 20 === 0) {
                        console.log(`    ⚡ Progress: ${processedLocators} locators processed, ${debugStats.added} added`);
                        
                        // Allow event loop to process other operations
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }

                    try {
                        const locator = locatorsToProcess[index];
                        
                        // Reduced debug logging frequency
                        if (processedLocators % 50 === 0) {
                            console.log(`      🔍 Processing locator ${processedLocators}: ${locator.description || 'No description'} (${locator.tagName || 'unknown'})`);
                        }
                        
                        // Apply locator type filters from frontend
                    const elementType = locator.tagName ? locator.tagName.toLowerCase() : '';
                    const inputType = locator.type ? locator.type.toLowerCase() : '';
                    
                    let matchesFilter = false;
                    
                    // Check if element matches selected filters
                    if (locatorFilters.input && (elementType === 'input' && inputType !== 'checkbox' && inputType !== 'radio')) {
                        matchesFilter = true;
                    }
                    if (locatorFilters.button && (elementType === 'button' || (elementType === 'input' && (inputType === 'submit' || inputType === 'button')))) {
                        matchesFilter = true;
                    }
                    if (locatorFilters.link && elementType === 'a') {
                        matchesFilter = true;
                    }
                    if (locatorFilters.select && elementType === 'select') {
                        matchesFilter = true;
                    }
                    if (locatorFilters.textarea && elementType === 'textarea') {
                        matchesFilter = true;
                    }
                    if (locatorFilters.checkbox && (elementType === 'input' && inputType === 'checkbox')) {
                        matchesFilter = true;
                    }
                    if (locatorFilters.radio && (elementType === 'input' && inputType === 'radio')) {
                        matchesFilter = true;
                    }
                    if (locatorFilters.form && elementType === 'form') {
                        matchesFilter = true;
                    }
                      if (!matchesFilter) {
                        debugStats.filteredOut++;
                        if (processedLocators % 10 === 0) {
                            console.log(`      ⏭️  DEBUG: Locator ${processedLocators} filtered out (no filter match)`);
                        }
                        continue; // Skip elements that don't match selected filters
                    }
                    
                    if (processedLocators % 10 === 0) {
                        console.log(`      ✅ DEBUG: Locator ${processedLocators} passed filter check`);
                    }// More lenient filtering for meaningful locators
                    const isQualityLocator = 
                        locator.isInteractive || // Interactive elements
                        locator.testId || // Test automation attributes
                        (locator.id && locator.id.length > 0) || // Any ID (removed uniqueness requirement)
                        locator.name || // Form elements with names
                        (locator.class && (
                            locator.class.includes('btn') || 
                            locator.class.includes('button') ||
                            locator.class.includes('form') ||
                            locator.class.includes('input') ||
                            locator.class.includes('control') ||
                            locator.class.includes('nav') ||
                            locator.class.includes('menu') ||
                            locator.class.includes('link') ||
                            locator.class.includes('submit')
                        )) ||
                        (locator.tagName && ['input', 'button', 'select', 'textarea', 'a'].includes(locator.tagName.toLowerCase()));
                      if (!isQualityLocator) {
                        debugStats.qualityFiltered++;
                        if (processedLocators % 10 === 0) {
                            console.log(`      ⏭️  DEBUG: Locator ${processedLocators} failed quality check`);
                        }
                        continue; // Skip low-quality locators
                    }
                    
                    if (processedLocators % 10 === 0) {
                        console.log(`      ✅ DEBUG: Locator ${processedLocators} passed quality check`);                    }
                    
                    // SIMPLIFIED: Skip all AI predictions for multi-page to avoid hangs
                    let aiRecommendation = { strategy: 'FALLBACK', confidence: 0.5 };
                    
                    // Only use AI for single-page mode with high-value locators
                    if (singlePageMode && (locator.testId || (locator.id && locator.isUnique) || locator.name)) {
                        try {
                            const aiPromise = predictBestLocatorStrategy({
                                id: locator.id,
                                name: locator.name,
                                testId: locator.testId,
                                class: locator.class,
                                isUnique: locator.isUnique,
                                isInteractive: locator.isInteractive,
                                description: locator.description
                            });
                            
                            const timeoutPromise = new Promise((_, reject) => {
                                setTimeout(() => reject(new Error('AI timeout')), 200);
                            });
                            
                            aiRecommendation = await Promise.race([aiPromise, timeoutPromise]);
                            
                        } catch (aiError) {
                            aiRecommendation = { strategy: 'FALLBACK', confidence: 0.5 };
                        }
                    }

                    let locatorType = 'css';
                    let locatorValue = '';
                    let description = locator.description || `Element ${index + 1}`;
                    let confidence = aiRecommendation.confidence || 0.5;

                    // Use AI recommendation or fallback to enhanced prioritization
                    if (aiRecommendation.strategy === 'TEST_ID' && locator.testId) {
                        locatorType = 'testId';
                        locatorValue = locator.testId;
                        description = locator.description || `Test ID: ${locator.testId}`;
                    } else if (aiRecommendation.strategy === 'ID' && locator.id && locator.isUnique) {
                        locatorType = 'id';
                        locatorValue = locator.id;
                        description = locator.description || `ID: ${locator.id}`;
                    } else if (aiRecommendation.strategy === 'NAME' && locator.name) {
                        locatorType = 'name';
                        locatorValue = locator.name;
                        description = locator.description || `Name: ${locator.name}`;
                    } else if (aiRecommendation.strategy === 'CLASS' && locator.class && locator.isInteractive) {
                        locatorType = 'css';
                        const firstClass = locator.class.split(' ')[0];
                        locatorValue = `.${firstClass}`;
                        description = locator.description || `Class: ${firstClass}`;
                    } else if (aiRecommendation.strategy === 'XPATH' && locator.xpath) {
                        locatorType = 'xpath';
                        locatorValue = locator.xpath;
                        description = locator.description || `XPath locator`;
                    } else {
                        // Enhanced prioritization fallback with XPath support
                        if (locator.testId) {
                            locatorType = 'testId';
                            locatorValue = locator.testId;
                            description = locator.description || `Test ID: ${locator.testId}`;
                        } else if (locator.id && locator.isUnique) {
                            locatorType = 'id';
                            locatorValue = locator.id;
                            description = locator.description || `ID: ${locator.id}`;
                        } else if (locator.name) {
                            locatorType = 'name';
                            locatorValue = locator.name;
                            description = locator.description || `Name: ${locator.name}`;
                        } else if (locator.xpath) {
                            locatorType = 'xpath';
                            locatorValue = locator.xpath;
                            description = locator.description || `XPath locator`;
                        } else if (locator.cssSelector && locator.cssSelector !== locator.tagName) {
                            locatorType = 'css';
                            locatorValue = locator.cssSelector;
                            description = locator.description || `CSS: ${locator.cssSelector}`;
                        } else if (locator.class && locator.isInteractive) {
                            locatorType = 'css';
                            const firstClass = locator.class.split(' ')[0];
                            locatorValue = `.${firstClass}`;
                            description = locator.description || `Class: ${firstClass}`;
                        } else if (locator.tagName && locator.isInteractive) {
                            locatorType = 'css';
                            locatorValue = locator.tagName;
                            description = locator.description || `Tag: ${locator.tagName}`;                        } else {
                            // Skip if no good locator strategy
                            continue;
                        }
                    }

                    // Create a more comprehensive unique key for global deduplication
                    // Include multiple identifiers to create a truly unique signature
                    const createUniqueKey = (locType, locValue, desc, element) => {
                        const keyParts = [locType, locValue, desc.replace(/\s+/g, ' ').trim()];
                        
                        // Add element attributes for better uniqueness
                        if (element && element.id) keyParts.push(`id:${element.id}`);
                        if (element && element.name) keyParts.push(`name:${element.name}`);
                        if (element && element.testId) keyParts.push(`testId:${element.testId}`);
                        if (element && element.tag) keyParts.push(`tag:${element.tag}`);
                        
                        return keyParts.join('||');
                    };
                      const uniqueKey = createUniqueKey(locatorType, locatorValue, description, {
                        id: locator.id,
                        name: locator.name,
                        testId: locator.testId,
                        tag: locator.tagName
                    });

                    if (!globalSeenLocators.has(uniqueKey)) {
                        globalSeenLocators.add(uniqueKey);
                          const locatorData = {
                            pageName: page.title || page.pageName || 'Unknown Page',
                            pageUrl: page.url || page.pageUrl || url,
                            description: description,
                            type: locatorType,
                            value: locatorValue,
                            xpath: locator.xpath || null,
                            cssSelector: locator.cssSelector || null,
                            isInteractive: locator.isInteractive || false,
                            isUnique: locator.isUnique || false,
                            depth: page.depth || 0,
                            confidence: confidence, // Add AI confidence score
                            aiStrategy: aiRecommendation.strategy, // Add AI strategy info
                            element: {
                                tag: locator.tagName,
                                id: locator.id,
                                name: locator.name,
                                class: locator.class,
                                testId: locator.testId,
                                type: locator.type,
                                placeholder: locator.placeholder,
                                role: locator.role,
                                ariaLabel: locator.ariaLabel
                            }                        };                        flattenedLocators.push(locatorData);
                        addedLocators++;
                        debugStats.added++;
                    } else {
                        debugStats.duplicates++;
                        // Silently skip duplicates to avoid log spam
                    }
                    
                    } catch (locatorError) {
                        console.error(`❌ Error processing locator ${processedLocators}:`, locatorError.message);
                        debugStats.aiErrors++;
                        continue; // Skip this locator and continue with next
                    }
                }
            } else {
                // Silently note pages without locators
            }
        }console.log(`✅ Processing completed: ${processedPages} pages, ${processedLocators} total locators processed`);
        console.log(`🎯 Found ${addedLocators} quality unique locators (${flattenedLocators.length} in array)`);

        // Add heartbeat to show we're still alive during sorting
        console.log(`🔄 Sorting locators by relevance...`);        // Sort by page depth and interactivity
        flattenedLocators.sort((a, b) => {
            if (a.depth !== b.depth) return a.depth - b.depth;
            if (a.isInteractive !== b.isInteractive) return b.isInteractive - a.isInteractive;
            return 0;
        });

        console.log(`🔄 Grouping locators by page...`);
        // Group locators by page for better frontend display
        const groupedByPage = flattenedLocators.reduce((acc, locator) => {
            const pageKey = locator.pageUrl;
            if (!acc[pageKey]) {
                acc[pageKey] = {
                    pageName: locator.pageName,
                    pageUrl: locator.pageUrl,
                    depth: locator.depth,
                    locators: []
                };
            }
            acc[pageKey].locators.push(locator);
            return acc;
        }, {});        const pageGroups = Object.values(groupedByPage);        console.log(`🚀 Preparing response with ${flattenedLocators.length} locators across ${pageGroups.length} page groups...`);
          console.log(`Processing complete. Found ${flattenedLocators.length} quality locators across ${results.length} pages.`);        // Final check before sending response
        console.log(`📤 About to send JSON response with ${flattenedLocators.length} locators...`);

        res.json({
            success: true,
            message: `Found ${flattenedLocators.length} quality locators across ${results.length} pages. POM Files generated and saved at ${outputDir}`,
            data: flattenedLocators, // Flat array for backward compatibility
            pageGroups: pageGroups, // Grouped by page for better display
            summary: {
                totalPages: results.length,
                totalLocators: flattenedLocators.length,
                interactiveElements: flattenedLocators.filter(l => l.isInteractive).length,
                uniqueElements: flattenedLocators.filter(l => l.isUnique).length,
                pagesWithLocators: pageGroups.length            },
            results, // Keep original format for debugging
        });
        
        console.log(`✅ JSON response sent successfully!`);
        
    } catch (error) {
        console.error('❌ Error generating locators:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Determine appropriate error response based on error type
        let statusCode = 500;
        let errorMessage = error.message;
        let suggestions = [];
        
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            statusCode = 408;
            errorMessage = 'Request timeout: The operation took too long to complete.';
            suggestions = [
                'Try using single-page mode for faster processing',
                'Check if the URL is accessible and loads quickly',
                'Some sites may have anti-bot protections'
            ];
        } else if (error.message.includes('ERR_NAME_NOT_RESOLVED') || error.message.includes('net::')) {
            statusCode = 400;
            errorMessage = 'Network error: Unable to access the specified URL.';
            suggestions = [
                'Check if the URL is correct and accessible',
                'Ensure you have internet connectivity',
                'Try a different URL'
            ];
        } else if (error.message.includes('Navigation failed') || error.message.includes('target closed')) {
            statusCode = 502;
            errorMessage = 'Page loading error: The page could not be loaded properly.';
            suggestions = [
                'The website may be temporarily unavailable',
                'Try again after a few minutes',
                'Check if the website requires authentication'
            ];
        } else if (error.message.includes('Protocol error') || error.message.includes('browser')) {
            statusCode = 503;
            errorMessage = 'Browser error: The automation browser encountered an issue.';
            suggestions = [
                'This is usually a temporary issue',
                'Try the request again',
                'Contact support if the problem persists'
            ];
        }
        
        res.status(statusCode).json({ 
            success: false, 
            error: errorMessage,
            originalError: error.message,
            suggestions: suggestions
        });
    }
});

// New API Endpoint: Enhanced locator generation with AI recommendations
app.post('/api/enhance-locators', async (req, res) => {
    const { locators } = req.body;
    
    try {
        console.log(`🤖 Enhancing ${locators.length} locators with AI recommendations`);
        
        const enhancedLocators = [];
        
        for (const locator of locators) {
            try {
                // Get AI recommendation for this locator
                const aiRecommendation = await predictBestLocatorStrategy({
                    id: locator.element?.id,
                    name: locator.element?.name,
                    testId: locator.element?.testId,
                    class: locator.element?.class,
                    isUnique: locator.isUnique,
                    isInteractive: locator.isInteractive,
                    description: locator.description
                });
                
                // Generate optimized locators based on AI recommendation
                const optimizedLocators = generateOptimizedLocators({
                    id: locator.element?.id,
                    name: locator.element?.name,
                    testId: locator.element?.testId,
                    class: locator.element?.class,
                    tagName: locator.element?.tag,
                    xpath: locator.xpath,
                    description: locator.description,
                    isUnique: locator.isUnique,
                    isInteractive: locator.isInteractive,
                    placeholder: locator.element?.placeholder,
                    type: locator.element?.type
                }, aiRecommendation);
                
                enhancedLocators.push({
                    original: locator,
                    aiRecommendation: aiRecommendation,
                    optimizedLocators: optimizedLocators,
                    bestLocator: optimizedLocators[0] || null
                });
                
            } catch (locatorError) {
                console.warn(`Failed to enhance locator: ${locatorError.message}`);
                // Include original locator without enhancement
                enhancedLocators.push({
                    original: locator,
                    aiRecommendation: { strategy: 'FALLBACK', confidence: 0.3 },
                    optimizedLocators: [],
                    bestLocator: null,
                    error: locatorError.message
                });
            }
        }
        
        res.json({
            success: true,
            message: `Enhanced ${enhancedLocators.length} locators with AI recommendations`,
            enhancedLocators: enhancedLocators
        });
        
    } catch (error) {
        console.error('Error enhancing locators with AI:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            message: 'Failed to enhance locators with AI recommendations'
        });
    }
});

// Add a simple test endpoint to verify site accessibility
app.post('/api/test-url', async (req, res) => {
    const { url } = req.body;
    
    try {
        console.log(`🧪 Testing URL accessibility: ${url}`);
        
        // First try a simple HTTP request
        const https = require('https');
        const http = require('http');
        const urlModule = require('url');
        
        const parsedUrl = urlModule.parse(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const testPromise = new Promise((resolve, reject) => {
            const request = client.get(url, (response) => {
                if (response.statusCode >= 200 && response.statusCode < 400) {
                    resolve({
                        accessible: true,
                        statusCode: response.statusCode,
                        headers: response.headers
                    });
                } else {
                    resolve({
                        accessible: false,
                        statusCode: response.statusCode,
                        error: `HTTP ${response.statusCode}`
                    });
                }
            });
            
            request.on('error', (error) => {
                resolve({
                    accessible: false,
                    error: error.message
                });
            });
            
            request.setTimeout(10000, () => {
                request.abort();
                resolve({
                    accessible: false,
                    error: 'Request timeout'
                });
            });
        });
        
        const result = await testPromise;
        
        res.json({
            success: true,
            url: url,
            ...result
        });
        
    } catch (error) {
        res.json({
            success: false,
            url: url,
            accessible: false,
            error: error.message
        });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// app.listen(PORT, HOST, () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
// });