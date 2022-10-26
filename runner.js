const puppeteer = require('puppeteer')
const fs = require('fs')
const {scrape} = require('./conjugator');

const nouns = [
    {
        deck: "Strong Verbs",
        urls: [
            'https://www.pealim.com/dict/2761-lichbod/',
            "https://www.pealim.com/dict/1-lichtov/",
            "https://www.pealim.com/dict/958-lehikatev/",
            "https://www.pealim.com/dict/960-lehitkatev/",
            "https://www.pealim.com/dict/959-lehachtiv/",
            "https://www.pealim.com/dict/2766-lechatev/"
        ]
    },
    {
        deck: "Verba Primae Laringalis",
        urls: [
            "https://www.pealim.com/dict/51-laavod/",
            "https://www.pealim.com/dict/6034-lehearetz/", // TODO ASK MARIE
            "https://www.pealim.com/dict/1437-lehaavid/",

            "https://www.pealim.com/dict/700-lachshov/",
            "https://www.pealim.com/dict/701-lehechashev/",
        ]
    },
    {
        deck: "Verba Mediae Laryngalis und Mediae R",
        urls: [
            "https://www.pealim.com/dict/266-lehitbarech/",
            "https://www.pealim.com/dict/39-lishol/",
            "https://www.pealim.com/dict/47-lehishaer/",
            "https://www.pealim.com/dict/265-levarech/",
            "https://www.pealim.com/dict/1029-lemaher/"
        ]
    },
//    {
//        deck: "Verba Tertiae Laryngalis",
//        urls: [],
//    },
//    {
//        deck: "Verba Primae Aleph",
//        urls: [],
//    },
//    {
//        deck: "Verba Primae Nun",
//        urls: [],
//    },
//    {
//        deck: "Verba Primae Jod Waw",
//        urls: [],
//    },
//    {
//        deck: "Halach",
//        urls: [],
//    },
//    {
//        deck: "Verba Mediae Geminatae",
//        urls: [],
//    },
//    {
//        deck: "Verba Mediae uio",
//        urls: [],
//    },
//    {
//        deck: "Verba tertiae Infirmae",
//        urls: [],
//    },
//    {
//        deck: "Verba tertiae Aleph",
//        urls: [],
//    }
];

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        args: ['--no-sandbox', '--disable-web-security', '--disable-features=site-per-process']
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1200, height: 800});

    await page.exposeFunction("scrape", scrape);

    for (const [index, {deck, urls}] of nouns.entries()) {
        console.log(deck)
        let data = [];

        for (const url of urls) {
            await page.goto(url);
            const pageData = await page.evaluate(scrape);
            console.log(`${url}: ${pageData.length}`)
            data = [...data, ...pageData]
        }

        const deckIndex = (index + 1).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })

        fs.writeFileSync(
            `results/${deck}.csv`,
            `#notetype:HebrewConjugations\n#deck:Hebrew Conjugations::${deckIndex} ${deck}\n${data.map(row => row.join(";"))
                .sort((a, b) => b.length - a.length)
                .join("\n")}`
        )
    }
    browser.close()
})()