import fs from 'fs/promises';
import path from 'path';
import axios from 'axios'; // axios import
import { config } from 'dotenv';
config(); // dotenv 설정

// --- 설정 ---
const API_BASE_URL = 'https://solved.ac/api/v3';
const REQUEST_DELAY_MS = 200;
const USERS_PER_TIER_TO_SAMPLE = 5000;
const PROBLEMS_PER_PAGE = 50;

const START_TIER = 6; // 예: Gold V
const END_TIER = 15;   // 예: Gold I

const OUTPUT_DIR = '../data'; // 수집된 데이터 저장 경로
const SOLVED_PROBLEMS_OUTPUT_FILE = path.join(OUTPUT_DIR, 'solved-problems-by-user.json');
const SELECTED_USERS_FILE = path.join(OUTPUT_DIR, `selected-users-for-processing-${START_TIER}to${END_TIER}.json`);
const HANDLES_BY_TIER_FILE = path.join(OUTPUT_DIR, 'handles-by-tier.json');


const COMMON_HEADERS = {
    Cookie: `solvedacToken=${process.env.SOLVED_TOKEN}`
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function shuffle(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

async function makeApiRequest(url, params = {}, attempt = 1) {
    // console.log(`API 요청 (axios): ${url} Params: ${JSON.stringify(params)}`); // Kept commented as in original
    await sleep(REQUEST_DELAY_MS);
    try {
        const response = await axios.get(url, { headers: COMMON_HEADERS, params: params }); // Pass params to axios
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const { response } = error;
            if (response) {
                if (response.status === 429) {
                    const retryAfter = response.headers['retry-after'] || '120'; // Default to 60s if header not present
                    const waitMs = parseInt(retryAfter, 10) * 1000 + Math.random() * 1000; // Add jitter
                    console.warn(`Rate limit exceeded (429). Retrying after ${Math.round(waitMs / 1000)} seconds... URL: ${url}`);
                    await sleep(waitMs);
                    return makeApiRequest(url, params, attempt + 1); // Retry with same attempt number logic, or increment if you prefer
                }
                console.error(`API 요청 실패 (axios): ${response.status} ${response.statusText} - ${url}`);
                console.error(`Error Data: ${JSON.stringify(response.data)}`);
            } else {
                console.error(`네트워크 오류 또는 API 요청 중 예외 발생 (axios): ${error.message} - ${url}`);
            }
        } else {
            console.error(`알 수 없는 예외 발생 (axios): ${error.message} - ${url}`);
        }

        if (attempt < 3) { // Max 3 attempts for errors other than 429
            const retryWait = REQUEST_DELAY_MS * (attempt + 1) + Math.random() * 1000; // Exponential backoff with jitter
            console.warn(`Retrying request (attempt ${attempt + 1}/3) after ${retryWait/1000}s... URL: ${url}`);
            await sleep(retryWait);
            return makeApiRequest(url, params, attempt + 1);
        }
        console.error(`최대 재시도 횟수 도달 실패. URL: ${url}`);
        return null;
    }
}

// Reads the handles-by-tier.json file.
// Assumes the file structure is: { "lastPage": ..., "result": { "tier_string": ["user1", "user2"], ... } }
async function readHandlesByTierFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        // Check if the expected 'result' property exists and is an object
        if (jsonData && typeof jsonData.result === 'object' && jsonData.result !== null) {
            return jsonData.result; // This should be { "11": [...], "12": [...] }
        } else {
            console.error(`'${filePath}' 파일이 예상된 구조({ lastPage, result: { ... } })가 아닙니다.`);
            return {}; // Return empty object if structure is not as expected
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`'${filePath}' 파일을 찾을 수 없습니다. 티어별 사용자 목록을 가져올 수 없습니다.`);
        } else {
            console.error(`'${filePath}' 파일 읽기 오류:`, error);
        }
        return {}; // Return empty object on error
    }
}

