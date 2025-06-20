const extractLocators = async (page, locatorFilters = {}) => {
    try {
        // Add page readiness check
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => {
            console.warn('Page readyState timeout, continuing anyway');
        });
        
        return await page.evaluate((filters) => {
            const locators = [];
            
            function safeGetProperty(obj, prop, fallback = null) {
                try {
                    const value = obj[prop];
                    return (typeof value === 'string' && value.trim().length > 0) ? value.trim() : fallback;
                } catch (e) {
                    return fallback;
                }
            }
            
            function isValidSelector(selector) {
                if (!selector || typeof selector !== 'string') return false;
                try {
                    document.querySelector(selector);
                    return true;
                } catch (e) {
                    return false;
                }
            }
              function escapeSelector(id) {
                if (!id || typeof id !== 'string') return '';
                try {
                    return CSS && CSS.escape ? CSS.escape(id) : id.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
                } catch (e) {
                    return id.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
                }
            }
            
            function isInteractiveElement(el) {
            const interactiveTags = ['input', 'button', 'select', 'textarea', 'a', 'form', 'details', 'summary'];
            const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'slider', 
                                     'tab', 'menuitem', 'option', 'searchbox', 'switch', 'scrollbar'];
            const interactiveTypes = ['submit', 'button', 'reset', 'image', 'file', 'range', 'color', 
                                     'date', 'time', 'email', 'url', 'search', 'tel', 'number'];
            
            const tagName = el.tagName ? el.tagName.toLowerCase() : '';
            const role = el.getAttribute('role');
            const type = el.getAttribute('type');
            const tabIndex = el.getAttribute('tabindex');
            const href = el.getAttribute('href');
            const onclick = el.getAttribute('onclick');
            const onchange = el.getAttribute('onchange');
            const className = el.className || '';
            
            // Check for various interaction indicators
            const hasEventHandlers = onclick || onchange || 
                                     el.onclick || el.onchange || el.addEventListener ||
                                     el.style.cursor === 'pointer';
            
            const hasInteractiveClass = className && (
                className.includes('btn') || className.includes('button') ||
                className.includes('link') || className.includes('input') ||
                className.includes('clickable') || className.includes('interactive') ||
                className.includes('control') || className.includes('field') ||
                className.includes('toggle') || className.includes('switch') ||
                className.includes('select') || className.includes('dropdown') ||
                className.includes('menu') || className.includes('tab') ||
                className.includes('accordion') || className.includes('modal') ||
                className.includes('dialog') || className.includes('popup')
            );
            
            const hasTestAttributes = el.hasAttribute('data-testid') ||
                                     el.hasAttribute('data-test') ||
                                     el.hasAttribute('data-cy') ||
                                     el.hasAttribute('data-automation') ||
                                     el.hasAttribute('data-qa');
            
            const isFocusable = tabIndex !== null && tabIndex !== '-1';
            const hasContentEditable = el.contentEditable === 'true';
            
            return interactiveTags.includes(tagName) || 
                   interactiveRoles.includes(role) || 
                   interactiveTypes.includes(type) ||
                   href ||
                   hasEventHandlers ||
                   hasInteractiveClass ||
                   hasTestAttributes ||
                   isFocusable ||
                   hasContentEditable;
        }
          function getElementDescription(el) {
            // Try to get meaningful description from various sources
            const text = el.textContent ? el.textContent.trim().substring(0, 50) : '';
            const placeholder = el.getAttribute('placeholder');
            const title = el.getAttribute('title');
            const alt = el.getAttribute('alt');
            const label = el.getAttribute('aria-label');
            const ariaDescribedBy = el.getAttribute('aria-describedby');
            const value = el.getAttribute('value');
            const type = el.getAttribute('type');
            const role = el.getAttribute('role');
            const tagName = el.tagName ? el.tagName.toLowerCase() : '';
            
            // Try to find associated label
            let associatedLabel = '';
            if (el.id) {
                const labelElement = document.querySelector(`label[for="${el.id}"]`);
                if (labelElement) {
                    associatedLabel = labelElement.textContent.trim();
                }
            }
            
            // Build description with priority order
            if (label) return `${tagName} - ${label}`;
            if (associatedLabel) return `${tagName} - ${associatedLabel}`;
            if (placeholder) return `${tagName} - ${placeholder}`;
            if (title) return `${tagName} - ${title}`;
            if (alt) return `${tagName} - ${alt}`;
            if (value && value.length < 30) return `${tagName} - ${value}`;
            if (type && type !== 'text') return `${tagName}[${type}] - ${text || 'input'}`;
            if (role) return `${tagName}[${role}] - ${text || 'element'}`;
            if (text) return `${tagName} - ${text}`;
            
            // Fallback description based on element context
            const className = el.className || '';
            if (className) {
                const meaningfulClasses = className.split(' ').filter(cls => 
                    cls.length > 2 && 
                    !cls.match(/^(col|row|d-|m-|p-|text-|bg-|border-|flex-|justify-|align-)/) // Skip utility classes
                );
                if (meaningfulClasses.length > 0) {
                    return `${tagName}.${meaningfulClasses[0]} element`;
                }
            }
            
            return `${tagName} element`;
        }
        
        try {            // Focus on interactive and useful elements for any website
            const selectors = [
                // Basic form and interactive elements
                'input', 'button', 'select', 'textarea', 'a[href]', 'form',
                
                // ARIA roles for accessibility
                '[role="button"]', '[role="link"]', '[role="textbox"]', '[role="combobox"]',
                '[role="checkbox"]', '[role="radio"]', '[role="slider"]', '[role="tab"]',
                '[role="menuitem"]', '[role="option"]', '[role="searchbox"]',
                
                // Test automation attributes
                '[data-testid]', '[data-test]', '[data-cy]', '[data-test-id]',
                '[data-automation]', '[data-qa]', '[data-e2e]', '[id^="test-"]',
                '[class*="test-"]', '[data-selenium]', '[data-robot]',
                
                // Common UI component classes
                '.btn', '.button', '.link', '.form-control', '.input', '.field',
                '.control', '.widget', '.component', '.element', '.item',
                
                // Framework-specific patterns
                '[ng-click]', '[v-on\\:click]', '[onclick]', // Event handlers
                '[ng-model]', '[v-model]', // Data binding
                '.ng-', '.vue-', '.react-', // Framework prefixes
                
                // Modern web component patterns
                '[data-target]', '[data-toggle]', '[data-dismiss]', // Bootstrap
                '.mui-', '.ant-', '.el-', // UI library prefixes
                '[class*="button"]', '[class*="input"]', '[class*="select"]',
                '[class*="checkbox"]', '[class*="radio"]', '[class*="toggle"]',
                
                // Navigation and menu elements
                'nav *[href]', '.menu *[href]', '.navigation *[href]',
                '.nav-item', '.menu-item', '.nav-link', '.menu-link',
                
                // Content interaction elements
                '.card [href]', '.tile [href]', '.panel [href]',
                '.accordion [href]', '.tab [href]', '.modal [href]',
                
                // E-commerce and form patterns
                '.product [href]', '.item [href]', '.category [href]',
                '.submit', '.cancel', '.save', '.delete', '.edit',
                '.add', '.remove', '.update', '.confirm', '.close'
            ];
            
            const elements = [];
            selectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    elements.push(...Array.from(found));
                } catch (e) {
                    // Skip invalid selectors
                }
            });
            
            // Remove duplicates
            const uniqueElements = [...new Set(elements)];
            
            for (let i = 0; i < uniqueElements.length; i++) {
                try {
                    const el = uniqueElements[i];
                    
                    // Skip if element doesn't exist or is not a proper DOM element
                    if (!el || !el.nodeType || el.nodeType !== 1) continue;
                    
                    // Skip hidden elements
                    const style = window.getComputedStyle(el);
                    if (style.display === 'none' || style.visibility === 'hidden') continue;
                    
                    // Get safe properties
                    const id = safeGetProperty(el, 'id');
                    const name = safeGetProperty(el, 'name');
                    const className = safeGetProperty(el, 'className');
                    const tagName = safeGetProperty(el, 'tagName');
                    const testId = el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');
                      // Skip if no useful attributes - make this less restrictive
                    if (!id && !name && !className && !testId && !tagName) continue;
                    
                    // Skip elements that clearly aren't useful for automation
                    const isUselessElement = (
                        (!id && !name && !testId && !className) ||
                        (tagName === 'div' && !className && !id && !testId) ||
                        (tagName === 'span' && !className && !id && !testId) ||
                        (tagName === 'p' && !className && !id && !testId)
                    );
                    
                    let isUnique = false;
                    if (id) {
                        try {
                            const escapedId = escapeSelector(id);
                            const selector = `#${escapedId}`;
                            if (isValidSelector(selector)) {
                                const matchingElements = document.querySelectorAll(selector);
                                isUnique = matchingElements.length === 1;
                            }
                        } catch (e) {
                            isUnique = false;
                        }
                    }                    // Generate meaningful description
                    const description = getElementDescription(el);
                    
                    // Generate XPath for the element
                    function getElementXPath(element) {
                        if (!element || element === document.documentElement) return '/html';
                        
                        // If element has unique id, use it
                        if (element.id) {
                            return `//*[@id='${element.id}']`;
                        }
                        
                        // Build path from root
                        const getElementIndex = (el) => {
                            if (!el.parentNode) return 1;
                            let index = 1;
                            for (let sibling = el.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
                                if (sibling.tagName === el.tagName) index++;
                            }
                            return index;
                        };
                        
                        const parts = [];
                        let current = element;
                        
                        while (current && current.nodeType === 1 && current !== document.documentElement) {
                            let part = current.tagName.toLowerCase();
                            
                            // Add attributes that make the xpath more specific
                            if (current.className) {
                                const classes = current.className.trim().split(/\s+/).filter(c => c.length > 0);
                                if (classes.length > 0) {
                                    part += `[@class='${classes.join(' ')}']`;
                                }
                            } else if (current.getAttribute('data-testid')) {
                                part += `[@data-testid='${current.getAttribute('data-testid')}']`;
                            } else if (current.name) {
                                part += `[@name='${current.name}']`;
                            } else {
                                // Use position as last resort
                                const index = getElementIndex(current);
                                if (index > 1 || (current.parentNode && current.parentNode.children.length > 1)) {
                                    part += `[${index}]`;
                                }
                            }
                            
                            parts.unshift(part);
                            current = current.parentElement;
                        }
                        
                        return '//' + parts.join('/');
                    }
                      // Generate CSS selector with relative approach
                    function getCSSSelector(element) {
                        if (!element) return '';
                        
                        // Priority 1: Test attributes
                        if (element.getAttribute('data-testid')) {
                            return `[data-testid="${element.getAttribute('data-testid')}"]`;
                        }
                        if (element.getAttribute('data-test')) {
                            return `[data-test="${element.getAttribute('data-test')}"]`;
                        }
                        if (element.getAttribute('data-cy')) {
                            return `[data-cy="${element.getAttribute('data-cy')}"]`;
                        }
                        
                        // Priority 2: Unique ID
                        if (element.id) {
                            return `#${CSS.escape ? CSS.escape(element.id) : element.id}`;
                        }
                        
                        // Priority 3: Name attribute
                        if (element.name) {
                            return `[name="${element.name}"]`;
                        }
                        
                        // Priority 4: Smart class selection (avoid auto-generated classes)
                        if (element.className) {
                            const classes = element.className.trim().split(/\s+/).filter(c => {
                                // Filter out likely auto-generated classes
                                return c.length > 0 && 
                                       !c.match(/^[a-z]+\d+$/) && // avoid classes like 'css123'
                                       !c.match(/^_[a-zA-Z0-9]+$/) && // avoid webpack style classes
                                       !c.match(/^[a-z]{1,3}\d{3,}$/) && // avoid short+number classes
                                       c.length > 2;
                            });
                            
                            if (classes.length > 0) {
                                // Use the most semantic class name
                                const bestClass = classes.find(c => 
                                    c.includes('btn') || c.includes('button') || 
                                    c.includes('input') || c.includes('form') || 
                                    c.includes('nav') || c.includes('menu') ||
                                    c.includes('header') || c.includes('footer') ||
                                    c.includes('content') || c.includes('main')
                                ) || classes[0];
                                
                                return '.' + (CSS.escape ? CSS.escape(bestClass) : bestClass);
                            }
                        }
                        
                        // Priority 5: Type attribute for inputs
                        if (element.type && element.tagName.toLowerCase() === 'input') {
                            return `input[type="${element.type}"]`;
                        }
                        
                        // Priority 6: Role attribute
                        if (element.getAttribute('role')) {
                            return `[role="${element.getAttribute('role')}"]`;
                        }
                        
                        // Fallback to tag name
                        return element.tagName.toLowerCase();
                    }
                    
                    // Generate smart relative XPath
                    function getSmartXPath(element) {
                        if (!element || element === document.documentElement) return '/html';
                        
                        // Priority 1: Use test attributes
                        if (element.getAttribute('data-testid')) {
                            return `//*[@data-testid='${element.getAttribute('data-testid')}']`;
                        }
                        if (element.getAttribute('data-test')) {
                            return `//*[@data-test='${element.getAttribute('data-test')}']`;
                        }
                        if (element.getAttribute('data-cy')) {
                            return `//*[@data-cy='${element.getAttribute('data-cy')}']`;
                        }
                        
                        // Priority 2: Use unique ID
                        if (element.id) {
                            return `//*[@id='${element.id}']`;
                        }
                        
                        // Priority 3: Use name attribute
                        if (element.name) {
                            return `//*[@name='${element.name}']`;
                        }                        // Priority 4: Use text content for buttons, links, etc.
                        const text = element.textContent ? element.textContent.trim() : '';
                        if (text && text.length > 0 && text.length < 50) {
                            const tagName = element.tagName.toLowerCase();
                            if (['button', 'a', 'span', 'div', 'p'].includes(tagName)) {
                                // Special handling for close buttons - prefer span over button for single character text
                                if ((text === '×' || text === 'X' || text === '✕' || text === '✖') && tagName === 'button') {
                                    // Check if there's a direct child span with the same text
                                    const childSpan = element.querySelector('span');
                                    if (childSpan && childSpan.textContent && childSpan.textContent.trim() === text) {
                                        return `//span[normalize-space(text())='${text}']`;
                                    }
                                }
                                
                                // Enhanced handling for links (a tags) - prioritize title attribute, then child elements
                                if (tagName === 'a') {
                                    // Priority 1: Check if element has title attribute
                                    const titleAttr = element.getAttribute('title');
                                    if (titleAttr && titleAttr.trim().length > 0 && titleAttr.trim().length < 50) {
                                        return `//a[@title='${titleAttr.trim()}']`;
                                    }
                                    
                                    // Priority 2: AGGRESSIVE span detection - check for ANY span child
                                    const spans = element.querySelectorAll('span');
                                    if (spans.length > 0) {
                                        const firstSpan = spans[0];
                                        const spanText = firstSpan.textContent ? firstSpan.textContent.trim() : '';
                                        return `//span[normalize-space(text())='${spanText}']`;
                                    }
                                    
                                    // Priority 3: Check all child elements for text content
                                    const childElements = element.querySelectorAll('*');
                                    for (const child of childElements) {
                                        const childText = child.textContent ? child.textContent.trim() : '';
                                        const childTagName = child.tagName ? child.tagName.toLowerCase() : '';
                                        
                                        // Check if this child contains meaningful text and it's a suitable element
                                        if (childText && childText.length > 0 && childText.length < 50 && 
                                            ['span', 'div', 'p', 'strong', 'em', 'b', 'i', 'small', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(childTagName)) {
                                            
                                            // Make sure this child's text is not just a subset of a parent's text
                                            // and that it's actually the primary text content
                                            const childTextRatio = childText.length / (text.length || 1);
                                            if (childTextRatio > 0.5) { // Lowered threshold to 50% to catch more cases
                                                return `//${childTagName}[normalize-space(text())='${childText}']`;
                                            }
                                        }
                                    }
                                    
                                    // Priority 3: Fallback to direct child span (more aggressive)
                                    const childSpan = element.querySelector('span');
                                    if (childSpan) {
                                        const spanText = childSpan.textContent ? childSpan.textContent.trim() : '';
                                        if (spanText && spanText.length > 0) {
                                            return `//span[normalize-space(text())='${spanText}']`;
                                        }
                                    }
                                    
                                    // Priority 4: Check for ANY child with text content (more aggressive)
                                    const allChildren = Array.from(element.children);
                                    if (allChildren.length > 0) {
                                        for (const child of allChildren) {
                                            const childText = child.textContent ? child.textContent.trim() : '';
                                            const childTagName = child.tagName ? child.tagName.toLowerCase() : '';
                                            if (childText && childText.length > 0 && childText.length < 100) { // Increased length limit
                                                return `//${childTagName}[normalize-space(text())='${childText}']`;
                                            }
                                        }
                                    }
                                    
                                    // Priority 5: If no suitable child found, try to use the link's href or other attributes
                                    const href = element.getAttribute('href');
                                    if (href && href !== '#' && href.length > 0) {
                                        return `//a[@href='${href}']`;
                                    }
                                    
                                    // Final fallback: use the 'a' tag with text
                                    return `//a[normalize-space(text())='${text}']`;
                                }
                                
                                // For non-link elements, continue with the original logic
                                return `//${tagName}[normalize-space(text())='${text}']`;
                            }
                        }
                        
                        // Priority 5: Use placeholder for inputs
                        if (element.placeholder) {
                            return `//*[@placeholder='${element.placeholder}']`;
                        }
                        
                        // Priority 6: Use type attribute
                        if (element.type) {
                            return `//*[@type='${element.type}']`;
                        }
                        
                        // Priority 7: Use role
                        if (element.getAttribute('role')) {
                            return `//*[@role='${element.getAttribute('role')}']`;
                        }
                        
                        // Fallback: create a shorter, more maintainable path
                        const parts = [];
                        let current = element;
                        let pathLength = 0;
                        
                        while (current && current.nodeType === 1 && current !== document.documentElement && pathLength < 3) {
                            let part = current.tagName.toLowerCase();
                            
                            // Add most distinctive attribute
                            if (current.className) {
                                const classes = current.className.trim().split(/\s+/).filter(c => 
                                    c.length > 2 && !c.match(/^[a-z]+\d+$/)
                                );
                                if (classes.length > 0) {
                                    part += `[@class='${classes[0]}']`;
                                }
                            } else if (current.getAttribute('role')) {
                                part += `[@role='${current.getAttribute('role')}']`;
                            } else if (current.type) {
                                part += `[@type='${current.type}']`;
                            }
                            
                            parts.unshift(part);
                            current = current.parentElement;
                            pathLength++;
                        }
                        
                        return '//' + parts.join('/');
                    }
                    
                    const xpath = getSmartXPath(el);
                    const cssSelector = getCSSSelector(el);
                    
                    // Only add if we have useful attributes or it's interactive, and it's not a useless element
                    if (!isUselessElement && (id || name || testId || isInteractiveElement(el) || 
                        (className && (className.includes('btn') || className.includes('form') || className.includes('input') || 
                         className.includes('control') || className.includes('slider') || className.includes('range'))))) {
                        
                        // Create enhanced locator object with multiple selector strategies
                        const locator = {
                            id: id,
                            name: name,
                            class: className,
                            tagName: tagName ? tagName.toLowerCase() : 'unknown',
                            testId: testId,
                            xpath: xpath,
                            cssSelector: cssSelector,
                            isUnique: isUnique,
                            description: description,
                            isInteractive: isInteractiveElement(el),
                            // Additional attributes for better identification
                            type: el.getAttribute('type'),
                            placeholder: el.getAttribute('placeholder'),
                            value: el.getAttribute('value'),
                            href: el.getAttribute('href'),
                            role: el.getAttribute('role'),
                            ariaLabel: el.getAttribute('aria-label')
                        };

                        // Apply locator filters
                        const shouldIncludeLocator = () => {
                            const tagName = locator.tagName || '';
                            const type = locator.type || '';
                            
                            // If no filters provided, include all
                            if (!filters || Object.keys(filters).length === 0) {
                                return true;
                            }
                            
                            // Check each filter type
                            if (tagName === 'input') {
                                if (type === 'checkbox' && filters.checkbox === false) return false;
                                if (type === 'radio' && filters.radio === false) return false;
                                if (type === 'text' || type === 'password' || type === 'email' || type === 'number' || type === 'search' || type === '' || !type) {
                                    if (filters.input === false) return false;
                                }
                            } else if (tagName === 'button' && filters.button === false) {
                                return false;
                            } else if (tagName === 'a' && filters.link === false) {
                                return false;
                            } else if (tagName === 'select' && filters.select === false) {
                                return false;
                            } else if (tagName === 'textarea' && filters.textarea === false) {
                                return false;
                            } else if (tagName === 'form' && filters.form === false) {
                                return false;
                            }
                            
                            return true;
                        };
                        
                        if (!shouldIncludeLocator()) {
                            continue; // Skip this locator if filtered out
                        }

                        // Check if this locator is already in the array to avoid duplicates
                        // Create a unique signature for each locator
                        const createLocatorSignature = (loc) => {
                            const sig = [];
                            if (loc.id) sig.push(`id:${loc.id}`);
                            if (loc.name) sig.push(`name:${loc.name}`);
                            if (loc.testId) sig.push(`testId:${loc.testId}`);
                            if (loc.class) sig.push(`class:${loc.class}`);
                            sig.push(`tag:${loc.tagName}`);
                            sig.push(`desc:${loc.description.replace(/\s+/g, ' ').trim()}`);
                            return sig.join('|');
                        };
                        
                        const currentSignature = createLocatorSignature(locator);
                        const isDuplicate = locators.some(existing => 
                            createLocatorSignature(existing) === currentSignature
                        );
                        
                        if (!isDuplicate) {
                            locators.push(locator);
                        }
                    }
                    
                } catch (elementError) {
                    // Skip this element and continue with next
                    continue;
                }
            }        } catch (generalError) {
            console.error('Error extracting locators:', generalError);
        }        
        return locators;
        }, locatorFilters);
    } catch (error) {
        console.error('Error in extractLocators:', error.message);
        return [];
    }
};

