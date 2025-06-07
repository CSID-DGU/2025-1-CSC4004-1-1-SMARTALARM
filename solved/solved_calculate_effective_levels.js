import { promises as fs } from 'fs';
import path from 'path';
// Counter와 유사한 기능을 직접 만들거나, lodash 같은 라이브러리 사용 가능
// 간단한 Counter 함수 예시:
const countBy = (arr) =>
    arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

const PREPROCESSED_DIR = 'data/preprocessed';
const OUTPUT_FILE = path.join(PREPROCESSED_DIR, 'user-effective-levels.json');

async function calculateAllUserEffectiveLevels() {
    // 1. 입력 데이터 로드
    const userSolvedTagActualLevels = JSON.parse(
        await fs.readFile(
            path.join(PREPROCESSED_DIR, 'user-solved-tag-actual-levels.json'),
            'utf-8'
        )
    );

    const userEffectiveLevels = {};

    // 2. 사용자별/태그별 반복
    for (const tier in userSolvedTagActualLevels) {
        userEffectiveLevels[tier] = {};
        for (const userId in userSolvedTagActualLevels[tier]) {
            userEffectiveLevels[tier][userId] = {};
            for (const tagKey in userSolvedTagActualLevels[tier][userId]) {
                const levelsInTag =
                    userSolvedTagActualLevels[tier][userId][tagKey];

                // 3. '안정적 해결 수준' 계산
                if (!levelsInTag || levelsInTag.length === 0) {
                    continue; // 해당 태그에 푼 문제 없음
                }

                if (levelsInTag.length === 1) {
                    userEffectiveLevels[tier][userId][tagKey] = levelsInTag[0]; // 푼 문제가 하나면 해당 레벨
                    continue;
                }

                const levelCounts = countBy(levelsInTag);
                const uniqueSortedLevels = [...new Set(levelsInTag)].sort(
                    (a, b) => a - b
                );

                let bestBandUpperLevel = uniqueSortedLevels[0]; // 기본값은 가장 낮은 레벨
                let maxProblemsInBand = 0;

                if (uniqueSortedLevels.length === 1) {
                    bestBandUpperLevel = uniqueSortedLevels[0];
                } else {
                    for (let i = 0; i < uniqueSortedLevels.length - 1; i++) {
                        const currentLowLevel = uniqueSortedLevels[i];
                        const currentUpperLevel = uniqueSortedLevels[i + 1]; // 실제 다음 레벨 값

                        // 현재는 [L, L+1] 고정폭 대신 실제 인접한 두 유니크 레벨을 기준으로 함
                        // 만약 [L, L+1] 고정폭을 원한다면, min_lvl 부터 max_lvl-1 까지 순회해야 함.
                        // 여기서는 유니크 레벨들 사이의 밀집도를 봄.
                        // 만약 유저가 10, 12, 13레벨을 풀었다면 [10,12], [12,13] 구간을 봄.

                        // 수정: 우리가 논의한 [L, L+1] (연속된 두 레벨) 구간 밀집도 방식으로 변경
                    }
                    // [L, L+1] 구간 밀집도 방식으로 수정된 로직:
                    const minLvlSolved = uniqueSortedLevels[0];
                    const maxLvlSolved =
                        uniqueSortedLevels[uniqueSortedLevels.length - 1];
                    bestBandUpperLevel = minLvlSolved; // 재초기화

                    for (
                        let currentLowLevel = minLvlSolved;
                        currentLowLevel < maxLvlSolved;
                        currentLowLevel++
                    ) {
                        const currentUpperLevelFromBand = currentLowLevel + 1;
                        const problemsInBand =
                            (levelCounts[currentLowLevel] || 0) +
                            (levelCounts[currentUpperLevelFromBand] || 0);

                        if (problemsInBand >= maxProblemsInBand) {
                            // 등호 포함 시 더 높은 레벨 구간 선호
                            maxProblemsInBand = problemsInBand;
                            bestBandUpperLevel = currentUpperLevelFromBand;
                        }
                    }
                }
                userEffectiveLevels[tier][userId][tagKey] = bestBandUpperLevel;
            }
        }
    }

    // 4. 결과 저장
    await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(userEffectiveLevels, null, 2)
    );
    console.log(`사용자별/태그별 안정적 해결 수준 계산 완료: ${OUTPUT_FILE}`);

    return userEffectiveLevels;
}

calculateAllUserEffectiveLevels().catch(console.error);
