---
title: "How this site works: Azure Static Web Apps, Terraform and OIDC"
date: "2026-07-09"
excerpt: "The portfolio you are reading is its own case study — static frontend on Azure Static Web Apps, infrastructure in Terraform, keyless deploys via GitHub Actions OIDC, and a serverless visitor counter on Table Storage."
tags: ["Azure", "Terraform", "GitHub Actions", "OIDC", "Static Web Apps"]
draft: false
---

This site is a static React app, but everything around it is the part I actually care about: the infrastructure is code, the deploys are keyless, and the visitor counter you see on the home page is a real serverless function hitting real storage. This post walks through how the pieces fit.

## The shape of the system

```
GitHub repo ──▶ GitHub Actions (OIDC, no stored cloud secrets)
                 ├─ terraform apply ──▶ Resource Group
                 │                       ├─ Static Web App (site + managed API)
                 │                       └─ Storage Account (Table: visitors)
                 └─ swa deploy ──────▶ dist/ + api/
Browser ──▶ muyideen.dev ──▶ SWA CDN ──▶ /api/visitors ──▶ Table Storage
```

The frontend is Vite + React + TypeScript, built to a `dist/` folder. Azure Static Web Apps serves it from a global edge, and also hosts the small Functions API that lives in `api/` — no separate Function App to provision or pay for.

## Terraform owns the infrastructure

Everything in Azure is declared in a small Terraform root with two modules:

- **`static_web_app`** — the SWA resource itself plus custom domains (`dns-txt-token` validation for the apex, `cname-delegation` for `www`).
- **`visitor_counter`** — a Standard LRS storage account (TLS 1.2 minimum) with a single Table. Its connection string flows into the Static Web App's app settings, so the API finds it at runtime without any manual configuration.

State lives in a remote Azure Storage backend, so applies are consistent from CI and from my laptop.

## Keyless deploys with OIDC federation

The GitHub Actions workflow logs into Azure with `azure/login` using **OpenID Connect federated credentials** — GitHub mints a short-lived token per run, Azure trusts it for this specific repository and branch, and there is no long-lived service-principal secret sitting in repository settings to leak or rotate.

```yaml
permissions:
  id-token: write
  contents: read

- uses: azure/login@v3
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Those three values are identifiers, not secrets — the trust lives in the federated credential configured on the Entra ID app registration. After `terraform apply`, the same pipeline builds the site and pushes `dist/` plus the API to Static Web Apps.

## The visitor counter

The number on the home page is a single entity in Table Storage, incremented by an anonymous Azure Function on every visit. The interesting bit is the concurrency handling: reads and writes race when several visitors land at once, so the function uses **optimistic concurrency with ETags** — read the entity, increment, write back with the ETag from the read, and retry on a 412 if someone else won the race.

```js
const next = (Number(entity.count) || 0) + 1
await client.updateEntity(
  { partitionKey: 'counter', rowKey: 'visits', count: next },
  'Replace',
  { etag: entity.etag },
)
```

No locks, no queues — for a counter this is exactly the level of machinery the problem deserves.

## Small hardening details

- **Security headers** are declared in `staticwebapp.config.json`: a Content-Security-Policy scoped to the handful of origins the site actually uses, `nosniff`, `frame-ancestors 'none'`, a referrer policy and a permissions policy.
- **The blog is markdown compiled at build time** — frontmatter is parsed by a Vite plugin during the build, raw HTML in markdown is disabled, and each post's body is code-split so the home page never downloads them.
- **CI runs on every branch** (lint, typecheck, build) before anything reaches `main`, and Dependabot watches npm, GitHub Actions and the Terraform providers.

The whole thing costs almost nothing to run — the Static Web App is on the free tier, and the storage account bills fractions of a cent for the counter's traffic. The repo *is* the case study: if you want to see any of this in detail, it lives on [my GitHub](https://github.com/MMuyideen).
