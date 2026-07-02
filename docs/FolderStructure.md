# Veriscope OS — Folder Structure

This document outlines the organization and directory layouts of the Veriscope OS codebase.

---

## 1. Directory Overview

```text
veriscope-os/
├── client/                 # Frontend React Application (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Custom React Flow Nodes, UI timeline progress loaders
│   │   ├── layout/         # Sidebar navigation and workspace shell wrapper
│   │   ├── pages/          # Landing portal search view and research analytics dashboard
│   │   ├── services/       # Fetch API integrations to backend port
│   │   └── types/          # Client-side typescript definitions
│   ├── Dockerfile          # Frontend container serving static client on Nginx
│   └── nginx.conf          # Nginx fallback configuration routing support
├── server/                 # Backend Node.js Server (Express + TypeScript)
│   ├── routes/             # REST routing layers
│   ├── services/           # Live LLM calls and seeded sandbox data providers
│   ├── Dockerfile          # Backend container building typescript and exposing endpoints
│   └── index.ts            # Entrypoint bootstrap, CORS rules, and static serving setup
├── shared/                 # Shared TypeScript Type interfaces
│   └── types.ts            # Common data schemas consumed by client & server
├── docs/                   # System Documentation files
├── Dockerfile              # Unified single-container Docker build file
├── docker-compose.yml      # Container orchestration configs
├── .env.example            # Environment configuration template
├── .gitignore              # Build and secret ignore list
├── package.json            # Root monorepo manager package settings
├── run.bat                 # Windows execution helper
└── run.ps1                 # PowerShell launcher script
```
