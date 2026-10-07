#!/usr/bin/env python3
"""Check that every internal link and image in a built site resolves.

Usage: python3 scripts/check_links.py _site [--baseurl /CS_lab_clone]
"""
import argparse, os, re, sys
from urllib.parse import urlparse, unquote

ap = argparse.ArgumentParser()
ap.add_argument("site")
ap.add_argument("--baseurl", default="")
args = ap.parse_args()
root = os.path.abspath(args.site)
attr = re.compile(r'(?:href|src)="([^"#?]+)')
ids = {}
bad = []

def target(page, url):
    if url.startswith(args.baseurl + "/") or url == args.baseurl:
        rel = url[len(args.baseurl):]
        path = os.path.join(root, unquote(rel).lstrip("/"))
    elif url.startswith("/"):
        return None  # missing baseurl
    else:
        path = os.path.normpath(os.path.join(os.path.dirname(page), unquote(url)))
    if os.path.isdir(path):
        path = os.path.join(path, "index.html")
    return path

for dirpath, _, files in os.walk(root):
    for f in files:
        if not f.endswith(".html"):
            continue
        page = os.path.join(dirpath, f)
        html = open(page, encoding="utf-8").read()
        for url in attr.findall(html):
            u = urlparse(url)
            if u.scheme or url.startswith("//") or url.startswith("mailto:") or url.startswith("tel:"):
                continue
            t = target(page, url)
            if t is None or not os.path.exists(t):
                bad.append(f"{os.path.relpath(page, root)}: {url}")

for b in sorted(set(bad)):
    print("BROKEN", b)
print(f"{len(set(bad))} broken internal links")
sys.exit(1 if bad else 0)
