import { promises as fs } from 'fs';
import { get } from 'http';
import path from 'path';

const PREPROCESSED_DIR = 'data/preprocessed';

// --- 데이터 로딩 함수 (애플리케이션 시작 시 또는 첫 요청 시 한 번 실행) ---
let problemDetails = null;
let userSolvedDataAggregated = null;
let userEffectiveLevelsWithTier = null; // 유저가 생성한 파일명으로 변경

async function loadRecommendationData() {
    if (
        problemDetails &&
        userSolvedDataAggregated &&
        userEffectiveLevelsWithTier
    ) {
        return; // 이미 로드됨
    }
    console.log('추천기용 전처리 데이터 로딩 중...');
    problemDetails = JSON.parse(
        await fs.readFile(
            path.join(PREPROCESSED_DIR, 'problem-details.json'),
            'utf-8'
        )
    );
    userSolvedDataAggregated = JSON.parse(
        await fs.readFile(
            path.join(PREPROCESSED_DIR, 'user-solved-data-aggregated.json'),
            'utf-8'
        )
    );
    // 유시님이 생성하신 티어 정보가 포함된 파일 로드
    userEffectiveLevelsWithTier = JSON.parse(
        await fs.readFile(
            path.join(PREPROCESSED_DIR, 'user-effective-levels.json'),
            'utf-8'
        )
    );
    console.log('데이터 로딩 완료.');
}

// 사용자가 푼 문제 Set 반환 헬퍼
function getSolvedProblemSetForUser(userId) {
    const solvedSet = new Set();
    if (userSolvedDataAggregated && userSolvedDataAggregated[userId]) {
        for (const tagKey in userSolvedDataAggregated[userId]) {
            userSolvedDataAggregated[userId][tagKey].forEach((pId) =>
                solvedSet.add(pId)
            );
        }
    }
    return solvedSet;
}

// 사용자 목표 티어 추론 헬퍼 (구체적인 로직 필요)
function inferUserTargetTier(userId) {
    // 예시: userEffectiveLevelsWithTier에서 해당 유저 ID가 가장 높은 티어 항목을 찾음
    // 실제로는 더 정교한 로직 (예: 최근 활동 티어 등)이 필요할 수 있음
    if (userEffectiveLevelsWithTier) {
        const userTiers = Object.keys(userEffectiveLevelsWithTier).filter(
            (tierKey) =>
                userEffectiveLevelsWithTier[tierKey] &&
                userEffectiveLevelsWithTier[tierKey][userId] &&
                Object.keys(userEffectiveLevelsWithTier[tierKey][userId])
                    .length > 0
        );
        if (userTiers.length > 0) {
            // 티어 키가 숫자 문자열이라고 가정하고 내림차순 정렬하여 가장 높은 티어 반환
            return userTiers.sort(
                (a, b) => parseInt(b, 10) - parseInt(a, 10)
            )[0];
        }
    }
    return null; // 추론 불가 시 null 또는 기본 티어 (예: "11" for Gold V)
}

