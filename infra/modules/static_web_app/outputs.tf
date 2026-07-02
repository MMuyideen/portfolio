output "default_host_name" {
  description = "Default hostname assigned to the Static Web App."
  value       = azurerm_static_web_app.main.default_host_name
}

output "custom_domain_validation_tokens" {
  description = "Domain => TXT validation token (populated only for dns-txt-token domains). Add each as a TXT record to prove ownership."
  value       = { for d, r in azurerm_static_web_app_custom_domain.custom : d => r.validation_token }
  sensitive   = true
}


