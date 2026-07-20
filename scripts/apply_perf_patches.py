#!/usr/bin/env python3
"""Apply performance patches to dgr-exp static HTML."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CDN = "https://cdn.jsdelivr.net/gh/khalidsaif912/Games@main"
RAW = "https://raw.githubusercontent.com/khalidsaif912/Games/main"

BODY_BG = """body{
  color:var(--text);
  background:
    radial-gradient(920px 520px at 12% 8%, rgba(79,172,254,.14), transparent 58%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
}"""

GLASS = "linear-gradient(180deg, rgba(18,28,48,.94), rgba(8,14,26,.88))"
GLASS_OLD = "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))"


def patch_file(path: Path, text: str) -> str:
    if RAW in text:
        text = text.replace(RAW, CDN)
    text = text.replace(GLASS_OLD, GLASS)
    text = re.sub(r"backdrop-filter\s*:\s*blur\(\s*\d+px\s*\)\s*;?", "", text)
    text = re.sub(
        r"body\s*\{\s*color:var\(--text\);\s*background:[^}]+\}",
        BODY_BG,
        text,
        count=1,
        flags=re.S,
    )
    if path.name == "pairs.html" and path.parent.name == "m1":
        text = text.replace(
            "--card-back:url('card-back.png');",
            f"--card-back:url('{CDN}/M1/card-back.png');",
        )
    return text


def patch_q_html(text: str) -> str:
    text = patch_file(ROOT / "Q" / "Q.HTML", text)

    # Remove leaked GitHub tokens from live copy
    text = re.sub(
        r",\s*\{\s*cache:[^}]+\}\s*\)",
        ", { cache: 'default' })",
        text,
        flags=re.S,
    )
    text = re.sub(
        r"headers:\s*\{\s*'Authorization':\s*'ghp_[^']+'[^}]*\}\s*,?",
        "",
        text,
    )

    insert = f'''
const CDN_BASE = "{CDN}/M1/";

async function loadM1PairsFromManifest(){{
  const res = await fetch(CDN_BASE + "manifest.json", {{ cache: "default" }});
  if(!res.ok) throw new Error("تعذر قراءة manifest.json: " + res.status);
  const data = await res.json();
  const list = Array.isArray(data?.pairs) ? data.pairs : [];
  if(list.length < 2) throw new Error("manifest.json: أزواج غير كافية");
  const out = [];
  const answers = [];
  for(const p of list){{
    const id = String(p.id || "");
    const a1 = CDN_BASE + String(p.img1 || "");
    const a2 = CDN_BASE + String(p.img2 || "");
    if(!p.img1 || !p.img2) continue;
    answers.push({{ base: id, url: a1 }});
    out.push({{ base: id, a1Url: a1, q2Url: a2 }});
  }}
  if(out.length < 2) throw new Error("لا توجد أزواج كافية في manifest.");
  if(answers.length < 6) throw new Error("لا توجد إجابات كافية لعرض 6 خيارات.");
  pairs = shuffle(out.slice());
  a1Pool = answers.slice();
}}

async function fetchCharactersFromManifest(){{
  const res = await fetch(CDN_BASE + "characters/manifest.json", {{ cache: "default" }});
  if(!res.ok) throw new Error("تعذر قراءة شخصيات manifest: " + res.status);
  const data = await res.json();
  const imgs = Array.isArray(data?.images) ? data.images : [];
  return imgs
    .filter(x => x && x.img)
    .map(x => ({{
      name: String(x.img),
      url: CDN_BASE + "characters/" + String(x.img),
    }}));
}}
'''
    if "CDN_BASE" not in text:
        text = text.replace(
            'const FOLDER_PATH = "M1";',
            'const FOLDER_PATH = "M1";' + insert,
        )

    text = re.sub(
        r"async function loadM1Pairs\(\)\{[\s\S]*?\n\}",
        """async function loadM1Pairs(){
  if(DEMO_MODE){
    pairs = shuffle(DEMO_PAIRS.slice());
    a1Pool = DEMO_ANSWERS.slice();
    return;
  }
  await loadM1PairsFromManifest();
}""",
        text,
        count=1,
    )

    text = text.replace(
        "const charFiles = await fetchCharactersListing();",
        "const charFiles = await fetchCharactersFromManifest();",
    )

    text = text.replace("const CONCURRENCY = 6;", "const CONCURRENCY = 10;")

    # Drop unused GitHub API helpers (tokens already stripped)
    text = re.sub(
        r"async function fetchFolderListing\(\)\{[\s\S]*?\n\}\n\n",
        "",
        text,
        count=1,
    )
    text = re.sub(
        r"async function fetchCharactersListing\(\)\{[\s\S]*?\n\}\n\n",
        "",
        text,
        count=1,
    )

    return text


def main() -> None:
    targets = [
        ROOT / "index.html",
        ROOT / "m1" / "pairs.html",
        ROOT / "g1" / "airlogo.html",
        ROOT / "g2" / "similarity.html",
        ROOT / "Q" / "Q.HTML",
    ]
    for path in targets:
        raw = path.read_text(encoding="utf-8")
        if path.name == "Q.HTML":
            out = patch_q_html(raw)
        else:
            out = patch_file(path, raw)
        if out != raw:
            path.write_text(out, encoding="utf-8")
            print("patched", path.relative_to(ROOT))
        else:
            print("unchanged", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