// --- 메인 추천 함수 ---
export async function getProblemRecommendations({
    targetUserId,
    targetTierContext = null, // 외부에서 특정 티어를 지정할 수 있음
    numRecommendations = 10
}) {
    await loadRecommendationData(); // 데이터 로드 보장

    if (!targetUserId) {
        console.error('오류: targetUserId가 필요합니다.');
        return [];
    }

    let currentProcessingTier = targetTierContext;
    if (!currentProcessingTier) {
        currentProcessingTier = inferUserTargetTier(targetUserId);
        if (!currentProcessingTier) {
            console.warn(
                `경고: 사용자 ${targetUserId}의 목표 티어를 추론할 수 없습니다. 기본 추천 또는 빈 목록을 반환합니다.`
            );
            // TODO: 티어 추론 불가 시 fallback 전략 구현 (예: 전체 인기 문제 추천)
            return [];
        }
        console.log(
            `사용자 ${targetUserId}의 추론된 목표 티어: ${currentProcessingTier}`
        );
    }

    const effectiveLevelsForUserInTier =
        (userEffectiveLevelsWithTier[currentProcessingTier] &&
            userEffectiveLevelsWithTier[currentProcessingTier][targetUserId]) ||
        {};

    if (Object.keys(effectiveLevelsForUserInTier).length === 0) {
        console.warn(
            `경고: 사용자 ${targetUserId} (티어 ${currentProcessingTier})에 대한 안정적 해결 수준 데이터가 없습니다.`
        );
        // TODO: 이 경우의 fallback 전략 구현 (예: 해당 티어의 인기 문제 추천)
        return [];
    }

    const solvedProblemIds = getSolvedProblemSetForUser(targetUserId);
    const candidateProblems = [];

    for (const problemIdStr in problemDetails) {
        // problemDetails는 {problemId: metadata} 형태
        const problem = problemDetails[problemIdStr];
        const problemId = parseInt(problemIdStr, 10);

        if (solvedProblemIds.has(problemId)) {
            continue; // 이미 푼 문제 제외
        }

        let score = 0.0;
        // const scoringReasons = []; // 디버깅용 점수 산정 이유

        const problemActualLevel = problem.level;

        // 점수 로직 1: 태그 관련성 및 난이도 적합성
        let tagAndDifficultyScore = 0;
        for (const tagKey of problem.tags) {
            if (effectiveLevelsForUserInTier[tagKey]) {
                const userEffLvl = effectiveLevelsForUserInTier[tagKey];
                tagAndDifficultyScore += 10; // 기본 태그 일치 점수
                // scoringReasons.push(`태그(${tagKey}) 일치: +10`);

                if (problemActualLevel === userEffLvl) {
                    tagAndDifficultyScore += 30; // 현재 수준 다지기
                    // scoringReasons.push(`난이도(${tagKey}) 완벽: +30`);
                } else if (problemActualLevel === userEffLvl + 1) {
                    tagAndDifficultyScore += 20; // 점진적 성장
                    // scoringReasons.push(`난이도(${tagKey}) 성장: +20`);
                } else if (problemActualLevel === userEffLvl + 2) {
                    tagAndDifficultyScore += 10; // 약간 도전
                    // scoringReasons.push(`난이도(${tagKey}) 도전: +10`);
                } else if (
                    problemActualLevel === userEffLvl - 1 &&
                    problemActualLevel > 0
                ) {
                    tagAndDifficultyScore += 5; // 빈틈 채우기
                    // scoringReasons.push(`난이도(${tagKey}) 빈틈: +5`);
                }
            }
        }
        score += tagAndDifficultyScore;

        // 점수 로직 2: 인기도 (푼 사람 수) - 로그 스케일 적용 및 가중치 부여
        if (problem.solvedCount > 0) {
            const popularityScore = Math.log10(problem.solvedCount + 1) * 5; // 가중치 5는 예시
            score += popularityScore;
            // scoringReasons.push(`인기도: +${popularityScore.toFixed(2)}`);
        }

        // 점수 로직 3: 목표 티어 맥락 부합성
        const numericTargetTier = parseInt(currentProcessingTier, 10);
        if (!isNaN(numericTargetTier)) {
            if (problemActualLevel === numericTargetTier) {
                score += 15; // 목표 티어와 정확히 일치
                // scoringReasons.push(`목표티어(${numericTargetTier}) 일치: +15`);
            } else if (Math.abs(problemActualLevel - numericTargetTier) === 1) {
                score += 5; // 목표 티어와 1레벨 차이
                // scoringReasons.push(`목표티어 근접: +5`);
            }
        }

        if (score > 0) {
            candidateProblems.push({
                problemId: problem.id,
                // problem_details.json에 titleKo가 있다고 가정
                title:
                    problemDetails[problem.id]?.titleKo || `문제 ${problem.id}`,
                level: problem.level,
                tags: problem.tags,
                score: score
                // reasons: scoringReasons // 디버깅용
            });
        }
    }

    // 점수 기준으로 내림차순 정렬
    candidateProblems.sort((a, b) => b.score - a.score);

    return candidateProblems.slice(0, numRecommendations);
}

console.log(
    await getProblemRecommendations({
        targetUserId: 'hjhjkk',
        targetTierContext: '11',
        numRecommendations: 5
    })
        .then((recommendations) => {
            console.log('추천 문제:', recommendations);
        })
        .catch((err) => {
            console.error('추천 문제 로딩 중 오류 발생:', err);
        })
);
