---
title: "The ARM eventual-consistency race that breaks Terraform applies"
date: "2026-05-02"
excerpt: "Why a role assignment that clearly exists still fails the next resource, and how to make applies deterministic."
tags: ["terraform", "azure", "iac"]
draft: true
---

You write a perfectly reasonable Terraform config: create a managed identity,
grant it a role on a storage account, then create a resource that uses that
identity to reach the storage account. `terraform apply` runs, and every few
times it fails on the last step with a permissions error, even though the role
assignment it just created is right there in the portal. Run it again with no
changes and it passes. That flakiness is not your config. It is Azure Resource
Manager being eventually consistent, and Terraform being faster than the control
plane.

## What is actually happening

ARM acknowledges a write before that write has propagated to every service that
reads it. When Terraform creates a role assignment, the API returns `201` as
soon as the assignment is recorded. But the data-plane service enforcing that
role (storage, Key Vault, whatever) may not see it for several seconds.
Terraform, meanwhile, has already moved to the next resource in the graph and
tries to use the permission that has not landed yet.

This is not a bug you can fix by ordering resources differently. `depends_on`
controls the order of the API calls, not the propagation that happens after
them.

## The wrong fixes

Two tempting non-solutions:

- **Retrying the whole apply.** It usually works on the second run, so people
  wire the pipeline to retry. That hides the race instead of handling it, and it
  doubles your apply time on every genuinely-failing change too.
- **A giant `depends_on`.** It feels like sequencing should help, but the
  dependency is already correct. The gap is temporal, not topological.

## The fix that actually works

Insert a deliberate wait between granting the permission and consuming it. The
cleanest primitive is `time_sleep` from the `hashicorp/time` provider, chained
into the dependency graph so it genuinely blocks the downstream resource.

```hcl
resource "azurerm_role_assignment" "storage" {
  scope                = azurerm_storage_account.state.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}

resource "time_sleep" "wait_for_rbac" {
  depends_on      = [azurerm_role_assignment.storage]
  create_duration = "30s"
}

resource "azurerm_something_that_uses_the_identity" "app" {
  # ...
  depends_on = [time_sleep.wait_for_rbac]
}
```

Thirty seconds is a pragmatic default for RBAC propagation. It is not elegant,
but it turns a coin-flip apply into a deterministic one, which is the whole point
of infrastructure as code.

## Prefer built-in retries when they exist

Where the provider exposes retry knobs, use them instead of sleeping. Several
azurerm data-plane operations honor a client-side retry, and Key Vault in
particular is worth configuring explicitly so you are not papering over its
firewall and RBAC propagation with a fixed timer.

```hcl
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}
```

## The takeaway

Eventual consistency is a property of the platform, not a failure of your code.
Once you name it, the fix is boring: give the control plane time to agree with
itself before you depend on the result. A single well-placed `time_sleep` beats a
pipeline that retries blindly, because the next engineer reading the config can
see exactly why the wait is there.
