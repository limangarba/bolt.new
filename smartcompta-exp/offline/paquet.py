#!/usr/bin/env python3
"""Prépare le ZIP à remettre aux clients : SmartCompta-Exp-Setup-<version>.zip (sans aucune licence).
Usage : python3 offline/paquet.py  (après offline/build.py, depuis le dossier smartcompta-exp)"""
import os
import re
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
PRIVE = os.path.join(ROOT, "prive")
VERSION = re.search(r'VERSION = "([\d.]+)"', open(os.path.join(ROOT, "offline", "build.py"), encoding="utf-8").read()).group(1)
V = ".".join(VERSION.split(".")[:2])


def lisez_moi() -> str:
    md = open(os.path.join(DIST, "INSTALLATION.md"), encoding="utf-8").read()
    t = re.sub(r"SmartCompta Exp [\d.]+ :", f"SmartCompta Exp {VERSION} :", md)
    t = t.replace("SmartCompta-Exp-Setup.exe", f"SmartCompta-Exp-Setup-{V}.exe").replace("`SmartCompta-Exp.html`", "`SmartCompta-Exp-portable.html`").replace("INSTALLATION.md` | Cette procédure", "LISEZ-MOI.txt` | Cette procédure")
    t = re.sub(r"^# (.*)$", lambda m: m.group(1).upper() + "\n" + "=" * len(m.group(1)), t, flags=re.M)
    t = re.sub(r"^## (.*)$", lambda m: "\n" + m.group(1).upper() + "\n" + "-" * len(m.group(1)), t, flags=re.M)
    t = re.sub(r"^### (.*)$", lambda m: "\n" + m.group(1), t, flags=re.M)
    t = re.sub(r"^\|[-| ]+\|$\n", "", t, flags=re.M)
    t = re.sub(r"^\| (.*) \|$", lambda m: "  - " + m.group(1).replace(" | ", " : "), t, flags=re.M)
    t = t.replace("**", "").replace("`", "").replace("> ", "   ").replace("---\n", "")
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.replace("\n", "\r\n")


def main():
    os.makedirs(PRIVE, exist_ok=True)
    name = f"SmartCompta-Exp-Setup-{V}"
    out = os.path.join(PRIVE, name + ".zip")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(DIST, "SmartCompta-Exp-Setup.exe"), f"{name}/SmartCompta-Exp-Setup-{V}.exe")
        z.write(os.path.join(DIST, "SmartCompta-Exp.html"), f"{name}/SmartCompta-Exp-portable.html")
        z.writestr(f"{name}/LISEZ-MOI.txt", ("﻿" + lisez_moi()).encode("utf-8"))
    print(out)


if __name__ == "__main__":
    main()
