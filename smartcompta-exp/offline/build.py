#!/usr/bin/env python3
"""Fabrique la version hors ligne de SmartCompta Exp.

Produit, dans smartcompta-exp/dist/ :
  - SmartCompta-Exp.html        : un seul fichier autonome (bibliothèques intégrées, aucune connexion)
  - smartcompta.ico             : icône de l'application
  - SmartCompta-Exp-Setup.exe   : installateur Windows (si makensis est disponible)

Et, dans smartcompta-exp/prive/ (dossier confidentiel, exclu du dépôt Git) :
  - cle-licence.json                    : clé secrète et codes d'accès (à conserver précieusement)
  - Generateur-codes-SmartCompta.html   : outil pour produire un code d'activation par ordinateur
  - Codes-acces-SmartCompta.xlsx        : registre des licences à remettre aux clients

Usage : python3 offline/build.py [--codes 20] [--sans-licence]  (depuis le dossier smartcompta-exp)
La clé et les codes sont créés au premier lancement puis réutilisés : les codes déjà remis restent valables.
"""
import os
import re
import json
import hmac
import hashlib
import secrets
import base64
import io
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFF = os.path.join(ROOT, "offline")
DIST = os.path.join(ROOT, "dist")
PRIVE = os.path.join(ROOT, "prive")
VERSION = "1.3.0"
VENDOR = "Smart Consulting"
ALPHA = "ABCDEFGHJKMNPQRSTVWXYZ0123456789"


def licence(n_codes):
    """Crée (une seule fois) la clé secrète et les codes d'accès, puis renvoie la configuration embarquée."""
    os.makedirs(PRIVE, exist_ok=True)
    path = os.path.join(PRIVE, "cle-licence.json")
    if os.path.exists(path):
        data = json.load(open(path, encoding="utf-8"))
    else:
        data = {"secret": secrets.token_hex(32), "codes": []}
    have = len(data["codes"])
    for i in range(have, n_codes):
        raw = "".join(secrets.choice(ALPHA) for _ in range(12))
        data["codes"].append({"n": i + 1, "code": "SCX-" + "-".join(raw[j:j + 4] for j in range(0, 12, 4))})
    json.dump(data, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    secret = bytes.fromhex(data["secret"])
    mask = hashlib.sha256("SmartCompta-Exp|cle|2026".encode()).digest()
    k = bytes(b ^ mask[i % 32] for i, b in enumerate(secret)).hex()
    norm = lambda c: c.replace("-", "")
    cfg = {"vendor": VENDOR, "k": k, "codes": [{"h": hashlib.sha256(("SCX-LIST|" + norm(x["code"])).encode()).hexdigest(), "l": "Licence %02d" % x["n"]} for x in data["codes"]]}
    return data, cfg, k


def activation(secret_hex, machine):
    m = re.sub(r"[^A-Z0-9]", "", machine.upper())
    d = hmac.new(bytes.fromhex(secret_hex), ("SCX-MACH|" + m).encode(), hashlib.sha256).digest()
    bits = "".join(f"{b:08b}" for b in d)[:50]
    out = "".join(ALPHA[int(bits[i:i + 5], 2)] for i in range(0, 50, 5))
    return out[:5] + "-" + out[5:]


def write_private(data, k):
    core = open(os.path.join(OFF, "licence-core.js"), encoding="utf-8").read()
    gen = open(os.path.join(OFF, "generateur.html"), encoding="utf-8").read()
    gen = gen.replace("/*__CORE__*/", inline_js(core)).replace("/*__DATA__*/", json.dumps({"k": k, "list": data["codes"]}))
    open(os.path.join(PRIVE, "Generateur-codes-SmartCompta.html"), "w", encoding="utf-8").write(gen)
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        wb = Workbook(); ws = wb.active; ws.title = "Registre des licences"
        ws.append(["Licence", "Code d'accès", "Remis à (client)", "Poste / ordinateur", "Date de remise", "Observations"])
        for x in data["codes"]:
            ws.append(["Licence %02d" % x["n"], x["code"], "", "", "", ""])
        for c in ws[1]:
            c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="0E6B63"); c.alignment = Alignment(vertical="center")
        for col, w in zip("ABCDEF", (12, 24, 30, 26, 16, 30)):
            ws.column_dimensions[col].width = w
        for row in ws.iter_rows(min_row=2, min_col=2, max_col=2):
            row[0].font = Font(name="Consolas", bold=True)
        ws.freeze_panes = "A2"
        wb.save(os.path.join(PRIVE, "Codes-acces-SmartCompta.xlsx"))
    except ImportError:
        pass

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


