#!/usr/bin/env python3
"""Extract the text-only Dalail catalogue from the Expo SQLite source database."""

from __future__ import annotations

import argparse
import html
import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT.parent / "durood-app" / "assets" / "db" / "dalail_al_khayrat.sqlite"
DEFAULT_OUTPUT = ROOT / "data" / "dalail-content.json"


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    value = value.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
    import re

    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]*>", "", value)
    return html.unescape(value).strip()


def read_languages(db: sqlite3.Connection) -> list[dict[str, object]]:
    rows = db.execute(
        """SELECT language, lang, classes, direction, sort
           FROM languages
           WHERE is_deleted = 0 AND classes IS NOT NULL AND classes != ''
           ORDER BY sort, id"""
    ).fetchall()
    languages = []
    for name, code, text_class, direction, order in rows:
        languages.append(
            {
                "name": name,
                "code": code,
                "key": text_class,
                "direction": direction or ("rtl" if code in {"ar", "fa", "ur"} else "ltr"),
                "order": order,
            }
        )
    return languages


def read_lines(db: sqlite3.Connection, table: str, parent_column: str) -> dict[int, list[dict[str, object]]]:
    rows = db.execute(
        f"""SELECT {parent_column}, line_number, classes, txt
            FROM {table}
            WHERE is_deleted = 0
            ORDER BY {parent_column}, line_number, id"""
    ).fetchall()
    grouped: dict[tuple[int, int], dict[str, str]] = {}
    for parent_id, line_number, text_class, text in rows:
        key = (int(parent_id), int(line_number))
        grouped.setdefault(key, {})[str(text_class)] = clean_text(text)

    output: dict[int, list[dict[str, object]]] = {}
    for (parent_id, line_number), values in grouped.items():
        output.setdefault(parent_id, []).append({"number": line_number, "texts": values})
    return output


def build_data(source: Path) -> dict[str, object]:
    db = sqlite3.connect(f"file:{source.as_posix()}?mode=ro", uri=True)
    try:
        languages = read_languages(db)
        part_lines = read_lines(db, "parts_text", "part_number")
        dua_lines = read_lines(db, "duas_text", "dua_id")

        parts = [
            {
                "number": int(part_number),
                "day": part_day,
                "title": part_title,
                "description": clean_text(part_description),
                "lines": part_lines.get(int(part_number), []),
            }
            for part_number, part_day, part_title, part_description in db.execute(
                """SELECT part_number, part_day, part_title, part_description
                   FROM parts_info WHERE is_deleted = 0 ORDER BY part_number"""
            )
        ]

        duas = [
            {
                "id": int(dua_id),
                "slug": dua_name,
                "title": dua_title,
                "titleArabic": dua_title_arabic,
                "lines": dua_lines.get(int(dua_id), []),
            }
            for dua_id, dua_name, dua_title, dua_title_arabic in db.execute(
                """SELECT id, dua_name, dua_title, dua_title_arabic
                   FROM duas_info WHERE is_deleted = 0 ORDER BY id"""
            )
        ]

        return {
            "title": "Dalailul Khairat",
            "fullTitle": "Dalailul Khairat wa Shawariq al-Anwar",
            "sourceDatabase": source.name,
            "languages": languages,
            "parts": parts,
            "duas": duas,
        }
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Source SQLite database path")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Generated JSON output path")
    args = parser.parse_args()
    if not args.source.is_file():
        raise SystemExit(f"Source database not found: {args.source}")

    payload = build_data(args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.output} ({len(payload['parts'])} parts, {len(payload['duas'])} duas, {len(payload['languages'])} languages)")


if __name__ == "__main__":
    main()
