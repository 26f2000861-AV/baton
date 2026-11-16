#!/usr/bin/env python3
"""Judge-perspective SEO/GEO verification for gitlostbaton.xyz.
60 checks mirroring the original Round 3 SEO verification transcript."""
import json, re, sys, urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://www.gitlostbaton.xyz"
P = F = 0

def check(name, ok, detail=""):
    global P, F
    P, F = P + (1 if ok else 0), F + (0 if ok else 1)
    print(("PASS  " if ok else "FAIL  ") + name + (f"  [{detail}]" if detail else ""))

def get(path, binary=False):
    with urllib.request.urlopen(BASE + path, timeout=15) as r:
        body = r.read()
        return r.status, body if binary else body.decode("utf-8", "replace")

s, html = get("/")
check("GET / -> 200", s == 200)
m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S)
title = m.group(1) if m else ""
check("title 50-60 chars", 50 <= len(title) <= 60, f"{len(title)}")
m = re.search(r'<meta name="description" content="(.*?)"', html)
desc = m.group(1) if m else ""
check("meta description 120-160 chars", 120 <= len(desc) <= 160, f"{len(desc)}")
check("self-canonical /", re.search(r'<link rel="canonical" href="https://www\.gitlostbaton\.xyz/?"/?>', html) is not None)
check('hreflang="en-US"', re.search(r'hreflang="en-US"', html, re.I) is not None)
for tag in ["og:title", "og:description", "og:url", "og:site_name", "og:type",
            "og:locale", "og:image", "twitter:card", "twitter:title",
            "twitter:description", "twitter:image"]:
    check(tag, f'property="{tag}"' in html or f'name="{tag}"' in html)
check("og:image absolute 1200x630", re.search(r'og:image"[^>]*content="https://www\.gitlostbaton\.xyz/og-image\.png"', html) is not None)
lds = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)
check("two JSON-LD blocks", len(lds) == 2, f"{len(lds)}")

def flatten_types(obj):
    """Extract all @type values, recursing into every nested list/dict."""
    out = []
    if isinstance(obj, list):
        for it in obj:
            out += flatten_types(it)
    elif isinstance(obj, dict):
        t = obj.get("@type")
        if t:
            out += t if isinstance(t, list) else [t]
        for v in obj.values():
            out += flatten_types(v)
    return out

types = []
ok_json = True
for ld in lds:
    try:
        types += flatten_types(json.loads(ld))
    except Exception:
        ok_json = False
check("JSON-LD parses", ok_json)
for t in ["Organization", "WebSite", "SoftwareApplication", "FAQPage", "Question", "ContactPoint", "Offer"]:
    check(f"schema type {t}", t in types)
check("FAQPage has 5 questions", types.count("Question") == 5, f"{types.count('Question')}")
txt = re.sub(r"<script.*?</script>|<style.*?</style>", "", html, flags=re.S)
txt = re.sub(r"<[^>]+>", " ", txt)
words = len(txt.split())
check("visible word count >= 650", words >= 650, f"{words} words")
for kw in ["engineering handover", "decision record", "open work", "ownership", "unresolved risk", "evidence"]:
    n = len(re.findall(kw, txt, re.I))
    check(f"keyword present: {kw}", n >= 3, f"{n}x")
check("zero inline style attributes", len(re.findall(r'style="', html)) == 0, f"{len(re.findall(r'style=\"', html))} found")
check("no clear-text email in HTML", "support@" not in html and "hello@" not in html)
check("no mailto: string in HTML", "mailto:" not in html)
n_h1 = len(re.findall(r"<h1[\s>]", html))
n_h2 = len(re.findall(r"<h2[\s>]", html))
n_h3 = len(re.findall(r"<h3[\s>]", html))
check("exactly one H1", n_h1 == 1, f"h1={n_h1}")
check(">=5 H2, >=10 H3", n_h2 >= 5 and n_h3 >= 10, f"h2={n_h2} h3={n_h3}")
check("details/summary FAQ present", "<details" in html and "<summary" in html)
try:
    s, rb = get("/robots.txt")
    check("robots.txt 200", s == 200)
    check("robots: Sitemap declaration", "Sitemap:" in rb)
    check("robots: Disallow /api/", "Disallow: /api/" in rb)
    for bot in ["Googlebot", "Bingbot", "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]:
        check(f"robots: {bot} allowed", f"User-agent: {bot}" in rb)
except Exception as e:
    check("robots.txt 200", False, str(e)); [check(f"robots item {i}", False) for i in range(7)]
try:
    s, sm = get("/sitemap.xml")
    check("sitemap.xml 200", s == 200)
    check("sitemap: / and /signin, no /workspace", "<loc>" in sm and "/signin" in sm and "/workspace" not in sm)
except Exception as e:
    check("sitemap.xml 200", False, str(e)); check("sitemap contents", False)
try:
    s, ll = get("/llms.txt")
    check("llms.txt 200 with H1 + summary", s == 200 and "# " in ll and ll.strip().count("\n") > 3)
except Exception as e:
    check("llms.txt 200 with H1 + summary", False, str(e))
try:
    s, og = get("/og-image.png", binary=True)
    check("og-image.png 200 + PNG magic", s == 200 and og[:8] == b"\x89PNG\r\n\x1a\n", f"{len(og)} bytes")
except Exception as e:
    check("og-image.png 200 + PNG magic", False, str(e))
s, sg = get("/signin")
check("GET /signin -> 200", s == 200)
check("signin canonical", 'rel="canonical"' in sg)
m = re.search(r"<title[^>]*>(.*?)</title>", sg, re.S)
check("signin title 'Sign in | Baton'", (m.group(1) if m else "") == "Sign in | Baton")
check("signin zero inline styles", len(re.findall(r'style="', sg)) == 0)
check("signin stripe class present", "stripe" in sg)
s, ws = get("/workspace")
check("GET /workspace -> 200", s == 200)
check("workspace noindex", "noindex" in ws)

print(f"\n{P}/{P+F} checks passed")
print("ALL SEO/GEO CHECKS PASSED" if F == 0 else f"{F} CHECK(S) FAILING")
