variable "name" {
  description = "Name of the Static Web App."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group to create the Static Web App in."
  type        = string
}

variable "location" {
  description = "Azure region for the Static Web App."
  type        = string
}

variable "sku_tier" {
  description = "SKU tier for the Static Web App."
  type        = string
  default     = "Free"
}

variable "sku_size" {
  description = "SKU size for the Static Web App."
  type        = string
  default     = "Free"
}

variable "app_settings" {
  description = "Application settings exposed to the managed Functions API."
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags applied to the Static Web App."
  type        = map(string)
  default     = {}
}

variable "custom_domains" {
  description = <<-EOT
    Map of custom domain name => validation type. Use "dns-txt-token" for apex/root
    domains (e.g. "muyideen.dev") and "cname-delegation" for subdomains (e.g.
    "www.muyideen.dev"). Empty by default so applies work before DNS is ready.
  EOT
  type        = map(string)
  default     = {}

  validation {
    condition = alltrue([
      for t in values(var.custom_domains) : contains(["dns-txt-token", "cname-delegation"], t)
    ])
    error_message = "Each validation type must be either \"dns-txt-token\" or \"cname-delegation\"."
  }
}
