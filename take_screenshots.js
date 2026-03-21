const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots', 'job seeker');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

const url = 'http://localhost:5173';
const email = 'noname@gmail.com';
const password = '87654321';

const routes = [
    { path: '/user/dashboard', name: '01_Dashboard' },
    { path: '/user/profile', name: '02_Profile' },
    { path: '/user/jobs', name: '03_Jobs' },
    { path: '/user/jobs-india', name: '04_Jobs_India' },
    { path: '/user/ai-actions', name: '05_AI_Actions' },
    { path: '/user/ai-actions/recommended-jobs', name: '06_Recommended_Jobs' },
    { path: '/user/applications', name: '07_Applications' },
    { path: '/user/interviews', name: '08_Interviews' },
    { path: '/user/tests', name: '09_Tests' },
    { path: '/user/coding-tests', name: '10_Coding_Tests' },
    { path: '/user/settings/themes', name: '11_Themes' }
];

(async () => {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();

    try {
        // Login
        console.log('Navigating to login...');
        await page.goto(`${url}/login`, { waitUntil: 'networkidle2' });

        // Fill credentials
        console.log('Logging in...');
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Click submit and wait for navigation
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
            page.click('button[type="submit"]')
        ]);

        console.log('Login successful. Taking screenshots...');

        for (const route of routes) {
            console.log(`Navigating to ${route.name}...`);
            await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle2' });

            console.log(`Waiting 10 seconds for ${route.name} to fully render...`);
            await new Promise(r => setTimeout(r, 10000));

            console.log(`Taking viewport screenshot of ${route.name}...`);
            await page.screenshot({ path: path.join(screenshotDir, `${route.name}.png`) });
        }

        console.log('All screenshots captured successfully in /screenshots folder!');
    } catch (error) {
        console.error('Error during screenshot process:', error);
    } finally {
        await browser.close();
    }
})();
