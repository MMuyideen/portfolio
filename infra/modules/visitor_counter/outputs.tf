output "connection_string" {
  description = "Storage account connection string for the Function app setting."
  value       = azurerm_storage_account.counter.primary_connection_string
  sensitive   = true
}

output "table_name" {
  description = "Name of the visitor-counter Table."
  value       = azurerm_storage_table.visitors.name
}
