// Smart Locator Selection Engine (Rule-based AI alternative)
// This provides intelligent locator recommendations without TensorFlow dependency

console.log('� Smart Locator Engine: Initializing intelligent locator selection...');

// Scoring weights for different locator strategies
const STRATEGY_WEIGHTS = {
    TEST_ID: 100,     // Best for automation
    ID: 90,           // Unique identifiers
    NAME: 80,         // Form elements
    CLASS: 60,        // CSS classes (if unique)
    XPATH: 40,        // Fallback option
    TAG: 20           // Last resort
};

// Quality indicators
const QUALITY_INDICATORS = {
    unique: 30,
    interactive: 20,
    hasText: 15,
    hasRole: 10,
    hasType: 5
};

const predictBestLocatorStrategy = async (locatorData) => {
    // Removed verbose logging to improve performance with many locators
    
    try {
        const strategies = [];
        
        // Evaluate TEST_ID strategy
        if (locatorData.testId) {
            const score = STRATEGY_WEIGHTS.TEST_ID + 
                         (locatorData.isUnique ? QUALITY_INDICATORS.unique : 0) +
                         (locatorData.isInteractive ? QUALITY_INDICATORS.interactive : 0);
            strategies.push({ strategy: 'TEST_ID', score, confidence: Math.min(score / 150, 1.0) });
        }
        
        // Evaluate ID strategy
        if (locatorData.id) {
            const score = STRATEGY_WEIGHTS.ID + 
                         (locatorData.isUnique ? QUALITY_INDICATORS.unique : 0) +
                         (locatorData.isInteractive ? QUALITY_INDICATORS.interactive : 0);
            strategies.push({ strategy: 'ID', score, confidence: Math.min(score / 140, 1.0) });
        }
        
        // Evaluate NAME strategy
        if (locatorData.name) {
            const score = STRATEGY_WEIGHTS.NAME + 
                         (locatorData.isUnique ? QUALITY_INDICATORS.unique : 0) +
                         (locatorData.isInteractive ? QUALITY_INDICATORS.interactive : 0);
            strategies.push({ strategy: 'NAME', score, confidence: Math.min(score / 130, 1.0) });
        }
        
        // Evaluate CLASS strategy
        if (locatorData.class) {
            let score = STRATEGY_WEIGHTS.CLASS;
            if (locatorData.isUnique) score += QUALITY_INDICATORS.unique;
            if (locatorData.isInteractive) score += QUALITY_INDICATORS.interactive;
            
            // Bonus for automation-friendly class names
            const classNames = locatorData.class.toLowerCase();
            if (classNames.includes('btn') || classNames.includes('button') || 
                classNames.includes('form') || classNames.includes('input') ||
                classNames.includes('control')) {
                score += 10;
            }
            
            strategies.push({ strategy: 'CLASS', score, confidence: Math.min(score / 100, 1.0) });
        }
        
        // Always provide XPATH as fallback
        let xpathScore = STRATEGY_WEIGHTS.XPATH;
        if (locatorData.description && locatorData.description.length > 0) {
            xpathScore += QUALITY_INDICATORS.hasText;
        }
        if (locatorData.isInteractive) {
            xpathScore += QUALITY_INDICATORS.interactive;
        }
        strategies.push({ strategy: 'XPATH', score: xpathScore, confidence: Math.min(xpathScore / 80, 1.0) });
        
        // Sort strategies by score (highest first)
        strategies.sort((a, b) => b.score - a.score);
          const bestStrategy = strategies[0];
        
        // Only log for high-confidence strategies or periodically to reduce spam
        if (bestStrategy.confidence >= 0.9 || Math.random() < 0.01) {
            console.log(`🤖 Smart Engine: Best strategy: ${bestStrategy.strategy} (confidence: ${bestStrategy.confidence.toFixed(3)})`);
        }
        
        return {
            strategy: bestStrategy.strategy,
            confidence: bestStrategy.confidence,
            probabilities: strategies.map(s => ({
                strategy: s.strategy,
                confidence: s.confidence
            }))
        };
        
    } catch (error) {
        console.error('🤖 Smart Engine: Analysis error:', error.message);
        // Ultimate fallback
        return predictBestLocatorFallback(locatorData);
    }
};

const predictBestLocatorFallback = (locatorData) => {
    console.log('🔄 Smart Engine: Using emergency fallback selection');
    
    // Rule-based fallback when main engine fails
    if (locatorData.testId) {
        console.log('🔄 Fallback: Selected TEST_ID strategy');
        return { strategy: 'TEST_ID', confidence: 0.95 };
    }
    if (locatorData.id && locatorData.isUnique) {
        console.log('🔄 Fallback: Selected ID strategy');
        return { strategy: 'ID', confidence: 0.9 };
    }
    if (locatorData.name && locatorData.isUnique) {
        console.log('🔄 Fallback: Selected NAME strategy');
        return { strategy: 'NAME', confidence: 0.85 };
    }
    if (locatorData.class && locatorData.isUnique) {
        console.log('🔄 Fallback: Selected CLASS strategy');
        return { strategy: 'CLASS', confidence: 0.7 };
    }
    
    console.log('🔄 Fallback: Selected XPATH strategy (default)');
    return { strategy: 'XPATH', confidence: 0.6 };
};

