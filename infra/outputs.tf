output "swa_url" {
  description = "Public URL of the deployed portfolio."
  value       = "https://${module.static_web_app.default_host_name}"
}

