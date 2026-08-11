# Muyideen Morenigbade — Portfolio

Personal portfolio and blog for a DevOps & Cloud Engineer, live at [muyideen.dev](https://www.muyideen.dev). Astro + TypeScript + Tailwind CSS, hosted on Azure Static Web Apps, managed with Terraform, deployed via GitHub Actions using OIDC (no long-lived cloud secrets). The site is its own case study: the deploy hash and visitor counter on the home page are real — the counter is a managed Azure Function backed by Table Storage, provisioned by the Terraform in this repo.

## Architecture

![Architecture diagram: GitHub Actions deploys via OIDC; Terraform provisions Azure Static Web Apps and Table Storage](src/content/posts/how-this-site-works/architecture.svg)

## Stack

| Layer | Choice |
|---|---|
| Frontend | Astro 5 (static output), TypeScript, Tailwind CSS 4 |
| Islands | One React island: the ⌘K command palette (cmdk); everything else ships zero JS |
| Blog | Astro content collections — folder per post, images co-located and auto-optimized to WebP |
| API | Azure Functions (SWA managed) + Table Storage visitor counter |
| Hosting | Azure Static Web Apps (Free tier) |
| IaC | Terraform ≥ 1.7, `azurerm 4.80.0`, remote state in Azure Storage |
| CI/CD | GitHub Actions — CI on every branch/PR, deploy on `main` via OIDC |

## Repository layout

```
src/
├── components/        # .astro sections (Hero, Work, …) + CommandPalette.tsx island
├── content/posts/     # blog: one folder per post (index.md + images)
├── content.config.ts  # posts collection schema (zod-validated frontmatter)
├── data/*.yaml        # ALL editable site content (projects, experience, certs, …)
├── layouts/           # Base.astro (head, header/footer, reveal script)
├── lib/               # site constants, YAML loaders, post helpers, build hash
├── pages/             # index, resume, blog/index, blog/[slug], 404, rss.xml
└── styles/global.css  # design tokens (@theme) + prose styles
api/visitors/          # visitor-counter Azure Function
infra/                 # Terraform (resource group, SWA, counter storage)
public/
├── diagrams/          # project architecture diagrams
├── certifications/    # certification badge images
└── resume.pdf         # generated from /resume — committed, see “Résumé”
scripts/               # post-build CSP hashing + résumé PDF rendering
```

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro build → dist/, then CSP-hash inline scripts
npm run preview    # serve the production build locally
npm run check      # astro check (typechecks .astro + .ts)
npm run resume:pdf # build, then re-render /resume → public/resume.pdf
```

---

## Customising content

All editable site content lives in **`src/data/*.yaml`** (plus identity in `src/lib/site.ts`).

| File | What it holds |
|---|---|
| `projects.yaml` | Projects; `featured: true` entries render as full case studies |
| `experience.yaml` | Roles, periods, bullets |
| `certifications.yaml` | Certs with verify URLs and badge images |
| `education.yaml`, `skills.yaml` | Schools/bootcamps, toolbox categories |
| `resume.yaml` | Résumé-only copy: headline, summary, impact metrics, project picks |

### Adding a project

Drop the architecture diagram in `public/diagrams/` and add an entry:

```yaml
- id: my-project              # kebab-case, unique
  title: My Project
  tagline: One-line summary shown under the title.
  stack: [Terraform, Azure]
  github: https://github.com/...
  diagram: /diagrams/my-project.png   # optional
  featured: true                      # optional: promotes to a case study
  detail: >-                          # required for featured entries
    A paragraph of case-study context.
  writeup: my-post-slug               # optional: links to a published post
```

---

## Writing a blog post

Each post is a **folder** under `src/content/posts/` containing an `index.md` and any images it uses:

```
src/content/posts/
└── my-post-slug/          # folder name = URL slug (/blog/my-post-slug)
    ├── index.md
    ├── image-01.png
    └── image-02.png
```

`index.md` starts with frontmatter (zod-validated by `src/content.config.ts`):

```markdown
---
title: "My Post Title"
date: "2026-07-09"
excerpt: "One-sentence summary shown on cards and in the RSS feed."
tags: ["Azure", "Terraform"]
draft: true            # flip to false to publish
---

Body in markdown. Reference co-located images relatively:

![Screenshot of the pipeline run](./image-01.png)
```

Notes:

- **`draft: true` posts are invisible everywhere** — site, sitemap, and RSS. Flip to `false` to publish.
- Relative image references (`./image.png`) are optimized to hashed WebP with intrinsic dimensions at build time (zero layout shift). Keep images in the post's own folder — external hot-linking is blocked by the CSP.
- Code blocks are highlighted by Shiki at build time and get a copy button; headings get hover anchors; posts with 3+ `##` headings get a table of contents.
- Post images and project diagrams get a magnifier badge that opens them full screen (`src/components/Lightbox.astro`, a native `<dialog>`). Anything else opts in with `data-zoomable` on the image's container.
- `sitemap-index.xml` and `rss.xml` regenerate on every build — nothing to hand-maintain.

---

## Résumé

`/resume` and `public/resume.pdf` are the **same document rendered twice**. `src/pages/resume.astro` holds one markup tree; on screen it inherits the dark control-plane theme, and a `@media print` block flips every colour token to paper (A4, 13mm margins, deeper amber for contrast on white) and drops the site chrome. So there is no separate PDF template to keep in sync — and no separate copy of the content either: experience, skills, certifications, education, and projects all resolve from `src/data/*.yaml`, with `resume.yaml` adding only what the résumé alone needs. The impact strip's certification count is derived from `certifications.yaml`, so it stays current on its own.

### Regenerating the PDF

```bash
npm run resume:pdf
```

This runs a normal build, serves `dist/` on an ephemeral port, and drives headless Chrome with `--print-to-pdf` over `/resume` — so the PDF is produced by the same print stylesheet you get from the page's own **Print** button. Output is written to `public/resume.pdf` (and copied into the current `dist/`).

- **Run it whenever résumé content changes**, then commit the regenerated `public/resume.pdf`. It is deliberately *not* part of `npm run build`: CI has no browser, so the committed PDF is the deployed artifact.
- Chrome is discovered automatically (macOS Chrome/Chromium/Edge, then the usual Linux paths). Override with `CHROME_PATH=/path/to/chrome npm run resume:pdf`.
- Current Chrome does not always exit after printing, so the script waits for the PDF to stop growing and then terminates the browser itself. Expect it to take a few seconds.

### Editing résumé content

`src/data/resume.yaml`:

```yaml
headline: One line under the name.
summary: >-
  The opening paragraph.
metrics:                    # three claimed numbers; certification count is appended automatically
  - value: 60%
    label: faster deployments
projects:                   # ids from projects.yaml, in display order
  - id: portfolio-site
    title: muyideen.dev — portfolio   # optional: overrides projects.yaml
    tagline: Optional override too.   # use where homepage copy reads as self-reference
  - id: aks-gitops
```

An unknown project id fails the build rather than silently dropping the entry. Contact details come from `src/lib/site.ts`.

---

## First-time infrastructure setup

### 1. Bootstrap remote state (run once)

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"

az group create \
  --name terraform-backend-rg \
  --location westeurope

az storage account create \
  --name deenterraformstate \
  --resource-group terraform-backend-rg \
  --location westeurope \
  --sku Standard_LRS \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false

az storage container create \
  --name tfstate \
  --account-name deenterraformstate

az storage account blob-service-properties update \
  --account-name deenterraformstate \
  --resource-group terraform-backend-rg \
  --enable-versioning true
```

(Names must match `infra/backend.tf`.)

### 2. Apply Terraform

```bash
cd infra
cp example.tfvars terraform.tfvars  # edit: fill in subscription_id
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

This provisions the resource group, the Static Web App (with custom domains from `var.custom_domains`), and the visitor-counter storage account whose connection string is wired into the SWA app settings automatically.

---

## GitHub Actions configuration

Two workflows:

- **`ci.yml`** — typecheck and build on every pull request and every non-`main` branch push. No cloud access needed.
- **`deploy.yml`** — on push to `main`: `terraform apply`, then build and deploy to SWA. Authenticates to Azure with `azure/login` via **OIDC federated identity** — GitHub mints a short-lived token per run; the three Azure values below are identifiers, not credentials.

Set these in **Settings → Secrets and variables → Actions** (all as **secrets**, matching `deploy.yml`):

| Secret | Value |
|---|---|
| `AZURE_CLIENT_ID` | Entra app registration (with federated credentials for this repo) |
| `AZURE_TENANT_ID` | Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Target subscription |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA deployment token (Portal → SWA → Manage deployment token) |

Dependabot (`.github/dependabot.yml`) watches npm (root and `api/`), GitHub Actions, and the Terraform providers weekly.

---

## Security posture

- **OIDC-only cloud auth** in CI — no service-principal secrets stored in GitHub.
- **Security headers** served via `public/staticwebapp.config.json`: a Content-Security-Policy locked to same-origin (plus Credly for badge fallbacks), `nosniff`, `frame-ancestors 'none'`, referrer and permissions policies.
- **No `unsafe-inline` scripts**: Astro's two inline island-bootstrap scripts are sha256-hashed into the CSP by `scripts/postbuild-csp.mjs` on every build.
- Markdown renders through Astro's remark pipeline; external images are blocked by the CSP by design.
- Visitor-counter storage enforces TLS 1.2 and is scoped to a single-purpose account.

---

## Custom domains

Domains are managed by Terraform through `var.custom_domains` (map of domain → validation type):

```hcl
custom_domains = {
  "muyideen.dev"     = "dns-txt-token"      # apex
  "www.muyideen.dev" = "cname-delegation"   # subdomain
}
```

Create the DNS records at your registrar — the CNAME target is `terraform output swa_default_host_name`, and the apex TXT validation token is in `terraform output -json custom_domain_validation_tokens` (it's marked sensitive, so the plain output prints a placeholder). Azure issues the managed TLS certificate once DNS propagates.

---

## Troubleshooting

**`terraform init` fails with auth error**
Run `az login` and `az account set --subscription <ID>` first. The azurerm backend uses your local Azure CLI credentials.

**`AADSTS70011` / OIDC login fails in CI**
The workflow needs `permissions: id-token: write`, and the Entra app registration needs a federated credential matching this repo and `ref:refs/heads/main`.

**Terraform apply fails: `insufficient privileges`**
The OIDC service principal needs Contributor on the resource group: `az role assignment list --assignee <client-id>`.

**SWA deploy exits 0 but the site shows old content**
CDN propagation takes up to ~2 minutes on the Free tier — wait and hard-refresh.

**A new blog post doesn't appear**
Check `draft: false` in its frontmatter, and that the folder contains an `index.md`. Drafts are excluded from the site, sitemap, and RSS.

**Images in a post render as broken**
Reference them relatively (`./image-01.png`) from inside the post's folder. External image hosts are blocked by the CSP by design.

**`npm run resume:pdf` fails with "No Chrome found"**
The script needs a local Chromium-family browser. Point it at one: `CHROME_PATH=/path/to/chrome npm run resume:pdf`.

**The downloaded résumé is out of date**
`public/resume.pdf` is a committed artifact, not a build output. Run `npm run resume:pdf` after editing any résumé data and commit the result.

**Browser console shows a CSP violation for an inline script**
Rebuild with `npm run build` — the CSP hashes in `dist/staticwebapp.config.json` are regenerated from the built HTML on every build (see `scripts/postbuild-csp.mjs`).
