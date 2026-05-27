"""
HERMENEIA — Ingestão de textos-fonte por testemunho (busca por referência)

Popula hermeneia_source_texts com versículos de:
  - WLC    (Westminster Leningrad Codex)        — hebraico, OT   [scrollmapper]
  - TR     (Textus Receptus, Scrivener 1894)    — grego, NT      [scrollmapper]
  - SBLGNT (SBL Greek New Testament, crítico)   — grego, NT      [morphgnt]

Os nomes de livro seguem o scrollmapper (canônico): "I Corinthians",
"Revelation of John" etc. — o parser de referência da API mapeia aliases.

Uso:
  python scripts/sources/ingest_source_texts.py
"""
import os
import sys
import json
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
load_dotenv()

SM = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/{v}.json"
MORPHGNT = "https://raw.githubusercontent.com/morphgnt/sblgnt/master/{f}-morphgnt.txt"

# arquivo morphgnt → nome canônico (scrollmapper)
SBLGNT_BOOKS = {
    "61-Mt": "Matthew", "62-Mk": "Mark", "63-Lk": "Luke", "64-Jn": "John",
    "65-Ac": "Acts", "66-Ro": "Romans", "67-1Co": "I Corinthians",
    "68-2Co": "II Corinthians", "69-Ga": "Galatians", "70-Eph": "Ephesians",
    "71-Php": "Philippians", "72-Col": "Colossians", "73-1Th": "I Thessalonians",
    "74-2Th": "II Thessalonians", "75-1Ti": "I Timothy", "76-2Ti": "II Timothy",
    "77-Tit": "Titus", "78-Phm": "Philemon", "79-Heb": "Hebrews", "80-Jas": "James",
    "81-1Pe": "I Peter", "82-2Pe": "II Peter", "83-1Jn": "I John", "84-2Jn": "II John",
    "85-3Jn": "III John", "86-Jud": "Jude", "87-Re": "Revelation of John",
}


def _fetch(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()


def rows_from_scrollmapper(version: str, language_id: str, witness: str, witness_name: str) -> list[dict]:
    data = json.loads(_fetch(SM.format(v=version)))
    rows = []
    for b in data["books"]:
        book = b["name"]
        for c in b["chapters"]:
            ch = c["chapter"]
            for v in c["verses"]:
                text = (v.get("text") or "").strip()
                if not text:
                    continue
                rows.append({
                    "language_id": language_id, "witness": witness,
                    "witness_name": witness_name, "book": book,
                    "chapter": ch, "verse": v["verse"],
                    "ref": f"{book} {ch}:{v['verse']}", "text": text,
                })
    return rows


def rows_from_sblgnt() -> list[dict]:
    rows = []
    for fcode, book in SBLGNT_BOOKS.items():
        raw = _fetch(MORPHGNT.format(f=fcode)).decode("utf-8")
        verses: dict[tuple, list[str]] = {}
        order: list[tuple] = []
        for line in raw.splitlines():
            parts = line.split()
            if len(parts) < 5:
                continue
            bcv = parts[0]
            ch, vs = int(bcv[2:4]), int(bcv[4:6])
            token = parts[3]  # texto com pontuação
            key = (ch, vs)
            if key not in verses:
                verses[key] = []
                order.append(key)
            verses[key].append(token)
        for ch, vs in order:
            rows.append({
                "language_id": "koine_greek", "witness": "SBLGNT",
                "witness_name": "SBL Greek New Testament", "book": book,
                "chapter": ch, "verse": vs,
                "ref": f"{book} {ch}:{vs}", "text": " ".join(verses[(ch, vs)]),
            })
        print(f"  SBLGNT {book}: {sum(1 for k in order)} versiculos")
    return rows


def ingest():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

    print("WLC (hebraico)...")
    wlc = rows_from_scrollmapper("WLC", "biblical_hebrew", "WLC", "Westminster Leningrad Codex")
    print(f"  {len(wlc)} versiculos")
    print("TR (grego, Textus Receptus)...")
    tr = rows_from_scrollmapper("TR", "koine_greek", "TR", "Textus Receptus (Scrivener 1894)")
    print(f"  {len(tr)} versiculos")
    print("SBLGNT (grego, critico)...")
    sblgnt = rows_from_sblgnt()
    print(f"  {len(sblgnt)} versiculos")

    all_rows = wlc + tr + sblgnt
    print(f"Total {len(all_rows)} versiculos. Inserindo...")
    inserted = 0
    for i in range(0, len(all_rows), 500):
        batch = all_rows[i:i + 500]
        sb.table("hermeneia_source_texts").upsert(
            batch, on_conflict="witness,book,chapter,verse", ignore_duplicates=True,
        ).execute()
        inserted += len(batch)
        if inserted % 5000 == 0 or inserted == len(all_rows):
            print(f"  ✓ {inserted}/{len(all_rows)}")
    print(f"✓ Textos-fonte ingeridos: {inserted}")


if __name__ == "__main__":
    ingest()
