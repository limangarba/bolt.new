/* SmartCompta Exp.exe : lanceur Windows de SmartCompta Exp.
   Ouvre SmartCompta-Exp.html (placé à côté du programme) dans une fenêtre d'application dédiée
   de Microsoft Edge (ou Google Chrome), avec un profil propre : %LOCALAPPDATA%\SmartComptaExp\Profil.
   Compilation : x86_64-w64-mingw32-windres launcher.rc -O coff -o launcher.res
                 x86_64-w64-mingw32-gcc -O2 -s -municode -mwindows launcher.c launcher.res -o "SmartCompta Exp.exe" -ladvapi32 -lshell32 */
#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif
#include <windows.h>
#include <shellapi.h>
#include <wchar.h>

#define APP L"SmartCompta Exp"
#define BUF 4096

static int file_exists(const wchar_t *p) {
  DWORD a = GetFileAttributesW(p);
  return a != INVALID_FILE_ATTRIBUTES && !(a & FILE_ATTRIBUTE_DIRECTORY);
}

static void strip_quotes(wchar_t *s) {
  size_t n = wcslen(s), j = 0;
  for (size_t i = 0; i < n; i++) if (s[i] != L'"') s[j++] = s[i];
  s[j] = 0;
}

static int app_path(HKEY root, const wchar_t *exe, wchar_t *out) {
  wchar_t key[256];
  DWORD size = BUF * sizeof(wchar_t);
  swprintf(key, 256, L"Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\%ls", exe);
  if (RegGetValueW(root, key, NULL, RRF_RT_REG_SZ, NULL, out, &size) != ERROR_SUCCESS) return 0;
  strip_quotes(out);
  return file_exists(out);
}

static int env_path(const wchar_t *var, const wchar_t *rest, wchar_t *out) {
  wchar_t base[BUF];
  if (!GetEnvironmentVariableW(var, base, BUF)) return 0;
  swprintf(out, BUF, L"%ls%ls", base, rest);
  return file_exists(out);
}

static int find_browser(wchar_t *out) {
  const wchar_t *edge = L"\\Microsoft\\Edge\\Application\\msedge.exe";
  const wchar_t *chrome = L"\\Google\\Chrome\\Application\\chrome.exe";
  return app_path(HKEY_CURRENT_USER, L"msedge.exe", out) || app_path(HKEY_LOCAL_MACHINE, L"msedge.exe", out)
      || env_path(L"ProgramFiles(x86)", edge, out) || env_path(L"ProgramFiles", edge, out) || env_path(L"LOCALAPPDATA", edge, out)
      || app_path(HKEY_CURRENT_USER, L"chrome.exe", out) || app_path(HKEY_LOCAL_MACHINE, L"chrome.exe", out)
      || env_path(L"ProgramFiles", chrome, out) || env_path(L"ProgramFiles(x86)", chrome, out) || env_path(L"LOCALAPPDATA", chrome, out);
}

/* Chemin Windows -> adresse file:/// (barres obliques, espaces et caractères réservés encodés). */
static void to_url(const wchar_t *path, wchar_t *url) {
  size_t j = 0;
  j += swprintf(url, BUF, L"file:///");
  for (const wchar_t *p = path; *p && j < BUF - 4; p++) {
    switch (*p) {
      case L'\\': url[j++] = L'/'; break;
      case L' ': url[j++] = L'%'; url[j++] = L'2'; url[j++] = L'0'; break;
      case L'%': url[j++] = L'%'; url[j++] = L'2'; url[j++] = L'5'; break;
      case L'#': url[j++] = L'%'; url[j++] = L'2'; url[j++] = L'3'; break;
      default: url[j++] = *p;
    }
  }
  url[j] = 0;
}

int WINAPI wWinMain(HINSTANCE inst, HINSTANCE prev, LPWSTR args, int show) {
  (void)inst; (void)prev; (void)args; (void)show;
  wchar_t dir[BUF], html[BUF], browser[BUF], url[BUF], prof[BUF], cmd[BUF * 3];
  GetModuleFileNameW(NULL, dir, BUF);
  wchar_t *slash = wcsrchr(dir, L'\\');
  if (slash) *slash = 0;
  swprintf(html, BUF, L"%ls\\SmartCompta-Exp.html", dir);
  if (!file_exists(html)) {
    MessageBoxW(NULL, L"Le fichier SmartCompta-Exp.html est introuvable à côté du programme.\n\nRéinstallez SmartCompta Exp.", APP, MB_ICONERROR);
    return 1;
  }
  if (!find_browser(browser)) {
    MessageBoxW(NULL, L"Microsoft Edge et Google Chrome sont introuvables sur cet ordinateur.\n\nSmartCompta Exp va s'ouvrir dans votre navigateur par défaut. Installez Microsoft Edge pour l'utiliser dans sa propre fenêtre.", APP, MB_ICONWARNING);
    ShellExecuteW(NULL, L"open", html, NULL, dir, SW_SHOWNORMAL);
    return 0;
  }
  wchar_t local[BUF];
  if (!GetEnvironmentVariableW(L"LOCALAPPDATA", local, BUF)) wcscpy(local, dir);
  swprintf(prof, BUF, L"%ls\\SmartComptaExp", local); CreateDirectoryW(prof, NULL);
  swprintf(prof, BUF, L"%ls\\SmartComptaExp\\Profil", local); CreateDirectoryW(prof, NULL);
  to_url(html, url);
  swprintf(cmd, BUF * 3, L"\"%ls\" --app=\"%ls\" --user-data-dir=\"%ls\" --no-first-run --no-default-browser-check --disable-sync --lang=fr", browser, url, prof);
  STARTUPINFOW si; PROCESS_INFORMATION pi;
  ZeroMemory(&si, sizeof si); si.cb = sizeof si; ZeroMemory(&pi, sizeof pi);
  if (!CreateProcessW(NULL, cmd, NULL, NULL, FALSE, 0, NULL, dir, &si, &pi)) {
    ShellExecuteW(NULL, L"open", html, NULL, dir, SW_SHOWNORMAL);
    return 0;
  }
  CloseHandle(pi.hThread); CloseHandle(pi.hProcess);
  return 0;
}
