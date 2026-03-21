const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots', 'job provider');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

const url = 'http://localhost:5173';

const routes = [
    { name: '01_Dashboard', path: '/provider/dashboard' },
    { name: '02_Job_Posting', path: '/provider/post-job' },
    { name: '03_Jobs_List', path: '/provider/jobs' },
    { name: '04_Applicants', path: '/provider/applicants' },
    { name: '05_AI_Tools', path: '/provider/ai-tools' },
    { name: '06_Auto_Shortlist', path: '/provider/ai-tools/auto-shortlist' },
    { name: '07_Interview_Scheduler', path: '/provider/ai-tools/interview-scheduler' },
    { name: '08_Company_Profile', path: '/provider/company' },
    { name: '09_Interviews', path: '/provider/interviews' },
    { name: '10_Tests', path: '/provider/tests' },
    { name: '11_Coding_Tests', path: '/provider/coding-tests' },
    { name: '12_Themes', path: '/provider/settings/themes' }
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

        console.log('Logging in as Job Provider...');
        await page.type('input[type="email"]', 'demo@example.com');
        await page.type('input[type="password"]', '12345678');

        // Find and click the login button
        const loginBtnSelector = 'button[type="submit"]';
        await page.waitForSelector(loginBtnSelector);
        await page.click(loginBtnSelector);

        // Wait for navigation after login
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

        console.log('All Provider screenshots captured successfully in /screenshots/job provider folder!');

    } catch (error) {
        console.error('Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
})();
