const puppeteer = require('puppeteer')
const {scrape} = require('./conjugator');

IDX = {
    verb: 0,
    stamm: 2,
    notes: 3,
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

    describe("לכתוב", () => {
        let pageData = {};
        beforeAll(async () => {
            await page.goto("https://www.pealim.com/dict/1-lichtov/");
            pageData = (await page.evaluate(scrape))
                .reduce((data, row) => {
                    data[row[IDX.tense]] = row;
                    return data;
                }, {});
        });

        describe("Special Notes", () => {
            test("should be empty", () => {
                expect(pageData["Active Part. ♀️ Plural"][IDX.notes]).toEqual("");
            })
            test("should have no br when there are no notes, and there are conj. specific notes", () => {
                expect(pageData["Imperfect 2nd ♀️ Plural"][IDX.notes]).toEqual(
                    "In modern language, the masculine form is generally used:<div><span><span><span class=\"menukad\">תִּכְתְּבוּ</span></span> <span class=\"transcription\">tichtev<b>u</b></span></span></div>"
                );
            })
        });
    });

    describe("להישתלח", () => {
        let pageData = {}

        beforeAll(async () => {
            await page.goto("https://www.pealim.com/dict/2222-lehishtaleach/");
            pageData = (await page.evaluate(scrape))
                .reduce((data, row) => {
                    data[row[IDX.tense]] = row;
                    return data;
                }, {});
        });

        test('Should parse verb correctly - sanity', () => {
            const a = pageData["Imperfect 2nd ♀️ Plural"];
            expect(a[IDX.verb]).toEqual("<div><span class=\"menukad\">תִּשְׁתַּלַּחְנָה</span></div><div class=\"transcription\">tishtal<b>a</b>chna</div>");
        });

        describe('HebrewOnly', function () {
            test('Should handle multiple nikudim', () => {
                const a = pageData["Perfect 3rd ♂️ Sing."];
                expect(a[IDX.onlyHebrew]).toEqual("הִשְׁתַּלֵּחַ, הִשְׁתַּלַּח");
            })

            test('Should handle special characters', () => {
                const a = pageData["Imperfect 2nd ♀️ Plural"];
                expect(a[IDX.onlyHebrew]).toEqual("תִּשְׁתַּלַּחְנָה");
            })
        });

        describe("Special Notes", () => {
            test('Sanity', () => {
                expect(pageData["Perfect 1st Sing."][IDX.notes]).toEqual("The final radical of this word is guttural. this affects the adjacent vowels.");
            })
            test('Should recognize', () => {
                expect(pageData["Imperfect 2nd ♀️ Plural"][IDX.notes]).toEqual(
                    "In modern language, the masculine form is generally used:<div><span><span><span class=\"menukad\">תִּשְׁתַּלְּחוּ</span></span> <span class=\"transcription\">tishtalch<b>u</b></span></span></div><br>The final radical of this word is guttural. this affects the adjacent vowels."
                )
            })
        });

        describe("Dedup", () => {
            test('Naive Case', () => {
                const a = pageData["Imperfect 2nd ♀️ Plural"];
                const b = pageData["Imperfect 3rd ♀️ Plural"];
                expect(a[IDX.verb]).toEqual(b[IDX.verb]);
                expect(a[IDX.additionalTense]).toEqual(b[IDX.tense]);
                expect(b[IDX.hideReverse]).toBeTruthy();
            });

            test('Should handle rlm and exclamation marks', () => {
                const a = pageData["Perfect 3rd ♂️ Sing."];
                const b = pageData["Imperative 2nd ♂️ Sing."];
                expect(a[IDX.verb]).toEqual(b[IDX.verb]);
                expect(a[IDX.additionalTense]).toEqual(b[IDX.tense]);
                expect(b[IDX.hideReverse]).toBeTruthy();
            });
        })
    });

    afterAll(() => browser.close());

});
