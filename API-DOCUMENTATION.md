# 🤖 API Documentation - AI-Powered UI Automation Locator Generator

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [🤖 AI Engine Endpoints](#-ai-engine-endpoints)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
5. [Request/Response Formats](#requestresponse-formats)
6. [AI-Enhanced Responses](#ai-enhanced-responses)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)
9. [Rate Limiting](#rate-limiting)
10. [Integration Guide](#integration-guide)

---

## 🌐 API Overview

### Base URL
```
http://localhost:5000/api
```

### Content Type
```
Content-Type: application/json
```

### HTTP Methods
- `POST` - Generate AI-powered locators
- `POST` - AI locator enhancement
- `GET` - Health check and AI status

### 🤖 AI Features
- **Intelligent Strategy Selection**: AI chooses optimal locator strategies
- **Confidence Scoring**: 0.0-1.0 confidence ratings for each recommendation
- **Multi-Framework Code Generation**: AI-optimized code for 4+ frameworks
- **Smart Fallbacks**: AI-powered fallback system for robust operation

---

## 🤖 AI Engine Endpoints

### AI Strategy Analysis
**Endpoint:** `POST /api/ai/analyze-element`
**Description:** Get AI recommendation for a single element

### AI Batch Enhancement  
**Endpoint:** `POST /api/ai/enhance-batch`
**Description:** Enhance multiple locators with AI recommendations

### AI Performance Metrics
**Endpoint:** `GET /api/ai/metrics`
**Description:** Get AI engine performance statistics

---

## 🔐 Authentication

Currently, the API does not require authentication for local usage. However, for production deployments, consider implementing:

- API Keys
- JWT tokens  
- Rate limiting by IP
- CORS configuration

---

## 🛠️ Endpoints

### 1. 🤖 AI-Powered Generate Locators

**Endpoint:** `POST /api/generate-locators`

**Description:** Extracts automation locators from a target website using AI-powered strategy selection

#### Request Body
```json
{
  "url": "https://example.com",
  "username": "optional_username",
  "password": "optional_password", 
  "singlePageMode": false,
  "locatorFilters": {
    "input": true,
    "button": true,
    "link": true,
    "select": true,
    "textarea": true,
    "checkbox": true,
    "radio": true,
    "form": true
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | ✅ Yes | - | Target website URL (must include protocol) |
| `username` | string | ❌ No | "" | Username for authentication (optional) |
| `password` | string | ❌ No | "" | Password for authentication (optional) |
| `singlePageMode` | boolean | ❌ No | false | If true, only crawl the specified URL |
| `locatorFilters` | object | ❌ No | all enabled | Element types to extract |

#### Locator Filters Object
```json
{
  "input": true,        // Text inputs, email, number fields
  "button": true,       // Buttons and submit elements
  "link": true,         // Anchor tags and navigation links
  "select": true,       // Dropdown menus and select elements
  "textarea": true,     // Multi-line text areas
  "checkbox": true,     // Checkbox input elements
  "radio": true,        // Radio button input elements
  "form": true          // Form container elements
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Found 156 quality locators across 8 pages. POM Files generated and saved at ./generatedPOMs",
  "data": [...],           // Flat array of locators (backward compatibility)
  "pageGroups": [...],     // Locators grouped by page
  "summary": {
    "totalPages": 8,
    "totalLocators": 156,
    "interactiveElements": 139,
    "uniqueElements": 104,
    "pagesWithLocators": 8
  },
  "results": [...]         // Original crawl results (for debugging)
}
```

#### Detailed Response Structure

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Found 156 quality locators across 8 pages. POM Files generated and saved at ./generatedPOMs",
  "data": [
    {
      "pageName": "Login Page",
      "pageUrl": "https://example.com/login",
      "description": "Username input field",
      "type": "id",
      "value": "userName",
      "xpath": "//*[@id='userName']",
      "cssSelector": "#userName",
      "isInteractive": true,
      "isUnique": true,
      "depth": 1,
      "element": {
        "tag": "input",
        "id": "userName",
        "name": "username",
        "class": "form-control",
        "testId": null,
        "type": "text",
        "placeholder": "Enter username",
        "role": null,
        "ariaLabel": "Username"
      }
    }
  ],
  "pageGroups": [
    {
      "pageName": "Login Page",
      "pageUrl": "https://example.com/login",
      "depth": 1,
      "locators": [
        {
          "pageName": "Login Page",
          "pageUrl": "https://example.com/login",
          "description": "Username input field",
          "type": "id",
          "value": "userName",
          "xpath": "//*[@id='userName']",
          "cssSelector": "#userName",
          "isInteractive": true,
          "isUnique": true,
          "depth": 1,
          "element": {
            "tag": "input",
            "id": "userName",
            "name": "username",
            "class": "form-control",
            "testId": null,
            "type": "text",
            "placeholder": "Enter username",
            "role": null,
            "ariaLabel": "Username"
          }
        }
      ]
    }
  ],
  "summary": {
    "totalPages": 8,
    "totalLocators": 156,
    "interactiveElements": 139,
    "uniqueElements": 104,
    "pagesWithLocators": 8
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid URL format. Please include protocol (http:// or https://)"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to extract locators: Navigation timeout"
}
```

---

### 2. Enhance Locators with AI

**Endpoint:** `POST /api/enhance-locators`

**Description:** Uses the Smart Locator Engine to provide AI-powered locator enhancements and strategy recommendations

#### Request Body
```json
{
  "locators": [
    {
      "pageName": "Login Page",
      "pageUrl": "https://example.com/login",  
      "description": "Username input field",
      "type": "css",
      "value": "#userName",
      "isInteractive": true,
      "isUnique": true,
      "element": {
        "tag": "input",
        "id": "userName",
        "name": "username",
        "class": "form-control",
        "testId": "user-input",
        "type": "text",
        "placeholder": "Enter username"
      }
    }
  ]
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Enhanced 1 locators with AI recommendations",
  "enhancedLocators": [
    {
      "original": {
        "pageName": "Login Page",
        "description": "Username input field",
        "type": "css",
        "value": "#userName"
      },
      "aiRecommendation": {
        "strategy": "TEST_ID",
        "confidence": 1.000,
        "probabilities": [
          { "strategy": "TEST_ID", "confidence": 1.000 },
          { "strategy": "ID", "confidence": 0.857 },
          { "strategy": "NAME", "confidence": 0.769 },
          { "strategy": "CLASS", "confidence": 0.750 }
        ]
      },
      "optimizedLocators": [
        {
          "type": "TEST_ID",
          "value": "[data-testid=\"user-input\"]",
          "selenium": "By.cssSelector(\"[data-testid='user-input']\")",
          "playwright": "page.getByTestId('user-input')",
          "cypress": "cy.get('[data-testid=\"user-input\"]')",
          "priority": 1,
          "confidence": 1.000
        },
        {
          "type": "ID", 
          "value": "#userName",
          "selenium": "By.id(\"userName\")",
          "playwright": "page.locator('#userName')",
          "cypress": "cy.get('#userName')",
          "priority": 1,
          "confidence": 0.857
        }
      ],
      "bestLocator": {
        "type": "TEST_ID",
        "value": "[data-testid=\"user-input\"]",
        "confidence": 1.000
      }
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to enhance locators with AI recommendations",
  "message": "Invalid locator data format"
}
```

---

### 3. Test URL Accessibility

**Endpoint:** `POST /api/test-url`

**Description:** Tests if a URL is accessible before crawling

#### Request Body
```json
{
  "url": "https://example.com"
}
```

#### Response Format
```json
{
  "success": true,
  "url": "https://example.com",
  "accessible": true,
  "statusCode": 200,
  "headers": {
    "content-type": "text/html; charset=utf-8",
    "server": "nginx/1.18.0"
  }
}
```

---

## 📝 Request/Response Formats

### Locator Object Structure
```json
{
  "pageName": "string",           // Human-readable page name
  "pageUrl": "string",            // Full URL of the page
  "description": "string",        // Element description
  "type": "string",               // Locator type: "id", "css", "xpath", "name", "testId"
  "value": "string",              // Locator value/selector
  "xpath": "string|null",         // XPath expression (if available)
  "cssSelector": "string|null",   // CSS selector (if available)
  "isInteractive": "boolean",     // Whether element is interactive
  "isUnique": "boolean",          // Whether locator is unique on page
  "depth": "number",              // Page crawling depth (0 = starting page)
  "element": {
    "tag": "string",              // HTML tag name
    "id": "string|null",          // Element ID attribute
    "name": "string|null",        // Element name attribute
    "class": "string|null",       // Element class attribute
    "testId": "string|null",      // Test automation attributes
    "type": "string|null",        // Input type (for input elements)
    "placeholder": "string|null", // Placeholder text
    "role": "string|null",        // ARIA role
    "ariaLabel": "string|null"    // ARIA label
  }
}
```

### Summary Object Structure
```json
{
  "totalPages": "number",         // Total pages crawled
  "totalLocators": "number",      // Total locators found
  "interactiveElements": "number", // Count of interactive elements
  "uniqueElements": "number",     // Count of elements with unique identifiers
  "pagesWithLocators": "number"   // Count of pages that had locators
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| HTTP Code | Error Type | Description |
|-----------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 500 | Internal Server Error | Server-side processing error |
| 503 | Service Unavailable | Server overloaded or maintenance |

### Error Response Structure
```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE",         // Optional error code
  "details": {                  // Optional additional details
    "url": "https://example.com",
    "timestamp": "2024-12-07T10:30:00Z"
  }
}
```

### Common Error Messages

#### URL-related Errors
```json
{ "success": false, "error": "URL is required" }
{ "success": false, "error": "Invalid URL format. Please include protocol (http:// or https://)" }
{ "success": false, "error": "URL not accessible: Connection timeout" }
```

#### Authentication Errors
```json
{ "success": false, "error": "Authentication failed: Invalid credentials" }
{ "success": false, "error": "Login form not found on page" }
```

#### Processing Errors
```json
{ "success": false, "error": "Navigation timeout after 45 seconds" }
{ "success": false, "error": "Browser connection lost - protocol error detected" }
{ "success": false, "error": "Page failed to load: ERR_NAME_NOT_RESOLVED" }
```

---

## 💻 Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function generateLocators(url, options = {}) {
  try {
    const response = await axios.post('http://localhost:5000/api/generate-locators', {
      url: url,
      singlePageMode: options.singlePageMode || false,
      username: options.username || '',
      password: options.password || '',
      locatorFilters: options.filters || {
        input: true,
        button: true,
        link: true,
        select: true,
        textarea: true,
        checkbox: true,
        radio: true,
        form: true
      }
    });

    if (response.data.success) {
      console.log(`Found ${response.data.summary.totalLocators} locators`);
      return response.data;
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error('Error generating locators:', error.message);
    throw error;
  }
}

// Usage examples
generateLocators('https://demoqa.com')
  .then(result => {
    console.log('Summary:', result.summary);
    console.log('Page Groups:', result.pageGroups.length);
  })
  .catch(error => console.error(error));

// Single page mode with specific filters
generateLocators('https://example.com/login', {
  singlePageMode: true,
  filters: {
    input: true,
    button: true,
    link: false,
    select: false,
    textarea: false,
    checkbox: false,
    radio: false,
    form: true
  }
});
```

### Python
```python
import requests
import json

class LocatorGenerator:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
    
    def generate_locators(self, url, single_page_mode=False, username='', password='', filters=None):
        """Generate locators for a given URL"""
        
        if filters is None:
            filters = {
                'input': True,
                'button': True,
                'link': True,
                'select': True,
                'textarea': True,
                'checkbox': True,
                'radio': True,
                'form': True
            }
        
        payload = {
            'url': url,
            'singlePageMode': single_page_mode,
            'username': username,
            'password': password,
            'locatorFilters': filters
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/api/generate-locators',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=120  # 2 minutes timeout
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('success'):
                return result
            else:
                raise Exception(result.get('error', 'Unknown error'))
                
        except requests.exceptions.RequestException as e:
            raise Exception(f'Request failed: {str(e)}')
    
    def test_url(self, url):
        """Test if URL is accessible"""
        try:
            response = requests.post(
                f'{self.base_url}/api/test-url',
                json={'url': url},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': str(e)}

# Usage examples
generator = LocatorGenerator()

# Basic usage
result = generator.generate_locators('https://demoqa.com')
print(f"Found {result['summary']['totalLocators']} locators")

# Single page mode with authentication
result = generator.generate_locators(
    url='https://secure-site.com/login',
    single_page_mode=True,
    username='testuser',
    password='testpass',
    filters={
        'input': True,
        'button': True,
        'form': True,
        'link': False,
        'select': False,
        'textarea': False,
        'checkbox': False,
        'radio': False
    }
)

# Print results
for page_group in result['pageGroups']:
    print(f"\nPage: {page_group['pageName']}")
    print(f"URL: {page_group['pageUrl']}")
    print(f"Locators: {len(page_group['locators'])}")
    
    for locator in page_group['locators'][:5]:  # Show first 5
        print(f"  - {locator['type']}: {locator['value']} ({locator['description']})")
```

### cURL
```bash
# Basic locator generation
curl -X POST http://localhost:5000/api/generate-locators \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demoqa.com",
    "singlePageMode": false,
    "locatorFilters": {
      "input": true,
      "button": true,
      "link": true,
      "select": true,
      "textarea": true,
      "checkbox": true,
      "radio": true,
      "form": true
    }
  }'

# Single page mode with authentication
curl -X POST http://localhost:5000/api/generate-locators \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/login",
    "username": "testuser",
    "password": "testpass",
    "singlePageMode": true,
    "locatorFilters": {
      "input": true,
      "button": true,
      "form": true,
      "link": false,
      "select": false,
      "textarea": false,
      "checkbox": false,
      "radio": false
    }
  }'

# Test URL accessibility
curl -X POST http://localhost:5000/api/test-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### PowerShell (Windows)
```powershell
# PowerShell function to generate locators
function Invoke-LocatorGenerator {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Url,
        
        [bool]$SinglePageMode = $false,
        [string]$Username = "",
        [string]$Password = "",
        [hashtable]$Filters = @{
            input = $true
            button = $true  
            link = $true
            select = $true
            textarea = $true
            checkbox = $true
            radio = $true
            form = $true
        }
    )
    
    $body = @{
        url = $Url
        singlePageMode = $SinglePageMode
        username = $Username
        password = $Password
        locatorFilters = $Filters
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/generate-locators" `
                                    -Method Post `
                                    -Body $body `
                                    -ContentType "application/json" `
                                    -TimeoutSec 120
        
        if ($response.success) {
            Write-Host "✅ Found $($response.summary.totalLocators) locators across $($response.summary.totalPages) pages"
            return $response
        } else {
            Write-Error "❌ Error: $($response.error)"
        }
    }
    catch {
        Write-Error "❌ Request failed: $($_.Exception.Message)"
    }
}

# Usage examples
$result = Invoke-LocatorGenerator -Url "https://demoqa.com"

# Single page with specific filters
$filters = @{
    input = $true
    button = $true
    form = $true
    link = $false
    select = $false
    textarea = $false
    checkbox = $false
    radio = $false
}

$result = Invoke-LocatorGenerator -Url "https://example.com" `
                                -SinglePageMode $true `
                                -Filters $filters

# Display results
$result.pageGroups | ForEach-Object {
    Write-Host "`nPage: $($_.pageName)"
    Write-Host "Locators: $($_.locators.Length)"
    $_.locators | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.type): $($_.value)"
    }
}
```

---

## 🚦 Rate Limiting

### Current Limits
- **No rate limiting** for local development
- **Concurrent requests**: Limited by server resources
- **Request timeout**: 120 seconds maximum

### Production Recommendations
```javascript
// Recommended rate limiting for production
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

---

## 🔗 Integration Guide

### CI/CD Integration

#### GitHub Actions
```yaml
name: Generate UI Locators
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  generate-locators:
    runs-on: ubuntu-latest
    
    services:
      locator-generator:
        image: node:16
        ports:
          - 5000:5000
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd backend
        npm install
    
    - name: Start locator generator
      run: |
        cd backend
        npm start &
        sleep 30
    
    - name: Generate locators
      run: |
        curl -X POST http://localhost:5000/api/generate-locators \
          -H "Content-Type: application/json" \
          -d '{"url":"${{ secrets.STAGING_URL }}","singlePageMode":false}' \
          -o locators.json
    
    - name: Upload results
      uses: actions/upload-artifact@v2
      with:
        name: generated-locators
        path: locators.json
```

#### Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                script {
                    // Start locator generator service
                    sh '''
                        cd backend
                        npm install
                        npm start &
                        sleep 30
                    '''
                }
            }
        }
        
        stage('Generate Locators') {
            steps {
                script {
                    def response = sh(
                        script: '''
                            curl -X POST http://localhost:5000/api/generate-locators \
                              -H "Content-Type: application/json" \
                              -d '{"url":"${STAGING_URL}","singlePageMode":false}' \
                              -s
                        ''',
                        returnStdout: true
                    )
                    
                    writeFile file: 'locators.json', text: response
                    archiveArtifacts artifacts: 'locators.json'
                }
            }
        }
    }
}
```

### Docker Integration
```dockerfile
# Dockerfile for API service
FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copy application code
COPY backend/ .

