variable "prefix" {
  description = "Name prefix applied to every resource."
  type        = string
  default     = "mmportfolio"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "westeurope"
}

variable "subscription_id" {
  description = "Azure subscription ID. Set via TF_VAR_subscription_id or example.tfvars."
  type        = string
}

variable "tags" {
  description = "Tags applied to all taggable resources."
  type        = map(string)
  default = {
    project    = "portfolio"
    managed_by = "terraform"
  }
}

variable "custom_domains" {
  description = "Map of custom domain name => validation type (\"dns-txt-token\" for apex, \"cname-delegation\" for subdomains)."
  type        = map(string)
  default = {
    "www.muyideen.dev" = "cname-delegation"
  }
}
