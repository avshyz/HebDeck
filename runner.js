const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {scrape} = require('./conjugatorv2');

const urls = [
    {
        deck: "1. Strong Verbs",
        urls: [
            'https://www.pealim.com/dict/2761-lichbod/',
            "https://www.pealim.com/dict/1-lichtov/",
            "https://www.pealim.com/dict/958-lehikatev/",
            "https://www.pealim.com/dict/960-lehitkatev/",
            "https://www.pealim.com/dict/959-lehachtiv/",
            "https://www.pealim.com/dict/2766-lechatev/"
        ]
    }
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

    await Promise.all(urls.map(async ({deck, urls}) => {
        let data = [];

        for (const url of urls) {
            await page.goto(url);
            const pageData = await page.evaluate(scrape);
            console.log(`${url}: ${pageData.length}`)
            data = [...data, ...pageData]
        }

        fs.writeFileSync(
            `results/${deck.split(". ")[1]}.csv`,
            `#notetype:HebrewConjugations\n#deck:Hebrew Conjugations::${deck}\n${data.map(row => row.join(";"))
                .sort((a, b) => b.length - a.length)
                .join("\n")}`
        )
    }));

    browser.close()
})()