terraform {
  # Partial backend configuration — state location is supplied at init time via
  # `-backend-config` flags (see .github/workflows/deploy.yml). Auth uses OIDC
  # through the ARM_USE_OIDC / ARM_CLIENT_ID / ARM_TENANT_ID env vars.
  backend "azurerm" {}
}
