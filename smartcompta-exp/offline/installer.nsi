; Installateur Windows de SmartCompta Exp (NSIS 3, Unicode).
; Installe l'application pour l'utilisateur courant, sans droits d'administrateur ni connexion internet.
; L'application s'ouvre dans sa propre fenêtre grâce à Microsoft Edge (présent sur Windows 10 et 11),
; avec un profil dédié : les données comptables restent dans %LOCALAPPDATA%\SmartComptaExp\Profil.
; Compilation : makensis -DVERSION=1.0.0 installer.nsi  (fichiers attendus à côté : SmartCompta-Exp.html, smartcompta.ico)

Unicode true
!ifndef VERSION
  !define VERSION "1.0.0"
!endif
!define APP "SmartCompta Exp"
!define REGKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartComptaExp"
!define DATADIR "$LOCALAPPDATA\SmartComptaExp"

!include "MUI2.nsh"
!include "WordFunc.nsh"

Name "${APP}"
OutFile "SmartCompta-Exp-Setup.exe"
InstallDir "${DATADIR}\App"
RequestExecutionLevel user
SetCompressor /SOLID lzma
BrandingText "${APP} ${VERSION}"

VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=1036 "ProductName" "${APP}"
VIAddVersionKey /LANG=1036 "FileDescription" "Installation de ${APP}, comptabilité SYSCOHADA hors ligne"
VIAddVersionKey /LANG=1036 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "LegalCopyright" "SmartCompta Exp"

!define MUI_ICON "smartcompta.ico"
!define MUI_UNICON "smartcompta.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Installation de ${APP}"
!define MUI_WELCOMEPAGE_TEXT "Logiciel de comptabilité SYSCOHADA révisé pour le Niger : saisie, import Excel, PDF et texte, lettrage, paie CNSS, ITS et FSSP, immobilisations, balance et états.$\r$\n$\r$\nL'application fonctionne entièrement hors ligne. Vos données restent sur cet ordinateur.$\r$\n$\r$\nAu premier démarrage, un code d'accès vous sera demandé : munissez-vous du code remis par votre fournisseur.$\r$\n$\r$\nCliquez sur Suivant pour continuer."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Lancer ${APP} maintenant"
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchApp

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "French"

Var BROWSER
Var ARGS

; Recherche Microsoft Edge, puis Google Chrome, pour ouvrir l'application dans une fenêtre dédiée.
Function FindBrowser
  StrCpy $BROWSER ""
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  StrCmp $0 "" 0 check
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  StrCmp $0 "" 0 check
  StrCpy $0 "$PROGRAMFILES32\Microsoft\Edge\Application\msedge.exe"
  IfFileExists $0 found
  StrCpy $0 "$PROGRAMFILES64\Microsoft\Edge\Application\msedge.exe"
  IfFileExists $0 found
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  StrCmp $0 "" 0 check
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  StrCmp $0 "" none check
  check:
    ${WordReplace} $0 '"' "" "+" $0
    IfFileExists $0 found none
  found:
    StrCpy $BROWSER $0
  none:
FunctionEnd

; Arguments de lancement : fenêtre d'application, profil dédié (données isolées et conservées).
Function BuildArgs
  ${WordReplace} "$INSTDIR\SmartCompta-Exp.html" "\" "/" "+" $1
  ${WordReplace} $1 "%" "%25" "+" $1
  ${WordReplace} $1 " " "%20" "+" $1
  ${WordReplace} $1 "#" "%23" "+" $1
  StrCpy $ARGS '--app="file:///$1" --user-data-dir="${DATADIR}\Profil" --no-first-run --no-default-browser-check --disable-sync --lang=fr'
FunctionEnd

Function LaunchApp
  StrCmp $BROWSER "" 0 +3
    ExecShell "open" "$INSTDIR\SmartCompta-Exp.html"
    Return
  Exec '"$BROWSER" $ARGS'
FunctionEnd

Section "Installer"
  SetOutPath "$INSTDIR"
  File "SmartCompta-Exp.html"
  File "smartcompta.ico"
  CreateDirectory "${DATADIR}\Profil"
  Call FindBrowser
  Call BuildArgs
  CreateDirectory "$SMPROGRAMS\${APP}"
  StrCmp $BROWSER "" nobrowser
    CreateShortCut "$DESKTOP\${APP}.lnk" "$BROWSER" "$ARGS" "$INSTDIR\smartcompta.ico" 0 SW_SHOWNORMAL "" "Comptabilité SYSCOHADA hors ligne"
    CreateShortCut "$SMPROGRAMS\${APP}\${APP}.lnk" "$BROWSER" "$ARGS" "$INSTDIR\smartcompta.ico" 0 SW_SHOWNORMAL "" "Comptabilité SYSCOHADA hors ligne"
    Goto shortcuts
  nobrowser:
    MessageBox MB_ICONEXCLAMATION|MB_OK "Microsoft Edge et Google Chrome sont introuvables sur cet ordinateur.$\r$\n$\r$\n${APP} s'ouvrira dans votre navigateur par défaut. Pour une fenêtre d'application dédiée, installez Microsoft Edge puis relancez cette installation." /SD IDOK
    CreateShortCut "$DESKTOP\${APP}.lnk" "$INSTDIR\SmartCompta-Exp.html" "" "$INSTDIR\smartcompta.ico" 0
    CreateShortCut "$SMPROGRAMS\${APP}\${APP}.lnk" "$INSTDIR\SmartCompta-Exp.html" "" "$INSTDIR\smartcompta.ico" 0
  shortcuts:
  CreateShortCut "$SMPROGRAMS\${APP}\Désinstaller ${APP}.lnk" "$INSTDIR\Desinstaller.exe" "" "$INSTDIR\smartcompta.ico" 0

  WriteUninstaller "$INSTDIR\Desinstaller.exe"
  WriteRegStr HKCU "${REGKEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${REGKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${REGKEY}" "Publisher" "SmartCompta Exp"
  WriteRegStr HKCU "${REGKEY}" "DisplayIcon" "$INSTDIR\smartcompta.ico"
  WriteRegStr HKCU "${REGKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "UninstallString" '"$INSTDIR\Desinstaller.exe"'
  WriteRegStr HKCU "${REGKEY}" "QuietUninstallString" '"$INSTDIR\Desinstaller.exe" /S'
  WriteRegDWORD HKCU "${REGKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REGKEY}" "NoRepair" 1
  WriteRegDWORD HKCU "${REGKEY}" "EstimatedSize" 4200
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\SmartCompta-Exp.html"
  Delete "$INSTDIR\smartcompta.ico"
  Delete "$INSTDIR\Desinstaller.exe"
  RMDir "$INSTDIR"
  Delete "$DESKTOP\${APP}.lnk"
  Delete "$SMPROGRAMS\${APP}\${APP}.lnk"
  Delete "$SMPROGRAMS\${APP}\Désinstaller ${APP}.lnk"
  RMDir "$SMPROGRAMS\${APP}"
  DeleteRegKey HKCU "${REGKEY}"
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "Supprimer aussi les données comptables enregistrées sur cet ordinateur ?$\r$\n$\r$\nChoisissez Non pour les conserver : elles seront retrouvées si vous réinstallez ${APP}.$\r$\nAvant de répondre Oui, téléchargez une sauvegarde depuis l'écran Dossier." /SD IDNO IDNO keep
    RMDir /r "${DATADIR}\Profil"
  keep:
  RMDir "${DATADIR}"
SectionEnd
