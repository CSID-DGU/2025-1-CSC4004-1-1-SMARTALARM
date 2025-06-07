import { promises as fs } from 'fs';
import { tags as allowedTags } from './solved_tags.js';
import path from 'path';

const INPUT_DIR_PROBLEMS = './solvedac';
const INPUT_DIR_USER_ACTIVITY = './data';
const OUTPUT_DIR = './data/preprocessed';

/*
    Get all problem IDs from the local source directory.
    Directory structure is based on Hiyabye/solvedac repository.

    Input: Root directory (e.g., './solvedac/data')
    Output: Set of problem IDs
*/
const getAllProblemIdsFromSource = async (rootDir) => {
    const problemIds = new Set();
    try {
        const groupDirs = await fs.readdir(rootDir); // 예: ['00xxx', '01xxx', ...]
        for (const groupDir of groupDirs) {
            const groupPath = path.join(rootDir, groupDir);
            if ((await fs.stat(groupPath)).isDirectory()) {
                try {
                    const problemFiles = await fs.readdir(groupPath);
                    for (const problemFile of problemFiles) {
                        if (problemFile.endsWith('.json')) {
                            const problemId = parseInt(
                                problemFile.replace('.json', ''),
                                10
                            );
                            if (!isNaN(problemId)) {
                                problemIds.add(problemId);
                            }
                        }
                    }
                } catch (innerError) {
                    // console.warn(`Warning: Could not read directory ${groupPath}: ${innerError.message}`);
                }
            }
        }
    } catch (error) {
        console.error(
            `Error: Failed when scanning problem IDs (${rootDir}) - ${error.message}`
        );
    }
    console.log(
        `Found ${problemIds.size} problem IDs in the source directory (${rootDir})`
    );
    return problemIds;
};

/* 
    Get metadata from given problem ID. 
    Directory structure is based on Hiyabye/solvedac repository.

    Input: Problem ID (e.g., 1000)
    Output: Metadata object containing:
        - id: Problem ID
        - level: Problem level (based on solved.ac API)
        - tags: List of tags, Filtered on 8 basic tags (which one can be found on solved.ac user page)
        - solvedCount: Number of users who solved the problem
        - averageTries: Average number of tries to solve the problem
*/
const getProblemMetadata = async (problemId) => {
    const dirPrefix = problemId
        .toString()
        .padStart(5, '0')
        .slice(0, 2)
        .padEnd(5, 'x');
    const filePath = `${INPUT_DIR_PROBLEMS}/data/${dirPrefix}/${problemId}.json`;
    try {
        const input = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        return {
            id: parseInt(problemId, 10),
            level: input.level,
            tags: input.tags
                .map((tag) => (allowedTags.includes(tag.key) ? tag.key : null)) // filtering
                .filter((tag) => tag), // remove undefined
            solvedCount: input.acceptedUserCount,
            averageTries: input.averageTries
            // titleKo: input.titleKo // uncomment if needed
        };
    } catch (error) {
        console.warn(
            `Warning: Metadata for problem ${problemId} not found or error: ${error.message}`
        );
        return null;
    }
};

