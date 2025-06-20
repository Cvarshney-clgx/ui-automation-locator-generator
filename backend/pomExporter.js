const fs = require('fs');
const path = require('path');
const { generatePOMFile } = require('./pomGenerator');

const exportPOMFiles = (results, outputDir = './generatedPOMs') => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir); // Create directory if not exists
    }

    if (!results || !Array.isArray(results)) {
        console.log('No results to export');
        return;
    }

    results.forEach((page, index) => {
        try {
            if (!page || !page.locators) {
                console.log(`Skipping page ${index}: No locators found`);
                return;
            }

            const pomCode = generatePOMFile(page.locators);
            
            // Generate safe filename
            let pageName = page.pageName || `Page_${index + 1}`;
            const safePageName = pageName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '');
            const fileName = `${safePageName || `Page${index + 1}`}POM.java`;
            const filePath = path.join(outputDir, fileName);

            fs.writeFileSync(filePath, pomCode);
            console.log(`POM file created: ${filePath}`);
        } catch (error) {
            console.error(`Error creating POM file for page ${index}:`, error.message);
        }
    });

    console.log(`POM files export process completed. Files saved to: ${outputDir}`);
};

module.exports = { exportPOMFiles };