import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { PromisePool } from '@supercharge/promise-pool';

const START_TIER = 11;
const END_TIER = 15;
const SAVE_INTERVAL = 64;
const OUTPUT_FILE = `solved-problems-by-tags-${START_TIER}to${END_TIER}.json`;
const INPUT_FILE = 'handles-by-tier.json';

const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
const data = JSON.parse(rawData).result;

const tags = [
    'implementation',
    'greedy',
    'string',
    'data_structures',
    'graphs',
    'dp',
    'geometry',
    'math'
];

const get_solved_problems_by_tag = async (username, tag) => {
    const query = encodeURIComponent(`s@${username} #${tag}`);
    const url = `https://solved.ac/search?query=${query}&sort=level&direction=desc`;

    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                Referer: 'https://solved.ac/',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 10000
        });

        const $ = cheerio.load(html);

        const noResult =
            $('.css-d64bfi').text().includes('해당하는 문제가 없습니다') ||
            $('.css-1ojb0xa').length === 0;

        if (noResult) {
            return { [tag]: [] };
        }

        const problemIds = $('.css-1ojb0xa')
            .map((_, el) => {
                const id = $(el).find('.css-1fudcfm').first().text().trim();
                return parseInt(id, 10);
            })
            .get()
            .filter((id) => !isNaN(id));

        return { [tag]: problemIds };
    } catch (err) {
        console.error(`tag \"${tag}\" for ${username} failed:`, err.message);
        return { [tag]: [] };
    }
};

const prev = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf-8'));

const retryList = [];
for (const [tier, users] of Object.entries(prev)) {
    for (const [username, tagMap] of Object.entries(users)) {
        const allEmpty = Object.values(tagMap).every(
            (arr) => Array.isArray(arr) && arr.length === 0
        );
        if (allEmpty) retryList.push({ tier, username });
    }
}

console.log('Retrying', retryList.length, 'users');

await PromisePool.withConcurrency(8)
    .for(retryList)
    .process(async ({ tier, username }, index) => {
        const userData = {};
        for (const tag of tags) {
            const tagResult = await get_solved_problems_by_tag(username, tag);
            Object.assign(userData, tagResult);
        }
        prev[tier][username] = userData;

        if ((index + 1) % 10 === 0) {
            await fs.writeFile(
                OUTPUT_FILE,
                JSON.stringify(prev, null, 2),
                'utf-8'
            );
            console.log(`Saved progress at ${index + 1}`);
        }
    });

await fs.writeFile(OUTPUT_FILE, JSON.stringify(prev, null, 2), 'utf-8');
