import json
import os
import random
import pickle
import time
from collections import defaultdict
from contextlib import suppress
import typing
import sys
from dataclasses import dataclass
from flask import Flask, request, jsonify

import requests

# Decimal string representation of numeric problem id.
ProblemIdStrType = str

# Problem id in integer type.
ProblemIdIntType = int

# Tier.
TierStrType = str

# Tier.
TierIntType = int

# Tier statistics.
AverageTierType = float

# Tag
TagType = str

# {"tier": 1, "tags": ["tag:foo", "tag:bar"]}
ProblemMetadataType = dict[str, TierIntType | list[TagType]]

# The code seems to have no specific assumption on user id type internally.
# (As long as we're able to use it as a dict key)
# But handles in string are used in sovledac API.
UserIdType = str

# "Interaction" raw data.
RawDataType = dict[TierStrType, dict[UserIdType, list[ProblemIdIntType]]]

TagToAverageTier = dict[TagType, AverageTierType]

CACHE_FILENAME = "problem_metadata_cache.pkl"
INTERACTIONS_FILE = "solved-problems-by-user.json"

app = Flask(__name__)


@dataclass
class OneBigBeautifulJsonList:
    count: int
    items: list


@dataclass
class OneBigBeautifulJson:
    problems: OneBigBeautifulJsonList
    user: OneBigBeautifulJsonList


class UserNotFoundException(Exception):
    pass


def solved_ac_api(path: str, params: dict[str, str]) -> requests.Response:
    return requests.get(
        url=f"https://solved.ac/api/v3/{path}",
        params=params,
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "DNT": "1",
            "Sec-GPC": "1",
            "Priority": "u=0",
        },
    )


# convert tier string to integer
def parse_tier(tier_value: TierStrType) -> TierIntType | None:
    try:
        return int(tier_value)
    except (TypeError, ValueError):
        return None


