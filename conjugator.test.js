const puppeteer = require('puppeteer')
const {scrape} = require('./conjugator');

IDX = {
    verb: 0,
    stamm: 2,
    tense: 4,

    onlyHebrew: 6,
    hideReverse: 7,
    additionalTense: 8,
    additionalMeanings: 9
}

jest.setTimeout(15000);

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

    describe("להישתלח", () => {
        let pageData;

        beforeAll(async () => {
            await page.goto("https://www.pealim.com/dict/2222-lehishtaleach/");
            pageData = await page.evaluate(scrape);
        });

        test('Should parse verb correctly - sanity', async () => {
            const a = pageData.find((d) => d[IDX.tense] === "Imperfect 2nd ♀️ Plural")
            expect(a[IDX.verb]).toEqual("<div><span class=\"menukad\">תִּשְׁתַּלַּחְנָה</span></div><div class=\"transcription\">tishtal<b>a</b>chna</div>");
        });

        describe('HebrewOnly', function () {
            test('Should handle multiple nikudim', async () => {
                const a = pageData.find((d) => d[IDX.tense] === "Perfect 3rd ♂️ Sing.");
                expect(a[IDX.onlyHebrew]).toEqual("הִשְׁתַּלֵּחַ, הִשְׁתַּלַּח");
            })

            test('Should handle special characters', async () => {
                const a = pageData.find((d) => d[IDX.tense] === "Imperfect 2nd ♀️ Plural");
                expect(a[IDX.onlyHebrew]).toEqual("תִּשְׁתַּלַּחְנָה");
            })
        });


        test('Should handle rlm and exclamation marks', async () => {
            const a = pageData.find((d) => d[IDX.tense] === "Perfect 3rd ♂️ Sing.");
            const b = pageData.find((d) => d[IDX.tense] === "Imperative 2nd ♂️ Sing.")
            expect(a[IDX.verb]).toEqual(b[IDX.verb]);
            expect(a[IDX.additionalTense]).toEqual(b[IDX.tense]);
            expect(b[IDX.hideReverse]).toBeTruthy();
        });


        test('Should find duplicates - naive case', async () => {
            const a = pageData.find((d) => d[IDX.tense] === "Imperfect 2nd ♀️ Plural");
            const b = pageData.find((d) => d[IDX.tense] === "Imperfect 3rd ♀️ Plural")
            expect(a[IDX.verb]).toEqual(b[IDX.verb]);
            expect(a[IDX.additionalTense]).toEqual(b[IDX.tense]);
            expect(b[IDX.hideReverse]).toBeTruthy();
        });
    });

    afterAll(() => browser.close());

});