async function preprocessData() {
    console.log('Starting data preprocessing...');

    // --- 1. 모든 사용자 활동 파일에서 문제 ID 수집 및 사용자 해결 데이터 통합 ---
    const allProblemIds = await getAllProblemIdsFromSource(
        INPUT_DIR_PROBLEMS + '/data'
    );

    // 예: ['solved_problems_by_tags_11to15.json', 'solved_problems_by_tags_16to20.json', ...]
    // 실제 파일 목록을 동적으로 읽어오거나 수동으로 지정해야 합니다.
    const userActivityFileNames = ['solved-problems-by-tags-11to15.json'];

    // userSolvedData: { tier: { userId: { tagKey: [problemId1, problemId2, ...] } } }
    const userSolvedDataAggregated = {};

    for (const fileName of userActivityFileNames) {
        console.log(`Processing user activity file: ${fileName}`);
        try {
            const fileContent = JSON.parse(
                await fs.readFile(
                    `${INPUT_DIR_USER_ACTIVITY}/${fileName}`,
                    'utf-8'
                )
            );
            // file: { 'tier': { 'userId': { 'tagKey': [problemId1, problemId2], ... }, ... }, ... }
            for (const tier in fileContent) {
                if (!userSolvedDataAggregated[tier]) {
                    userSolvedDataAggregated[tier] = {};
                }
                const usersInTier = fileContent[tier];
                for (const userId in usersInTier) {
                    if (!userSolvedDataAggregated[tier][userId]) {
                        userSolvedDataAggregated[tier][userId] = {};
                    }
                    const tagsSolvedByUser = usersInTier[userId];
                    for (const tag in tagsSolvedByUser) {
                        if (!allowedTags.includes(tag)) continue; // continue if the tag is not in default tags

                        if (!userSolvedDataAggregated[tier][userId][tag]) {
                            userSolvedDataAggregated[tier][userId][tag] = [];
                        }
                        const problemIdsInTag = tagsSolvedByUser[tag];
                        problemIdsInTag.forEach((pId) => {
                            userSolvedDataAggregated[tier][userId][tag].push(
                                pId
                            );
                        });
                        // remove duplicates
                        userSolvedDataAggregated[tier][userId][tag] = [
                            ...new Set(
                                userSolvedDataAggregated[tier][userId][tag]
                            )
                        ];
                    }
                }
            }
        } catch (error) {
            console.error(
                `Error: Failed to process user activity file '${fileName}' - ${error.message}`
            );
        }
    }
    const calculateTotalUsers = (data) => {
        let sum = 0;
        for (const tier in data) {
            sum += Object.keys(data[tier]).length;
        }
        return sum;
    };
    console.log(
        `Number of users: ${calculateTotalUsers(userSolvedDataAggregated)}`
    );

    // fetch metadata (for all problems)
    // problemDetails: { problemId: { metadata } }
    const problemDetails = {};
    console.log('Fetching metadata for all problems...');
    let fetchedCount = 0;
    for (const problemId of allProblemIds) {
        const meta = await getProblemMetadata(problemId);
        if (meta) {
            problemDetails[meta.id] = meta;
        }
        fetchedCount++;
        if (fetchedCount % 200 === 0 || fetchedCount === allProblemIds.size) {
            console.log(
                `Current progress: ${((fetchedCount / allProblemIds.size) * 100).toFixed(2)}%`
            );
        }
    }
    console.log(`Total metadata count: ${Object.keys(problemDetails).length}`);

    // saving solved problems levels by tags / user
    // userSolvedTagActualLevels: { userId: { tagKey: [level1, level2, ...] } }
    const userSolvedTagLevels = {};
    console.log('Generating solved problems levels by user...');
    for (const tier in userSolvedDataAggregated) {
        for (const userId in userSolvedDataAggregated[tier]) {
            userSolvedTagLevels[tier] = userSolvedTagLevels[tier] || {};
            userSolvedTagLevels[tier][userId] = {};
            for (const tagKey in userSolvedDataAggregated[tier][userId]) {
                userSolvedTagLevels[tier][userId][tagKey] =
                    userSolvedDataAggregated[tier][userId][tagKey]
                        .map((problemId) =>
                            problemDetails[problemId]
                                ? problemDetails[problemId].level
                                : null
                        )
                        .filter(
                            (level) => level !== null && level !== undefined
                        );
            }
        }
    }
    console.log('Completed user solved tag actual levels generation');

    // saving json
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        await fs.writeFile(
            `${OUTPUT_DIR}/problem-details.json`,
            JSON.stringify(problemDetails, null, 2)
        );
        await fs.writeFile(
            `${OUTPUT_DIR}/user-solved-data-aggregated.json`,
            JSON.stringify(userSolvedDataAggregated, null, 2)
        );
        await fs.writeFile(
            `${OUTPUT_DIR}/user-solved-tag-actual-levels.json`,
            JSON.stringify(userSolvedTagLevels, null, 2)
        );
        console.log(`Saved preprocessed data to ${OUTPUT_DIR}`);
    } catch (error) {
        console.error(`Error: Save failed - ${error.message}`);
    }

    console.log('Completed');
}

// 스크립트 실행
preprocessData().catch(console.error);