const generateOptimizedLocators = (locatorData, aiRecommendation) => {
    const locators = [];
    
    // Generate relative/smart locators based on AI recommendation
    switch (aiRecommendation.strategy) {
        case 'ID':
            if (locatorData.id) {
                locators.push({
                    type: 'ID',
                    value: `#${locatorData.id}`,
                    selenium: `By.id("${locatorData.id}")`,
                    playwright: `page.locator('#${locatorData.id}')`,
                    cypress: `cy.get('#${locatorData.id}')`,
                    priority: 1,
                    confidence: aiRecommendation.confidence
                });
            }
            break;
            
        case 'NAME':
            if (locatorData.name) {
                locators.push({
                    type: 'NAME',
                    value: `[name="${locatorData.name}"]`,
                    selenium: `By.name("${locatorData.name}")`,
                    playwright: `page.locator('[name="${locatorData.name}"]')`,
                    cypress: `cy.get('[name="${locatorData.name}"]')`,
                    priority: 2,
                    confidence: aiRecommendation.confidence
                });
            }
            break;
            
        case 'TEST_ID':
            if (locatorData.testId) {
                locators.push({
                    type: 'TEST_ID',
                    value: `[data-testid="${locatorData.testId}"]`,
                    selenium: `By.cssSelector("[data-testid='${locatorData.testId}']")`,
                    playwright: `page.getByTestId('${locatorData.testId}')`,
                    cypress: `cy.get('[data-testid="${locatorData.testId}"]')`,
                    priority: 1,
                    confidence: aiRecommendation.confidence
                });
            }
            break;
            
        case 'CLASS':
            if (locatorData.class) {
                const classes = locatorData.class.split(' ').filter(c => c.trim().length > 0);
                const shortestClass = classes.reduce((a, b) => a.length <= b.length ? a : b);
                locators.push({
                    type: 'CLASS',
                    value: `.${shortestClass}`,
                    selenium: `By.className("${shortestClass}")`,
                    playwright: `page.locator('.${shortestClass}')`,
                    cypress: `cy.get('.${shortestClass}')`,
                    priority: 3,
                    confidence: aiRecommendation.confidence
                });
            }
            break;
            
        case 'XPATH':
        default:
            // Generate smart relative XPath
            locators.push(generateSmartXPath(locatorData, aiRecommendation.confidence));
            break;
    }
    
    // Always provide alternative locators
    addAlternativeLocators(locators, locatorData);
    
    return locators.sort((a, b) => b.priority - a.priority || b.confidence - a.confidence);
};

const generateSmartXPath = (locatorData, confidence) => {
    console.log('🛠️ Generating smart XPath for:', locatorData.tagName);
    
    let xpath = '';
    
    try {
        // Try to create more readable and maintainable XPath
        if (locatorData.description && locatorData.description.length > 0) {
            const text = locatorData.description.substring(0, 30).trim();
            if (text) {
                xpath = `//${locatorData.tagName}[contains(text(), '${text.replace(/'/g, "\\'")}')]`;
                console.log('🛠️ Generated text-based XPath:', xpath);
            }
        }
        
        if (!xpath && locatorData.placeholder) {
            xpath = `//${locatorData.tagName}[@placeholder='${locatorData.placeholder.replace(/'/g, "\\'")}']`;
            console.log('🛠️ Generated placeholder-based XPath:', xpath);
        }
        
        if (!xpath && locatorData.type) {
            xpath = `//${locatorData.tagName}[@type='${locatorData.type}']`;
            console.log('🛠️ Generated type-based XPath:', xpath);
        }
        
        if (!xpath) {
            xpath = locatorData.xpath || `//${locatorData.tagName}`;
            console.log('🛠️ Using fallback XPath:', xpath);
        }
        
    } catch (error) {
        console.error('🛠️ Error generating smart XPath:', error.message);
        xpath = locatorData.xpath || `//${locatorData.tagName || '*'}`;
    }
    
    return {
        type: 'XPATH',
        value: xpath,
        selenium: `By.xpath("${xpath}")`,
        playwright: `page.locator('xpath=${xpath}')`,
        cypress: `cy.xpath('${xpath}')`,
        priority: 0,
        confidence: confidence || 0.5
    };
};

const addAlternativeLocators = (locators, locatorData) => {
    const existingTypes = new Set(locators.map(l => l.type));
    
    // Add test ID if available and not already added
    if (locatorData.testId && !existingTypes.has('TEST_ID')) {
        locators.push({
            type: 'TEST_ID',
            value: `[data-testid="${locatorData.testId}"]`,
            selenium: `By.cssSelector("[data-testid='${locatorData.testId}']")`,
            playwright: `page.getByTestId('${locatorData.testId}')`,
            cypress: `cy.get('[data-testid="${locatorData.testId}"]')`,
            priority: 1,
            confidence: 0.9
        });
    }
    
    // Add ID if available and not already added
    if (locatorData.id && !existingTypes.has('ID')) {
        locators.push({
            type: 'ID',
            value: `#${locatorData.id}`,
            selenium: `By.id("${locatorData.id}")`,
            playwright: `page.locator('#${locatorData.id}')`,
            cypress: `cy.get('#${locatorData.id}')`,
            priority: 1,
            confidence: 0.85
        });
    }
};

module.exports = { 
    predictBestLocatorStrategy, 
    generateOptimizedLocators,
    predictBestLocatorFallback,
    generateSmartXPath
};