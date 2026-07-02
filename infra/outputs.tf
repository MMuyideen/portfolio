output "swa_url" {
  description = "Public URL of the deployed portfolio."
  value       = "https://${module.static_web_app.default_host_name}"
}

output "swa_default_host_name" {
  description = "SWA default hostname — CNAME target for custom subdomains (e.g. www)."
  value       = module.static_web_app.default_host_name
}

output "custom_domain_validation_tokens" {
  description = "Domain => TXT validation token for apex (dns-txt-token) domains. Add each as a TXT record, then re-apply."
  value       = module.static_web_app.custom_domain_validation_tokens
  sensitive   = true
}

