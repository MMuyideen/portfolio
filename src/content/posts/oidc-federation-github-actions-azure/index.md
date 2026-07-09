---
title: "OIDC federation: GitHub Actions to Azure, zero static keys"
date: "2026-06-18"
excerpt: "Killing long-lived service-principal secrets by wiring workload identity into the deploy pipeline."
tags: ["azure", "oidc", "ci/cd"]
draft: true
---

For years the default way to let GitHub Actions talk to Azure was an
`AZURE_CREDENTIALS` secret: a JSON blob holding a service principal's client
secret. It works, and it is also a liability. The secret never expires on its
own, it sits in your repo settings in plaintext-to-the-platform form, and
rotating it is a manual chore everyone forgets. Workload identity federation
removes it entirely.

## The idea in one paragraph

Instead of storing a secret, you tell Entra ID to trust short-lived tokens that
GitHub already mints for every workflow run. GitHub signs an OIDC token that
describes the run (which repo, which branch, which environment). Azure checks
that description against a federated credential you registered, and if it
matches, hands back an access token good for a few minutes. Nothing long-lived
ever touches the runner.

## Register the federated credential

Create (or reuse) an app registration, then attach a federated credential whose
subject matches the runs you want to trust. The subject string is exact, so
decide up front whether you are scoping to a branch, a tag, or an environment.

```bash
az ad app federated-credential create \
  --id "$APP_OBJECT_ID" \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:MMuyideen/portfolio:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

Then give the app's service principal whatever role it actually needs, and
nothing more. For a Static Web App deploy that is usually `Contributor` on a
single resource group, not the subscription.

## The workflow side

Two things matter in the YAML: the `id-token: write` permission (without it
GitHub will not mint the token) and using `azure/login` with the client, tenant
and subscription IDs instead of a `creds` secret.

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v3
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Those three IDs are not secrets in the security sense (they are identifiers, not
credentials), but keeping them in Actions secrets keeps the workflow file clean.

## Making Terraform play along

The catch that costs people an afternoon: the azurerm provider will happily
authenticate over OIDC, but only if you tell it to. Set `ARM_USE_OIDC=true` and
it uses the GitHub token. Miss it, and the provider silently falls back to the
Azure CLI session, which is a service principal login the backend rejects with a
confusing "only supported as a User" error.

```yaml
env:
  ARM_USE_OIDC: "true"
  ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
  ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
  ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

The same flag has to apply to the remote state backend, not just the provider,
or `terraform init` authenticates one way and `plan` another.

## What you gain

No secret to rotate, no secret to leak, and an audit trail that ties every Azure
action back to a specific workflow run on a specific branch. The subject match is
also a real access-control boundary: a pull request from a fork cannot assume the
identity, because its OIDC subject does not match `refs/heads/main`. That last
point is the one worth internalizing. Federation is not just tidier, it is a
tighter blast radius.
