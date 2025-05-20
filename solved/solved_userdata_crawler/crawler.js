import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const START_TIER = 6;
const END_TIER = 6;

const OUTPUT_FILE = `../data/solved_problems_by_tags_${START_TIER}to${END_TIER}.json`;
const INPUT_FILE = '../data/handles-by-tier.json';

const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
const data = JSON.parse(rawData).result;

const get_solved_problems_by_tags = async (
    browser,
    username,
    tags = [
        'implementation',
        'greedy',
        'string',
        'data_structures',
        'graphs',
        'dp',
        'geometry',
        'math'
    ]
) => {
    const value = await Promise.all(
        tags.map(async (tag) => {
            const page = await browser.newPage();
            const targetUrl = `https://solved.ac/search?query=s%40${username}%20%23${tag}&sort=level&direction=desc`;
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
            );
            await page.setViewport({ width: 1920, height: 1080 });

            try {
                await page.goto(targetUrl, { waitUntil: 'networkidle2' });

                const hasResults = await page.evaluate(() => {
                    return document.querySelectorAll('.css-1ojb0xa').length > 0;
                });

                if (!hasResults) {
                    await page.close();
                    return { [tag]: [] };
                }

                const rows = await page.evaluate(() => {
                    return Array.from(
                        document.querySelectorAll('.css-1ojb0xa')
                    ).map((row) => {
                        const tds = row.querySelectorAll('.css-1fudcfm');
                        return {
                            col1: tds[0]?.innerText.trim() || null
                        };
                    });
                });

                const values = rows
                    .map((row) => row.col1)
                    .filter((val) => val !== null)
                    .map((val) => parseInt(val, 10));

                await page.close();
                return { [tag]: values };
            } catch (err) {
                console.error(
                    `An error occurred while processing tag "${tag}": ${err.message}`
                );
                await page.close();
                return { [tag]: [] };
            }
        })
    );

    return { [username]: value };
};

const browser = await puppeteer.launch({ headless: true });

let result = {};
for (let i = START_TIER; i <= END_TIER; i++) {
    if (!result[i]) result[i] = {};
    if (!data[i]) continue;

    let count = 0;
    for (const username of data[i]) {
        if (count % 10 === 0) {
            await fs.writeFile(
                OUTPUT_FILE,
                JSON.stringify(result, null, 2),
                'utf-8'
            );
            console.log(`Saved progress at tier ${i}, count = ${count}`);
        }
        console.log(`Processing ${username}...`);
        const res = await get_solved_problems_by_tags(browser, username);
        result[i][username] = res[username];
        count++;
    }
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
}
await browser.close();
