# RC1 Electron EXE Build Guide

**Date:** 2026-07-11
**Policy:** RC1 baseline unchanged - sessionStorage only, SQLite ON HOLD
**Build status:** PASS (portable EXE produced and launched)

## Build Status Summary

| Step | Command | Result |
|------|---------|--------|
| Vite web build | npm run build | PASS |
| Vite Electron build | npm run build:electron | PASS |
| Electron production preview | npm run electron:preview | PASS |
| Windows portable EXE | npm run dist:portable | PASS |

**Output:** release/Project-TITAN-1.3.0-portable.exe (~85 MB)

## Commands

npm install
npm run electron:preview
npm run dist:portable
npm run dist:win

## RC1 Runtime Notes

- sessionStorage persists per Windows user profile in Electron webview (not shared across PCs)
- No Repository/SQLite changes in this build
- SQLite deferred per PM 2026-07-11

## 경리실 QA Checklist

- Launch portable EXE, no White Screen
- Login, HOME, Sidebar navigation
- Core flow: import, inbound, LOT, inspection, certificate, outbound, invoice print
- QR generate/print
- sessionStorage retained after app restart on same PC