// Samples users from each tier based on handles read from HANDLES_BY_TIER_FILE
async function getUsersInTier(maxUsersPerTier = 2000) {
    const selectedUsersByTier = {}; // Stores { "tier_string": [selected_users] }
    // handlesByTierData should be in format: { "11": ["userA", "userB"], "12": ["userC"] }
    const handlesByTierData = await readHandlesByTierFile(HANDLES_BY_TIER_FILE);

    if (Object.keys(handlesByTierData).length === 0) {
        console.warn("티어별 사용자 데이터가 비어있거나 로드에 실패했습니다. 사용자 샘플링을 진행할 수 없습니다.");
        return selectedUsersByTier;
    }

    for (let tier = START_TIER; tier <= END_TIER; tier++) {
        const tierKey = String(tier);
        const tierSpecificHandles = (handlesByTierData && Array.isArray(handlesByTierData[tierKey])) ? handlesByTierData[tierKey] : [];
        
        if (tierSpecificHandles.length === 0) {
            console.log(`Tier ${tierKey}: 가져온 핸들이 없습니다. 건너<0xEB><0><0x8A><0x8D>니다.`);
            selectedUsersByTier[tierKey] = [];
            continue;
        }
        
        const shuffledHandles = shuffle(tierSpecificHandles); // shuffle returns a new shuffled array
        selectedUsersByTier[tierKey] = shuffledHandles.slice(0, maxUsersPerTier);
        console.log(`Tier ${tierKey}: ${tierSpecificHandles.length}명 중 ${selectedUsersByTier[tierKey].length}명 샘플링 완료.`);
    }
    return selectedUsersByTier; // Keys are strings "11", "12", etc.
}

// 특정 사용자가 푼 모든 문제 목록 가져오기
async function getAllSolvedProblemsForUser(userId) {
    const allProblemIds = [];
    let currentPage = 1;
    let totalProblemsForUser = -1; // API's count of total problems for this user

    console.log(`사용자 '${userId}'의 해결한 문제 수집 시작...`);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const url = `${API_BASE_URL}/search/problem`;
        const params = {
            query: `solved_by:${userId}`,
            sort: 'level', // As per original, though 'id' or 'random' might be faster if order doesn't matter
            direction: 'desc',
            page: currentPage
        };
        const data = await makeApiRequest(url, params);

        if (!data || !data.items) {
            console.error(`사용자 '${userId}', 페이지 ${currentPage} 문제 로드 실패. API 응답:`, data);
            break; 
        }
        
        if (totalProblemsForUser === -1) {
            totalProblemsForUser = data.count; // Get total count from the first successful response
        }

        allProblemIds.push(...data.items.map(problem => problem.problemId));
        const problemCountOnCurrentRequest = data.items.length;
        console.log(`사용자 '${userId}', 페이지 ${currentPage}: ${problemCountOnCurrentRequest}개 문제 추가, 총 ${allProblemIds.length}/${totalProblemsForUser}개 수집.`);

        // Exit condition: if current page brought fewer problems than page size, or if we've collected all problems
        if (problemCountOnCurrentRequest < PROBLEMS_PER_PAGE || allProblemIds.length >= totalProblemsForUser) {
            if (allProblemIds.length < totalProblemsForUser) {
                 console.warn(`사용자 '${userId}': API count (${totalProblemsForUser})와 수집된 문제 수(${allProblemIds.length})가 다릅니다. API 페이징 문제일 수 있습니다.`);
            }
            break;
        }
        currentPage++;
    }
    return allProblemIds;
}