# load problem metadata (level, tags) with caching
def load_all_problem_metadata(
    data_path: str,
) -> dict[ProblemIdStrType, ProblemMetadataType]:
    """
    Traverse metadata JSON files, extract problem tiers and tags, and cache results to speed up subsequent loads.
    Returns a dict: {'problem_id': {'tier': int, 'tags': [str]}}
    """
    if os.path.exists(CACHE_FILENAME):
        with suppress(Exception):
            with open(CACHE_FILENAME, "rb") as cache_file:
                return pickle.load(cache_file)

    start = time.time()
    problem_metadata: dict[ProblemIdStrType, ProblemMetadataType] = {}
    for root, _, files in os.walk(data_path):
        for fname in files:
            if not fname.endswith(".json"):
                continue
            path = os.path.join(root, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                pid = data.get("problemId")
                if not pid:
                    continue
                pid = str(pid)
                ko_title = next(
                    (
                        t["title"]
                        for t in data.get("titles", [])
                        if t.get("language") == "ko"
                    ),
                    None,
                )
                if not ko_title:
                    continue
                tier = parse_tier(data.get("level"))
                if tier is None:
                    continue
                tags = [f"tag:{t['key']}" for t in data.get("tags", [])]
                problem_metadata[pid] = {"tier": tier, "tags": tags}
            except Exception as e:
                print(f"Warning: failed to process {path}: {e}")
    try:
        with open(CACHE_FILENAME, "wb") as cache_file:
            pickle.dump(problem_metadata, cache_file)
    except Exception:
        pass
    print(
        f"Loaded and cached {len(problem_metadata)} problems in {time.time()-start:.2f}s"
    )
    return problem_metadata


# load and build user-to-tier mapping
def load_raw_interactions_and_build_user_to_tier(
    file_path: str,
) -> tuple[RawDataType, dict[UserIdType, TierIntType]]:
    raw_data: RawDataType = {}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print("Info: interactions not found, initializing empty.")
    except Exception as e:
        print(f"Error loading interactions: {e}")

    user_to_tier: dict[UserIdType, TierIntType] = {}
    for tier_str, users in raw_data.items():
        tier_int = parse_tier(tier_str)
        if tier_int is None:
            continue
        for uid in users:
            user_to_tier[uid] = tier_int
    return raw_data, user_to_tier


# helper: update raw interactions with new user's solved list
def update_user_interactions(
    user_id: UserIdType,
    tier: TierIntType,
    solved_list: list[ProblemIdIntType],
    raw_data: RawDataType,
    user_to_tier: dict[UserIdType, TierIntType],
):
    """
    Insert or update a user's solved problems into raw_data and persist to JSON.
    """
    # determine tier for this user (fallback to 0 if unknown)
    tier_int: TierIntType = user_to_tier.get(user_id, tier)
    tier_key: TierStrType = str(tier_int)
    if tier_key not in raw_data:
        raw_data[tier_key] = {}
    raw_data[tier_key][user_id] = solved_list
    user_to_tier[user_id] = tier_int

    try:
        with open(INTERACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(raw_data, f, ensure_ascii=False, indent=2)
        print(f"Updated interactions for user {user_id} in tier {tier_int}.")
    except Exception as e:
        print(f"Error saving interactions: {e}")


# build tier-tag levels
def build_tier_tag_levels(
    raw_data: RawDataType, problem_metadata: dict[ProblemIdStrType, ProblemMetadataType]
) -> dict[TierIntType, dict[TagType, list[TierIntType]]]:
    tier_tag_levels: dict[TierIntType, dict[TagType, list[TierIntType]]] = {}
    for tier_str, user_dict in raw_data.items():
        tier_int = parse_tier(tier_str)
        if tier_int is None:
            continue
        tag_levels: dict[TagType, list[TierIntType]] = defaultdict(list)
        for solved in user_dict.values():
            for pid in solved:
                meta = problem_metadata.get(str(pid))
                if not meta:
                    continue
                pt = typing.cast(TierIntType, meta["tier"])
                for tag in typing.cast(list[TagType], meta["tags"]):
                    tag_levels[tag].append(pt)
        tier_tag_levels[tier_int] = tag_levels
    return tier_tag_levels


# compute average tier per tag for each tier
def compute_tier_tag_avg_levels(
    tier_tag_levels: dict[TierIntType, dict[TagType, list[TierIntType]]],
) -> dict[TierIntType, TagToAverageTier]:
    result: dict[TierIntType, TagToAverageTier] = {}
    for tier, tag_levels in tier_tag_levels.items():
        result[tier] = {
            tag: sum(levels) / len(levels)
            for tag, levels in tag_levels.items()
            if levels
        }
    return result


# compute user tag averages
def compute_user_tag_avg_levels(
    solved_list: list[ProblemIdIntType],
    problem_metadata: dict[ProblemIdStrType, ProblemMetadataType],
) -> TagToAverageTier:
    tag_levels: dict[TagType, list[TierIntType]] = defaultdict(list)
    for pid in solved_list:
        meta = problem_metadata.get(str(pid))
        if not meta:
            continue
        for tag in typing.cast(list[TagType], meta["tags"]):
            tag_levels[tag].append(typing.cast(TierIntType, meta["tier"]))
    return {tag: sum(vals) / len(vals) for tag, vals in tag_levels.items() if vals}


# blend user and tier
def blend_user_and_tier_levels(
    user_avg: TagToAverageTier, tier_avg: TagToAverageTier, alpha: float = 0.6
) -> TagToAverageTier:
    tags = set(user_avg) | set(tier_avg)
    result: TagToAverageTier = {}
    for tag in tags:
        if tag in user_avg and tag in tier_avg:
            result[tag] = alpha * user_avg[tag] + (1 - alpha) * tier_avg[tag]
        elif tag in user_avg and tag not in tier_avg:
            result[tag] = user_avg[tag]
        elif tag not in user_avg and tag in tier_avg:
            result[tag] = tier_avg[tag]
    return result


# collect candidates and finalize as before
def collect_candidates(
    blended: TagToAverageTier,
    problem_metadata: dict[ProblemIdStrType, ProblemMetadataType],
    tol: int | float = 2,
) -> dict[TagType, list[ProblemIdStrType]]:
    candidates: dict[TagType, list[ProblemIdStrType]] = defaultdict(list)
    for tag, target in blended.items():
        low: float = target - tol
        high: float = target + tol
        for pid, meta in problem_metadata.items():
            problem_tier = typing.cast(TierIntType, meta["tier"])
            problem_tags = typing.cast(list[TagType], meta["tags"])
            if tag in problem_tags and low <= problem_tier <= high:
                candidates[tag].append(pid)
    return candidates


def finalize_recommendations(
    candidates: dict[TagType, list[ProblemIdStrType]], n=3, max_total=30
) -> list[ProblemIdStrType]:
    """
    Select up to n candidates per tag, dedupe, and cap total recommendations to max_total.
    """
    unique_recs: list[ProblemIdStrType] = []
    seen = set()
    # iterate through each tag's candidate list
    for lst in candidates.values():
        random.shuffle(lst)
        for pid in lst[:n]:
            if pid not in seen:
                seen.add(pid)
                unique_recs.append(pid)
                if len(unique_recs) >= max_total:
                    return unique_recs
    return unique_recs


# main recommendation with update support
def recommend_with_tier_blend(
    user_id: UserIdType,
    user_solved: list[ProblemIdIntType],
    user_to_tier: dict[UserIdType, TierIntType],
    raw_data: RawDataType,
    tier_tag_avg: dict[TierIntType, TagToAverageTier],
    problem_metadata: dict[ProblemIdStrType, ProblemMetadataType],
    tol=1,
    alpha=0.6,
    n=2,
) -> list[ProblemIdStrType]:
    # update cold-start user interactions
    if user_id not in user_to_tier:
        update_user_interactions(user_id, 0, user_solved, raw_data, user_to_tier)

    tier = user_to_tier.get(user_id, 0)
    user_avg = compute_user_tag_avg_levels(user_solved, problem_metadata)
    tier_avg = tier_tag_avg.get(tier, {})
    blended = blend_user_and_tier_levels(user_avg, tier_avg, alpha)
    candidates = collect_candidates(blended, problem_metadata, tol)
    return finalize_recommendations(candidates, n)


def recommend_for(user_id: UserIdType, tier: TierIntType) -> list[ProblemIdIntType]:
    problem_metadata = load_all_problem_metadata("./solvedac/data")
    raw_data, user_to_tier = load_raw_interactions_and_build_user_to_tier(
        INTERACTIONS_FILE
    )
    if user_id not in user_to_tier:
        # Populate user data using top_100 data.
        top100 = solved_ac_api(path="user/top_100", params={"handle": user_id}).json()
        user_solved = [item["problemId"] for item in top100["items"]]
        update_user_interactions(user_id, tier, user_solved, raw_data, user_to_tier)
        raw_data, user_to_tier = load_raw_interactions_and_build_user_to_tier(
            INTERACTIONS_FILE
        )
    tier_levels = build_tier_tag_levels(raw_data, problem_metadata)
    tier_tag_avg = compute_tier_tag_avg_levels(tier_levels)
    sol = raw_data[str(user_to_tier[user_id])].get(user_id, [])
    recommended = recommend_with_tier_blend(
        user_id, sol, user_to_tier, raw_data, tier_tag_avg, problem_metadata
    )
    return [int(problem_id) for problem_id in recommended]


def one_big_beautiful_json(user_id: UserIdType) -> OneBigBeautifulJson:
    user_response = solved_ac_api(path="user/show", params={"handle": user_id})
    if user_response.status_code == 404:
        raise UserNotFoundException
    user_data = user_response.json()
    tier: TierIntType = user_data["tier"]
    problem_ids = recommend_for(user_id, tier)
    problems_response = solved_ac_api(
        path="problem/lookup",
        params={
            "problemIds": ",".join([str(p) for p in problem_ids]),
            "x-solvedac-language": "ko,",
        },
    )
    problems = problems_response.json()
    return OneBigBeautifulJson(
        user=OneBigBeautifulJsonList(count=1, items=[user_data]),
        problems=OneBigBeautifulJsonList(count=len(problems), items=problems),
    )


if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(
            json.dumps(
                one_big_beautiful_json(sys.argv[1]),
                default=vars,
                ensure_ascii=False,
                indent=2,
            )
        )
        sys.exit(0)
    print("Loading problem metadata...")
    problem_metadata = load_all_problem_metadata("./solvedac/data")

    print("Loading user interactions...")
    raw_data, user_to_tier = load_raw_interactions_and_build_user_to_tier(
        INTERACTIONS_FILE
    )

    print("Building tier-tag stats...")
    tier_levels = build_tier_tag_levels(raw_data, problem_metadata)
    tier_tag_avg = compute_tier_tag_avg_levels(tier_levels)

    # Example existing user
    if user_to_tier:
        uid = next(iter(user_to_tier))
        sol = raw_data[str(user_to_tier[uid])].get(uid, [])
        print(
            f"Recs for {uid}: {recommend_with_tier_blend(uid, sol, user_to_tier, raw_data, tier_tag_avg, problem_metadata)}"
        )

    # Example cold-start\
    # cold = 'cold_user_999'
    # solved = ['1000','2345','6789']
    # print(f"Recs for cold user: {recommend_with_tier_blend(cold, solved, user_to_tier, raw_data, tier_tag_avg, problem_metadata)}")


@app.route("/api/recommend")
def recommend():
    user_id = request.args.get("user")
    if not user_id:
        return "Param 'user' is required", 400
    try:
        result = one_big_beautiful_json(user_id)
    except UserNotFoundException:
        return "No such user", 404
    except Exception:
        return "Internal server error", 500
    return jsonify(result)
