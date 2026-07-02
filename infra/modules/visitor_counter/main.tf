# Visitor-counter storage. A single Table entity holds the running total; the
# /api/visitors managed Function increments it with optimistic concurrency.

resource "random_string" "storage_suffix" {
  length  = 6
  upper   = false
  special = false
  numeric = true
}

resource "azurerm_storage_account" "counter" {
  # 3–24 chars, lowercase alphanumeric, globally unique.
  name                     = "${var.name_prefix}c${random_string.storage_suffix.result}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}

resource "azurerm_storage_table" "visitors" {
  name                 = var.table_name
  storage_account_name = azurerm_storage_account.counter.name
}
