"""Converte um .md em HTML standalone + PDF, ambos com CSS embarcado pra leitura confortável."""
import sys, os
from pathlib import Path
import markdown
from weasyprint import HTML, CSS

if len(sys.argv) < 2:
    print("uso: render_md.py <arquivo.md>")
    sys.exit(1)

src = Path(sys.argv[1])
out_html = src.with_suffix(".html")
out_pdf  = src.with_suffix(".pdf")
md_text = src.read_text(encoding="utf-8")

# Conversao MD -> HTML com extensoes uteis (tabelas, fenced code, footnotes)
body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "footnotes", "sane_lists", "smarty"],
    output_format="html5",
)

CSS_STR = """
@page { size: A4; margin: 2cm; }
:root { color-scheme: light dark; }
html { font-size: 16px; }
body {
  font-family: 'Charter', 'Iowan Old Style', 'Georgia', serif;
  line-height: 1.6;
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1.2rem;
  color: #1a1a1a;
  background: #fafaf7;
}
h1 { font-size: 1.9rem; border-bottom: 2px solid #1a1a1a; padding-bottom: .3rem; margin-top: 2rem; }
h2 { font-size: 1.45rem; margin-top: 2.2rem; border-bottom: 1px solid #888; padding-bottom: .2rem; }
h3 { font-size: 1.15rem; margin-top: 1.4rem; color: #444; }
blockquote {
  border-left: 3px solid #b39858;
  background: #f4efe2;
  margin: 1rem 0;
  padding: .6rem 1rem;
  font-style: italic;
  color: #2a2a2a;
}
code { font-family: 'SF Mono', 'Menlo', monospace; font-size: .92em; background: #ececea; padding: 0 .25em; border-radius: 3px; }
em { font-style: italic; }
strong { font-weight: 700; color: #000; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: .94rem; }
th, td { border: 1px solid #aaa; padding: .4rem .7rem; text-align: left; vertical-align: top; }
th { background: #ece7d6; }
hr { border: none; border-top: 1px solid #aaa; margin: 2rem 0; }
@media (prefers-color-scheme: dark) {
  body { background: #1a1a18; color: #ebebe5; }
  h1, h2, h3 { color: #f3f0e2; border-color: #555; }
  blockquote { background: #2a2620; border-left-color: #c9a86a; color: #ebebe5; }
  code { background: #2d2d29; color: #f3f0e2; }
  th { background: #322e22; }
  th, td { border-color: #555; }
}
"""

html_full = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{src.stem}</title>
<style>{CSS_STR}</style>
</head>
<body>
{body}
</body>
</html>
"""

out_html.write_text(html_full, encoding="utf-8")
print(f"HTML: {out_html}")

HTML(string=html_full).write_pdf(str(out_pdf), stylesheets=[CSS(string=CSS_STR)])
print(f"PDF:  {out_pdf}")
