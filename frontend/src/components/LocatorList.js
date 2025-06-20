import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Grid, 
    Chip, 
    Button, 
    Snackbar, 
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Divider,
    Switch,
    FormControlLabel,
    Menu,
    MenuItem,
    ButtonGroup
} from '@mui/material';
import { 
    ContentCopy as CopyIcon, 
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Clear as ClearIcon,
    GetApp as DownloadIcon,
    Code as CodeIcon
} from '@mui/icons-material';

const LocatorList = ({ locators, pageGroups, summary }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showPageView, setShowPageView] = useState(true);
    const [lastDataUpdate, setLastDataUpdate] = useState(null);
    const [bulkCopyMenuAnchor, setBulkCopyMenuAnchor] = useState(null);

    // Handle both old format (flat array) and new format (page groups)
    const displayData = pageGroups && pageGroups.length > 0 ? pageGroups : null;
    const flatLocators = locators || [];

    // Reset search when new data is loaded (but preserve during filtering)
    useEffect(() => {
        const currentDataSignature = JSON.stringify({ 
            pageGroupsLength: pageGroups?.length || 0, 
            locatorsLength: locators?.length || 0 
        });
        
        if (lastDataUpdate !== currentDataSignature) {
            setLastDataUpdate(currentDataSignature);
            // Don't reset search if we already have data and it's just being filtered
            if (!lastDataUpdate) {
                setSearchTerm('');
                setFilterType('all');
            }
        }
    }, [locators, pageGroups, lastDataUpdate]);

    // Enhanced deduplication for flat array (backward compatibility)
    const deduplicatedLocators = useMemo(() => {
        const deduplicateLocators = (locatorArray) => {
            if (!Array.isArray(locatorArray)) return [];
            const seen = new Set();
            return locatorArray.filter(locator => {
                const signature = [
                    locator.type,
                    locator.value,
                    locator.description?.replace(/\s+/g, ' ').trim(),
                    locator.pageUrl || '',
                    locator.element?.id || '',
                    locator.element?.name || '',
                    locator.element?.testId || ''
                ].join('||');
                
                if (seen.has(signature)) {
                    return false;
                }
                seen.add(signature);
                return true;
            });
        };
        return deduplicateLocators(flatLocators);
    }, [flatLocators]);

    // Enhanced filtering logic - memoized to prevent unnecessary recalculations
    const filterLocators = useMemo(() => {
        return (locatorArray, search, type) => {
            if (!Array.isArray(locatorArray)) return [];
            return locatorArray.filter(locator => {
                // Filter by search term - more robust search
                const searchLower = (search || '').toLowerCase().trim();
                const matchesSearch = !searchLower || 
                    (locator.description && locator.description.toLowerCase().includes(searchLower)) ||
                    (locator.value && locator.value.toLowerCase().includes(searchLower)) ||
                    (locator.type && locator.type.toLowerCase().includes(searchLower)) ||
                    (locator.element && locator.element.tag && locator.element.tag.toLowerCase().includes(searchLower)) ||
                    (locator.element && locator.element.id && locator.element.id.toLowerCase().includes(searchLower)) ||
                    (locator.element && locator.element.name && locator.element.name.toLowerCase().includes(searchLower)) ||
                    (locator.element && locator.element.class && locator.element.class.toLowerCase().includes(searchLower)) ||
                    (locator.pageUrl && locator.pageUrl.toLowerCase().includes(searchLower)) ||
                    (locator.pageName && locator.pageName.toLowerCase().includes(searchLower));

                // Filter by type
                const matchesType = type === 'all' || locator.type === type;

                // Only show interactive or high-quality locators
                const isQualityLocator = locator.isInteractive || 
                                       locator.type === 'testId' || 
                                       locator.type === 'id' || 
                                       locator.type === 'name' ||
                                       (locator.element && locator.element.testId);

                return matchesSearch && matchesType && isQualityLocator;
            });
        };
    }, []);

    // Use page groups if available, otherwise create groups from flat data - memoized
    const processedPageGroups = useMemo(() => {
        let result;
        if (displayData && displayData.length > 0) {
            // Filter existing page groups
            result = displayData.map(page => ({
                ...page,
                locators: filterLocators(page.locators || [], searchTerm, filterType)
            })).filter(page => page.locators.length > 0);
        } else {
            // Create page groups from flat data
            const groupedFromFlat = deduplicatedLocators.reduce((acc, locator) => {
                const pageName = locator.pageName || 'Unknown Page';
                const pageUrl = locator.pageUrl || '';
                const pageKey = `${pageName}|${pageUrl}`;
                
                if (!acc[pageKey]) {
                    acc[pageKey] = {
                        pageName: pageName,
                        pageUrl: pageUrl,
                        depth: locator.depth || 0,
                        locators: []
                    };
                }
                acc[pageKey].locators.push(locator);
                return acc;
            }, {});

            result = Object.values(groupedFromFlat).map(page => ({
                ...page,
                locators: filterLocators(page.locators || [], searchTerm, filterType)
            })).filter(page => page.locators.length > 0);
        }
        return result;
    }, [displayData, deduplicatedLocators, searchTerm, filterType, filterLocators]);

    // Get derived values using useMemo to prevent recalculation
    const { allLocators, locatorTypes, totalFilteredLocators, totalLocators } = useMemo(() => {
        const allLocs = processedPageGroups.flatMap(page => page.locators || []);
        const types = [...new Set(allLocs.map(l => l.type))];
        const totalFiltered = allLocs.length;
        const totalOrig = deduplicatedLocators.length;
        
        return {
            allLocators: allLocs,
            locatorTypes: types,
            totalFilteredLocators: totalFiltered,
            totalLocators: totalOrig
        };
    }, [processedPageGroups, deduplicatedLocators]);    // Clear search function
    const clearSearch = () => {
        setSearchTerm('');
        setFilterType('all');
    };

    // Handle undefined, null, or empty data - MOVED AFTER ALL HOOKS
    if ((!displayData || displayData.length === 0) && (!flatLocators || flatLocators.length === 0)) {
        return (
            <Box sx={{ mt: 3, textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.secondary">
                    🔍 No locators generated yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Enter a URL above to start crawling and generating automation-ready locators
                </Typography>
            </Box>
        );
    }

    // Early return if no matching locators after filtering - MOVED AFTER ALL HOOKS
    if (processedPageGroups.length === 0) {
        const hasOriginalData = (displayData && displayData.length > 0) || deduplicatedLocators.length > 0;
        return (
            <Box sx={{ mt: 3, textAlign: 'center', p: 3 }}>
                <Typography variant="h6" color="text.secondary">
                    {hasOriginalData ? '🔍 No locators match your search criteria' : '🔍 No interactive locators found'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {hasOriginalData 
                        ? 'Try adjusting your search term or filter options, or clear the search to see all results.' 
                        : 'Try adjusting your search or filter options. Only interactive elements and quality locators are shown.'
                    }
                </Typography>
                {hasOriginalData && (searchTerm || filterType !== 'all') && (
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                        }}
                        sx={{ mt: 2 }}
                        startIcon={<ClearIcon />}
                    >
                        Clear Search & Filters
                    </Button>
                )}            </Box>
        );
    }

    const copyToClipboard = (text, description) => {
        navigator.clipboard.writeText(text).then(() => {
            setSnackbarMessage(`Copied: ${description}`);
            setSnackbarOpen(true);
        }).catch(() => {
            setSnackbarMessage('Failed to copy to clipboard');
            setSnackbarOpen(true);
        });
    };

    const generateSeleniumCode = (locator) => {
        switch (locator.type) {
            case 'id':
                return `driver.find_element(By.ID, "${locator.value}")`;
            case 'name':
                return `driver.find_element(By.NAME, "${locator.value}")`;
            case 'className':
                if (locator.value.includes(' ')) {
                    return `driver.find_element(By.CSS_SELECTOR, ".${locator.value.split(' ').join('.')}")`;
                }
                return `driver.find_element(By.CLASS_NAME, "${locator.value}")`;
            case 'css':
                return `driver.find_element(By.CSS_SELECTOR, "${locator.value}")`;
            case 'xpath':
                return `driver.find_element(By.XPATH, "${locator.value}")`;            case 'tagName':
                return `driver.find_element(By.TAG_NAME, "${locator.value}")`;
            case 'testId':
                return `driver.find_element(By.CSS_SELECTOR, "[data-testid='${locator.value}']")`;
            default:
                return `driver.find_element(By.CSS_SELECTOR, "${locator.value}")`;
        }
    };

    const generateSeleniumJavaCode = (locator) => {
        switch (locator.type) {
            case 'id':
                return `driver.findElement(By.id("${locator.value}"))`;
            case 'name':
                return `driver.findElement(By.name("${locator.value}"))`;
            case 'className':
                if (locator.value.includes(' ')) {
                    return `driver.findElement(By.cssSelector(".${locator.value.split(' ').join('.')}"))`;
                }
                return `driver.findElement(By.className("${locator.value}"))`;
            case 'css':
                return `driver.findElement(By.cssSelector("${locator.value}"))`;
            case 'xpath':
                return `driver.findElement(By.xpath("${locator.value}"))`;
            case 'tagName':
                return `driver.findElement(By.tagName("${locator.value}"))`;
            case 'testId':
                return `driver.findElement(By.cssSelector("[data-testid='${locator.value}']"))`;
            default:
                return `driver.findElement(By.cssSelector("${locator.value}"))`;
        }
    };

    const generatePlaywrightCode = (locator) => {
        switch (locator.type) {
            case 'id':
                return `page.locator('#${locator.value}')`;
            case 'name':
                return `page.locator('[name="${locator.value}"]')`;
            case 'className':
                if (locator.value.includes(' ')) {
                    return `page.locator('.${locator.value.split(' ').join('.')}')`;
                }
                return `page.locator('.${locator.value}')`;
            case 'css':
                return `page.locator('${locator.value}')`;
            case 'xpath':
                return `page.locator('xpath=${locator.value}')`;
            case 'tagName':
                return `page.locator('${locator.value}')`;
            case 'testId':
                return `page.locator('[data-testid="${locator.value}"]')`;
            default:
                return `page.locator('${locator.value}')`;
        }
    };

    const generateCypressCode = (locator) => {
        switch (locator.type) {
            case 'id':
                return `cy.get('#${locator.value}')`;
            case 'name':
                return `cy.get('[name="${locator.value}"]')`;
            case 'className':
                if (locator.value.includes(' ')) {
                    return `cy.get('.${locator.value.split(' ').join('.')}')`;
                }
                return `cy.get('.${locator.value}')`;
            case 'css':
                return `cy.get('${locator.value}')`;
            case 'xpath':
                return `cy.xpath('${locator.value}')`;
            case 'tagName':
                return `cy.get('${locator.value}')`;
            case 'testId':
                return `cy.get('[data-testid="${locator.value}"]')`;
            default:
                return `cy.get('${locator.value}')`;
        }
    };

    // POM Generation Functions
    const generatePOMClassName = () => {
        const url = processedPageGroups[0]?.pageUrl || 'WebPage';
        const domain = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '');
        return domain.charAt(0).toUpperCase() + domain.slice(1) + 'Page';
    };

    const generateSeleniumPOMJava = () => {
        const className = generatePOMClassName();
        let pom = `package pages;\n\n`;
        pom += `import org.openqa.selenium.WebDriver;\n`;
        pom += `import org.openqa.selenium.WebElement;\n`;
        pom += `import org.openqa.selenium.support.FindBy;\n`;
        pom += `import org.openqa.selenium.support.PageFactory;\n\n`;
        pom += `public class ${className} {\n`;
        pom += `    private WebDriver driver;\n\n`;
        pom += `    public ${className}(WebDriver driver) {\n`;
        pom += `        this.driver = driver;\n`;
        pom += `        PageFactory.initElements(driver, this);\n`;
        pom += `    }\n\n`;
        
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const findByAnnotation = generateJavaFindBy(locator);
            pom += `    ${findByAnnotation}\n`;
            pom += `    private WebElement ${elementName};\n\n`;
        });

        pom += `    // Action methods\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const methodName = elementName.charAt(0).toUpperCase() + elementName.slice(1);
            if (locator.element?.tag === 'input' || locator.element?.tag === 'textarea') {
                pom += `    public void enter${methodName}(String text) {\n`;
                pom += `        ${elementName}.clear();\n`;
                pom += `        ${elementName}.sendKeys(text);\n`;
                pom += `    }\n\n`;
            } else {
                pom += `    public void click${methodName}() {\n`;
                pom += `        ${elementName}.click();\n`;
                pom += `    }\n\n`;
            }
        });

        pom += `}`;
        return pom;
    };

    const generateJavaFindBy = (locator) => {
        switch (locator.type) {
            case 'id':
                return `@FindBy(id = "${locator.value}")`;
            case 'name':
                return `@FindBy(name = "${locator.value}")`;
            case 'className':
                return `@FindBy(className = "${locator.value}")`;
            case 'css':
                return `@FindBy(css = "${locator.value}")`;
            case 'xpath':
                return `@FindBy(xpath = "${locator.value}")`;
            case 'testId':
                return `@FindBy(css = "[data-testid='${locator.value}']")`;
            default:
                return `@FindBy(css = "${locator.value}")`;
        }
    };

    const generateSeleniumPOMPython = () => {
        const className = generatePOMClassName();
        let pom = `from selenium.webdriver.common.by import By\n`;
        pom += `from selenium.webdriver.support.ui import WebDriverWait\n`;
        pom += `from selenium.webdriver.support import expected_conditions as EC\n\n`;
        pom += `class ${className}:\n`;
        pom += `    def __init__(self, driver):\n`;
        pom += `        self.driver = driver\n`;
        pom += `        self.wait = WebDriverWait(driver, 10)\n\n`;
        
        pom += `    # Locators\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const pythonLocator = generatePythonLocator(locator);
            pom += `    ${elementName.toUpperCase()}_LOCATOR = ${pythonLocator}\n`;
        });

        pom += `\n    # Action methods\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const methodName = elementName.toLowerCase();
            if (locator.element?.tag === 'input' || locator.element?.tag === 'textarea') {
                pom += `    def enter_${methodName}(self, text):\n`;
                pom += `        element = self.wait.until(EC.element_to_be_clickable(self.${elementName.toUpperCase()}_LOCATOR))\n`;
                pom += `        element.clear()\n`;
                pom += `        element.send_keys(text)\n\n`;
            } else {
                pom += `    def click_${methodName}(self):\n`;
                pom += `        element = self.wait.until(EC.element_to_be_clickable(self.${elementName.toUpperCase()}_LOCATOR))\n`;
                pom += `        element.click()\n\n`;
            }
        });

        return pom;
    };

    const generatePythonLocator = (locator) => {
        switch (locator.type) {
            case 'id':
                return `(By.ID, "${locator.value}")`;
            case 'name':
                return `(By.NAME, "${locator.value}")`;
            case 'className':
                return `(By.CLASS_NAME, "${locator.value}")`;
            case 'css':
                return `(By.CSS_SELECTOR, "${locator.value}")`;
            case 'xpath':
                return `(By.XPATH, "${locator.value}")`;
            case 'testId':
                return `(By.CSS_SELECTOR, "[data-testid='${locator.value}']")`;
            default:
                return `(By.CSS_SELECTOR, "${locator.value}")`;
        }
    };

    const generatePlaywrightPOM = () => {
        const className = generatePOMClassName();
        let pom = `import { Page, Locator } from '@playwright/test';\n\n`;
        pom += `export class ${className} {\n`;
        pom += `    readonly page: Page;\n\n`;
        
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            pom += `    readonly ${elementName}: Locator;\n`;
        });

        pom += `\n    constructor(page: Page) {\n`;
        pom += `        this.page = page;\n`;
        
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const playwrightLocator = generatePlaywrightLocator(locator);
            pom += `        this.${elementName} = page.locator('${playwrightLocator}');\n`;
        });

        pom += `    }\n\n`;
        
        pom += `    // Action methods\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const methodName = elementName.charAt(0).toUpperCase() + elementName.slice(1);
            if (locator.element?.tag === 'input' || locator.element?.tag === 'textarea') {
                pom += `    async fill${methodName}(text: string) {\n`;
                pom += `        await this.${elementName}.fill(text);\n`;
                pom += `    }\n\n`;
            } else {
                pom += `    async click${methodName}() {\n`;
                pom += `        await this.${elementName}.click();\n`;
                pom += `    }\n\n`;
            }
        });

        pom += `}`;
        return pom;
    };

    const generatePlaywrightLocator = (locator) => {
        switch (locator.type) {
            case 'id':
                return `#${locator.value}`;
            case 'name':
                return `[name="${locator.value}"]`;
            case 'className':
                return `.${locator.value}`;
            case 'css':
                return locator.value;
            case 'xpath':
                return locator.value;
            case 'testId':
                return `[data-testid="${locator.value}"]`;
            default:
                return locator.value;
        }
    };

    const generateCypressPOM = () => {
        const className = generatePOMClassName();
        let pom = `class ${className} {\n`;
        
        pom += `    // Locators\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const cypressLocator = generateCypressLocator(locator);
            pom += `    get ${elementName}() { return cy.get('${cypressLocator}'); }\n`;
        });

        pom += `\n    // Action methods\n`;
        allLocators.forEach(locator => {
            const elementName = locator.description.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const methodName = elementName.charAt(0).toUpperCase() + elementName.slice(1);
            if (locator.element?.tag === 'input' || locator.element?.tag === 'textarea') {
                pom += `    enter${methodName}(text) {\n`;
                pom += `        this.${elementName}.clear().type(text);\n`;
                pom += `        return this;\n`;
                pom += `    }\n\n`;
            } else {
                pom += `    click${methodName}() {\n`;
                pom += `        this.${elementName}.click();\n`;
                pom += `        return this;\n`;
                pom += `    }\n\n`;
            }
        });

        pom += `}\n\nexport default ${className};`;
        return pom;
    };

    const generateCypressLocator = (locator) => {
        switch (locator.type) {
            case 'id':
                return `#${locator.value}`;
            case 'name':
                return `[name="${locator.value}"]`;
            case 'className':
                return `.${locator.value}`;
            case 'css':
                return locator.value;
            case 'xpath':
                return locator.value;
            case 'testId':
                return `[data-testid="${locator.value}"]`;
            default:
                return locator.value;
        }
    };

    const handleBulkCopy = (framework) => {
        let pomCode = '';
        let frameworkName = '';
        
        switch (framework) {
            case 'selenium-java':
                pomCode = generateSeleniumPOMJava();
                frameworkName = 'Selenium Java POM';
                break;
            case 'selenium-python':
                pomCode = generateSeleniumPOMPython();
                frameworkName = 'Selenium Python POM';
                break;
            case 'playwright':
                pomCode = generatePlaywrightPOM();
                frameworkName = 'Playwright POM';
                break;
            case 'cypress':
                pomCode = generateCypressPOM();
                frameworkName = 'Cypress POM';
                break;
            default:
                return;
        }
        
        copyToClipboard(pomCode, frameworkName);
        setBulkCopyMenuAnchor(null);
    };

    const renderLocatorCard = (locator, index) => (
        <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
                            {locator.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip 
                                label={locator.type} 
                                color="primary" 
                                size="small" 
                            />
                            {locator.isInteractive && (
                                <Chip 
                                    label="Interactive" 
                                    color="success" 
                                    size="small" 
                                />
                            )}
                            {locator.isUnique && (
                                <Chip 
                                    label="Unique" 
                                    color="warning" 
                                    size="small" 
                                />
                            )}
                            {locator.element?.tag && (
                                <Chip 
                                    label={locator.element.tag} 
                                    variant="outlined" 
                                    size="small" 
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {/* Primary Locator */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Primary Locator ({locator.type}):
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: '#f5f5f5', 
                            p: 1, 
                            borderRadius: 1,
                            mb: 1
                        }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontFamily: 'monospace', 
                                    flex: 1, 
                                    wordBreak: 'break-all' 
                                }}
                            >
                                {locator.value}
                            </Typography>
                            <Tooltip title="Copy locator value">
                                <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(locator.value, 'locator value')}
                                >
                                    <CopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>

                    {/* XPath (if available) */}
                    {locator.xpath && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                XPath:
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                bgcolor: '#f5f5f5', 
                                p: 1, 
                                borderRadius: 1,
                                mb: 1
                            }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontFamily: 'monospace', 
                                        flex: 1, 
                                        wordBreak: 'break-all' 
                                    }}
                                >
                                    {locator.xpath}
                                </Typography>
                                <Tooltip title="Copy XPath">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => copyToClipboard(locator.xpath, 'XPath')}
                                    >
                                        <CopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    )}

                    {/* CSS Selector (if different from primary) */}
                    {locator.cssSelector && locator.cssSelector !== locator.value && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                CSS Selector:
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                bgcolor: '#f5f5f5', 
                                p: 1, 
                                borderRadius: 1,
                                mb: 1
                            }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontFamily: 'monospace', 
                                        flex: 1, 
                                        wordBreak: 'break-all' 
                                    }}
                                >
                                    {locator.cssSelector}
                                </Typography>
                                <Tooltip title="Copy CSS Selector">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => copyToClipboard(locator.cssSelector, 'CSS Selector')}
                                    >
                                        <CopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    )}                    {/* Code Examples */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Code Examples:
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} md={6} lg={3}>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Selenium (Python):
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            {generateSeleniumCode(locator)}
                                        </Typography>
                                        <Tooltip title="Copy Selenium Python code">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => copyToClipboard(generateSeleniumCode(locator), 'Selenium Python code')}
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Selenium (Java):
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            {generateSeleniumJavaCode(locator)}
                                        </Typography>
                                        <Tooltip title="Copy Selenium Java code">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => copyToClipboard(generateSeleniumJavaCode(locator), 'Selenium Java code')}
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Playwright:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            {generatePlaywrightCode(locator)}
                                        </Typography>
                                        <Tooltip title="Copy Playwright code">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => copyToClipboard(generatePlaywrightCode(locator), 'Playwright code')}
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                                <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Cypress:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                fontSize: '0.75rem',
                                                flex: 1
                                            }}
                                        >
                                            {generateCypressCode(locator)}
                                        </Typography>
                                        <Tooltip title="Copy Cypress code">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => copyToClipboard(generateCypressCode(locator), 'Cypress code')}
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ mt: 3 }}>
            {/* Summary Stats */}
            {summary && (
                <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                    <CardContent>                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                            📊 Locator Summary
                        </Typography><Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h4" color="primary">
                                    {processedPageGroups.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Pages Crawled
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h4" color="success.main">
                                    {totalLocators}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Locators
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h4" color="warning.main">
                                    {totalFilteredLocators}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Filtered Results
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h4" color="info.main">
                                    {allLocators.filter(l => l.isInteractive).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Interactive Elements
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}            {/* Search and Filter Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Search locators"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setSearchTerm('')}
                                                edge="end"
                                                size="small"
                                                aria-label="clear search"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Search by description, value, element type, page name..."
                                helperText={`Showing ${totalFilteredLocators} of ${totalLocators} locators`}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Filter by type"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                SelectProps={{ native: true }}
                            >
                                <option value="all">All Types ({locatorTypes.length} types)</option>
                                {locatorTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type} ({allLocators.filter(l => l.type === type).length})
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CodeIcon />}
                                fullWidth
                                onClick={(e) => setBulkCopyMenuAnchor(e.currentTarget)}
                                disabled={allLocators.length === 0}
                            >
                                Copy All as POM
                            </Button>
                            <Menu
                                anchorEl={bulkCopyMenuAnchor}
                                open={Boolean(bulkCopyMenuAnchor)}
                                onClose={() => setBulkCopyMenuAnchor(null)}
                                PaperProps={{
                                    sx: { minWidth: 200 }
                                }}
                            >
                                <MenuItem onClick={() => handleBulkCopy('selenium-java')}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" fontWeight="bold">Selenium Java</Typography>
                                        <Typography variant="caption" color="text.secondary">Page Object Model</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={() => handleBulkCopy('selenium-python')}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" fontWeight="bold">Selenium Python</Typography>
                                        <Typography variant="caption" color="text.secondary">Page Object Model</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={() => handleBulkCopy('playwright')}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" fontWeight="bold">Playwright</Typography>
                                        <Typography variant="caption" color="text.secondary">TypeScript POM</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={() => handleBulkCopy('cypress')}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" fontWeight="bold">Cypress</Typography>
                                        <Typography variant="caption" color="text.secondary">JavaScript POM</Typography>
                                    </Box>
                                </MenuItem>
                            </Menu>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {(searchTerm || filterType !== 'all') && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={clearSearch}
                                        startIcon={<ClearIcon />}
                                        fullWidth
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                    {totalFilteredLocators === totalLocators 
                                        ? `${totalLocators} quality locators` 
                                        : `${totalFilteredLocators} of ${totalLocators} locators`
                                    }
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Page-wise Locator Display */}
            {processedPageGroups.map((page, pageIndex) => (
                <Accordion key={pageIndex} defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>
                                📄 {page.pageName}
                            </Typography>
                            <Chip 
                                label={`${page.locators.length} locators`} 
                                color="primary" 
                                size="small" 
                            />
                            {page.depth > 0 && (
                                <Chip 
                                    label={`Depth: ${page.depth}`} 
                                    variant="outlined" 
                                    size="small" 
                                />
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            URL: {page.pageUrl}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {page.locators.map((locator, locatorIndex) => 
                            renderLocatorCard(locator, locatorIndex)
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Snackbar for copy notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LocatorList;
