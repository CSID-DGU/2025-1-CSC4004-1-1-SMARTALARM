import fs from 'fs/promises';
import path from 'path';
import axios from 'axios'; // axios import
import { config } from 'dotenv';
import { get } from 'http';
config(); // dotenv 설정

// --- 설정 ---
const API_BASE_URL = 'https://solved.ac/api/v3';
const REQUEST_DELAY_MS = 3516;
const USERS_PER_TIER_TO_SAMPLE = 2000;
const PROBLEMS_PER_PAGE = 50;

const START_TIER = 6;
const END_TIER = 10;

const OUTPUT_DIR = '../data'; // 수집된 데이터 저장 경로 (axios 버전)

const COMMON_HEADERS = {
    Cookie: `solvedacToken=${process.env.SOLVED_TOKEN}`,
};


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function makeApiRequest(url, params = {}, attempt = 1) {
    //console.log(`API 요청 (axios): ${url} Params: ${JSON.stringify(params)}`);
    await sleep(REQUEST_DELAY_MS);
    try {
        const response = await axios.get(url, {headers: COMMON_HEADERS});
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const { response } = error;
            if (response) {
                if (response.status === 429) {
                    const retryAfter = response.headers['retry-after'] || '60';
                    const waitMs = parseInt(retryAfter, 10) * 1000 + REQUEST_DELAY_MS;
                    console.warn(`Rate limit exceeded. Retrying after ${waitMs / 1000} seconds...`);
                    await sleep(waitMs);
                    return makeApiRequest(url, params, attempt + 1); 
                }
                console.error(`API 요청 실패 (axios): ${response.status} ${response.statusText} - ${url}`);
                console.error(`Error Data: ${JSON.stringify(response.data)}`);
            } else {
                console.error(`네트워크 오류 또는 API 요청 중 예외 발생 (axios): ${error.message} - ${url}`);
            }
        } else {
            console.error(`알 수 없는 예외 발생 (axios): ${error.message} - ${url}`);
        }

        if (attempt < 3) {
            console.warn(`Retrying request (attempt ${attempt + 1})...`);
            await sleep(REQUEST_DELAY_MS * (attempt + 1));
            return makeApiRequest(url, params, attempt + 1);
        }
        return null;
    }
}

// read from file
async function readUsernamesFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const { lastPage, result } = JSON.parse(data);
        return result;
    } catch (error) {
        console.error(`error when reading file: ${filePath}`, error);
        return [];
    }
}

// Sampling 2000 users from each tier
async function getUsersInTier(maxUsers = 2000) {
    const userIds = new Set();
    let result = {};
    const handles = await readUsernamesFromFile(path.join(OUTPUT_DIR, 'handles-by-tier.json'))
    for (let tier = START_TIER; tier <= END_TIER; tier++) {
        if (result[tier] == null) {
            result[tier] = [];
        }
        result[tier] = shuffle(handles[tier]);
        result[tier] = result[tier].slice(0, maxUsers);
    }
    return result;
}

// 특정 사용자가 푼 모든 문제 목록 가져오기
async function getAllSolvedProblemsForUser(userId) {
    const allProblems = [];
    let currentPage = 1;
    let problemCountOnCurrentRequest = 0;

    console.log(`사용자 '${userId}'의 해결한 문제 수집 시작...`);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const url = `${API_BASE_URL}/search/problem?query=solved_by%3A${userId}&sort=level&direction=desc&page=${currentPage}`;
        const data = await makeApiRequest(url);

        if (!data || !data.items) {
            console.error(`사용자 '${userId}', 페이지 ${currentPage} 문제 로드 실패. API 응답:`, data);
            break;
        }
        
        allProblems.push(...data.items);
        problemCountOnCurrentRequest = data.items.length;
        console.log(`사용자 '${userId}', 페이지 ${currentPage}: ${problemCountOnCurrentRequest}개 문제 추가, 총 ${allProblems.length}개 수집. (API count: ${data.count})`);

        if (problemCountOnCurrentRequest < PROBLEMS_PER_PAGE || allProblems.length >= data.count) {
            break;
        }
        currentPage++;
    }
    return allProblems.map(problem => (problem.problemId));
}

// --- 메인 실행 로직 ---
async function main() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const userIdsToProcess = await getUsersInTier(USERS_PER_TIER_TO_SAMPLE);
    const userDataToSave = {};
    const OUTPUT_FILE = path.join(OUTPUT_DIR, 'solved-problems-by-user.json');

    for (let tier = START_TIER; tier <= END_TIER; tier++) {
        for (const userId of userIdsToProcess[tier]) {
            const solvedProblems = await getAllSolvedProblemsForUser(userId);
            if (solvedProblems) {
                userDataToSave[userId] = solvedProblems;
                await fs.writeFile(OUTPUT_FILE, JSON.stringify(userDataToSave, null, 2));
                console.log(`사용자 '${userId}'의 데이터 (${solvedProblems.length}개 문제) 저장 완료: ${OUTPUT_FILE}`);
            } else { 
                console.log(`사용자 '${userId}'의 문제 데이터를 가져오지 못했습니다. (API 호출 실패 가능성)`);
            }
        }
    }
    console.log("Completed");
}

main().catch(error => {
    console.error(error);
});
