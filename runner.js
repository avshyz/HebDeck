
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile);
(async () => {
    const browser = await puppeteer.launch({})
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })

    await page.goto('https://checklyhq.com/')
    const imageHref = await page.evaluate((sel) => {
        return document.querySelector(sel).getAttribute('src').replace('/', '')
    }, '.hero-image')

    const viewSource = await page.goto('https://checklyhq.com/' + imageHref)
    const buffer = await viewSource.buffer()
    await writeFileAsync(path.join(__dirname, 'checkly.png'), buffer)
    console.log('The file was saved!')

    await readFileAsync(path.join(__dirname, 'checkly.png'))
    console.log('The file was read!')
    browser.close()
})()