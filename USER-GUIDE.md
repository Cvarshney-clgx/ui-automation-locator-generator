# 🤖 AI-Powered UI Automation Locator Generator - Complete User Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [🤖 Understanding AI Features](#-understanding-ai-features)
3. [User Interface Guide](#user-interface-guide)  
4. [Configuration Options](#configuration-options)
5. [Understanding AI-Enhanced Results](#understanding-ai-enhanced-results)
6. [AI Code Generation](#ai-code-generation)
7. [Best Practices with AI](#best-practices-with-ai)
8. [Troubleshooting](#troubleshooting)
9. [Advanced AI Features](#advanced-ai-features)

---

## 🚀 Getting Started

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: Version 14 or higher ([Download here](https://nodejs.org/))
- **Memory**: Minimum 4GB RAM, 8GB recommended for AI processing
- **Browser**: Chrome or Chromium (installed automatically with Puppeteer)
- **Network**: Internet connection for web crawling
- **🤖 AI Engine**: Built-in Smart Locator Engine (no additional dependencies)

### Installation Steps

#### Step 1: Download & Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/ui-automation-locator-generator.git
cd ui-automation-locator-generator

# Install backend dependencies (includes AI engine)
cd backend
npm install

# Install frontend dependencies
cd ../frontend  
npm install
```

#### Step 2: Launch the AI-Powered Application
```bash
# Terminal 1: Start Backend with AI Engine (keep running)
cd backend
npm start
# ✅ Server running on http://localhost:5000
# 🤖 Smart Locator Engine: Initializing intelligent locator selection...

# Terminal 2: Start Frontend (keep running)
cd frontend
npm start  
# ✅ Frontend running on http://localhost:3000
# 🤖 AI-enhanced UI ready for intelligent locator generation
```

---

## 🤖 Understanding AI Features

### **Smart Locator Engine Overview**
The AI engine is the core intelligence that powers optimal locator selection:

```
🤖 AI Processing Flow:
1. Element Analysis → Extracts all available attributes
2. Strategy Evaluation → Scores each locator strategy (TEST_ID, ID, NAME, etc.)
3. Quality Assessment → Evaluates uniqueness, interactivity, accessibility
4. Confidence Calculation → Generates 0.0-1.0 confidence score
5. Multi-Framework Generation → Creates optimized code for all frameworks
```

### **AI Strategy Priorities**
| Strategy | Weight | AI Confidence Range | Use Case |
|----------|--------|-------------------|----------|
| 🥇 **TEST_ID** | 100 | 0.95 - 1.00 | `data-testid` attributes (best for automation) |
| 🥈 **ID** | 90 | 0.85 - 0.95 | Unique `id` attributes |
| 🥉 **NAME** | 80 | 0.75 - 0.90 | Form `name` attributes |
| **CLASS** | 60 | 0.60 - 0.80 | Meaningful CSS classes |
| **XPATH** | 40 | 0.40 - 0.70 | AI-generated smart XPath |

### **AI Quality Indicators**
- ✅ **Unique Element** (+30 points): AI verifies element uniqueness
- ✅ **Interactive** (+20 points): AI detects clickable/interactable elements  
- ✅ **Text Content** (+15 points): AI analyzes meaningful text
- ✅ **Accessibility** (+10 points): AI checks role attributes
- ✅ **Type Specification** (+5 points): AI validates input types
# ✅ React app running on http://localhost:3000
```

#### Step 3: Access the Application
- Open your web browser
- Navigate to `http://localhost:3000`
- You should see the UI Automation Locator Generator interface

---

## 🎨 User Interface Guide

### Main Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    🚀 UI Automation Locator Generator        │
├─────────────────────────────────────────────────────────────┤
│  🌐 URL Configuration                                        │
│  ┌─────────────────┬──────────────┬──────────────────────┐   │
│  │ Application URL │ Username     │ Password             │   │
│  │ (required)      │ (optional)   │ (optional)           │   │
│  └─────────────────┴──────────────┴──────────────────────┘   │
│  ☑️ Single Page Mode (no multi-page traversal)              │
├─────────────────────────────────────────────────────────────┤
│  🔍 Locator Type Filters                                    │
│  ☑️ Input Fields    ☑️ Buttons       ☑️ Links              │
│  ☑️ Select/Dropdown ☑️ Text Areas    ☑️ Checkboxes         │
│  ☑️ Radio Buttons   ☑️ Forms                               │
├─────────────────────────────────────────────────────────────┤
│  🎮 Actions                                                 │
│  [Generate Locators] [Clear Results]                        │
├─────────────────────────────────────────────────────────────┤
│  📊 Results (appears after generation)                      │
│  • Summary Statistics                                       │
│  • Page-wise Locator Groups                                │
│  • Framework Code Blocks                                   │
│  • Copy-to-Clipboard Buttons                              │
└─────────────────────────────────────────────────────────────┘
```

### Interface Components

#### 1. URL Configuration Section
- **Application URL** (Required)
  - Enter the target website URL
  - Must include protocol (http:// or https://)
  - Examples: `https://demoqa.com`, `https://saucedemo.com`

- **Username** (Optional)
  - For websites requiring authentication
  - Used for login forms during crawling

- **Password** (Optional)  
  - Password for authentication
  - Securely handled, not stored

- **Single Page Mode Toggle**
  - ✅ **ON**: Extract locators only from the specified URL
  - ❌ **OFF**: Multi-page crawling with automatic navigation

#### 2. Locator Type Filters
Configure which element types to extract:

| Filter | Description | Examples |
|--------|-------------|----------|
| **Input Fields** | Text inputs, email, number, date fields | `<input type="text">`, password fields |
| **Buttons** | Clickable buttons and submit elements | `<button>`, `<input type="submit">` |
| **Links** | Anchor tags and navigation links | `<a href="...">`, navigation menu items |
| **Select/Dropdown** | Dropdown menus and select elements | `<select>`, dropdown components |
| **Text Areas** | Multi-line text input areas | `<textarea>` elements |
| **Checkboxes** | Checkbox input elements | `<input type="checkbox">` |
| **Radio Buttons** | Radio button input elements | `<input type="radio">` |
| **Forms** | Form containers and elements | `<form>` elements |

#### 3. Action Buttons
- **Generate Locators**: Start the crawling and extraction process
- **Clear Results**: Reset all results and start fresh

---

## ⚙️ Configuration Options

### Crawling Modes

#### Single Page Mode
```yaml
Purpose: Extract locators from one specific page only
Use Cases:
  - Single Page Applications (SPAs)
  - Specific form pages
  - Landing pages
  - Quick locator extraction
  
Advantages:
  - Faster execution (no navigation)
  - Focused results
  - Lower resource usage
  
Disadvantages:
  - Misses multi-page workflows
  - Limited coverage
```

#### Multi-Page Mode (Default)
```yaml
Purpose: Crawl multiple pages automatically
Use Cases:
  - Complete website testing
  - End-to-end test automation
  - Comprehensive locator discovery
  - Multi-step user journeys
  
Configuration:
  - Maximum depth: 3 levels
  - Domain restriction: Same domain only
  - Intelligent link discovery
  
Advantages:
  - Complete coverage
  - Workflow-based locators
  - Comprehensive test data
  
Disadvantages:
  - Longer execution time
  - Higher resource usage
```

### Element Type Filtering

#### Why Filter by Element Type?
- **Focus**: Only extract relevant elements for your automation needs
- **Performance**: Reduce processing time and result size
- **Clarity**: Get organized, categorized results
- **Maintenance**: Easier to maintain automation scripts

#### Filter Combinations for Different Use Cases

**Form Testing**
```yaml
Filters: Input Fields + Buttons + Text Areas + Checkboxes + Radio Buttons
Result: Complete form automation elements
Use Case: Registration, login, checkout forms
```

**Navigation Testing**  
```yaml
Filters: Links + Buttons
Result: All navigation and interaction elements
Use Case: Menu testing, user journey automation
```

**Data Entry Testing**
```yaml
Filters: Input Fields + Select/Dropdown + Text Areas
Result: All data input elements
Use Case: Form filling, data validation
```

**Complete UI Testing**
```yaml
Filters: All enabled (default)
Result: Comprehensive element coverage
Use Case: Full application automation
```

### Authentication Configuration

#### When to Use Authentication
- Login-protected areas
- User-specific content
- Multi-step workflows requiring login
- Protected admin panels

#### Setup Process
1. Enable authentication by filling username/password fields
2. Tool will attempt login on the first page
3. Subsequent crawling will be performed as authenticated user
4. Access to protected areas and user-specific content

#### Supported Authentication Types
- **Form-based login**: Standard username/password forms
- **Basic authentication**: HTTP basic auth (URL-based)
- **Session-based**: Maintains login session across pages

---

## 📊 Understanding Results

### Results Overview Structure

```
📊 SUMMARY STATISTICS
├── Total Pages Crawled: 8
├── Total Locators Found: 156  
├── Interactive Elements: 139 (89%)
├── Unique Identifiers: 104 (67%)
└── Pages with Locators: 8

📄 PAGE-WISE RESULTS
├── 🏠 Home Page (depth: 0)
│   ├── 23 locators found
│   ├── Elements: buttons, links, forms
│   └── Quality: 91% interactive
├── 📝 Login Page (depth: 1)  
│   ├── 12 locators found
│   ├── Elements: inputs, buttons
│   └── Quality: 100% interactive
└── ... more pages
```

### Locator Quality Indicators

#### Quality Metrics Explained
- **Interactive Elements**: Elements that users can interact with
- **Unique Identifiers**: Elements with unique IDs or attributes
- **Automation Attributes**: Elements with test-specific attributes
- **Stability Score**: Reliability prediction for automation

#### Quality Levels
```yaml
🟢 HIGH QUALITY (Score: 80-100%)
- Unique ID attributes
- Test automation attributes (data-testid)
- Stable CSS selectors
- Interactive elements with clear identifiers

🟡 MEDIUM QUALITY (Score: 60-79%)  
- Class-based selectors
- Name attributes
- Hierarchical CSS selectors
- Interactive elements with generic attributes

🔴 LOW QUALITY (Score: 0-59%)
- Position-based XPath
- Generic tag selectors
- Non-interactive elements
- Unstable attribute dependencies
```

### Locator Types Generated

#### 1. CSS Selectors
```css
/* ID-based (highest priority) */
#userName
#submit-button

/* Attribute-based */
[data-testid="login-form"]
[name="email"]

/* Class-based */
.btn-primary
.form-control

/* Hierarchical */
.login-form .submit-button
```

#### 2. XPath Expressions
```xpath
<!-- Attribute-based XPath -->
//*[@id='userName']
//*[@data-testid='submit-btn']

<!-- Text-based XPath -->
//button[text()='Submit']
//a[contains(text(), 'Login')]

<!-- Hierarchical XPath -->
//form[@class='login-form']//button
//div[@class='container']//input[@type='email']
```

#### 3. Framework-Specific Selectors
```yaml
Selenium:
  - By.ID, By.CLASS_NAME, By.CSS_SELECTOR
  - By.XPATH, By.NAME, By.TAG_NAME
  
Playwright:
  - page.locator(), page.getBy* methods
  - Text and attribute-based selectors
  
Cypress:
  - cy.get(), cy.contains()
  - Data attribute selectors
```

---

## 💻 Code Generation

### Framework Support

#### 1. Selenium Python
```python
# Generated WebDriver code with explicit waits
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Example: Login form automation
def test_login():
    driver = webdriver.Chrome()
    driver.get("https://example.com")
    
    # Username field
    username_field = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "userName"))
    )
    username_field.send_keys("testuser")
    
    # Password field  
    password_field = driver.find_element(By.ID, "password")
    password_field.send_keys("testpass")
    
    # Submit button
    submit_button = driver.find_element(By.XPATH, "//button[text()='Submit']")
    submit_button.click()
    
    driver.quit()
```

#### 2. Selenium Java (Page Object Model)
```java
// Generated POM class with Page Factory
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;
    
    // Page elements
    @FindBy(id = "userName")
    private WebElement usernameField;
    
    @FindBy(id = "password")  
    private WebElement passwordField;
    
    @FindBy(xpath = "//button[text()='Submit']")
    private WebElement submitButton;
    
    // Constructor
    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }
    
    // Page actions
    public void enterUsername(String username) {
        usernameField.sendKeys(username);
    }
    
    public void enterPassword(String password) {
        passwordField.sendKeys(password);
    }
    
    public void clickSubmit() {
        submitButton.click();
    }
    
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickSubmit();
    }
}
```

#### 3. Playwright TypeScript
```typescript
// Generated Playwright test with modern selectors
import { test, expect, Page } from '@playwright/test';

test.describe('Login Page Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://example.com');
  });
  
  test('should login with valid credentials', async () => {
    // Fill login form
    await page.fill('#userName', 'testuser');
    await page.fill('#password', 'testpass');
    
    // Click submit button
    await page.click('button:has-text("Submit")');
    
    // Verify login success
    await expect(page.locator('.welcome-message')).toBeVisible();
  });
  
  test('should validate required fields', async () => {
    // Try to submit without filling fields
    await page.click('button:has-text("Submit")');
    
    // Check for validation messages
    await expect(page.locator('#userName')).toHaveAttribute('required');
    await expect(page.locator('#password')).toHaveAttribute('required');
  });
});
```

#### 4. Cypress JavaScript
```javascript
// Generated Cypress test with best practices
describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('https://example.com');
  });
  
  it('should login with valid credentials', () => {
    // Fill login form
    cy.get('#userName').type('testuser');
    cy.get('#password').type('testpass');
    
    // Submit form
    cy.get('button').contains('Submit').click();
    
    // Verify successful login
    cy.get('.welcome-message').should('be.visible');
    cy.url().should('include', '/dashboard');
  });
  
  it('should show validation errors for empty fields', () => {
    // Try to submit empty form
    cy.get('button').contains('Submit').click();
    
    // Check validation messages
    cy.get('#userName').should('have.attr', 'required');
    cy.get('#password').should('have.attr', 'required');
  });
  
  it('should handle invalid credentials', () => {
    // Enter invalid credentials
    cy.get('#userName').type('invaliduser');
    cy.get('#password').type('wrongpass');
    cy.get('button').contains('Submit').click();
    
    // Check error message
    cy.get('.error-message').should('contain', 'Invalid credentials');
  });
});
```

### Copy-to-Clipboard Feature

#### How to Use
1. **Select Framework**: Choose your preferred automation framework
2. **Review Code**: Generated code appears in the respective code block
3. **Copy Code**: Click the copy button (📋) in the top-right corner
4. **Paste & Use**: Paste directly into your IDE or test file

#### Code Customization Tips
- **Replace test data**: Update hardcoded values with your test data
- **Add assertions**: Include validation and verification steps
- **Error handling**: Add try-catch blocks for robust automation
- **Parameterization**: Convert hardcoded values to configurable parameters

---

## 🎯 Best Practices

### Locator Selection Guidelines

#### Priority Order for Locator Types
1. **🥇 Test Automation Attributes** (Highest Priority)
   ```html
   data-testid="submit-button"
   data-test="login-form"  
   data-cy="username-input"
   data-automation="navigation-menu"
   ```

2. **🥈 Unique ID Attributes**
   ```html
   id="userName"
   id="submit-btn"
   ```

3. **🥉 Name Attributes** (Form Elements)
   ```html
   name="email"
   name="password"
   ```

4. **🏅 Stable CSS Classes**
   ```html
   class="btn-primary"
   class="form-control"
   ```

5. **📍 XPath with Text** (When Appropriate)
   ```xpath
   //button[text()='Submit']
   //a[contains(text(), 'Login')]
   ```

#### Locator Stability Guidelines

**✅ DO Use:**
- Unique IDs and test attributes
- Semantic HTML elements
- Stable CSS classes
- Form field names
- Aria labels and roles

**❌ AVOID:**
- Position-based XPath (`//div[3]/span[2]`)
- Auto-generated class names (`class="css-1234xyz"`)
- Index-based selectors (`li:nth-child(5)`)
- Overly specific hierarchical paths
- Dynamic content identifiers

### Framework-Specific Best Practices

#### Selenium Best Practices
```python
# Use explicit waits instead of implicit waits
wait = WebDriverWait(driver, 10)
element = wait.until(EC.element_to_be_clickable((By.ID, "submit")))

# Prefer ID and name attributes
driver.find_element(By.ID, "userName")          # Best
driver.find_element(By.NAME, "email")           # Good  
driver.find_element(By.CLASS_NAME, "btn")       # OK
driver.find_element(By.XPATH, "//div[3]/span")  # Avoid

# Use Page Object Model for maintainability
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        
    def enter_username(self, username):
        self.driver.find_element(By.ID, "userName").send_keys(username)
```

#### Playwright Best Practices
```typescript
// Use built-in locator methods
await page.getByRole('button', { name: 'Submit' });     // Best
await page.getByTestId('submit-button');                // Excellent
await page.getByLabel('Username');                      // Good
await page.locator('#userName');                        // OK

// Use expect assertions with auto-waiting
await expect(page.getByText('Welcome')).toBeVisible();

// Prefer semantic locators
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
```

#### Cypress Best Practices
```javascript
// Use data-cy attributes for testing
cy.get('[data-cy="submit-button"]').click();    // Best

// Use contains() for text-based selection
cy.contains('button', 'Submit').click();        // Good

// Chain commands effectively
cy.get('#userName')
  .should('be.visible')
  .type('testuser')
  .should('have.value', 'testuser');

// Use aliases for reusable elements
cy.get('#loginForm').as('loginForm');
cy.get('@loginForm').find('[data-cy="username"]').type('user');
```

### Performance Optimization

#### Crawling Performance
- **Use Single Page Mode** for focused extraction
- **Filter Element Types** to reduce processing time
- **Limit Crawling Depth** for large websites
- **Monitor Memory Usage** during long crawls

#### Locator Performance
- **Prefer ID selectors** (fastest)
- **Avoid deep hierarchical selectors**
- **Use specific attributes** over generic classes
- **Test locator performance** in your automation framework

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot connect to Chrome browser"
```yaml
Problem: Puppeteer cannot launch Chrome
Solutions:
  - Check Chrome installation
  - Update Chrome to latest version
  - Run: npm install puppeteer --save
  - Try: npm install puppeteer-core --save
  - Linux: Install Chrome dependencies
    sudo apt-get install -y gconf-service libasound2-dev
```

#### 2. "Target URL not accessible"
```yaml
Problem: Website cannot be reached
Solutions:
  - Verify URL format (include http:// or https://)
  - Check internet connection
  - Try accessing URL manually in browser
  - Check for website blocking/firewall
  - Use "Test URL" feature (if available)
```

#### 3. "No locators found"
```yaml
Problem: Zero locators extracted
Possible Causes:
  - Website uses non-standard elements
  - All elements filtered out by type filters
  - JavaScript-heavy SPA not loading properly
  - Website requires authentication
  
Solutions:
  - Enable all element type filters
  - Try Single Page Mode first
  - Add authentication credentials
  - Increase wait time (modify backend timeout)
  - Check browser console for errors
```

#### 4. "Authentication failed"
```yaml
Problem: Login not working
Solutions:
  - Verify username/password are correct
  - Check login form field names/IDs
  - Try manual login in browser first
  - Use browser developer tools to inspect form
  - Some sites may require captcha/2FA
```

#### 5. "Memory issues during crawling"
```yaml
Problem: High memory usage or crashes
Solutions:
  - Use Single Page Mode for large sites
  - Reduce crawling depth
  - Filter element types to reduce processing
  - Close other applications to free memory
  - Restart the application
```

#### 6. "Slow performance"
```yaml
Problem: Crawling takes too long
Solutions:
  - Enable Single Page Mode
  - Reduce element type filters
  - Use faster internet connection
  - Limit crawling depth to 1-2 levels
  - Check target website performance
```

### Debugging Tips

#### Enable Debug Mode
```bash
# Backend debugging
cd backend
DEBUG=true npm start

# Check browser developer tools
# Open http://localhost:3000
# Press F12 and check Console tab
```

#### Logging and Diagnostics
```javascript
// Check backend logs in terminal
// Look for these patterns:
✅ "Successfully loaded page"
❌ "Navigation failed"  
⚠️  "Timeout warning"
🔍 "Found X locators"
```

### Getting Help

#### Before Reporting Issues
1. **Check this troubleshooting section**
2. **Try the suggested solutions**
3. **Test with a known working website** (e.g., https://demoqa.com)
4. **Collect error messages and logs**
5. **Note your system configuration**

#### Issue Reporting Template
```markdown
**System Information:**
- OS: Windows 10 / macOS Big Sur / Ubuntu 20.04
- Node.js version: 16.14.0
- Browser: Chrome 96.0.4664.110

**Issue Description:**
- What were you trying to do?
- What happened instead?
- Error messages (if any)

**Steps to Reproduce:**
1. Step one
2. Step two  
3. Step three

**Expected Behavior:**
What should have happened?

**Additional Context:**
Any other relevant information
```

---

## 🚀 Advanced Features

### Page Object Model (POM) Generation

#### Automatic POM File Creation
The tool automatically generates Page Object Model files for Selenium Java in the `backend/generatedPOMs/` directory.

```java
// Example generated POM file: LoginPagePOM.java
package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPagePOM {
    private WebDriver driver;
    
    @FindBy(id = "userName")
    private WebElement usernameField;
    
    @FindBy(id = "password")
    private WebElement passwordField;
    
    @FindBy(xpath = "//button[text()='Submit']")
    private WebElement submitButton;
    
    public LoginPagePOM(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }
    
    public void enterCredentials(String username, String password) {
        usernameField.sendKeys(username);
        passwordField.sendKeys(password);
    }
    
    public void clickSubmit() {
        submitButton.click();
    }
}
```

#### Using Generated POM Files
1. **Location**: Check `backend/generatedPOMs/` directory
2. **Integration**: Copy files to your Java project
3. **Dependencies**: Ensure Selenium WebDriver dependencies
4. **Customization**: Modify methods as needed for your tests

### API Integration

#### Direct API Usage
```javascript
// Call the backend API directly
const response = await fetch('http://localhost:5000/api/generate-locators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        url: 'https://example.com',
        singlePageMode: false,
        locatorFilters: {
            input: true,
            button: true,
            link: true
        }
    })
});

const data = await response.json();
console.log(data.summary); // Result summary
console.log(data.pageGroups); // Page-wise results
```

#### Integration with CI/CD
```yaml
# Example GitHub Actions workflow
name: Generate Locators
on: [push]
jobs:
  generate-locators:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd backend && npm install
      - name: Generate locators
        run: |
          cd backend && npm start &
          sleep 10
          curl -X POST http://localhost:5000/api/generate-locators \
            -H "Content-Type: application/json" \
            -d '{"url":"https://staging.example.com"}'
```

### Custom Configuration

#### Environment Variables
```bash
# Backend configuration
PORT=5000                    # Server port
TIMEOUT=30000               # Page timeout (ms)
MAX_DEPTH=3                 # Crawling depth
CONCURRENT_PAGES=3          # Parallel processing

# Browser configuration  
HEADLESS=true              # Run browser in headless mode
CHROME_PATH=/usr/bin/chrome # Custom Chrome path
```

#### Advanced Filtering
```javascript
// Custom locator filtering in backend
const advancedFilters = {
    // Minimum quality score (0-100)
    minQualityScore: 70,
    
    // Required attributes
    requiredAttributes: ['id', 'data-testid', 'name'],
    
    // Exclude patterns
    excludePatterns: [
        /^css-\w+$/,           // Auto-generated CSS classes
        /temp-\d+/,            // Temporary IDs
        /\btest\b/i            // Test-only elements
    ],
    
    // Interactive elements only
    interactiveOnly: true,
    
    // Unique elements only
    uniqueOnly: false
};
```

### Performance Monitoring

#### Execution Metrics
The tool provides detailed performance metrics:

```javascript
// Example performance data
{
    "executionTime": "23.4 seconds",
    "pagesProcessed": 8,
    "locatorsFound": 156,
    "processingRate": "6.8 locators/second",
    "memoryUsage": "245 MB peak",
    "successRate": "87.5%"
}
```

#### Performance Optimization Tips
- **Use Single Page Mode** for faster execution
- **Limit element types** to reduce processing
- **Optimize crawling depth** based on site structure
- **Monitor memory usage** for large websites
- **Use caching** for repeated crawls (future feature)

---

## 📞 Support and Community

### Getting Help
- **Documentation**: Read this guide thoroughly
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions and share experiences
- **Email Support**: Contact for enterprise support

### Contributing
- **Fork the repository** on GitHub
- **Create feature branches** for new functionality
- **Submit pull requests** with clear descriptions
- **Follow coding standards** and include tests
- **Update documentation** for new features

### License
This project is licensed under the MIT License. See LICENSE file for details.

---

*Last updated: December 2024*
*Version: 2.0.0*
