export interface DataJson {
  problems: ProblemResponse;
  user: UserProfileResponse;
}

export interface UserProfile {
  handle: string;
  bio: string;
  badgeId: string;
  backgroundId: string;
  profileImageUrl: string;
  solvedCount: number;
  voteCount: number;
  class: number;
  classDecoration: string; // "none" | "bronze" | "silver" | "gold" | etc. (추정)
  rivalCount: number;
  reverseRivalCount: number;
  tier: number;
  rating: number;
  ratingByProblemsSum: number;
  ratingByClass: number;
  ratingBySolvedCount: number;
  ratingByVoteCount: number;
  arenaTier: number;
  arenaRating: number;
  arenaMaxTier: number;
  arenaMaxRating: number;
  arenaCompetedRoundCount: number;
  maxStreak: number;
  coins: number;
  stardusts: number;
  joinedAt: string; // ISO 8601 형식의 날짜 문자열
  bannedUntil: string; // ISO 8601 형식의 날짜 문자열
  proUntil: string; // ISO 8601 형식의 날짜 문자열
  rank: number;
}

export interface UserProfileResponse {
  count: number;
  items: UserProfile[];
}

// ----------------------------------------
// 문제 DTO
// ----------------------------------------

export interface ProblemTitle {
  language: string;
  languageDisplayName: string;
  title: string;
  isOriginal: boolean;
}

export interface TagDisplayName {
  language: string;
  name: string;
  short: string;
}

export interface TagAlias {
  alias: string;
}

export interface ProblemTag {
  key: string;
  isMeta: boolean;
  bojTagId: number;
  problemCount: number;
  displayNames: TagDisplayName[];
  aliases: TagAlias[];
}

export interface ProblemItem {
  problemId: number;
  titleKo: string;
  titles: ProblemTitle[];
  isSolvable: boolean;
  isPartial: boolean;
  acceptedUserCount: number;
  level: number;
  votedUserCount: number;
  sprout: boolean;
  givesNoRating: boolean;
  isLevelLocked: boolean;
  averageTries: number;
  official: boolean;
  tags: ProblemTag[];
  metadata: null; // metadata의 구조가 명확하지 않으므로 'any' 또는 'unknown'으로 지정합니다.
}

export interface ProblemResponse {
  count: number;
  items: ProblemItem[];
}
