---
title: "Group-based RBAC on ARO with Entra ID"
date: "2026-03-21"
excerpt: "Wiring Azure Red Hat OpenShift to Entra ID groups so cluster access follows your directory, not hand-edited RoleBindings."
tags: ["openshift", "azure", "rbac", "entra-id"]
draft: true
---

Handing out cluster access one `RoleBinding` at a time does not scale, and it
drifts. Someone leaves the team, their directory account is disabled, and their
OpenShift access lingers because nobody remembered the YAML. The fix is to make
Entra ID the single source of truth: users get access by being in a group, and
the cluster maps that group to a role. Add or remove someone from the group and
their cluster permissions follow automatically.

## The pieces

Three things have to line up:

1. An Entra ID application used as the OpenShift OAuth identity provider.
2. A **group claim** in the token, so OpenShift can see which groups a user
   belongs to.
3. OpenShift `ClusterRole` / `Role` bindings that target the group, not
   individual users.

The step people miss is the second one. Without the optional groups claim, the
OAuth flow authenticates the user fine, but the token carries no group
information, so every group binding you write matches nobody.

## Emit the groups claim

On the app registration, configure the token to include security groups. Emitting
group object IDs (rather than names) keeps the claim stable when a group is
renamed.

```bash
az ad app update --id "$APP_ID" --set groupMembershipClaims=SecurityGroup
```

For a large directory, watch the claim overage limit: past roughly 200 groups the
token stops listing them inline and returns a Graph link instead, which OpenShift
will not follow. Scope group membership so cluster users stay under that ceiling.

## Point OpenShift at Entra ID

Configure the OAuth identity provider to trust the app, requesting the `groups`
scope so the claim comes through.

```yaml
apiVersion: config.openshift.io/v1
kind: OAuth
metadata:
  name: cluster
spec:
  identityProviders:
    - name: entra-id
      mappingMethod: claim
      type: OpenID
      openID:
        clientID: "$APP_ID"
        clientSecret:
          name: entra-id-secret
        issuer: "https://login.microsoftonline.com/$TENANT_ID/v2.0"
        claims:
          preferredUsername: ["preferred_username"]
          name: ["name"]
          email: ["email"]
        extraScopes: ["groups"]
```

## Bind the group, not the person

Now the payoff. Grant a role to the group's object ID, and every current and
future member inherits it.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: platform-admins
subjects:
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: "11111111-2222-3333-4444-555555555555"
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

Use the group's object ID as the subject `name`, matching what the token claim
emits. If you configured the claim to send display names instead, bind to those,
but IDs are the safer choice.

## Verify with the right identity

Do not test as `kubeadmin`. That local account bypasses the whole OAuth path and
will happily let you in even if the group wiring is broken. Log in as a real
directory user who is a member of the group, then confirm OpenShift resolved
their groups:

```bash
oc login --web
oc get groups
oc auth can-i create projects --as-group="11111111-2222-3333-4444-555555555555"
```

## Why it holds up

Access decisions now live in one place your identity team already governs. Joiner,
mover and leaver flows that update Entra ID membership propagate to the cluster
with no OpenShift change at all, and an access review of the group is an access
review of the cluster. The RoleBindings become boring and static, which is
exactly what you want from the layer that decides who can delete production.
