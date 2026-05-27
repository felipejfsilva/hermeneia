"""
HERMENEIA — Resolução de referências bíblicas → (livro, capítulo, versículo)

Mapeia entradas como "John 1:1", "Gen 1:1", "1 Cor 13:13", "I Coríntios 13:13"
para o nome canônico de livro usado em hermeneia_source_texts (padrão
scrollmapper: "I Corinthians", "Revelation of John"...).
"""
import re

# Nomes canônicos (padrão scrollmapper) presentes em hermeneia_source_texts.
_CANON = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua",
    "Judges", "Ruth", "I Samuel", "II Samuel", "I Kings", "II Kings",
    "I Chronicles", "II Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
    "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
    "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
    "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "I Corinthians", "II Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "I Thessalonians", "II Thessalonians",
    "I Timothy", "II Timothy", "Titus", "Philemon", "Hebrews", "James",
    "I Peter", "II Peter", "I John", "II John", "III John", "Jude",
    "Revelation of John",
]

# Abreviações que NÃO são prefixo do nome canônico (essas precisam de mapa).
_ABBREV = {
    "mt": "Matthew", "mk": "Mark", "mc": "Mark", "lk": "Luke", "jn": "John",
    "jo": "John", "ac": "Acts", "rm": "Romans", "gn": "Genesis", "ex": "Exodus",
    "lv": "Leviticus", "nm": "Numbers", "dt": "Deuteronomy", "ps": "Psalms",
    "prv": "Proverbs", "rev": "Revelation of John", "rv": "Revelation of John",
    "ap": "Revelation of John", "phm": "Philemon", "php": "Philippians",
}
_ROMAN = {"1": "i", "2": "ii", "3": "iii"}


def _norm(s: str) -> str:
    s = (s or "").strip().lower().replace(".", "")
    s = re.sub(r"\s+", " ", s)
    m = re.match(r"^([123])\s*(.+)$", s)  # "1 cor"/"1cor" -> "i cor"
    if m:
        s = f"{_ROMAN[m.group(1)]} {m.group(2)}"
    return s


def resolve_reference(ref: str) -> tuple[str, int, int] | None:
    m = re.match(r"^\s*(.+?)\s+(\d+)\s*[:.\s]\s*(\d+)\s*$", ref or "")
    if not m:
        return None
    book_part, ch, vs = m.group(1), int(m.group(2)), int(m.group(3))
    nb = _norm(book_part)
    norm_map = {_norm(b): b for b in _CANON}

    if nb in norm_map:
        return (norm_map[nb], ch, vs)
    if nb in _ABBREV:
        return (_ABBREV[nb], ch, vs)
    cands = [b for k, b in norm_map.items() if k.startswith(nb)]
    if len(cands) == 1:
        return (cands[0], ch, vs)
    return None
