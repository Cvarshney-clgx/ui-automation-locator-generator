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
    FormControlLabel
} from '@mui/material';
import { 
    ContentCopy as CopyIcon, 
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

const LocatorList = ({ locators, pageGroups, summary }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showPageView, setShowPageView] = useState(true);
    const [lastDataUpdate, setLastDataUpdate] = useState(null);

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
                        <Grid item xs={12} md={6}>
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
                        </Grid>                        <Grid item xs={12} md={3}>
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
