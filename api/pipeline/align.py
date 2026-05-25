"""
HERMENEIA — Alinhamento original ↔ tradução

Estratégia:
1. Tokeniza o original (preservando morfologia)
2. Usa Claude para alinhar tokens originais → spans da tradução
3. Retorna pares [(original_token, translation_span)]

Nota: alinhamento de línguas antigas é não-trivial.
Hebraico bíblico: partículas prefixadas (ב, ו, ה) fazem parte do token.
Grego: artigos + substantivos em declensão.
Usamos Claude para fazer o alinhamento linguístico — ele conhece essas línguas.
"""
import re
import os
import unicodedata
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv(override=True)
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def tokenize_ancient(text: str, language: str) -> list[str]:
    """
    Tokenização básica preservando morfologia da língua.
    Para hebraico: mantém prefixos (ב, ו, ה, כ, ל, מ, ש) como parte do token.
    Para grego: mantém enclíticos.
    """
    # Remove diacríticos problemáticos mas mantém os que fazem parte da morfologia
    # (cantilação hebraica vs. vogais masoréticas)
    if language in ("biblical_hebrew", "aramaic"):
        # Mantém nikud (vowel points U+05B0-U+05C7) mas remove cantilação (U+0591-U+05AF)
        cleaned = ""
        for ch in text:
            cp = ord(ch)
            if 0x0591 <= cp <= 0x05AF:  # cantilação — remove
                continue
            cleaned += ch
        text = cleaned

    # Tokeniza por espaços e pontuação básica
    tokens = re.split(r'[\s ]+', text.strip())
    tokens = [t for t in tokens if t and not all(unicodedata.category(c) in ('Po', 'Ps', 'Pe') for c in t)]
    return tokens


def align_tokens(
    original_text: str,
    translation: str,
    language: str,
    original_tokens: list[str]
) -> list[dict]:
    """
    Usa Claude para alinhar cada token do original a um span da tradução.

    Retorna lista de dicts:
    [{"original": "בְּרֵאשִׁית", "transliteration": "bereshit", "translation_span": "In the beginning"}]
    """
    lang_names = {
        "biblical_hebrew": "Biblical Hebrew",
        "koine_greek":     "Koine Greek",
        "classical_greek": "Classical Greek",
        "aramaic":         "Aramaic",
        "latin":           "Classical Latin",
        "coptic":          "Coptic",
    }
    lang_display = lang_names.get(language, language)

    prompt = f"""You are a specialist in {lang_display} philology.

Original text ({lang_display}):
{original_text}

Existing translation:
{translation}

Tokens identified in the original (in order):
{chr(10).join(f"{i+1}. {t}" for i, t in enumerate(original_tokens))}

Task: For each token in the original, identify:
1. The corresponding span in the translation (exact substring)
2. The standard transliteration
3. The root/lemma form (canonical dictionary form)

Respond with ONLY a JSON array, one object per token, in order:
[
  {{
    "original": "<token as given>",
    "transliteration": "<romanized form>",
    "lemma": "<dictionary/root form>",
    "translation_span": "<exact substring from translation>"
  }},
  ...
]

Rules:
- translation_span must be an exact substring of the translation text
- If a token is a grammatical particle with no independent translation span, use ""
- If multiple tokens map to the same translation span, repeat it
- Do not skip any tokens"""

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    text_response = response.content[0].text.strip()
    # Extrai JSON mesmo se vier com markdown
    if "```" in text_response:
        text_response = re.search(r'\[.*\]', text_response, re.DOTALL).group(0)

    aligned = json.loads(text_response)
    return aligned
