# AION Flow — Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (Vercel SPA)"]
        UI[React SPA<br/>Vite + TypeScript]
        Sentry[Sentry Error Tracking]
        Router[TanStack Router]
        Query[TanStack Query]
    end

    subgraph Supabase["Supabase Platform"]
        PG[(PostgreSQL)]
        Auth[Auth Service]
        Storage[Storage API]
        EF[Edge Functions]
    end

    subgraph External["External Services"]
        SMTP[SMTP Server<br/>Gmail / Custom]
        GH[GitHub Actions<br/>Scheduled Backups]
        SENTRY[Sentry.io<br/>Error Monitoring]
    end

    UI -->|Auth JWT| Auth
    UI -->|SQL Queries| PG
    UI -->|File Upload| Storage
    UI -->|RPC Calls| EF
    EF -->|Send Emails| SMTP
    EF -->|Read/Write| PG
    GH -->|Trigger| EF
    UI -->|Errors| Sentry
    Sentry --> SENTRY
```

## Module Architecture

```mermaid
graph LR
    subgraph CMS["Content Management"]
        S[Services]
        B[Blog]
        P[Products]
        PG2[Pages]
        M[Media]
    end

    subgraph CRM["Customer Relations"]
        IN[Inbox]
        TH[Threading]
        AT[Attachments]
        SR[Search]
    end

    subgraph Sales["Sales Pipeline"]
        PL[Pipeline]
        FUP[Follow-Up Tasks]
        LV[Lead Values]
    end

    subgraph Platform["Platform"]
        HI[History / Audit]
        RL[Roles & Permissions]
        BK[Backups]
        OB[Observability]
    end

    CMS --- CRM --- Sales --- Platform
```

## Data Flow

```mermaid
sequenceDiagram
    participant User as Browser
    participant Vercel as Vercel CDN
    participant Supa as Supabase
    participant EF as Edge Function
    participant SMTP as SMTP Server

    User->>Vercel: Load SPA
    Vercel->>User: React App

    User->>Supa: Login (Auth)
    Supa->>User: JWT Token

    User->>Supa: CRUD Queries
    Supa->>User: Data Response

    User->>Supa: Contact Form Submit
    Supa->>User: Acknowledged
    Supa->>Supa: Trigger: sync to contact_messages

    User->>EF: Send Reply
    EF->>Supa: Read SMTP settings
    EF->>SMTP: Send Email
    SMTP->>EF: Delivery Confirm
    EF->>User: OK Response
```

## Permission Model

```mermaid
graph TD
    subgraph Roles
        A[Admin]
        E[Editor]
        S[Sales]
        V[Viewer]
    end

    subgraph Permissions
        C_EDIT[cms.edit]
        C_VIEW[cms.view]
        CRM_IN[crm.inbox]
        CRM_PL[crm.pipeline]
        CRM_TK[crm.tasks]
        HIST_V[history.view]
        HIST_R[history.restore]
        SET_ALL[settings.all]
        USR_M[users.manage]
    end

    A --> C_EDIT & C_VIEW & CRM_IN & CRM_PL & CRM_TK & HIST_V & HIST_R & SET_ALL & USR_M
    E --> C_EDIT & C_VIEW & HIST_V & SET_ALL
    S --> CRM_IN & CRM_PL & CRM_TK & HIST_V
    V --> C_VIEW & HIST_V
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 7 |
| Routing | TanStack Router |
| Styling | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel (SPA) + Supabase (DB/API) |
| Email | SMTP via nodemailer (Edge Functions) |
| Monitoring | Sentry (errors) + Custom Observability Dashboard |
| Scheduling | GitHub Actions (daily/weekly backups) |
