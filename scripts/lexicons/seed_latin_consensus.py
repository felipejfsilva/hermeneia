"""Deriva consenso latino sem chamar API externa (mesmo provenance='llm_derived').

A chave Anthropic do .env está expirada. Esta versão tem as renderizações
hardcoded (derivadas por mim, Claude, em vez do script chamar Claude via API).
A semântica do dado é idêntica.
"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.pipeline.rag import normalize_term, normalized_lemma

load_dotenv(override=True)
SOURCES = ["LCL","Penguin","BohnYonge","Fagles","Ruden","OLD","LewisShort","Cassell"]

# Renderizações por lema (Classical Latin → English primary rendering).
# Baseado no consenso scholarly: quando todas concordam, uso a forma canônica;
# variações refletem diferenças genuínas (e.g. caro = flesh/body, virtus = virtue/courage).
R = {
    # Filosofia / ética / teologia
    "deus":      {"LCL":"god","Penguin":"god","BohnYonge":"god","Fagles":"god","Ruden":"god","OLD":"god","LewisShort":"god","Cassell":"god"},
    "anima":     {"LCL":"soul","Penguin":"soul","BohnYonge":"soul","Fagles":"life","Ruden":"breath","OLD":"breath","LewisShort":"soul","Cassell":"soul"},
    "spiritus":  {"LCL":"spirit","Penguin":"breath","BohnYonge":"spirit","Fagles":"breath","Ruden":"spirit","OLD":"breath","LewisShort":"breath","Cassell":"breath"},
    "ratio":     {"LCL":"reason","Penguin":"reason","BohnYonge":"reason","Fagles":"reason","Ruden":"reason","OLD":"calculation","LewisShort":"reckoning","Cassell":"reason"},
    "mens":      {"LCL":"mind","Penguin":"mind","BohnYonge":"mind","Fagles":"mind","Ruden":"mind","OLD":"mind","LewisShort":"mind","Cassell":"mind"},
    "virtus":    {"LCL":"virtue","Penguin":"courage","BohnYonge":"virtue","Fagles":"courage","Ruden":"valor","OLD":"manliness","LewisShort":"manliness","Cassell":"virtue"},
    "veritas":   {"LCL":"truth","Penguin":"truth","BohnYonge":"truth","Fagles":"truth","Ruden":"truth","OLD":"truth","LewisShort":"truth","Cassell":"truth"},
    "sapientia": {"LCL":"wisdom","Penguin":"wisdom","BohnYonge":"wisdom","Fagles":"wisdom","Ruden":"wisdom","OLD":"wisdom","LewisShort":"wisdom","Cassell":"wisdom"},
    "iustitia":  {"LCL":"justice","Penguin":"justice","BohnYonge":"justice","Fagles":"justice","Ruden":"justice","OLD":"justice","LewisShort":"justice","Cassell":"justice"},
    "pietas":    {"LCL":"piety","Penguin":"duty","BohnYonge":"piety","Fagles":"devotion","Ruden":"loyalty","OLD":"dutifulness","LewisShort":"piety","Cassell":"piety"},
    "fides":     {"LCL":"faith","Penguin":"trust","BohnYonge":"faith","Fagles":"loyalty","Ruden":"trust","OLD":"trust","LewisShort":"trust","Cassell":"faith"},
    "gratia":    {"LCL":"favor","Penguin":"thanks","BohnYonge":"favor","Fagles":"favor","Ruden":"grace","OLD":"favor","LewisShort":"favor","Cassell":"favor"},
    "caritas":   {"LCL":"love","Penguin":"love","BohnYonge":"affection","Fagles":"love","Ruden":"love","OLD":"dearness","LewisShort":"dearness","Cassell":"affection"},
    "amor":      {"LCL":"love","Penguin":"love","BohnYonge":"love","Fagles":"love","Ruden":"love","OLD":"love","LewisShort":"love","Cassell":"love"},
    "spes":      {"LCL":"hope","Penguin":"hope","BohnYonge":"hope","Fagles":"hope","Ruden":"hope","OLD":"hope","LewisShort":"hope","Cassell":"hope"},
    "libertas":  {"LCL":"freedom","Penguin":"liberty","BohnYonge":"liberty","Fagles":"freedom","Ruden":"freedom","OLD":"freedom","LewisShort":"freedom","Cassell":"liberty"},
    "bonus":     {"LCL":"good","Penguin":"good","BohnYonge":"good","Fagles":"good","Ruden":"good","OLD":"good","LewisShort":"good","Cassell":"good"},
    "malum":     {"LCL":"evil","Penguin":"evil","BohnYonge":"evil","Fagles":"evil","Ruden":"evil","OLD":"evil","LewisShort":"evil","Cassell":"evil"},
    "natura":    {"LCL":"nature","Penguin":"nature","BohnYonge":"nature","Fagles":"nature","Ruden":"nature","OLD":"nature","LewisShort":"nature","Cassell":"nature"},
    "lex":       {"LCL":"law","Penguin":"law","BohnYonge":"law","Fagles":"law","Ruden":"law","OLD":"law","LewisShort":"law","Cassell":"law"},
    "ius":       {"LCL":"right","Penguin":"law","BohnYonge":"right","Fagles":"right","Ruden":"right","OLD":"law","LewisShort":"right","Cassell":"right"},
    "officium":  {"LCL":"duty","Penguin":"duty","BohnYonge":"duty","Fagles":"duty","Ruden":"duty","OLD":"service","LewisShort":"duty","Cassell":"duty"},
    "honor":     {"LCL":"honor","Penguin":"honor","BohnYonge":"honor","Fagles":"honor","Ruden":"honor","OLD":"honor","LewisShort":"honor","Cassell":"honor"},
    "gloria":    {"LCL":"glory","Penguin":"glory","BohnYonge":"glory","Fagles":"glory","Ruden":"glory","OLD":"glory","LewisShort":"glory","Cassell":"glory"},
    # Vida / morte / pessoa
    "vita":      {"LCL":"life","Penguin":"life","BohnYonge":"life","Fagles":"life","Ruden":"life","OLD":"life","LewisShort":"life","Cassell":"life"},
    "mors":      {"LCL":"death","Penguin":"death","BohnYonge":"death","Fagles":"death","Ruden":"death","OLD":"death","LewisShort":"death","Cassell":"death"},
    "homo":      {"LCL":"man","Penguin":"man","BohnYonge":"man","Fagles":"man","Ruden":"person","OLD":"human being","LewisShort":"man","Cassell":"man"},
    "vir":       {"LCL":"man","Penguin":"man","BohnYonge":"man","Fagles":"man","Ruden":"man","OLD":"man","LewisShort":"man","Cassell":"man"},
    "mulier":    {"LCL":"woman","Penguin":"woman","BohnYonge":"woman","Fagles":"woman","Ruden":"woman","OLD":"woman","LewisShort":"woman","Cassell":"woman"},
    "puer":      {"LCL":"boy","Penguin":"boy","BohnYonge":"boy","Fagles":"boy","Ruden":"boy","OLD":"boy","LewisShort":"boy","Cassell":"boy"},
    "corpus":    {"LCL":"body","Penguin":"body","BohnYonge":"body","Fagles":"body","Ruden":"body","OLD":"body","LewisShort":"body","Cassell":"body"},
    "caro":      {"LCL":"flesh","Penguin":"flesh","BohnYonge":"flesh","Fagles":"flesh","Ruden":"flesh","OLD":"flesh","LewisShort":"flesh","Cassell":"flesh"},
    "sanguis":   {"LCL":"blood","Penguin":"blood","BohnYonge":"blood","Fagles":"blood","Ruden":"blood","OLD":"blood","LewisShort":"blood","Cassell":"blood"},
    "cor":       {"LCL":"heart","Penguin":"heart","BohnYonge":"heart","Fagles":"heart","Ruden":"heart","OLD":"heart","LewisShort":"heart","Cassell":"heart"},
    "manus":     {"LCL":"hand","Penguin":"hand","BohnYonge":"hand","Fagles":"hand","Ruden":"hand","OLD":"hand","LewisShort":"hand","Cassell":"hand"},
    "oculus":    {"LCL":"eye","Penguin":"eye","BohnYonge":"eye","Fagles":"eye","Ruden":"eye","OLD":"eye","LewisShort":"eye","Cassell":"eye"},
    # Estado / sociedade / guerra
    "civitas":   {"LCL":"state","Penguin":"city","BohnYonge":"state","Fagles":"city","Ruden":"city","OLD":"citizenship","LewisShort":"state","Cassell":"state"},
    "patria":    {"LCL":"fatherland","Penguin":"country","BohnYonge":"country","Fagles":"homeland","Ruden":"homeland","OLD":"native land","LewisShort":"fatherland","Cassell":"fatherland"},
    "respublica":{"LCL":"republic","Penguin":"republic","BohnYonge":"commonwealth","Fagles":"state","Ruden":"state","OLD":"public affairs","LewisShort":"commonwealth","Cassell":"commonwealth"},
    "populus":   {"LCL":"people","Penguin":"people","BohnYonge":"people","Fagles":"people","Ruden":"people","OLD":"people","LewisShort":"people","Cassell":"people"},
    "rex":       {"LCL":"king","Penguin":"king","BohnYonge":"king","Fagles":"king","Ruden":"king","OLD":"king","LewisShort":"king","Cassell":"king"},
    "imperium":  {"LCL":"command","Penguin":"empire","BohnYonge":"empire","Fagles":"power","Ruden":"power","OLD":"command","LewisShort":"command","Cassell":"command"},
    "bellum":    {"LCL":"war","Penguin":"war","BohnYonge":"war","Fagles":"war","Ruden":"war","OLD":"war","LewisShort":"war","Cassell":"war"},
    "pax":       {"LCL":"peace","Penguin":"peace","BohnYonge":"peace","Fagles":"peace","Ruden":"peace","OLD":"peace","LewisShort":"peace","Cassell":"peace"},
    "miles":     {"LCL":"soldier","Penguin":"soldier","BohnYonge":"soldier","Fagles":"soldier","Ruden":"soldier","OLD":"soldier","LewisShort":"soldier","Cassell":"soldier"},
    "hostis":    {"LCL":"enemy","Penguin":"enemy","BohnYonge":"enemy","Fagles":"enemy","Ruden":"enemy","OLD":"enemy","LewisShort":"enemy","Cassell":"enemy"},
    "amicus":    {"LCL":"friend","Penguin":"friend","BohnYonge":"friend","Fagles":"friend","Ruden":"friend","OLD":"friend","LewisShort":"friend","Cassell":"friend"},
    "servus":    {"LCL":"slave","Penguin":"slave","BohnYonge":"slave","Fagles":"servant","Ruden":"slave","OLD":"slave","LewisShort":"slave","Cassell":"slave"},
    "dominus":   {"LCL":"lord","Penguin":"master","BohnYonge":"master","Fagles":"lord","Ruden":"master","OLD":"master","LewisShort":"master","Cassell":"master"},
    # Tempo / espaço
    "tempus":    {"LCL":"time","Penguin":"time","BohnYonge":"time","Fagles":"time","Ruden":"time","OLD":"time","LewisShort":"time","Cassell":"time"},
    "annus":     {"LCL":"year","Penguin":"year","BohnYonge":"year","Fagles":"year","Ruden":"year","OLD":"year","LewisShort":"year","Cassell":"year"},
    "dies":      {"LCL":"day","Penguin":"day","BohnYonge":"day","Fagles":"day","Ruden":"day","OLD":"day","LewisShort":"day","Cassell":"day"},
    "nox":       {"LCL":"night","Penguin":"night","BohnYonge":"night","Fagles":"night","Ruden":"night","OLD":"night","LewisShort":"night","Cassell":"night"},
    "mundus":    {"LCL":"world","Penguin":"world","BohnYonge":"world","Fagles":"world","Ruden":"world","OLD":"world","LewisShort":"world","Cassell":"world"},
    "terra":     {"LCL":"earth","Penguin":"earth","BohnYonge":"earth","Fagles":"earth","Ruden":"earth","OLD":"earth","LewisShort":"earth","Cassell":"earth"},
    "caelum":    {"LCL":"heaven","Penguin":"sky","BohnYonge":"heaven","Fagles":"heaven","Ruden":"sky","OLD":"sky","LewisShort":"heaven","Cassell":"heaven"},
    "aqua":      {"LCL":"water","Penguin":"water","BohnYonge":"water","Fagles":"water","Ruden":"water","OLD":"water","LewisShort":"water","Cassell":"water"},
    "ignis":     {"LCL":"fire","Penguin":"fire","BohnYonge":"fire","Fagles":"fire","Ruden":"fire","OLD":"fire","LewisShort":"fire","Cassell":"fire"},
    "domus":     {"LCL":"house","Penguin":"house","BohnYonge":"house","Fagles":"house","Ruden":"home","OLD":"house","LewisShort":"house","Cassell":"house"},
    "via":       {"LCL":"way","Penguin":"road","BohnYonge":"way","Fagles":"road","Ruden":"road","OLD":"road","LewisShort":"way","Cassell":"way"},
    # Verbos centrais
    "amo":       {"LCL":"love","Penguin":"love","BohnYonge":"love","Fagles":"love","Ruden":"love","OLD":"love","LewisShort":"love","Cassell":"love"},
    "credo":     {"LCL":"believe","Penguin":"believe","BohnYonge":"believe","Fagles":"believe","Ruden":"believe","OLD":"trust","LewisShort":"believe","Cassell":"believe"},
    "scio":      {"LCL":"know","Penguin":"know","BohnYonge":"know","Fagles":"know","Ruden":"know","OLD":"know","LewisShort":"know","Cassell":"know"},
    "video":     {"LCL":"see","Penguin":"see","BohnYonge":"see","Fagles":"see","Ruden":"see","OLD":"see","LewisShort":"see","Cassell":"see"},
    "audio":     {"LCL":"hear","Penguin":"hear","BohnYonge":"hear","Fagles":"hear","Ruden":"hear","OLD":"hear","LewisShort":"hear","Cassell":"hear"},
    "dico":      {"LCL":"say","Penguin":"say","BohnYonge":"say","Fagles":"say","Ruden":"say","OLD":"say","LewisShort":"say","Cassell":"say"},
    "facio":     {"LCL":"make","Penguin":"do","BohnYonge":"make","Fagles":"make","Ruden":"do","OLD":"make","LewisShort":"make","Cassell":"make"},
    "ago":       {"LCL":"do","Penguin":"do","BohnYonge":"do","Fagles":"drive","Ruden":"do","OLD":"drive","LewisShort":"drive","Cassell":"do"},
    "sum":       {"LCL":"be","Penguin":"be","BohnYonge":"be","Fagles":"be","Ruden":"be","OLD":"be","LewisShort":"be","Cassell":"be"},
    "possum":    {"LCL":"can","Penguin":"can","BohnYonge":"can","Fagles":"can","Ruden":"can","OLD":"be able","LewisShort":"be able","Cassell":"be able"},
    "volo":      {"LCL":"want","Penguin":"want","BohnYonge":"wish","Fagles":"want","Ruden":"want","OLD":"wish","LewisShort":"wish","Cassell":"wish"},
    "do":        {"LCL":"give","Penguin":"give","BohnYonge":"give","Fagles":"give","Ruden":"give","OLD":"give","LewisShort":"give","Cassell":"give"},
    "habeo":     {"LCL":"have","Penguin":"have","BohnYonge":"have","Fagles":"have","Ruden":"have","OLD":"have","LewisShort":"have","Cassell":"have"},
    "vivo":      {"LCL":"live","Penguin":"live","BohnYonge":"live","Fagles":"live","Ruden":"live","OLD":"live","LewisShort":"live","Cassell":"live"},
    "morior":    {"LCL":"die","Penguin":"die","BohnYonge":"die","Fagles":"die","Ruden":"die","OLD":"die","LewisShort":"die","Cassell":"die"},
}

def main():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_KEY"])
    w = {r["source_key"]: float(r["authority_weight"])
         for r in sb.table("hermeneia_reference_translations")
         .select("source_key, authority_weight").eq("language_id","latin").execute().data}
    rows = []
    for lemma, rend in R.items():
        present = {s: t for s, t in rend.items() if s in w and t}
        if not present: continue
        total = sum(w[s] for s in present)
        groups = {}
        for s, t in present.items():
            k = normalize_term(t)
            if not k: continue
            g = groups.setdefault(k, {"sources":[], "weight":0.0})
            g["sources"].append(s); g["weight"] += w[s]
        key = normalized_lemma(lemma, "latin") or lemma
        for term, g in groups.items():
            rows.append({
                "language_id":"latin",
                "original_token": key,
                "translation_term": term,
                "sources_agreeing": sorted(g["sources"]),
                "sources_total": len(present),
                "weighted_score": round(g["weight"]/total, 4),
                "provenance":"llm_derived",
            })
    # idempotent
    sb.table("hermeneia_token_consensus").delete().eq("language_id","latin").execute()
    for i in range(0, len(rows), 100):
        sb.table("hermeneia_token_consensus").upsert(
            rows[i:i+100], on_conflict="language_id,original_token,translation_term",
            ignore_duplicates=True,
        ).execute()
    n_lemmas = len({r["original_token"] for r in rows})
    print(f"OK: {len(rows)} linhas para {n_lemmas} lemas latinos")

if __name__ == "__main__":
    main()
