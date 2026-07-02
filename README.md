# Muyideen Morenigbade — Portfolio

Personal portfolio site for a DevOps & Cloud Engineer. React + Vite + TypeScript + Tailwind CSS, hosted on Azure Static Web Apps, managed with Terraform, deployed via GitHub Actions using OIDC (no long-lived secrets).

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Hosting | Azure Static Web Apps (Free tier) |
| IaC | Terraform ≥ 1.7, `azurerm ~> 3.x`, `azuread ~> 2.x` |
| CI/CD | GitHub Actions + OIDC federated identity |

---

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

---

## Customising content

All editable content lives in one file: **`src/data/portfolio.ts`**.

| Field | What to change |
|---|---|
| `email`, `github`, `linkedin` | Your contact links |
| `projects[]` | Add/edit/remove projects |
| `certifications[]` | Add/edit/remove certs |
| `experience[]` | Add/edit/remove roles |

### Adding a project

```ts
{
  id: 'my-project',              // kebab-case, unique
  command: 'run my-project',     // shown as: $ run my-project
  description: [
    '# One-line summary as a comment.',
    '# Second line if needed.',
  ],
  stack: ['Terraform', 'Azure'], // shown as mono tags
  links: [
    { label: 'GitHub', href: 'https://github.com/...', external: true },
  ],
},
```

### Adding a certification

```ts
{
  issuer: 'Microsoft',
  title: 'AZ-500 Azure Security Engineer Associate',
  date: '2025-01',
  verifyUrl: 'https://learn.microsoft.com/api/credentials/share/YOUR_ID',
},
```

---

## First-time infrastructure setup

### 1. Bootstrap remote state (run once)

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"

az group create \
  --name mmportfolio-tfstate-rg \
  --location westeurope

az storage account create \
  --name mmportfoliotfstate \
  --resource-group mmportfolio-tfstate-rg \
  --location westeurope \
  --sku Standard_LRS \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false

az storage container create \
  --name tfstate \
  --account-name mmportfoliotfstate

az storage account blob-service-properties update \
  --account-name mmportfoliotfstate \
  --resource-group mmportfolio-tfstate-rg \
  --enable-versioning true
```

### 2. Apply Terraform

```bash
cd infra
cp example.tfvars terraform.tfvars  # edit: fill in subscription_id
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### 3. Collect outputs

```bash
terraform output -raw swa_api_key       # → GitHub secret
terraform output oidc_client_id         # → GitHub variable
terraform output oidc_tenant_id         # → GitHub variable
terraform output oidc_subscription_id   # → GitHub variable
```

---

## GitHub secrets & variables

In your repository go to **Settings → Secrets and variables → Actions**.

| Type | Name | Value |
|---|---|---|
| **Secret** | `AZURE_STATIC_WEB_APPS_API_TOKEN` | `terraform output -raw swa_api_key` |
| **Variable** | `AZURE_CLIENT_ID` | `terraform output oidc_client_id` |
| **Variable** | `AZURE_TENANT_ID` | `terraform output oidc_tenant_id` |
| **Variable** | `AZURE_SUBSCRIPTION_ID` | `terraform output oidc_subscription_id` |

Secrets are referenced as `${{ secrets.NAME }}`; variables as `${{ vars.NAME }}`.

The OIDC federated identity is created automatically by Terraform — no manual `az ad app` commands are needed. Terraform provisions:
- An Azure AD application (`mmportfolio-github-oidc`)
- A service principal with Contributor on the resource group
- Two federated credentials (main branch + pull requests)

---

## Attaching a custom domain

1. Add your domain to the SWA in the Azure Portal (Static Web App → Custom domains → Add).
2. Create the DNS records your registrar shows (CNAME or TXT + A).
3. Azure issues a managed TLS certificate automatically once DNS propagates.
4. Update `og:url` in `index.html` and `Sitemap` in `public/robots.txt`.

To manage the domain via Terraform instead, add to `infra/main.tf`:

```hcl
resource "azurerm_static_web_app_custom_domain" "main" {
  static_web_app_id = azurerm_static_web_app.main.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"
}
```

And add `variable "custom_domain" { type = string }` to `infra/variables.tf`.

---

## CI/CD checklist

- [ ] Remote state storage account created (`mmportfoliotfstate`)
- [ ] `terraform apply` run locally at least once
- [ ] GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` set
- [ ] GitHub variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` set
- [ ] Federated credentials in Azure AD match: `mmuyideen/portfolio` + `ref:refs/heads/main` and `pull_request`
- [ ] `infra/terraform.tfvars` is **not** committed (it's in `.gitignore`)
- [ ] `.terraform.lock.hcl` **is** committed (provider checksums)
- [ ] Push to `main` triggers the Deploy workflow and the SWA URL resolves

---

## Troubleshooting

**`terraform init` fails with auth error**
Run `az login` and `az account set --subscription <ID>` before `terraform init`. The azurerm backend uses your local Azure CLI credentials.

**`AADSTS70011: The provided request must include a 'scope' input parameter`**
The `azure/login@v2` action requires `permissions: id-token: write` at the workflow or job level.

**Terraform apply fails: `insufficient privileges to complete the operation`**
The OIDC service principal needs Contributor on the resource group. Check: `az role assignment list --assignee <client-id> --scope /subscriptions/<sub>/resourceGroups/mmportfolio-rg`.

**SWA deploy step exits 0 but site shows old content**
CDN propagation takes up to 2 minutes. The SWA Free tier doesn't support purging — wait and hard-refresh.

**`terraform output -raw swa_api_key` prints nothing after apply**
The output is marked `sensitive`. Use `terraform output -raw swa_api_key` (not `terraform output swa_api_key`) to reveal the raw value.

**Local build passes but CI lint fails**
Run `npm run lint` locally before pushing. ESLint is configured with `--max-warnings 0` so warnings are treated as errors in CI.
