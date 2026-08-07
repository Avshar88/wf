#!/usr/bin/env python3
"""Collect verified Real Madrid news for MADRID NOW by ARAMPRO."""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "news.json"
USER_AGENT = "MadridNowFeed/2.0 (+https://madridista-realm.primeoutlet.chatgpt.site)"
MAX_STORIES = 30
RETENTION_DAYS = 21

GOOGLE_SOURCES = [
    {
        "name": "Real Madrid",
        "category": "Official",
        "query": '"Real Madrid" site:realmadrid.com/en-US/news when:7d',
        "domains": ("realmadrid.com",),
    },
    {
        "name": "LaLiga",
        "category": "Official",
        "query": '"Real Madrid" site:laliga.com when:7d',
        "domains": ("laliga.com",),
    },
    {
        "name": "UEFA",
        "category": "Official",
        "query": '"Real Madrid" site:uefa.com when:14d',
        "domains": ("uefa.com",),
    },
    {
        "name": "Reuters",
        "category": "Reported",
        "query": '"Real Madrid" site:reuters.com/sports when:7d',
        "domains": ("reuters.com",),
    },
]

YOUTUBE_SOURCES = [
    {
        "name": "Real Madrid",
        "category": "Official",
        "channel_id": "UCWV3obpZVGgJ3j9FVhEjF2Q",
        "filter_madrid": False,
    },
    {
        "name": "Fabrizio Romano",
        "category": "Transfers",
        "channel_id": "UCX1em-uaFMS02Rrk_Bowyng",
        "filter_madrid": True,
    },
]

MADRID_TERMS = re.compile(
    r"\breal madrid\b|\bmadrid\b|vin[ií]cius|mbapp[eé]|bellingham|rodrygo|"
    r"bernab[eé]u|valverde|arda g[uü]ler|tchouam[eé]ni|courtois|carvajal",
    re.IGNORECASE,
)
MATCH_TERMS = re.compile(
    r"fixture|match|kick.?off|line.?up|squad list|champions league|laliga|"
    r"training|pre.?season|highlights?|goal",
    re.IGNORECASE,
)
TRANSFER_TERMS = re.compile(
    r"transfer|sign(?:s|ed|ing)?|deal|contract|renew|loan|departure|joins?|"
    r"agreement|here we go",
    re.IGNORECASE,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def normalize_date(value: str) -> str:
    try:
        dt = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    value = re.sub(r"<[^>]+>", " ", html.unescape(value))
    return re.sub(r"\s+", " ", value).strip()


def story_category(default: str, title: str) -> str:
    if MATCH_TERMS.search(title):
        return "Matchday"
    if TRANSFER_TERMS.search(title):
        return "Transfers"
    return default


def fetch_xml(url: str) -> ET.Element:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/atom+xml, application/rss+xml, application/xml, text/xml",
        },
    )
    with urllib.request.urlopen(request, timeout=25) as response:
        return ET.fromstring(response.read())


def google_feed_url(query: str) -> str:
    return (
        "https://news.google.com/rss/search?"
        + urllib.parse.urlencode(
            {
                "q": query,
                "hl": "en-US",
                "gl": "US",
                "ceid": "US:en",
            }
        )
    )


def collect_google(config: dict[str, object]) -> list[dict[str, str]]:
    root = fetch_xml(google_feed_url(str(config["query"])))
    stories: list[dict[str, str]] = []
    for item in root.findall("./channel/item"):
        source_node = item.find("source")
        publisher_url = (source_node.attrib.get("url", "") if source_node is not None else "").lower()
        if not any(domain in publisher_url for domain in config["domains"]):
            continue

        title = clean_text(item.findtext("title"))
        link = clean_text(item.findtext("link"))
        description = clean_text(item.findtext("description"))
        published = clean_text(item.findtext("pubDate"))
        if not title or not link or not published:
            continue
        if not MADRID_TERMS.search(f"{title} {description}"):
            continue

        source_name = str(config["name"])
        title = re.sub(rf"\s+-\s+{re.escape(source_name)}$", "", title, flags=re.IGNORECASE).strip()
        stories.append(
            {
                "id": hashlib.sha256(f"{source_name}|{title}|{published}".encode()).hexdigest()[:20],
                "category": story_category(str(config["category"]), title),
                "time": "NEW",
                "title": title,
                "summary": f"Latest verified Real Madrid update published by {source_name}.",
                "source": source_name,
                "href": link,
                "publishedAt": normalize_date(published),
            }
        )
    return stories


