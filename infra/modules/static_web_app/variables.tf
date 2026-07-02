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
