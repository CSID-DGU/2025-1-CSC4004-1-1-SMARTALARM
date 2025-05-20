import { get } from 'axios';
import { promises as fs } from 'fs';
import { config } from 'dotenv';
config();

const OUTPUT_FILE = '../data/handles-by-tier.json';
const TOKEN = process.env.SOLVED_TOKEN;
const HEADERS = {
    Cookie: `solvedacToken=${TOKEN}`
};

const DELAY_MS = 300;

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadExistingData() {
    try {
        const content = await fs.readFile(OUTPUT_FILE, 'utf-8');
        const { lastPage, result } = JSON.parse(content);
        console.log(`loaded lastPage: ${lastPage}`);
        return { lastPage, result };
    } catch {
        console.log('No existing data found, starting fresh.');
        return { lastPage: 0, result: {} };
    }
}

async function saveProgress(lastPage, result) {
    await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify({ lastPage, result }, null, 2),
        'utf-8'
    );
    console.log(`saved progress at page ${lastPage}`);
}

async function fetchAllPages(maxPages = 6000) {
    let { lastPage, result } = await loadExistingData();

    try {
        for (let page = lastPage + 1; page <= maxPages; page++) {
            const url = `https://solved.ac/api/v3/ranking/tier?page=${page}`;
            const res = await get(url, { headers: HEADERS });

            const items = res.data.items;
            if (!items || items.length === 0) break;

            for (const user of items) {
                const tier = user.tier.toString();
                if (!result[tier]) result[tier] = [];
                result[tier].push(user.handle);
            }

            lastPage = page;
            console.log(`Page ${page} completed`);
            await saveProgress(lastPage, result);
            await sleep(DELAY_MS);
        }

        await fs.writeFile(
            OUTPUT_FILE,
            JSON.stringify({ lastPage, result }, null, 2),
            'utf-8'
        );
        console.log(`Completed; saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(
            `Request failed at (page ${lastPage + 1}): ${error.message}`
        );
        await saveProgress(lastPage, result);
        console.log(`saved to ${OUTPUT_FILE}`);
    }
}

fetchAllPages();