def build_html(cfg=None) -> str:
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
    if cfg:
        core = open(os.path.join(OFF, "licence-core.js"), encoding="utf-8").read()
        boot += "\n<script>window.SMARTCOMPTA_LICENCE = %s;</script>\n<script>%s</script>" % (json.dumps(cfg), inline_js(core))
    # Les bibliothèques passent juste avant le script principal de l'application.
    i = src.index("<script>\n\"use strict\";")
    body = src[:i] + boot + "\n" + "\n".join(libs) + "\n" + src[i:]
    fav = favicon_links()
    return ("<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n" + fav + "\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
            f"{title}\n{RESET}\n</head>\n<body>\n{body}\n</body>\n</html>\n")


def favicon_links() -> str:
    # Icône de la fenêtre et de la barre des tâches : sans elle, Edge ou Chrome affichent leur propre logo.
    out = []
    for n in (32, 192):
        buf = io.BytesIO(); icon_image(n).save(buf, "PNG")
        out.append('<link rel="icon" type="image/png" sizes="%dx%d" href="data:image/png;base64,%s">' % (n, n, base64.b64encode(buf.getvalue()).decode()))
    return "\n".join(out)


def icon_image(n=256):
    from PIL import Image
    return draw_icon().resize((n, n), Image.LANCZOS)


def draw_icon():
    from PIL import Image, ImageDraw
    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([8, 8, size - 8, size - 8], radius=52, fill=(14, 107, 99, 255))
    w = 18
    d.line([(64, 196), (64, 60)], fill="white", width=w)
    d.line([(55, 196), (200, 196)], fill="white", width=w)
    d.line([(88, 160), (124, 112), (152, 140), (198, 76)], fill="white", width=w, joint="curve")
    return img


def build_icon(path: str):
    draw_icon().save(path, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])


def build_launcher():
    """Compile « SmartCompta Exp.exe », le lanceur Windows doté de l'icône de l'application."""
    gcc, windres = "x86_64-w64-mingw32-gcc", "x86_64-w64-mingw32-windres"
    if not (shutil.which(gcc) and shutil.which(windres)):
        sys.exit("Compilateur MinGW absent : installez gcc-mingw-w64-x86-64 pour produire le lanceur Windows.")
    shutil.copy(os.path.join(DIST, "smartcompta.ico"), os.path.join(OFF, "smartcompta.ico"))
    try:
        subprocess.run([windres, "launcher.rc", "-O", "coff", "-o", "launcher.res"], cwd=OFF, check=True)
        subprocess.run([gcc, "-O2", "-s", "-municode", "-mwindows", "launcher.c", "launcher.res", "-o", os.path.join(DIST, "SmartCompta Exp.exe"), "-ladvapi32", "-lshell32"], cwd=OFF, check=True)
    finally:
        for f in ("launcher.res", "smartcompta.ico"):
            if os.path.exists(os.path.join(OFF, f)):
                os.remove(os.path.join(OFF, f))
    print("Lanceur : " + os.path.join(DIST, "SmartCompta Exp.exe"))


def main():
    os.makedirs(DIST, exist_ok=True)
    args = sys.argv[1:]
    n = int(args[args.index("--codes") + 1]) if "--codes" in args else 20
    cfg = None
    if "--sans-licence" not in args:
        data, cfg, k = licence(n)
        write_private(data, k)
        print(f"Licences : {len(data['codes'])} codes d'accès, générateur et registre dans {PRIVE}")
    html = build_html(cfg)
    out = os.path.join(DIST, "SmartCompta-Exp.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"HTML autonome : {out} ({len(html.encode('utf-8')) / 1e6:.1f} Mo)")
    ico = os.path.join(DIST, "smartcompta.ico")
    build_icon(ico)
    print(f"Icône : {ico}")
    build_launcher()
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
