// Simple fallback crawler with minimal dependencies for when protocol errors persist
const puppeteer = require('puppeteer');

class FallbackCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }
    
    async initBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) {
                // Ignore close errors
            }
        }
        
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--single-process',
                '--no-zygote'
            ],
            timeout: 30000
        });
        
        this.page = await this.browser.newPage();
        await this.page.setDefaultTimeout(15000);
        await this.page.setDefaultNavigationTimeout(15000);
    }
    
    async extractBasicLocators(url) {
        try {
            if (!this.browser || !this.page) {
                await this.initBrowser();
            }
            
            console.log(`Extracting locators from: ${url}`);
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const locators = await this.page.evaluate(() => {
                const elements = document.querySelectorAll('input, button, select, textarea, a[href], [data-testid], [id]');
                return Array.from(elements).slice(0, 20).map(el => {
                    const getXPath = (element) => {
                        if (element.id) return `//*[@id='${element.id}']`;
                        const idx = Array.from(element.parentNode.children).indexOf(element) + 1;
                        return `//${element.tagName.toLowerCase()}[${idx}]`;
                    };
                    
                    return {
                        tagName: el.tagName.toLowerCase(),
                        id: el.id || null,
                        name: el.name || null,
                        className: el.className || null,
                        xpath: getXPath(el),
                        cssSelector: el.id ? `#${el.id}` : el.tagName.toLowerCase(),
                        description: el.textContent ? el.textContent.trim().substring(0, 50) : `${el.tagName} element`,
                        isInteractive: ['input', 'button', 'select', 'textarea', 'a'].includes(el.tagName.toLowerCase())
                    };
                });
            });
            
            return locators;
            
        } catch (error) {
            console.error('Fallback extraction failed:', error.message);
            
            // Try to restart browser once
            try {
                console.log('Attempting browser restart...');
                await this.initBrowser();
                await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                
                const locators = await this.page.evaluate(() => {
                    const elements = document.querySelectorAll('input, button, select, a[href], [id]');
                    return Array.from(elements).slice(0, 10).map(el => ({
                        tagName: el.tagName.toLowerCase(),
                        id: el.id || null,
                        xpath: el.id ? `//*[@id='${el.id}']` : `//${el.tagName.toLowerCase()}`,
                        cssSelector: el.id ? `#${el.id}` : el.tagName.toLowerCase(),
                        description: `${el.tagName} element`
                    }));
                });
                
                return locators;
                
            } catch (retryError) {
                console.error('Fallback retry failed:', retryError.message);
                return [];
            }
        }
    }
    
    async close() {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) {
                // Ignore close errors
            }
        }
    }
}

async function testFallbackCrawler() {
    console.log('Testing fallback crawler...');
    
    const crawler = new FallbackCrawler();
    
    try {
        const locators = await crawler.extractBasicLocators('https://httpbin.org/html');
        
        console.log(`Found ${locators.length} locators:`);
        locators.forEach((loc, i) => {
            console.log(`${i + 1}. ${loc.description}`);
            console.log(`   Tag: ${loc.tagName}, ID: ${loc.id || 'none'}`);
            console.log(`   XPath: ${loc.xpath}`);
            console.log(`   CSS: ${loc.cssSelector}`);
            console.log('');
        });
        
        // Generate simple POM
        const pomCode = generateFallbackPOM(locators);
        console.log('Generated POM:');
        console.log('='.repeat(50));
        console.log(pomCode);
        
    } catch (error) {
        console.error('Fallback test failed:', error.message);
    } finally {
        await crawler.close();
    }
}

function generateFallbackPOM(locators) {
    if (!locators || locators.length === 0) {
        return `
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.WebDriver;

public class FallbackPageObjects {
    public FallbackPageObjects(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    
    // No locators found
}`;
    }
    
    const elements = locators.map((loc, i) => {
        const elementName = loc.id ? loc.id.replace(/[^a-zA-Z0-9]/g, '') : `element${i + 1}`;
        const locatorStrategy = loc.id ? 'id' : 'xpath';
        const locatorValue = loc.id ? loc.id : loc.xpath;
        
        return `
    // ${loc.description}
    // Alternative: @FindBy(xpath = "${loc.xpath}")
    @FindBy(${locatorStrategy} = "${locatorValue}")
    private WebElement ${elementName}Element;`;
    }).join('\n');
    
    return `
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.WebDriver;

public class FallbackPageObjects {
    public FallbackPageObjects(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    ${elements}
}`;
}

// Export for use as fallback
module.exports = { FallbackCrawler, testFallbackCrawler };

// Run test if called directly
if (require.main === module) {
    testFallbackCrawler();
}
