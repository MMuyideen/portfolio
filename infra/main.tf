# ── Resource group ───────────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "${var.prefix}-rg"
  location = var.location
  tags     = var.tags
}

# ── Visitor-counter storage (backs the /api/visitors Function) ───────────────────

module "visitor_counter" {
  source              = "./modules/visitor_counter"
  name_prefix         = var.prefix
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
}

# ── Static Web App (hosts the site + managed Functions API) ──────────────────────

module "static_web_app" {
  source              = "./modules/static_web_app"
  name                = "${var.prefix}-swa"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = var.tags
  custom_domains      = var.custom_domains

  app_settings = {
    AZURE_STORAGE_CONNECTION_STRING = module.visitor_counter.connection_string
    TABLE_NAME                      = module.visitor_counter.table_name
  }
}
