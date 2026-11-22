#!/usr/bin/env python3
"""Fabrique la version hors ligne de SmartCompta Exp.

Produit, dans smartcompta-exp/dist/ :
  - SmartCompta-Exp.html        : un seul fichier autonome (bibliothèques intégrées, aucune connexion)
  - smartcompta.ico             : icône de l'application
  - SmartCompta-Exp-Setup.exe   : installateur Windows (si makensis est disponible)

Usage : python3 offline/build.py  (depuis le dossier smartcompta-exp)
"""
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFF = os.path.join(ROOT, "offline")
DIST = os.path.join(ROOT, "dist")
VERSION = "1.0.0"

# Bibliothèques intégrées, dans l'ordre de chargement. Le « worker » de pdf.js est chargé
# dans la page : pdf.js l'utilise alors directement, sans processus séparé ni réseau.
LIBS = ["xlsx.full.min.js", "pdf.min.js", "pdf.worker.min.js", "jspdf.umd.min.js"]

RESET = """<style>
*,*::before,*::after{box-sizing:border-box}
:root{color-scheme:light}
html{-webkit-text-size-adjust:100%}
body{margin:0;font:14px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif}
img{max-width:100%}
[hidden]{display:none!important}
</style>"""


def inline_js(code: str) -> str:
    # Un « </script » dans le code fermerait la balise : on l'échappe.
    return re.sub(r"</(script)", r"<\\/\1", code, flags=re.I)


def build_html() -> str:
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    # Polices Google : remplacées par les polices du système (Segoe UI sous Windows).
    src = re.sub(r'<link rel="(preconnect|stylesheet)" href="https://fonts\.(googleapis|gstatic)\.com[^>]*>\n?', "", src)
    title = re.search(r"<title>.*?</title>", src).group(0)
    src = src.replace(title, "", 1)
    libs = []
    for name in LIBS:
        code = open(os.path.join(OFF, "vendor", name), encoding="utf-8").read()
        libs.append(f"<script>/* {name} */\n{inline_js(code)}\n</script>")
    boot = '<script>window.SMARTCOMPTA_OFFLINE = true; window.SMARTCOMPTA_VERSION = "%s";</script>' % VERSION
    # Les bibliothèques passent juste avant le script principal de l'application.
    i = src.index("<script>\n\"use strict\";")
    body = src[:i] + boot + "\n" + "\n".join(libs) + "\n" + src[i:]
    return ("<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
            f"{title}\n{RESET}\n</head>\n<body>\n{body}\n</body>\n</html>\n")


def build_icon(path: str):
    from PIL import Image, ImageDraw
    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([8, 8, size - 8, size - 8], radius=52, fill=(14, 107, 99, 255))
    w = 18
    d.line([(64, 196), (64, 60)], fill="white", width=w)
    d.line([(55, 196), (200, 196)], fill="white", width=w)
    d.line([(88, 160), (124, 112), (152, 140), (198, 76)], fill="white", width=w, joint="curve")
    img.save(path, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])


def main():
    os.makedirs(DIST, exist_ok=True)
    html = build_html()
    out = os.path.join(DIST, "SmartCompta-Exp.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"HTML autonome : {out} ({len(html.encode('utf-8')) / 1e6:.1f} Mo)")
    ico = os.path.join(DIST, "smartcompta.ico")
    build_icon(ico)
    print(f"Icône : {ico}")
    if shutil.which("makensis"):
        shutil.copy(os.path.join(OFF, "installer.nsi"), os.path.join(DIST, "installer.nsi"))
        r = subprocess.run(["makensis", "-V2", f"-DVERSION={VERSION}", "installer.nsi"], cwd=DIST, capture_output=True, text=True)
        os.remove(os.path.join(DIST, "installer.nsi"))
        if r.returncode:
            print(r.stdout, r.stderr)
            sys.exit("Échec de la compilation de l'installateur.")
        print(f"Installateur : {os.path.join(DIST, 'SmartCompta-Exp-Setup.exe')}")
    else:
        print("makensis absent : installateur non compilé (voir offline/installer.nsi).")


if __name__ == "__main__":
    main()