# Set Chrome path for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 5000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  locator-generator-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./generatedPOMs:/app/generatedPOMs
    restart: unless-stopped
```

### Webhook Integration
```javascript
// Express webhook endpoint
app.post('/webhook/generate-locators', async (req, res) => {
    const { url, callback_url } = req.body;
    
    try {
        // Generate locators asynchronously
        const result = await generateLocatorsForApp({ url });
        
        // Send results to callback URL
        if (callback_url) {
            await axios.post(callback_url, result);
        }
        
        res.json({ success: true, message: 'Locator generation started' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

---

## 📊 API Response Examples

### Successful Single Page Response
```json
{
  "success": true,
  "message": "Found 12 quality locators across 1 pages. POM Files generated and saved at ./generatedPOMs",
  "data": [
    {
      "pageName": "Login Page",
      "pageUrl": "https://example.com/login",
      "description": "Username input field",
      "type": "id",
      "value": "userName",
      "xpath": "//*[@id='userName']",
      "cssSelector": "#userName",
      "isInteractive": true,
      "isUnique": true,
      "depth": 0,
      "element": {
        "tag": "input",
        "id": "userName",
        "name": "username",
        "class": "form-control",
        "testId": null,
        "type": "text",
        "placeholder": "Enter username",
        "role": null,
        "ariaLabel": "Username"
      }
    }
  ],
  "pageGroups": [
    {
      "pageName": "Login Page", 
      "pageUrl": "https://example.com/login",
      "depth": 0,
      "locators": [
        // ... locator objects
      ]
    }
  ],
  "summary": {
    "totalPages": 1,
    "totalLocators": 12,
    "interactiveElements": 12,
    "uniqueElements": 8,
    "pagesWithLocators": 1
  }
}
```

### Multi-Page Response
```json
{
  "success": true,
  "message": "Found 156 quality locators across 8 pages. POM Files generated and saved at ./generatedPOMs",
  "summary": {
    "totalPages": 8,
    "totalLocators": 156,
    "interactiveElements": 139,
    "uniqueElements": 104,
    "pagesWithLocators": 8
  },
  "pageGroups": [
    {
      "pageName": "Home Page",
      "pageUrl": "https://demoqa.com/",
      "depth": 0,
      "locators": [
        // ... 23 locators
      ]
    },
    {
      "pageName": "Elements",
      "pageUrl": "https://demoqa.com/elements",
      "depth": 1,
      "locators": [
        // ... 18 locators
      ]
    }
    // ... more page groups
  ]
}
```

---

## 🔍 Advanced Usage

### Batch Processing
```javascript
const urls = [
    'https://example.com/page1',
    'https://example.com/page2', 
    'https://example.com/page3'
];

async function batchGenerateLocators(urls) {
    const results = [];
    
    for (const url of urls) {
        try {
            const result = await generateLocators(url, { singlePageMode: true });
            results.push({ url, success: true, data: result });
        } catch (error) {
            results.push({ url, success: false, error: error.message });
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
}
```

### Custom Post-Processing
```javascript
function processLocatorResults(apiResponse) {
    const { data, pageGroups } = apiResponse;
    
    // Filter high-quality locators only
    const highQualityLocators = data.filter(locator => 
        locator.isUnique && locator.isInteractive
    );
    
    // Group by element type
    const byElementType = highQualityLocators.reduce((acc, locator) => {
        const elementType = locator.element.tag;
        if (!acc[elementType]) acc[elementType] = [];
        acc[elementType].push(locator);
        return acc;
    }, {});
    
    // Generate framework-specific code
    const seleniumCode = generateSeleniumCode(highQualityLocators);
    const playwrightCode = generatePlaywrightCode(highQualityLocators);
    
    return {
        summary: apiResponse.summary,
        locatorsByType: byElementType,
        generatedCode: {
            selenium: seleniumCode,
            playwright: playwrightCode
        }
    };
}
```

---

## 📞 Support

### API Issues
- Check server logs for detailed error information
- Verify all required parameters are provided
- Test with known working URLs (e.g., https://demoqa.com)
- Ensure proper JSON formatting in requests

### Performance Issues
- Use `singlePageMode: true` for faster responses
- Limit `locatorFilters` to required element types only
- Consider implementing request caching for repeated calls
- Monitor server resources during high-volume usage

### Integration Support
- Refer to the code examples above
- Check CORS settings for browser-based requests
- Implement proper error handling and retries
- Use appropriate timeouts for your use case

---

*API Documentation v2.0.0*  
*Last Updated: December 2024*