// Crawl pages recursively
const crawlPages = async (page, url, visited, results, depth = 0, maxDepth = 3, baseUrl = null, locatorFilters = {}) => {
    try {
        if (depth > maxDepth) {
            console.log(`Max depth reached: ${depth}`);
            return;
        }

        if (visited.has(url)) {
            console.log(`Skipped already visited URL: ${url}`);
            return;
        }

        // Normalize URLs for better comparison
        const normalizedUrl = url.replace(/\/$/, ''); // Remove trailing slash
        const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : null;
        
        if (normalizedBaseUrl && !normalizedUrl.startsWith(normalizedBaseUrl)) {
            console.log(`Skipped external domain: ${url}`);
            return;
        }        console.log(`Visiting (depth ${depth}): ${url}`);
        visited.add(url);
          let navigationError = false;
        let navigationAttempts = 0;
        const maxNavigationAttempts = 3;
        const navigationStrategies = ['networkidle2', 'networkidle0', 'domcontentloaded'];
          while (navigationAttempts < maxNavigationAttempts && !navigationError) {
            try {
                console.log(`Loading ${url} (attempt ${navigationAttempts + 1})...`);
                
                // Check if page is still connected before navigation
                try {
                    await page.evaluate(() => document.readyState);
                } catch (connectionError) {
                    if (connectionError.message.includes('Protocol error') || 
                        connectionError.message.includes('Target closed') ||
                        connectionError.message.includes('Session closed')) {
                        console.error('Page connection lost, throwing error to restart browser');
                        throw new Error('Browser connection lost - protocol error detected');
                    }
                }
                
                const strategy = navigationStrategies[navigationAttempts] || 'domcontentloaded';
                const navigationPromise = page.goto(url, { 
                    waitUntil: strategy,
                    timeout: 45000
                });
                
                // Add protocol error detection
                const result = await navigationPromise.catch(navError => {
                    if (navError.message.includes('Protocol error') ||
                        navError.message.includes('Target closed') ||
                        navError.message.includes('Session closed') ||
                        navError.message.includes('Connection closed')) {
                        console.error('Protocol error detected during navigation:', navError.message);
                        throw new Error('Browser connection lost - protocol error detected');
                    }
                    throw navError;
                });
                
                // Wait for content to load with shorter timeout
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                console.log(`Successfully loaded page with strategy: ${strategy}`);
                break;
                
            } catch (err) {
                navigationAttempts++;
                console.error(`Navigation attempt ${navigationAttempts} failed for ${url}: ${err.message}`);
                
                // Check for protocol errors that require browser restart
                if (err.message.includes('Browser connection lost') ||
                    err.message.includes('Protocol error') ||
                    err.message.includes('Target closed') ||
                    err.message.includes('Session closed')) {
                    console.error('Critical browser error detected, propagating up...');
                    throw err; // Propagate protocol errors up to restart browser
                }
                
                if (navigationAttempts >= maxNavigationAttempts) {
                    console.error(`All navigation attempts failed for ${url}`);
                    navigationError = true;
                }
                
                // Wait before retry for non-protocol errors
                if (navigationAttempts < maxNavigationAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        if (navigationError) return;        let locators = [];
        let pageTitle = 'Unknown Page';
          try {
            // Add timeout wrapper for locator extraction with protocol error detection
            const extractionPromise = extractLocators(page, locatorFilters).catch(extractError => {
                if (extractError.message.includes('Protocol error') ||
                    extractError.message.includes('Target closed') ||
                    extractError.message.includes('Session closed') ||
                    extractError.message.includes('Connection closed')) {
                    console.error('Protocol error during locator extraction:', extractError.message);
                    throw new Error('Browser connection lost during extraction - protocol error detected');
                }
                throw extractError;
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Locator extraction timeout')), 30000)
            );
            
            locators = await Promise.race([extractionPromise, timeoutPromise]);
            console.log(`Found ${locators.length} locators on ${url}`);
        } catch (err) {
            console.error(`Failed to extract locators from ${url}: ${err.message}`);
            
            // Check for protocol errors that require browser restart
            if (err.message.includes('Browser connection lost') ||
                err.message.includes('Protocol error') ||
                err.message.includes('Target closed') ||
                err.message.includes('Session closed')) {
                console.error('Critical browser error during extraction, propagating up...');
                throw err; // Propagate protocol errors up to restart browser
            }
            
            locators = [];
        }
        
        try {
            // Add timeout for title extraction too
            const titlePromise = page.title();
            const titleTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Title extraction timeout')), 5000)
            );
            
            pageTitle = await Promise.race([titlePromise, titleTimeoutPromise]);
        } catch (err) {
            console.error(`Failed to get page title from ${url}: ${err.message}`);
            pageTitle = `Page_${depth}_${Date.now()}`;
        }
        
        // Only add pages that have meaningful locators
        if (locators.length > 0) {
            results.push({ 
                pageName: pageTitle, 
                pageUrl: url,
                depth: depth,
                locators 
            });
        }        // Enhanced link discovery for any website structure
        let links = [];
        try {
            links = await page.evaluate((currentUrl, baseUrl) => {
                const foundLinks = new Set();
                
                // Get all anchor tags
                const anchors = document.querySelectorAll('a[href]');
                
                for (const anchor of anchors) {
                    try {
                        let href = anchor.href;
                        
                        // Skip empty, javascript, mailto, tel links
                        if (!href || 
                            href.startsWith('javascript:') || 
                            href.startsWith('mailto:') || 
                            href.startsWith('tel:') ||
                            href.startsWith('#') ||
                            href === currentUrl) {
                            continue;
                        }
                        
                        // Convert relative URLs to absolute
                        const linkUrl = new URL(href, currentUrl);
                        const cleanUrl = linkUrl.href;
                        
                        // Only include links from the same domain
                        const baseDomain = new URL(baseUrl).hostname;
                        if (linkUrl.hostname === baseDomain) {
                            foundLinks.add(cleanUrl);
                        }
                    } catch (e) {
                        // Skip invalid URLs
                        continue;
                    }
                }                
                // Generic selectors for common website patterns
                const commonSelectors = [
                    // Navigation and menu structures
                    'nav a[href]',              // Navigation links
                    '.navbar a[href]',          // Bootstrap navbar
                    '.nav a[href]',             // Navigation classes
                    '.navigation a[href]',      // Navigation sections
                    '.menu a[href]',            // Menu items
                    '.main-menu a[href]',       // Main menu
                    '.header-menu a[href]',     // Header menu
                    '.sidebar a[href]',         // Sidebar links
                    
                    // Card and content structures
                    '.card a[href]',            // Card components
                    '.category a[href]',        // Category links
                    '.item a[href]',            // Item links
                    '.product a[href]',         // Product links
                    '.service a[href]',         // Service links
                    '.feature a[href]',         // Feature links
                    
                    // List and grid structures
                    '.list a[href]',            // List items
                    '.grid a[href]',            // Grid items
                    'ul a[href]',               // Unordered list links
                    'ol a[href]',               // Ordered list links
                    'li a[href]',               // List item links
                    
                    // Content sections
                    '.content a[href]',         // Content areas
                    '.section a[href]',         // Section links
                    '.container a[href]',       // Container links
                    '.wrapper a[href]',         // Wrapper links
                    'main a[href]',             // Main content
                    'article a[href]',          // Article links
                    
                    // Button and CTA structures
                    '.button[href]',            // Button links
                    '.btn[href]',               // Button classes
                    '.cta[href]',               // Call-to-action
                    '.link[href]',              // Generic link classes
                    
                    // Common component patterns
                    '[class*="link"] a[href]',  // Any class containing "link"
                    '[class*="nav"] a[href]',   // Any class containing "nav"
                    '[class*="menu"] a[href]',  // Any class containing "menu"
                    '[class*="card"] a[href]',  // Any class containing "card"
                    '[class*="item"] a[href]',  // Any class containing "item"
                    '[class*="category"] a[href]', // Any class containing "category"
                    
                    // Framework-specific patterns
                    '.list-group a[href]',      // Bootstrap list groups
                    '.dropdown a[href]',        // Dropdown items
                    '.accordion a[href]',       // Accordion items
                    '.tab a[href]',             // Tab items
                    '.breadcrumb a[href]',      // Breadcrumb links
                    
                    // E-commerce patterns
                    '.shop a[href]',            // Shop links
                    '.store a[href]',           // Store links
                    '.catalog a[href]',         // Catalog links
                    '.category-grid a[href]',   // Category grids
                    '.product-grid a[href]',    // Product grids
                    
                    // Blog and content patterns
                    '.blog a[href]',            // Blog links
                    '.post a[href]',            // Post links
                    '.article a[href]',         // Article links
                    '.news a[href]',            // News links
                    '.portfolio a[href]',       // Portfolio links
                ];
                
                // Apply all common selectors
                commonSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            try {
                                const href = element.href;
                                if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                                    const linkUrl = new URL(href, currentUrl);
                                    const baseDomain = new URL(baseUrl).hostname;
                                    if (linkUrl.hostname === baseDomain) {
                                        foundLinks.add(linkUrl.href);
                                    }
                                }
                            } catch (e) {
                                // Skip invalid links
                            }
                        });
                    } catch (e) {
                        // Skip if selector fails
                    }
                });                
                // Look for clickable elements that might navigate (for SPAs and dynamic content)
                const clickableSelectors = [
                    // Data attributes (common in modern frameworks)
                    '[data-href]',
                    '[data-url]',
                    '[data-link]',
                    '[data-route]',
                    '[data-navigate]',
                    '[data-id]',
                    '[data-section]',
                    '[data-page]',
                    '[data-target]',
                    
                    // Role-based navigation
                    '[role="button"][data-href]',
                    '[role="link"][data-href]',
                    '[role="tab"]',
                    '[role="menuitem"]',
                    
                    // Common clickable patterns
                    '.clickable',
                    '.navigable',
                    '.router-link',
                    '.nav-link',
                    '.page-link',
                    
                    // Framework-specific patterns
                    '[ng-click]',              // AngularJS
                    '[v-on\\:click]',          // Vue.js
                    '[onclick*="location"]',   // Inline navigation
                    '[onclick*="window.open"]', // Window opening
                    '[onclick*="href"]',       // Href manipulation
                    
                    // React Router patterns
                    '[data-testid*="link"]',
                    '[data-testid*="nav"]',
                    '[data-testid*="menu"]',
                ];
                
                clickableSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            // Try to extract navigation info from data attributes
                            const dataHref = element.getAttribute('data-href');
                            const dataUrl = element.getAttribute('data-url');
                            const dataLink = element.getAttribute('data-link');
                            const dataRoute = element.getAttribute('data-route');
                            const dataId = element.getAttribute('data-id');
                            const dataSection = element.getAttribute('data-section');
                            const dataPage = element.getAttribute('data-page');
                            
                            // Build potential URLs from data attributes
                            const potentialUrls = [
                                dataHref,
                                dataUrl,
                                dataLink,
                                dataRoute,
                                dataId ? `${baseUrl}/${dataId}` : null,
                                dataSection ? `${baseUrl}/${dataSection}` : null,
                                dataPage ? `${baseUrl}/${dataPage}` : null,
                            ].filter(Boolean);
                            
                            potentialUrls.forEach(url => {
                                try {
                                    const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href;
                                    const linkUrl = new URL(fullUrl);
                                    const baseDomain = new URL(baseUrl).hostname;
                                    if (linkUrl.hostname === baseDomain) {
                                        foundLinks.add(fullUrl);
                                    }
                                } catch (e) {
                                    // Skip invalid URLs
                                }
                            });
                        });
                    } catch (e) {
                        // Skip if selector fails
                    }
                });                        // Intelligent site structure detection
                        if (currentUrl.includes('demoqa.com')) {
                            // DemoQA-specific structure
                            const demoqaSections = [
                                'elements', 'forms', 'alerts', 'widgets', 'interactions', 'book-store-application'
                            ];
                            
                            demoqaSections.forEach(section => {
                                foundLinks.add(`${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${section}`);
                            });
                            
                            // Add subsections for each main section
                            const subsections = {
                                'elements': ['text-box', 'check-box', 'radio-button', 'web-tables', 'buttons', 'links', 'broken', 'upload-download', 'dynamic-properties'],
                                'forms': ['practice-form'],
                                'alerts': ['alerts', 'frames', 'nested-frames', 'modal-dialogs'],
                                'widgets': ['accordian', 'auto-complete', 'date-picker', 'slider', 'progress-bar', 'tabs', 'tool-tips', 'menu', 'select-menu'],
                                'interactions': ['sortable', 'selectable', 'resizable', 'droppable', 'dragabble'],
                                'book-store-application': ['login', 'books', 'profile']
                            };
                              
                            Object.entries(subsections).forEach(([section, subs]) => {
                                subs.forEach(sub => {
                                    foundLinks.add(`${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${sub}`);
                                });
                            });
                        } else {
                            // Generic site structure detection
                            // Look for common URL patterns in existing links
                            const existingPaths = Array.from(foundLinks).map(link => {
                                try {
                                    return new URL(link).pathname;
                                } catch (e) {
                                    return '';
                                }
                            }).filter(path => path && path !== '/');
                            
                            // Extract common path segments that might indicate sections
                            const pathSegments = new Set();
                            existingPaths.forEach(path => {
                                const segments = path.split('/').filter(segment => 
                                    segment && 
                                    segment.length > 1 && 
                                    segment.length < 20 && 
                                    !segment.includes('.') && 
                                    !segment.match(/^\d+$/) // Skip numeric IDs
                                );
                                segments.forEach(segment => pathSegments.add(segment));
                            });
                            
                            // Common website sections to try
                            const commonSections = [
                                'about', 'services', 'products', 'portfolio', 'blog', 'news', 
                                'contact', 'support', 'help', 'docs', 'documentation',
                                'features', 'pricing', 'solutions', 'resources', 'downloads',
                                'gallery', 'team', 'careers', 'jobs', 'events', 'testimonials',
                                'faq', 'terms', 'privacy', 'policy', 'legal', 'sitemap'
                            ];
                            
                            // Add discovered path segments and common sections
                            [...pathSegments, ...commonSections].forEach(section => {
                                const potentialUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${section}`;
                                foundLinks.add(potentialUrl);
                            });
                            
                            // Look for pagination patterns
                            const paginationPatterns = ['page', 'p', 'offset'];
                            paginationPatterns.forEach(pattern => {
                                for (let i = 1; i <= 3; i++) { // Try first few pages
                                    foundLinks.add(`${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${pattern}/${i}`);
                                    foundLinks.add(`${baseUrl}${baseUrl.endsWith('/') ? '' : '/?'}${pattern}=${i}`);
                                }
                            });
                        }
                
                return Array.from(foundLinks);
            }, url, baseUrl);
            
            console.log(`Found ${links.length} internal links on ${url}`);
            if (links.length > 0) {
                console.log(`Links found: ${links.slice(0, 5).join(', ')}${links.length > 5 ? '...' : ''}`);
            }
        } catch (err) {
            console.error(`Failed to extract links from ${url}: ${err.message}`);            links = [];
        }

        // Crawl found links at the next depth level
        for (const link of links) {
            if (!visited.has(link)) {
                try {
                    await crawlPages(page, link, visited, results, depth + 1, maxDepth, baseUrl, locatorFilters);
                } catch (err) {
                    console.error(`Failed to crawl link ${link}: ${err.message}`);
                    continue;
                }
            }
        }
    } catch (err) {
        console.error(`Critical error in crawlPages for ${url}: ${err.message}`);
    }
};

// New function for single page crawling
const crawlSinglePage = async (url, username = '', password = '', locatorFilters = {}) => {
    const puppeteer = require('puppeteer');
    let browser = null;
    let page = null;
    
    try {
        console.log(`🚀 Starting single page crawl for: ${url}`);
        
        // Launch browser with optimized settings for faster execution
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=TranslateUI',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ],
            timeout: 30000 // 30 second timeout for browser launch
        });

        page = await browser.newPage();
        
        // Set optimized timeouts and viewport
        await page.setDefaultTimeout(45000); // 45 second timeout for all operations
        await page.setDefaultNavigationTimeout(45000); // 45 second navigation timeout
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        // Handle authentication if provided
        if (username && password) {
            console.log('🔐 Using authentication credentials');
            await page.authenticate({ username, password });
        }

        // Navigate to the page with timeout
        console.log(`📄 Navigating to: ${url}`);
        await page.goto(url, { 
            waitUntil: 'domcontentloaded', // Changed from 'networkidle2' for faster loading
            timeout: 45000 
        });        // Wait a bit for dynamic content, but not too long
        console.log(`⏳ Waiting for page to stabilize...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds max wait
        console.log(`📄 Extracting locators from: ${url}`);
          
        // Extract locators with timeout protection
        const locators = await Promise.race([
            extractLocators(page, locatorFilters),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Locator extraction timeout')), 30000)
            )
        ]);
        
        console.log(`✅ Found ${locators.length} elements on the page`);

        const result = {
            url: url,
            title: await page.title(),
            pageName: await page.title() || 'Single Page',
            depth: 0,
            locators: locators
        };

        // Close browser safely
        if (page) await page.close();
        if (browser) await browser.close();
        
        return [result]; // Return as array to maintain compatibility with existing code

    } catch (error) {
        console.error(`❌ Error crawling single page ${url}:`, error.message);
        
        // Enhanced cleanup with timeout protection
        try {
            if (page) {
                await Promise.race([
                    page.close(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Page close timeout')), 5000))
                ]).catch(() => console.warn('Page close timeout or failed'));
            }
        } catch (e) {
            console.warn('Could not close page:', e.message);
        }
        
        try {
            if (browser) {
                await Promise.race([
                    browser.close(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Browser close timeout')), 5000))
                ]).catch(() => console.warn('Browser close timeout or failed'));
            }
        } catch (e) {
            console.warn('Could not close browser:', e.message);
        }
        
        // Return partial results instead of complete failure
        return [{
            url: url,
            title: 'Error',
            pageName: 'Error - ' + (error.message.includes('timeout') ? 'Timeout' : 'Failed to load'),
            depth: 0,
            locators: [],
            error: error.message
        }];
    }
};

module.exports = { crawlPages, crawlSinglePage };