// --- 메인 실행 로직 ---
async function main() {
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
    } catch (error) {
        console.error(`출력 디렉토리 '${OUTPUT_DIR}' 생성 실패:`, error);
        return; // Exit if cannot create output directory
    }

    let previouslySolvedData = {};
    try {
        const rawData = await fs.readFile(SOLVED_PROBLEMS_OUTPUT_FILE, 'utf-8');
        previouslySolvedData = JSON.parse(rawData);
        console.log(`기존에 수집된 사용자 데이터 (${SOLVED_PROBLEMS_OUTPUT_FILE})를 성공적으로 불러왔습니다. ${Object.keys(previouslySolvedData).length}명의 데이터 로드됨.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`기존 사용자 데이터 파일 (${SOLVED_PROBLEMS_OUTPUT_FILE})이 없습니다. 새로 시작합니다.`);
        } else {
            console.error(`기존 사용자 데이터 파일 (${SOLVED_PROBLEMS_OUTPUT_FILE}) 불러오기 오류:`, error);
            // Optionally, decide if to proceed with empty data or exit
        }
    }

    let usersToProcessByTier = {};
    try {
        const rawSelectedUsers = await fs.readFile(SELECTED_USERS_FILE, 'utf-8');
        usersToProcessByTier = JSON.parse(rawSelectedUsers);
        console.log(`저장된 선택 사용자 목록 (${SELECTED_USERS_FILE})을 불러왔습니다.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`저장된 선택 사용자 목록 (${SELECTED_USERS_FILE})이 없습니다. 새로 생성합니다.`);
            usersToProcessByTier = await getUsersInTier(USERS_PER_TIER_TO_SAMPLE);
            try {
                await fs.writeFile(SELECTED_USERS_FILE, JSON.stringify(usersToProcessByTier, null, 2));
                console.log(`선택된 사용자 목록을 ${SELECTED_USERS_FILE}에 저장했습니다.`);
            } catch (saveError) {
                console.error(`선택된 사용자 목록 저장 오류 (${SELECTED_USERS_FILE}):`, saveError);
            }
        } else {
            console.error(`저장된 선택 사용자 목록 (${SELECTED_USERS_FILE}) 불러오기 오류:`, error);
            console.log("선택된 사용자 목록을 불러올 수 없어, 새로 생성 시도합니다.");
            usersToProcessByTier = await getUsersInTier(USERS_PER_TIER_TO_SAMPLE); // Fallback to generating new list
             try {
                await fs.writeFile(SELECTED_USERS_FILE, JSON.stringify(usersToProcessByTier, null, 2));
                console.log(`선택된 사용자 목록을 ${SELECTED_USERS_FILE}에 새로 저장했습니다.`);
            } catch (saveError) {
                console.error(`선택된 사용자 목록 저장 오류 (${SELECTED_USERS_FILE}):`, saveError);
            }
        }
    }
    
    if (Object.keys(usersToProcessByTier).length === 0) {
        console.log("처리할 사용자가 없습니다. 스크립트를 종료합니다.");
        return;
    }

    const userDataToSave = { ...previouslySolvedData }; // Combine with previously loaded data

    for (let tierNum = START_TIER; tierNum <= END_TIER; tierNum++) {
        const tierKey = String(tierNum);
        const usersInCurrentTier = usersToProcessByTier[tierKey];
        if( !userDataToSave[tierKey] ) {
            userDataToSave[tierKey] = {};
        }
        if (!usersInCurrentTier || usersInCurrentTier.length === 0) {
            console.log(`Tier ${tierKey}: 처리할 사용자가 없습니다. 건너<0xEB><0><0x8A><0x8D>니다.`);
            continue;
        }
        console.log(`\n--- Tier ${tierKey} 처리 시작 (${usersInCurrentTier.length}명) ---`);

        for (const userId of usersInCurrentTier) {
            if (userDataToSave[tierKey].hasOwnProperty(userId)) {
                console.log(`사용자 '${userId}'의 데이터는 이미 수집되었습니다 (${userDataToSave[tierKey][userId].length} 문제). 건너<0xEB><0><0x8A><0x8D>니다.`);
                continue;
            }

            const solvedProblems = await getAllSolvedProblemsForUser(userId);
            if (solvedProblems && solvedProblems.length > 0) { // Only save if problems were found
                userDataToSave[tierKey][userId] = solvedProblems;
                try {
                    await fs.writeFile(SOLVED_PROBLEMS_OUTPUT_FILE, JSON.stringify(userDataToSave, null, 2));
                    console.log(`사용자 '${userId}'의 데이터 (${solvedProblems.length}개 문제) 저장 완료: ${SOLVED_PROBLEMS_OUTPUT_FILE}`);
                } catch (writeError) {
                    console.error(`사용자 '${userId}'의 데이터 파일 쓰기 오류:`, writeError);
                }
            } else if (solvedProblems && solvedProblems.length === 0) {
                console.log(`사용자 '${userId}'가 푼 문제가 없거나, API가 빈 목록을 반환했습니다. (0개 문제)`);
                // Optionally save empty array to mark as processed: userDataToSave[userId] = [];
            } else { 
                console.log(`사용자 '${userId}'의 문제 데이터를 가져오지 못했습니다. (API 호출 실패 또는 빈 응답)`);
            }
        }
    }
    console.log("\n모든 작업 완료.");
}

main().catch(error => {
    console.error("메인 실행 중 치명적인 오류 발생:", error);
});
