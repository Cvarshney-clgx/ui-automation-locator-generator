# 🤖 Installation & Setup Guide - AI-Powered UI Automation Locator Generator

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Quick Installation](#quick-installation)
3. [AI Engine Setup](#ai-engine-setup)
4. [Detailed Setup Instructions](#detailed-setup-instructions)
5. [Platform-Specific Setup](#platform-specific-setup)
6. [Docker Installation](#docker-installation)
7. [Configuration Options](#configuration-options)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)
11. [Upgrade Instructions](#upgrade-instructions)

---

## 💻 System Requirements

### **Minimum Requirements**
```yaml
Operating System:
  - Windows 10 (version 1903 or later)
  - macOS 10.14 (Mojave) or later
  - Ubuntu 18.04 LTS or later
  - CentOS 7 or later

Hardware:
  - CPU: 2+ cores (4+ recommended for AI processing)
  - RAM: 4GB minimum (8GB recommended for optimal AI performance)
  - Storage: 2GB free space
  - Network: Internet connection required

Software:
  - Node.js: Version 14.0 or later
  - npm: Version 6.0 or later (comes with Node.js)
  - Chrome/Chromium: Installed automatically via Puppeteer

AI Engine:
  - 🤖 Smart Locator Engine: Built-in (no additional dependencies)
  - Memory: Additional 1GB RAM recommended for AI processing
  - CPU: Multi-core recommended for parallel AI analysis
```

### **Recommended Requirements for Optimal AI Performance**
```yaml
Hardware:
  - CPU: 4+ cores for parallel AI processing
  - RAM: 8GB+ for handling large-scale AI analysis
  - SSD: For faster AI model loading and processing

AI Features:
  - 🤖 Rule-based AI Engine: Included (no external dependencies)
  - Confidence Scoring: Real-time AI confidence calculations
  - Multi-Framework Generation: AI-optimized code generation
  - Smart Fallbacks: AI-powered fallback system
Hardware:
  - CPU: 4+ cores (Intel i5/AMD Ryzen 5 or better)
  - RAM: 8GB+ (16GB for large-scale crawling)
  - Storage: 5GB+ SSD storage
  - Network: Stable broadband connection

Software:
  - Node.js: Latest LTS version (18.x or 20.x)
  - Modern browser: Chrome, Firefox, or Edge
  - Text editor: VS Code, WebStorm, or similar
```

### **Browser Compatibility**
```yaml
Supported Browsers (for UI):
  ✅ Google Chrome 90+
  ✅ Mozilla Firefox 88+
  ✅ Microsoft Edge 90+
  ✅ Safari 14+ (macOS)
  ✅ Opera 76+

Crawling Engine:
  - Uses Puppeteer with Chromium
  - Automatically installed
  - Headless Chrome for web crawling
```

---

## ⚡ Quick Installation

### **5-Minute Setup**
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ui-automation-locator-generator.git
cd ui-automation-locator-generator

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Start the application
# Terminal 1 (Backend)
cd ../backend && npm start

# Terminal 2 (Frontend) 
cd ../frontend && npm start

# 5. Open in browser
# http://localhost:3000
```

### **One-Line Installation Script**
```bash
# Windows (PowerShell)
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/yourusername/ui-automation-locator-generator/main/install.ps1'))

# macOS/Linux (Bash)
curl -fsSL https://raw.githubusercontent.com/yourusername/ui-automation-locator-generator/main/install.sh | bash
```

---

## 📖 Detailed Setup Instructions

### **Step 1: Install Node.js**

#### **Windows**
```powershell
# Option 1: Download from official website
# Visit: https://nodejs.org/en/download/
# Download Windows Installer (.msi)
# Run installer and follow wizard

# Option 2: Using Chocolatey
choco install nodejs

# Option 3: Using Scoop
scoop install nodejs

# Verify installation
node --version
npm --version
```

#### **macOS**
```bash
# Option 1: Download from official website
# Visit: https://nodejs.org/en/download/
# Download macOS Installer (.pkg)

# Option 2: Using Homebrew
brew install node

# Option 3: Using MacPorts
sudo port install nodejs18

# Verify installation
node --version
npm --version
```

#### **Ubuntu/Debian**
```bash
# Option 1: Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Option 2: Using Ubuntu repository
sudo apt update
sudo apt install nodejs npm

# Option 3: Using snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

#### **CentOS/RHEL/Fedora**
```bash
# Option 1: Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs npm

# Option 2: Using dnf (Fedora)
sudo dnf install nodejs npm

# Option 3: Using snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

### **Step 2: Clone the Repository**
```bash
# Using HTTPS
git clone https://github.com/yourusername/ui-automation-locator-generator.git

# Using SSH (if you have SSH keys configured)
git clone git@github.com:yourusername/ui-automation-locator-generator.git

# Using GitHub CLI
gh repo clone yourusername/ui-automation-locator-generator

# Navigate to project directory
cd ui-automation-locator-generator
```

### **Step 3: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Optional: Install global dependencies
npm install -g nodemon  # For development hot-reload

# Verify installation
npm list --depth=0

# Expected output should include:
# ├── express@4.18.2
# ├── puppeteer@21.6.1
# ├── cors@2.8.5
# └── body-parser@1.20.2
```

### **Step 4: Frontend Setup**
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Expected output should include:
# ├── react@18.2.0
# ├── @mui/material@5.14.18
# ├── @emotion/react@11.11.1
# └── @emotion/styled@11.11.0
```

### **Step 5: Environment Configuration**
```bash
# Backend configuration (create .env file)
cd ../backend
cat > .env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Browser Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=

# Crawling Configuration
DEFAULT_TIMEOUT=30000
MAX_CONCURRENT_PAGES=3
MAX_CRAWL_DEPTH=3

# Security Configuration
ENABLE_CORS=true
ALLOWED_ORIGINS=http://localhost:3000

# Debug Configuration
DEBUG_MODE=false
LOG_LEVEL=info
EOF

# Frontend configuration (create .env file)
cd ../frontend
cat > .env << 'EOF'
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=120000

# UI Configuration
REACT_APP_THEME=light
REACT_APP_ENABLE_DEBUG=false

# Feature Flags
REACT_APP_ENABLE_ADVANCED_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=false
EOF
```

---

## 🖥️ Platform-Specific Setup

### **Windows Setup**

#### **PowerShell Script**
```powershell
# create-setup.ps1
Write-Host "🚀 Setting up UI Automation Locator Generator for Windows" -ForegroundColor Green

# Check Node.js installation
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js version: $(node --version)" -ForegroundColor Green
Write-Host "✅ npm version: $(npm --version)" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "1. cd backend && npm start" -ForegroundColor White
Write-Host "2. cd frontend && npm start" -ForegroundColor White
```

#### **Windows Service Setup (Optional)**
```powershell
# install-service.ps1
# Install as Windows Service using node-windows

npm install -g node-windows

# Create service installation script
$serviceScript = @"
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'UI Locator Generator',
  description: 'UI Automation Locator Generator Backend Service',
  script: 'C:\\path\\to\\ui-automation-locator-generator\\backend\\server.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the 'install' event
svc.on('install',function(){
  svc.start();
});

// Install the service
svc.install();
"@

$serviceScript | Out-File -FilePath "install-service.js" -Encoding UTF8
node install-service.js
```

### **macOS Setup**

#### **Homebrew Installation Script**
```bash
#!/bin/bash
# macos-setup.sh

echo "🚀 Setting up UI Automation Locator Generator for macOS"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clone repository if not exists
if [ ! -d "ui-automation-locator-generator" ]; then
    echo "📂 Cloning repository..."
    git clone https://github.com/yourusername/ui-automation-locator-generator.git
    cd ui-automation-locator-generator
else
    cd ui-automation-locator-generator
    git pull origin main
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "🎉 Installation completed successfully!"
echo "To start the application:"
echo "1. cd backend && npm start"
echo "2. cd frontend && npm start"
```

#### **LaunchAgent Setup (Optional)**
```xml
<!-- ~/Library/LaunchAgents/com.locatorgenerator.backend.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.locatorgenerator.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/ui-automation-locator-generator/backend/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/ui-automation-locator-generator/backend</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/tmp/locatorgenerator.err</string>
    <key>StandardOutPath</key>
    <string>/tmp/locatorgenerator.out</string>
</dict>
</plist>
```

### **Linux Setup**

#### **Ubuntu/Debian Installation Script**
```bash
#!/bin/bash
# ubuntu-setup.sh

echo "🚀 Setting up UI Automation Locator Generator for Ubuntu/Debian"

# Update package list
sudo apt update

# Install required system packages
sudo apt install -y curl git build-essential

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chrome dependencies for Puppeteer
sudo apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clone and setup
if [ ! -d "ui-automation-locator-generator" ]; then
    git clone https://github.com/yourusername/ui-automation-locator-generator.git
    cd ui-automation-locator-generator
else
    cd ui-automation-locator-generator
    git pull origin main
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "🎉 Installation completed successfully!"
```

#### **Systemd Service Setup**
```ini
# /etc/systemd/system/locator-generator.service
[Unit]
Description=UI Automation Locator Generator Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/ui-automation-locator-generator/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=locator-generator
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable locator-generator
sudo systemctl start locator-generator
sudo systemctl status locator-generator
```

---

## 🐳 Docker Installation

### **Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm install --only=production
RUN cd frontend && npm install && npm run build

# Copy application code
COPY backend/ ./backend/
COPY frontend/build/ ./frontend/build/

# Set Chrome path for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "backend/server.js"]
```

### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  locator-generator:
    build: .
    ports:
      - "5000:5000"
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
    volumes:
      - ./generatedPOMs:/app/backend/generatedPOMs
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - locator-generator
    restart: unless-stopped
```

### **Docker Commands**
```bash
# Build and run with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Scale service
docker-compose up --scale locator-generator=3

# Stop services
docker-compose down

# Build standalone Docker image
docker build -t ui-locator-generator .

# Run standalone container
docker run -d \
  --name locator-generator \
  -p 5000:5000 \
  -v $(pwd)/generatedPOMs:/app/backend/generatedPOMs \
  ui-locator-generator
```

---

## ⚙️ Configuration Options

### **Backend Configuration**
```javascript
// backend/config.js
module.exports = {
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    cors: {
      enabled: process.env.ENABLE_CORS !== 'false',
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    }
  },

  // Browser settings
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  },

  // Crawling settings
  crawling: {
    timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 30000,
    maxConcurrentPages: parseInt(process.env.MAX_CONCURRENT_PAGES) || 3,
    maxDepth: parseInt(process.env.MAX_CRAWL_DEPTH) || 3,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3
  },

  // Output settings
  output: {
    directory: process.env.OUTPUT_DIRECTORY || './generatedPOMs',
    formats: ['java', 'json'],
    includeScreenshots: process.env.INCLUDE_SCREENSHOTS === 'true'
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    console: process.env.LOG_CONSOLE !== 'false'
  }
};
```

### **Frontend Configuration**
```javascript
// frontend/src/config.js
export const config = {
  // API settings
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 120000,
    retryAttempts: 3
  },

  // UI settings
  ui: {
    theme: process.env.REACT_APP_THEME || 'light',
    enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true',
    itemsPerPage: 20,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },

  // Feature flags
  features: {
    advancedFiltering: process.env.REACT_APP_ENABLE_ADVANCED_FEATURES !== 'false',
    analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    exportOptions: ['json', 'csv', 'excel']
  }
};
```

---

## ✅ Verification & Testing

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

echo "🔍 Running health checks..."

# Check Node.js installation
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm installation
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check backend dependencies
if [ -f "backend/package.json" ]; then
    cd backend
    if npm list --depth=0 &> /dev/null; then
        echo "✅ Backend dependencies installed"
    else
        echo "❌ Backend dependencies missing"
        exit 1
    fi
    cd ..
fi

# Check frontend dependencies
if [ -f "frontend/package.json" ]; then
    cd frontend
    if npm list --depth=0 &> /dev/null; then
        echo "✅ Frontend dependencies installed"
    else
        echo "❌ Frontend dependencies missing"
        exit 1
    fi
    cd ..
fi

# Test backend server
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
sleep 10

# Test API endpoint
if curl -f http://localhost:5000/health &> /dev/null; then
    echo "✅ Backend API responding"
else
    echo "❌ Backend API not responding"
    kill $BACKEND_PID
    exit 1
fi

# Cleanup
kill $BACKEND_PID
echo "🎉 All health checks passed!"
```

### **Test API Endpoints**
```bash
# Test basic functionality
curl -X POST http://localhost:5000/api/test-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/get"}'

# Test locator generation
curl -X POST http://localhost:5000/api/generate-locators \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/forms/post",
    "singlePageMode": true,
    "locatorFilters": {
      "input": true,
      "button": true
    }
  }'
```

### **Unit Tests**
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd ../frontend
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

---

## 🔧 Troubleshooting

### **Common Installation Issues**

#### **Node.js Version Issues**
```bash
# Check Node.js version
node --version

# If version is too old, update:
# Windows (using nvm-windows)
nvm install lts
nvm use lts

# macOS/Linux (using nvm)
nvm install --lts
nvm use --lts
```

#### **Permission Issues (Linux/macOS)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npx instead of global installs
npx create-react-app my-app
```

#### **Puppeteer Installation Issues**
```bash
# Skip Chromium download if issues
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer

# Use system Chrome
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
# or on macOS:
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

#### **Port Already in Use**
```bash
# Check what's using port 5000
lsof -i :5000

# Kill process using port
kill -9 $(lsof -t -i:5000)

# Or use different port
PORT=5001 npm start
```

### **Browser Issues**
```bash
# Install Chrome dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
  libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
  libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release \
  xdg-utils wget

# For CentOS/RHEL
sudo yum install -y \
  alsa-lib atk cups-libs gtk3 ipa-gothic-fonts \
  libXcomposite libXcursor libXdamage libXext \
  libXi libXrandr libXScrnSaver libXtst nss xorg-x11-fonts-100dpi \
  xorg-x11-fonts-75dpi xorg-x11-fonts-cyrillic \
  xorg-x11-fonts-misc xorg-x11-fonts-Type1 xorg-x11-utils
```

### **Memory Issues**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm start

# Or in package.json
"scripts": {
  "start": "node --max-old-space-size=4096 server.js"
}
```

---

## 🚀 Production Deployment

### **Environment Setup**
```bash
# Production environment variables
export NODE_ENV=production
export PORT=5000
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
export MAX_CONCURRENT_PAGES=5
export DEFAULT_TIMEOUT=45000

# Security settings
export ENABLE_CORS=true
export ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"

# Logging
export LOG_LEVEL=warn
export LOG_FILE=/var/log/locator-generator/app.log
```

### **Production Build**
```bash
# Build frontend for production
cd frontend
npm run build

# Install only production dependencies
cd ../backend
npm install --only=production

# Use PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "locator-generator" -i max

# Set up PM2 startup script
pm2 startup
pm2 save
```

### **Performance Tuning**
```javascript
// backend/server.js production optimizations
if (process.env.NODE_ENV === 'production') {
  // Enable compression
  app.use(require('compression')());
  
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Rate limiting
  const rateLimit = require('express-rate-limit');
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }));
}
```

---

## 🔄 Upgrade Instructions

### **Upgrading from v1.x to v2.x**
```bash
# Backup current installation
cp -r ui-automation-locator-generator ui-automation-locator-generator-backup

# Pull latest changes
cd ui-automation-locator-generator
git fetch origin
git checkout main
git pull origin main

# Update dependencies
cd backend && npm update
cd ../frontend && npm update

# Run migration script (if available)
npm run migrate

# Restart services
pm2 restart all
```

### **Version Compatibility**
```yaml
Version 2.0.0+:
  - Node.js 14+ required
  - Breaking changes in API response format
  - New environment variables added
  - Updated UI components

Version 1.x:
  - Legacy support until Dec 2024
  - Security updates only
  - Migration guide available
```

---

## 📞 Support

### **Getting Help**
- 📖 **Documentation**: Read all documentation files
- 🐛 **GitHub Issues**: Report bugs and feature requests  
- 💬 **Discussions**: Community support and questions
- 📧 **Email**: enterprise-support@yourdomain.com

### **Enterprise Support**
- 🎯 **Priority Support**: Dedicated support team
- 🚀 **Custom Features**: Tailored implementations
- 🔧 **Professional Services**: Setup and maintenance
- 📈 **SLA Guarantees**: Uptime and response guarantees

---

*Installation & Setup Guide v2.0.0*  
*Last Updated: December 2024*
