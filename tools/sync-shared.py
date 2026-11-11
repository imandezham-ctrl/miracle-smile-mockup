"""Copy the shared header/menu and footer from index.html into every other page.

Edit them once in index.html, then run:  python3 tools/sync-shared.py
Each page marks its current nav link via <body data-page="training.html">.
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
source = (root / "index.html").read_text()
blocks = {
    # Drop index.html's own "current page" marker; each page gets its own below
    name: re.search(rf"<!-- SHARED:{name} -->.*?<!-- /SHARED:{name} -->", source, re.S).group(0).replace(' aria-current="page"', "")
    for name in ("HEADER", "FOOTER")
}

for page in sorted(root.glob("*.html")):
    html = page.read_text()
    for name, block in blocks.items():
        html = re.sub(rf"<!-- SHARED:{name} -->.*?<!-- /SHARED:{name} -->", lambda _: block, html, flags=re.S)
    current = re.search(r'<body[^>]*data-page="([^"]+)"', html)
    if current:
        html = html.replace(f'<a href="{current.group(1)}">', f'<a href="{current.group(1)}" aria-current="page">', 1)
    page.write_text(html)
    print("synced", page.name)
