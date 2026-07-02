output "swa_url" {
  description = "Public URL of the deployed portfolio."
  value       = "https://${module.static_web_app.default_host_name}"
}

output "swa_api_key" {
  description = "SWA deployment token. Store as GitHub secret AZURE_STATIC_WEB_APPS_API_TOKEN."
  value       = module.static_web_app.api_key
  sensitive   = true
}
