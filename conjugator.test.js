const puppeteer = require('puppeteer')
const {scrape} = require('./conjugator');

describe('Conjugator', function () {
    let browser;
    let page;
    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true,
            devtools: true,
            args: ['--no-sandbox', '--disable-web-security', '--disable-features=site-per-process']
        })
        page = await browser.newPage()
        await page.setViewport({width: 1200, height: 800});

        await page.exposeFunction("scrape", scrape);
    })

    test('Handle Exclamation Marks', async () => {
        const url = "https://www.pealim.com/dict/2222-lehishtaleach/"

        await page.goto(url);
        const pageData = await page.evaluate(scrape);

        expect(pageData).toEqual([])

    });

    afterAll(() => browser.close())

});