def collect_youtube(config: dict[str, object]) -> list[dict[str, str]]:
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/",
    }
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={config['channel_id']}"
    root = fetch_xml(url)
    stories: list[dict[str, str]] = []
    for entry in root.findall("atom:entry", ns):
        title = clean_text(entry.findtext("atom:title", default="", namespaces=ns))
        description = clean_text(entry.findtext("media:group/media:description", default="", namespaces=ns))
        published = clean_text(entry.findtext("atom:published", default="", namespaces=ns))
        video_id = clean_text(entry.findtext("yt:videoId", default="", namespaces=ns))
        if not title or not video_id or not published:
            continue
        if bool(config["filter_madrid"]) and not MADRID_TERMS.search(f"{title} {description}"):
            continue

        source_name = str(config["name"])
        stories.append(
            {
                "id": hashlib.sha256(f"{source_name}|youtube|{video_id}".encode()).hexdigest()[:20],
                "category": story_category(str(config["category"]), title),
                "time": "NEW",
                "title": title,
                "summary": f"New video update from {source_name}'s official YouTube channel.",
                "source": source_name,
                "href": f"https://www.youtube.com/watch?v={video_id}",
                "publishedAt": normalize_date(published),
            }
        )
    return stories


def load_existing() -> dict[str, object]:
    if not OUTPUT.exists():
        return {"stories": [], "updatedAt": None}
    try:
        data = json.loads(OUTPUT.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {"stories": [], "updatedAt": None}
    except (OSError, json.JSONDecodeError):
        return {"stories": [], "updatedAt": None}


def story_identity(story: dict[str, object]) -> tuple[str, str, str]:
    return (
        str(story.get("id", "")),
        str(story.get("title", "")),
        str(story.get("publishedAt", "")),
    )


def main() -> int:
    existing = load_existing()
    collected: list[dict[str, str]] = []
    successful_sources: set[str] = set()
    failures: list[str] = []

    for config in GOOGLE_SOURCES:
        try:
            collected.extend(collect_google(config))
            successful_sources.add(str(config["name"]))
        except Exception as exc:  # Keep other trusted sources running.
            failures.append(f"{config['name']}: {exc}")

    for config in YOUTUBE_SOURCES:
        try:
            collected.extend(collect_youtube(config))
            successful_sources.add(str(config["name"]))
        except Exception as exc:  # Keep other trusted sources running.
            failures.append(f"{config['name']} YouTube: {exc}")

    if not successful_sources:
        for failure in failures:
            print(failure, file=sys.stderr)
        print("No trusted source could be reached; preserving the previous feed.", file=sys.stderr)
        return 1

    existing_stories = [
        story for story in existing.get("stories", [])
        if isinstance(story, dict)
    ]
    candidates = collected + existing_stories
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
    unique: dict[str, dict[str, object]] = {}

    for story in candidates:
        title = clean_text(str(story.get("title", "")))
        published = str(story.get("publishedAt", ""))
        if not title or not published:
            continue
        try:
            published_dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
        except ValueError:
            continue
        if published_dt < cutoff:
            continue
        key = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
        unique.setdefault(key, story)

    stories = sorted(
        unique.values(),
        key=lambda story: str(story.get("publishedAt", "")),
        reverse=True,
    )[:MAX_STORIES]

    previous_ids = [story_identity(story) for story in existing_stories]
    current_ids = [story_identity(story) for story in stories]
    if current_ids == previous_ids:
        print("No new verified stories.")
        return 0

    payload = {
        "version": 2,
        "stories": stories,
        "updatedAt": now_iso(),
        "refreshSeconds": 60,
        "collectionIntervalMinutes": 5,
        "availableSources": [
            "Real Madrid",
            "LaLiga",
            "UEFA",
            "Reuters",
            "Fabrizio Romano",
        ],
        "mode": "live" if stories else "fallback",
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(stories)} verified stories from {len(successful_sources)} sources.")
    for failure in failures:
        print(f"Warning: {failure}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
