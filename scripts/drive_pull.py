#!/usr/bin/env python3
"""Targeted Google Drive folder downloader (fixed parser).

embeddedfolderview entries look like:
<div class="flip-entry" id="entry-ID" ...><div class="flip-entry-info">
<a href="https://drive.google.com/drive/folders/ID" ...> ... <div class="flip-entry-title">NAME</div></a>
or <a href="https://drive.google.com/file/d/ID/view" ...>
"""
import os
import re
import sys
import time
import requests

FOLDER_ID = "153u7lPYpdjErFDdIkTyd5Qx5Kx3A4OGp"
OUT = "/tmp/baton-drive2"
SKIP_GIT = True

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"})


def list_dir(folder_id):
    """Return list of (name, id, is_folder) for a Drive folder."""
    r = session.get(f"https://drive.google.com/embeddedfolderview?id={folder_id}#list", timeout=60)
    if r.status_code != 200:
        print(f"  ! list {folder_id} -> {r.status_code}")
        return []
    entries = []
    chunks = r.text.split('<div class="flip-entry"')
    for chunk in chunks[1:]:
        mid = re.search(r'id="entry-([\w-]+)"', chunk)
        mhref = re.search(r'href="(https://drive\.google\.com/(?:drive/folders|file/d)/[\w-]+)', chunk)
        mtitle = re.search(r'flip-entry-title">(.*?)</div>', chunk)
        if not (mid and mhref and mtitle):
            continue
        fid = mid.group(1)
        href = mhref.group(1)
        name = re.sub(r'<[^>]+>', '', mtitle.group(1)).strip()
        is_folder = '/drive/folders/' in href
        entries.append((name, fid, is_folder))
    return entries


def walk(folder_id, relpath, all_items):
    for name, fid, is_folder in list_dir(folder_id):
        path = f"{relpath}/{name}" if relpath else name
        all_items.append((path, fid, is_folder))
        if is_folder:
            walk(fid, path, all_items)


def download_file(file_id, dest):
    url = "https://drive.usercontent.google.com/download"
    r = session.get(url, params={"id": file_id, "export": "download", "confirm": "t"}, timeout=180)
    if r.status_code != 200:
        return f"http {r.status_code}"
    if r.content[:15].lower().startswith(b'<!doctype html'):
        m = re.search(rb'name="confirm" value="([^"]+)"', r.content)
        mu = re.search(rb'name="uuid" value="([^"]+)"', r.content)
        params = {"id": file_id, "export": "download", "confirm": (m.group(1).decode() if m else "t")}
        if mu:
            params["uuid"] = mu.group(1).decode()
        r = session.get(url, params=params, timeout=180)
        if r.status_code != 200 or r.content[:15].lower().startswith(b'<!doctype html'):
            return "html/consent page"
    with open(dest, "wb") as f:
        f.write(r.content)
    return None


def main():
    all_items = []
    print("Listing folder tree ...")
    walk(FOLDER_ID, "", all_items)
    folders = sum(1 for _, _, f in all_items if f)
    files = [(p, fid) for p, fid, f in all_items if not f]
    print(f"Found {folders} folders, {len(files)} files")
    os.makedirs(OUT, exist_ok=True)
    # priority: content first, .git last
    files.sort(key=lambda x: (x[0].startswith(".git/"), x[0]))
    ok, fail = 0, 0
    for i, (path, fid) in enumerate(files):
        if SKIP_GIT and path.startswith(".git/"):
            continue
        dest = os.path.join(OUT, path)
        os.makedirs(os.path.dirname(dest) or OUT, exist_ok=True)
        err = download_file(fid, dest)
        if err:
            fail += 1
            print(f"  FAIL [{i+1}/{len(files)}] {path}: {err}")
        else:
            ok += 1
            print(f"  ok  [{i+1}/{len(files)}] {path}")
        time.sleep(0.25)
    print(f"DONE ok={ok} fail={fail}")


if __name__ == "__main__":
    main()
