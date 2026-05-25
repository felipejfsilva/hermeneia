"""
Teste end-to-end: Gênesis 1:1-2 (Hebraico Bíblico → KJV)
"""
import os, json
from dotenv import load_dotenv
load_dotenv(override=True)

from api.pipeline.refine import run_pipeline

result = run_pipeline(
    original_text="בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
    translation="In the beginning God created the heavens and the earth",
    language="biblical_hebrew",
    translation_source="KJV",
)

print(f"\n{'='*60}")
print(f"HERMENEIA — Análise Gênesis 1:1 (KJV)")
print(f"{'='*60}")
print(f"Tokens analisados: {result['summary'].total_tokens}")
print(f"Tokens flagados:   {result['summary'].tokens_flagged}")
print(f"Confiança média:   {result['summary'].avg_confidence:.2f}")
print(f"Alta confiança:    {result['summary'].high_confidence_pct:.0f}%")
print(f"Baixa confiança:   {result['summary'].low_confidence_pct:.0f}%")
print(f"Tempo:             {result['processing_ms']}ms")
print(f"\nFlags detectadas: {result['summary'].flags_breakdown}")

print(f"\n{'─'*60}")
print("ANÁLISE POR TOKEN:")
print(f"{'─'*60}")
for t in result['tokens']:
    icon = "🟢" if t.confidence > 0.75 else ("🟡" if t.confidence > 0.50 else "🔴")
    flag_str = f" [{', '.join(f.value for f in t.flags)}]" if t.flags else ""
    print(f"\n{icon} {t.original} → '{t.existing}'  (conf: {t.confidence:.2f}){flag_str}")
    if t.refined != t.existing:
        print(f"   ✏️  Refinamento: '{t.refined}'")
    if t.alternatives:
        for a in t.alternatives[:2]:
            print(f"   ↳ Alt: '{a.text}' ({a.support})")
    print(f"   {t.reasoning[:200]}...")

if result['summary'].consistency_issues:
    print(f"\n⚠️  INCONSISTÊNCIAS INTRA-DOCUMENTO:")
    for ci in result['summary'].consistency_issues:
        print(f"   '{ci.token}' → {ci.translations_used}")
