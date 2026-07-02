variable "name_prefix" {
  description = "Prefix for the storage account name (a random suffix is appended for global uniqueness)."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group to create the storage account in."
  type        = string
}

variable "location" {
  description = "Azure region for the storage account."
  type        = string
}

variable "table_name" {
  description = "Name of the Table that holds the counter entity."
  type        = string
  default     = "visitors"
}

variable "tags" {
  description = "Tags applied to the storage account."
  type        = map(string)
  default     = {}
}
