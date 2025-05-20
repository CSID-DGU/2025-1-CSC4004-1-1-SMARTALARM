import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { PromisePool } from '@supercharge/promise-pool';
import { tags } from '../solved_tags.js';

const START_TIER = 11;
const END_TIER = 15;

const SAVE_INTERVAL = 10;
const USER_NUMBER = 1000;
const SLEEP_INTERVAL = 1000;

const OUTPUT_FILE = `../data/solved_problems_by_tags_${START_TIER}to${END_TIER}.json`;
const INPUT_FILE = '../data/handles-by-tier.json';

const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
const data = JSON.parse(rawData).result;

const get_solved_problems_by_tag = async (browser, username, tag) => {
    const page = await browser.newPage();
    const targetUrl = `https://solved.ac/search?query=s%40${username}%20%23${tag}&sort=level&direction=desc`;
    await page.setUserAgent(
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${Math.floor(
            Math.random() * 10 + 90
        )}.0) Gecko/20100101 Firefox/${Math.floor(Math.random() * 10 + 90)}.0`
    );
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        try {
            await page.goto(targetUrl, { waitUntil: 'networkidle2' });
        } catch (err) {
            await page.goto(targetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });
        }

        const hasResults = await page.evaluate(() => {
            return document.querySelectorAll('.css-1ojb0xa').length > 0;
        });

        if (!hasResults) {
            await page.close();
            return { [tag]: [] };
        }

        const rows = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.css-1ojb0xa')).map(
                (row) => {
                    const tds = row.querySelectorAll('.css-1fudcfm');
                    return {
                        col1: tds[0]?.innerText.trim() || null
                    };
                }
            );
        });

        const values = rows
            .map((row) => row.col1)
            .filter((val) => val !== null)
            .map((val) => parseInt(val, 10));

        await page.close();
        return { [tag]: values };
    } catch (err) {
        console.error(
            `an error occured when getting ${username}.${tag}: ${err.message}`
        );
        await page.close();
        return { [tag]: [] };
    }
};

const browser = await puppeteer.launch({ headless: true });
let result = {};

for (let i = START_TIER; i <= END_TIER; i++) {
    if (!data[i]) continue;
    const usernames = data[i];
    result[i] = {};

    const workItems = [];
    const randomUsernames = usernames
        .sort(() => Math.random() - 0.5)
        .slice(0, USER_NUMBER);
    for (const username of randomUsernames) {
        for (const tag of tags) {
            workItems.push([username, tag]);
        }
    }

    await PromisePool.withConcurrency(16)
        .for(workItems)
        .process(async ([username, tag], index) => {
            const tagResult = await get_solved_problems_by_tag(
                browser,
                username,
                tag
            );

            if (!result[i][username]) result[i][username] = {};
            Object.assign(result[i][username], tagResult);

            if ((index + 1) % (SAVE_INTERVAL * 8) === 0) {
                await fs.writeFile(
                    OUTPUT_FILE,
                    JSON.stringify(result, null, 2),
                    'utf-8'
                );
                console.log(`Saved at ${index + 1} tag-user pairs`);
            }
        });

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
}

await browser.close();
