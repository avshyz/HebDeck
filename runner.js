const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {scrape} = require('./conjugatorv2');

const urls = [
    "https://www.pealim.com/dict/1-lichtov/",
    'https://www.pealim.com/dict/2761-lichbod/'
];

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--user-data-dir="/tmp/chromium"', '--disable-web-security', '--disable-features=site-per-process']
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1200, height: 800});

    await page.exposeFunction("scrape", scrape);

//    await page.goto('https://www.pealim.com/dict/1-lichtov/')
    await page.goto('https://www.pealim.com/dict/2761-lichbod/')
    const data = await page.evaluate(scrape);
    console.log(data);

    fs.writeFileSync(
        "result.csv",
        data.map(row => row.join(";"))
            .sort((a, b) => b.length - a.length)
            .join("\n")
    )

    browser.close()
})()