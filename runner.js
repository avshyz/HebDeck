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
        deck: "Verba Primae Laryngalis",
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
    {
        deck: "Verba Tertiae Laryngalis",
        urls: [
            "https://www.pealim.com/dict/2220-lishloach/",
            "https://www.pealim.com/dict/2221-lehishaleach/",
            "https://www.pealim.com/dict/2805-leshaleach/",
            "https://www.pealim.com/dict/2222-lehishtaleach/",
            "https://www.pealim.com/dict/2127-lehashbiach/" // TODO ASK MARIE
        ],
    },
    {
        deck: "Verba Primae Aleph",
        urls: ["https://www.pealim.com/dict/30-leechol/"],
    },
    {
        deck: "Verba Primae Nun",
        urls: [
            "https://www.pealim.com/dict/1230-lipol/",
            "https://www.pealim.com/dict/2706-lehinave/",
            "https://www.pealim.com/dict/1143-lageshet/",
            "https://www.pealim.com/dict/1144-lehagish/",
            "https://www.pealim.com/dict/1285-latet/"
        ],
    },
    {
        deck: "Verba Primae Jod Waw",
        urls: [
            "https://www.pealim.com/dict/737-lehetiv/",
            "https://www.pealim.com/dict/9-lashevet/",
            "https://www.pealim.com/dict/800-lehivaled/",
            "https://www.pealim.com/dict/854-lirok/",
            "https://www.pealim.com/dict/2457-lehoshiv/",
        ],
    },
    {
        deck: "Halach",
        urls: [
            "https://www.pealim.com/dict/7-lalechet/",
        ],
    },
    {
        deck: "Verba Mediae Geminatae",
        urls: [
            // missing קלל
            "https://www.pealim.com/dict/1294-lasov/",
            "https://www.pealim.com/dict/1297-lehistovev/",
            "https://www.pealim.com/dict/1295-lehisov/",
            "https://www.pealim.com/dict/1296-lesovev/",
            "https://www.pealim.com/dict/1294-lasov/",
            "https://www.pealim.com/dict/1298-lehasev/"
        ],
    },
    {
        deck: "Verba Mediae uio",
        urls: [
            "https://www.pealim.com/dict/1876-lakum/",
            "https://www.pealim.com/dict/52-lamut/",
            "https://www.pealim.com/dict/45-lasim/",
            "https://www.pealim.com/dict/28-lavo/",
            "https://www.pealim.com/dict/192-levosh/",

            "https://www.pealim.com/dict/2413-lehikon/",
            // POLAL MISSING
            "https://www.pealim.com/dict/1877-lehakim/",
            'https://www.pealim.com/dict/895-lechonen/',
            "https://www.pealim.com/dict/896-lehitkaven/"
        ],
    },
    {
        deck: "Verba tertiae Infirmae",
        urls: [
            "https://www.pealim.com/dict/454-lihyot/",
            "https://www.pealim.com/dict/1201-lehakot/",
            "https://www.pealim.com/dict/788-lehodot/",
            "https://www.pealim.com/dict/333-liglot/",
            "https://www.pealim.com/dict/334-lehigalot/",
            "https://www.pealim.com/dict/331-legalot/",
            "https://www.pealim.com/dict/335-lehaglot/",
            "https://www.pealim.com/dict/332-lehitgalot/",
            "https://www.pealim.com/dict/26-laalot/",
            "https://www.pealim.com/dict/3384-lehaalot/"
        ],
    },
    {
        deck: "Verba tertiae Aleph",
        urls: [
            "https://www.pealim.com/dict/209-levate/",
            "https://www.pealim.com/dict/1086-lehitmatze/",
            "https://www.pealim.com/dict/1085-lehamtzi/",
            "https://www.pealim.com/dict/1084-lehimatze/",
            "https://www.pealim.com/dict/1083-limtzo/",
            "https://www.pealim.com/dict/2701-limlot/"

        ],
    }
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
            `results/${deckIndex} ${deck}.csv`,
            `#notetype:HebrewConjugations\n#deck:Hebrew Conjugations::${deckIndex}. ${deck}\n${data.map(row => row.join(";"))
                .sort((a, b) => b.length - a.length)
                .join("\n")}`
        )
    }
    browser.close();
    console.log("DONE!")
})()