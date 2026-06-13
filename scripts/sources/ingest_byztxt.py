"""
HERMENEIA — Bizantino (Robinson-Pierpont 2018) como 3o testemunho grego

Adiciona ao hermeneia_source_texts os 27 livros do NT no formato Texto
Majoritario Bizantino editado por Robinson & Pierpont. Fonte: byztxt org
no GitHub (https://github.com/byztxt/byzantine-majority-text), csv-unicode
sem parsing morfologico.

Os nomes de livro seguem o canone scrollmapper (igual TR e SBLGNT) para
que o resolve_reference da API case os tres testemunhos no mesmo ref.

Uso:
  python scripts/sources/ingest_byztxt.py
"""
import os
import sys
import csv
import io
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
load_dotenv()

BMT = (
    "https://raw.githubusercontent.com/byztxt/byzantine-majority-text"
    "/master/csv-unicode/strongs/no-parsing/{f}.csv"
)

# arquivo BMT -> nome canonico (scrollmapper)
BMT_BOOKS = {
    "MAT": "Matthew", "MAR": "Mark", "LUK": "Luke", "JOH": "John",
    "ACT": "Acts", "ROM": "Romans",
    "1CO": "I Corinthians", "2CO": "II Corinthians",
    "GAL": "Galatians", "EPH": "Ephesians", "PHP": "Philippians",
    "COL": "Colossians",
    "1TH": "I Thessalonians", "2TH": "II Thessalonians",
    "1TI": "I Timothy", "2TI": "II Timothy",
    "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews", "JAM": "James",
    "1PE": "I Peter", "2PE": "II Peter",
    "1JO": "I John", "2JO": "II John", "3JO": "III John",
    "JUD": "Jude", "REV": "Revelation of John",
}


def _fetch(url: str) -> str:
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read().decode("utf-8")


def rows_from_byzantine() -> list[dict]:
    rows = []
    for fcode, book in BMT_BOOKS.items():
        raw = _fetch(BMT.format(f=fcode))
        reader = csv.DictReader(io.StringIO(raw))
        n = 0
        for line in reader:
            ch, vs = int(line["chapter"]), int(line["verse"])
            text = (line["text"] or "").strip()
            if not text:
                continue
            rows.append({
                "language_id": "koine_greek",
                "witness": "ByzMT",
                "witness_name": "Byzantine Majority Text (Robinson-Pierpont 2018)",
                "book": book,
                "chapter": ch,
                "verse": vs,
                "ref": f"{book} {ch}:{vs}",
                "text": text,
            })
            n += 1
        print(f"  ByzMT {book}: {n} versiculos")
    return rows


def ingest():
    sb = create_client(
        os.environ["SUPABASE_URL"],
        os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_KEY"],
    )
    rows = rows_from_byzantine()
    print(f"Total {len(rows)} versiculos. Inserindo...")
    inserted = 0
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        sb.table("hermeneia_source_texts").upsert(
            batch, on_conflict="witness,book,chapter,verse",
            ignore_duplicates=True,
        ).execute()
        inserted += len(batch)
        if inserted % 2000 == 0 or inserted == len(rows):
            print(f"  ok {inserted}/{len(rows)}")
    print(f"OK: Bizantino ingerido: {inserted} versiculos")


if __name__ == "__main__":
    ingest()
