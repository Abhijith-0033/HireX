const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots', 'admin');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

const url = 'http://localhost:5173';

const routes = [
    { name: '01_Dashboard', path: '/admin/dashboard' },
    { name: '02_User_Management', path: '/admin/users' },
    { name: '03_Job_Management', path: '/admin/jobs' },
    { name: '04_Application_Management', path: '/admin/applications' },
    { name: '05_Themes', path: '/admin/settings/themes' }
];

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('Starting browser...');
        console.log('Navigating to login...');
        await page.goto(`${url}/login`, { waitUntil: 'networkidle2' });

        console.log('Logging in as Admin...');
        await page.type('input[type="email"]', 'admin@gmail.com');
        await page.type('input[type="password"]', 'admin@123');

        const loginBtnSelector = 'button[type="submit"]';
        await page.waitForSelector(loginBtnSelector);
        await page.click(loginBtnSelector);

        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Login successful. Taking screenshots...');

        for (const route of routes) {
            console.log(`Navigating to ${route.name}...`);
            await page.goto(`${url}${route.path}`, { waitUntil: 'networkidle2' });

            console.log(`Waiting 10 seconds for ${route.name} to fully render...`);
            await new Promise(r => setTimeout(r, 10000));

            console.log(`Taking viewport screenshot of ${route.name}...`);
            await page.screenshot({ path: path.join(screenshotDir, `${route.name}.png`) });
        }

        console.log('All Admin screenshots captured successfully in /screenshots/admin folder!');

    } catch (error) {
        console.error('Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
})();
