const generatePOMFile = (locators) => {
    if (!locators || !Array.isArray(locators)) {
        return `
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.WebDriver;

public class PageObjects {
    
    public PageObjects(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    
    // No locators found
}
        `;
    }

    // Enhanced filtering for quality locators with better prioritization
    const qualityLocators = locators
        .filter(locator => {
            // Skip if no meaningful identifiers
            if (!locator) return false;
            
            // High priority: elements with unique IDs, test IDs, or names
            if ((locator.id && locator.isUnique) || locator.testId || locator.name) {
                return true;
            }
            
            // Medium priority: interactive elements with good selectors
            if (locator.isInteractive && (locator.id || locator.cssSelector || locator.xpath)) {
                return true;
            }
            
            // Lower priority: elements with meaningful classes or roles
            if (locator.class && (
                locator.class.includes('btn') || locator.class.includes('button') ||
                locator.class.includes('input') || locator.class.includes('form') ||
                locator.class.includes('link') || locator.class.includes('menu') ||
                locator.class.includes('nav') || locator.class.includes('control')
            )) {
                return true;
            }
            
            return false;
        })
        // Sort by quality: test IDs first, then unique IDs, then interactive elements
        .sort((a, b) => {
            if (a.testId && !b.testId) return -1;
            if (!a.testId && b.testId) return 1;
            if (a.id && a.isUnique && !(b.id && b.isUnique)) return -1;
            if (!(a.id && a.isUnique) && b.id && b.isUnique) return 1;
            if (a.isInteractive && !b.isInteractive) return -1;
            if (!a.isInteractive && b.isInteractive) return 1;
            return 0;
        })
        .slice(0, 30); // Limit to top 30 quality locators

    if (qualityLocators.length === 0) {
        return `
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.WebDriver;

public class PageObjects {
    
    public PageObjects(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    
    // No quality locators found
}
        `;
    }

    const pomCode = qualityLocators
        .map((locator, index) => {
            let findByAnnotations = [];
            let elementName = `element${index + 1}`;
            let comments = [];

            // Generate meaningful element name
            if (locator.testId) {
                elementName = locator.testId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            } else if (locator.id && locator.isUnique) {
                elementName = locator.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            } else if (locator.name) {
                elementName = locator.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            } else if (locator.description) {
                const descWords = locator.description
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .split(' ')
                    .filter(word => word.length > 2)
                    .slice(0, 2)
                    .map(word => word.toLowerCase())
                    .join('');
                
                if (descWords.length > 0) {
                    elementName = descWords;
                }
            }

            // Ensure element name is valid
            if (!elementName || elementName.length === 0) {
                elementName = `element${index + 1}`;
            }
            if (!elementName.match(/^[a-zA-Z]/)) {
                elementName = 'element' + elementName.charAt(0).toUpperCase() + elementName.slice(1);
            }

            // Add description comment
            if (locator.description) {
                comments.push(`// ${locator.description}`);
            }

            // Determine best locator strategy with multiple options
            const strategies = [];

            // Priority 1: Test ID (most reliable)
            if (locator.testId) {
                strategies.push({
                    type: 'Primary (Test ID)',
                    annotation: `@FindBy(css = "[data-testid='${locator.testId}']")`,
                    xpath: `@FindBy(xpath = "//*[@data-testid='${locator.testId}']")`
                });
            }

            // Priority 2: Unique ID
            if (locator.id && locator.isUnique) {
                strategies.push({
                    type: 'Primary (ID)',
                    annotation: `@FindBy(id = "${locator.id}")`,
                    xpath: `@FindBy(xpath = "//*[@id='${locator.id}']")`
                });
            }

            // Priority 3: Name attribute
            if (locator.name) {
                strategies.push({
                    type: 'Secondary (Name)',
                    annotation: `@FindBy(name = "${locator.name}")`,
                    xpath: `@FindBy(xpath = "//*[@name='${locator.name}']")`
                });
            }

            // Priority 4: CSS Selector
            if (locator.cssSelector && locator.cssSelector !== locator.tagName) {
                strategies.push({
                    type: 'Tertiary (CSS)',
                    annotation: `@FindBy(css = "${locator.cssSelector}")`,
                    xpath: null
                });
            }

            // Priority 5: XPath
            if (locator.xpath) {
                strategies.push({
                    type: 'Alternative (XPath)',
                    annotation: `@FindBy(xpath = "${locator.xpath}")`,
                    xpath: null
                });
            }

            // Priority 6: Class name (if meaningful)
            if (locator.class && !locator.class.includes(' ') && 
                (locator.class.includes('btn') || locator.class.includes('input') || 
                 locator.class.includes('form') || locator.class.includes('control'))) {
                strategies.push({
                    type: 'Fallback (Class)',
                    annotation: `@FindBy(className = "${locator.class}")`,
                    xpath: `@FindBy(xpath = "//*[@class='${locator.class}']")`
                });
            }

            // Use the best strategy available
            const primaryStrategy = strategies[0];
            const alternativeStrategies = strategies.slice(1, 3); // Provide up to 2 alternatives

            if (!primaryStrategy) {
                return null; // Skip if no good strategy found
            }

            // Build the element definition
            let elementDef = '';
            
            // Add comments
            if (comments.length > 0) {
                elementDef += '\n    ' + comments.join('\n    ');
            }
            
            // Add element info comment
            const elementInfo = [];
            if (locator.tagName) elementInfo.push(`Tag: ${locator.tagName}`);
            if (locator.type) elementInfo.push(`Type: ${locator.type}`);
            if (locator.isInteractive) elementInfo.push('Interactive: true');
            
            if (elementInfo.length > 0) {
                elementDef += `\n    // ${elementInfo.join(', ')}`;
            }

            // Add primary locator
            elementDef += `\n    // ${primaryStrategy.type}`;
            elementDef += `\n    ${primaryStrategy.annotation}`;
            elementDef += `\n    private WebElement ${elementName}Element;`;

            // Add alternative locators as comments for reference
            if (alternativeStrategies.length > 0) {
                elementDef += '\n    // Alternative locators:';
                alternativeStrategies.forEach(alt => {
                    elementDef += `\n    // ${alt.annotation}`;
                    if (alt.xpath) {
                        elementDef += `\n    // ${alt.xpath}`;
                    }
                });
            }

            return elementDef;
        })
        .filter(def => def !== null) // Remove null entries
        .join('\n\n');

    return `
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.WebDriver;

public class PageObjects {
    
    public PageObjects(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    ${pomCode}
    
    // Helper methods can be added below
    
}
    `;
};

module.exports = { generatePOMFile };