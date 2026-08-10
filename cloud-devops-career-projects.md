# Cloud/DevOps Career-Building Project Portfolio

Built to train three specific skills: **evaluating** technical trade-offs (not just implementing tutorials), **translating** technical decisions into cost/risk/revenue language, and **communicating** the same work differently to engineers, managers, and executives.

---

## BEGINNER TIER

### Project 1: Static Site Delivery — Cost & Performance Showdown

**Problem statement:** A marketing team needs a fast, cheap, globally available site with 99.9% uptime and near-zero ops overhead.

**Architecture:** S3 (or GCS) + CloudFront (CDN) + Route 53 + ACM for TLS. Deploy via GitHub Actions. Add a synthetic uptime check (e.g., a simple Lambda or cron pinging the site) and a CloudFront access-log → Athena query for traffic analysis.

**Why this architecture (trade-offs):**
- **S3+CloudFront vs. Netlify/Vercel:** Netlify wins on speed-to-market (git push → deploy, built-in preview URLs); S3+CloudFront wins on cost at scale and gives you IAM/network primitives you'll reuse everywhere else in AWS. Evaluation criteria: time-to-first-deploy, monthly cost at 100k/1M/10M requests, vendor lock-in.
- **CloudFront vs. no CDN (S3 website hosting alone):** No CDN is cheaper at near-zero traffic but fails on global latency and has no DDoS shielding (no AWS Shield Standard integration path).
- **Static hosting vs. small EC2/Nginx box:** EC2 requires patching, capacity planning, and 24/7 billing even at zero traffic — worse reliability-per-dollar for a static workload.

**Failure modes & mitigation:** DNS misconfiguration (detect via external uptime monitor like UptimeRobot); cache poisoning/stale content after deploy (mitigate with cache invalidation step in CI); origin S3 bucket made public accidentally (detect with AWS Config rule `s3-bucket-public-read-prohibited`).

**Scale/stress tests:** Simulate 10x traffic with a load tool (k6/Artillery) hitting CloudFront — verify origin shielding prevents S3 throttling. Simulate "budget halved" — show cost delta between CloudFront price classes (all edge locations vs. NA/EU only) and quantify latency impact for APAC users.

**Success metrics:** p95 TTFB, monthly cost per 1M requests, cache hit ratio (target >90%), deploy lead time. Business mapping: cache hit ratio directly reduces origin cost; TTFB affects conversion (cite: 100ms delay ≈ 1% conversion loss, Amazon's often-cited figure).

**MVP deliverables:** Working site behind CloudFront + HTTPS, CI/CD deploy pipeline, cache invalidation on deploy, basic uptime alert.
**Expanded scope:** Multi-region failover with Route 53 health checks, WAF rules, cost dashboard via Cost Explorer API.

**Time/cost estimate:** 4–8 hours; <$2/month at low traffic (mostly Route 53 hosted zone fee).

**Interview talking points:** "I chose CloudFront's price-class tiering to trade edge coverage for cost, and quantified the latency impact for the tier I cut — that's the kind of cost/latency lever a senior engineer should be able to name, not just 'CDNs are fast.'"

**Demo/portfolio:** Screenshot of CloudFront cache-hit-ratio graph, Lighthouse score before/after CDN, cost dashboard screenshot, architecture diagram.

**Blog posts:**
- *Technical:* "S3 + CloudFront vs. Netlify: A Real Cost and Latency Comparison at Three Traffic Tiers"
- *Manager-focused:* "Why We Chose 'Boring' Infrastructure for the Marketing Site (and What It Saved Us in On-Call Hours)"
- *Executive-focused:* "The Hidden Cost of Website Downtime: What 99.9% Uptime Actually Buys You"

---

### Project 2: Serverless URL Shortener / Micro-API

**Problem statement:** A startup needs a low-traffic internal API (e.g., link shortener, feature-flag service) with unpredictable, bursty usage and no dedicated ops team.

**Architecture:** API Gateway → Lambda → DynamoDB, with CloudWatch alarms and X-Ray tracing.

**Why this architecture:**
- **Lambda vs. Fargate vs. EC2:** Lambda wins on cost-at-idle (pay-per-invocation) and zero patching; Fargate wins if you need long-running connections or >15min execution; EC2 wins only if you need full OS control or have very high, steady, predictable traffic where reserved-instance pricing beats Lambda's per-ms billing. Evaluation criteria: traffic predictability, cold-start tolerance, operational headcount.
- **DynamoDB vs. RDS Postgres:** DynamoDB wins on scaling simplicity and cost for simple key-value access patterns; RDS wins if you need complex joins/transactions/reporting. This is a classic "right tool" decision to be able to defend in an interview.

**Failure modes:** Cold starts causing latency spikes (detect via CloudWatch p99 duration; mitigate with provisioned concurrency); DynamoDB throttling under burst (detect via `ThrottledRequests` metric; mitigate with on-demand capacity mode or auto-scaling); Lambda IAM over-permissioning (detect with IAM Access Analyzer).

**Scale/stress tests:** Load test to 10x and 100x expected RPS with k6; observe DynamoDB auto-scaling lag and Lambda concurrency limits; test with budget halved — compare on-demand DynamoDB vs. provisioned capacity cost curves.

**Success metrics:** Cost per 1M requests, p99 latency, error rate. Business mapping: near-zero idle cost vs. an EC2 box running 24/7 — quantify the delta annually.

**MVP:** Working CRUD API, IaC (Terraform/CDK), basic alarms.
**Expanded:** Custom domain, rate limiting, provisioned concurrency, canary deployments (Lambda aliases + weighted routing).

**Time/cost:** 6–10 hours; <$1/month at low volume.

**Interview talking points:** Frame it as "I picked serverless because the traffic pattern was spiky and unpredictable — I can show you the cost-crossover point where Lambda stops being cheaper than a reserved EC2 instance, which is roughly at sustained >X req/sec."

**Demo:** X-Ray trace map screenshot, cost-per-request chart, load-test report.

**Blog posts:**
- *Technical:* "Lambda vs. Fargate vs. EC2: Finding the Cost Crossover Point With Real Load Tests"
- *Manager:* "How Serverless Cut Our On-Call Burden for Low-Traffic Internal Tools"
- *Executive:* "Paying for What You Use: A Serverless Cost Model vs. Always-On Servers"

---

### Project 3: CI/CD Pipeline for a Containerized App

**Problem statement:** A small engineering team is manually deploying via SSH and needs a repeatable, auditable release process before their next audit/compliance review.

**Architecture:** GitHub Actions → build/test/scan Docker image → push to ECR → deploy to ECS/EKS with blue/green or rolling strategy. Add Trivy/Snyk container scanning gate.

**Why this architecture:**
- **GitHub Actions vs. Jenkins vs. AWS CodePipeline:** GitHub Actions wins on speed-to-market and low maintenance (no server to run); Jenkins wins on plugin flexibility and on-prem/air-gapped needs; CodePipeline wins on native AWS IAM integration for tightly regulated AWS-only shops. Evaluation criteria: maintenance burden (Jenkins requires patching its own server), vendor lock-in, secrets management model.
- **Blue/green vs. rolling deploy:** Blue/green gives instant rollback (swap target group) at 2x infra cost during cutover; rolling is cheaper but rollback is slower and riskier under partial failure.

**Failure modes:** Secrets leaked in CI logs (mitigate with masked variables + OIDC federation instead of long-lived keys); failed deploy leaves half-updated fleet (mitigate with health-check gated rolling deploys and automated rollback on alarm); supply-chain risk from unscanned images (mitigate with mandatory Trivy scan gate blocking critical CVEs).

**Scale/stress tests:** Simulate a bad deploy (inject a crash-looping container) and measure time-to-detect and time-to-auto-rollback; test pipeline under 10x concurrent PR builds (queueing/parallelism limits).

**Success metrics:** Deployment frequency, change failure rate, mean time to restore (the DORA metrics) — directly tie to engineering velocity and incident cost.

**MVP:** Build→test→scan→deploy pipeline with one environment.
**Expanded:** Multi-environment promotion (dev→staging→prod) with manual approval gate, automated rollback on CloudWatch alarm, OIDC-based short-lived AWS credentials (no static keys).

**Time/cost:** 8–15 hours; near-$0 (GitHub Actions free tier + small ECS Fargate task).

**Interview talking points:** Speak in DORA metrics — "we reduced change failure rate from X to Y by adding a scan gate and automated rollback," which is a business-risk statement, not just a pipeline description.

**Demo:** Pipeline run screenshots, DORA metrics dashboard, a recorded "bad deploy → auto-rollback" GIF.

**Blog posts:**
- *Technical:* "Blue/Green vs. Rolling Deploys: What Actually Happens When a Deploy Fails"
- *Manager:* "The Four DORA Metrics That Tell You If Your Team Ships Safely"
- *Executive:* "Deployment Frequency as a Leading Indicator of Engineering Health"

---

## INTERMEDIATE TIER

### Project 4: Multi-Environment IaC Platform With Cost Guardrails

**Problem statement:** Engineering has 3+ environments (dev/staging/prod) provisioned by hand with config drift causing "works in staging, breaks in prod" incidents.

**Architecture:** Terraform modules (or Pulumi) with remote state (S3+DynamoDB lock), environment-specific `tfvars`, `tflint`/`checkov` policy scanning, and Infracost in CI to show dollar-delta per PR.

**Why this architecture:**
- **Terraform vs. Pulumi vs. native CloudFormation/CDK:** Terraform wins on multi-cloud portability and ecosystem maturity; Pulumi wins if the team wants real programming languages (loops/testing) over HCL; CDK/CloudFormation wins for AWS-only shops wanting native drift detection and no third-party state backend. Evaluation criteria: team's existing language skills, multi-cloud requirement, state-management operational burden.
- **Remote state + locking vs. local state:** Local state is faster to start but guarantees drift and corruption in any team >1 person — an easy "why" to articulate.

**Failure modes:** State file corruption/lock contention (mitigate with S3 versioning + DynamoDB locks + documented `force-unlock` runbook); drift between console changes and Terraform state (detect with scheduled `terraform plan` in CI, alert on non-empty diff); a misconfigured module deletes prod resources (mitigate with `prevent_destroy` lifecycle rules + mandatory plan review before apply).

**Scale/stress tests:** Add 10x the number of modules/environments and measure plan/apply time degradation; simulate "budget halved" by running Infracost against a proposed change and showing the team a right-sizing alternative.

**Success metrics:** Time to provision new environment (before/after), number of drift incidents per quarter, cost variance caught pre-merge via Infracost. Business mapping: environment provisioning time directly affects new-hire ramp and feature velocity; caught cost drift = avoided budget overrun.

**MVP:** Reusable modules for network/compute/data tier, remote state, one environment fully migrated.
**Expanded:** Policy-as-code (OPA/Checkov) blocking non-compliant resources, Infracost PR comments, self-service environment creation via a thin wrapper/Backstage template.

**Time/cost:** 15–25 hours; <$5/month (state backend + small test resources).

**Interview talking points:** "I added Infracost to the PR pipeline so cost review happens before merge, not after the bill arrives — that shifted cost conversations from finance-vs-engineering conflict to an engineering-owned gate."

**Demo:** Infracost PR comment screenshot, drift-detection alert example, before/after provisioning time chart.

**Blog posts:**
- *Technical:* "Terraform vs. Pulumi vs. CDK: A Decision Matrix, Not a Popularity Contest"
- *Manager:* "How Config Drift Quietly Costs You a Sprint a Quarter"
- *Executive:* "Shifting Cloud Cost Review Left: Catching Budget Overruns Before They Ship"

---

### Project 5: Auto-Scaling Web App With Full Observability

**Problem statement:** A product has unpredictable traffic spikes (marketing campaigns, viral moments) and the current fixed-capacity deployment either over-pays or falls over.

**Architecture:** EKS or ECS with Horizontal Pod/Service Autoscaling based on custom metrics, Prometheus + Grafana (or CloudWatch + Managed Grafana) for dashboards, and an SLO with error-budget alerting.

**Why this architecture:**
- **Kubernetes (EKS) vs. ECS vs. plain ASG+EC2:** EKS wins on portability and ecosystem (Helm, service mesh) but has real operational overhead (control plane cost, upgrade cadence); ECS wins on lower ops burden for AWS-only teams; ASG+EC2 wins only for simple, non-containerized legacy workloads. Evaluation criteria: team K8s expertise, multi-cloud ambition, operational headcount available.
- **Prometheus/Grafana vs. CloudWatch native vs. Datadog:** Prometheus is cheaper at scale and avoids per-metric vendor billing but requires you to run/scale it yourself; Datadog wins on time-to-value and unified tracing/logs/metrics but gets expensive fast per host; CloudWatch wins on zero extra infra but has weaker dashboards/query language.

**Failure modes:** Scale-up lag during sudden spike causing 5xx errors (detect via error-rate alert; mitigate with predictive/scheduled scaling for known events + faster health-check intervals); metric cardinality explosion crashing Prometheus (mitigate with relabeling rules and recording rules); autoscaler flapping (mitigate with proper cooldown/stabilization windows).

**Scale/stress tests:** Load test to 10x and 100x baseline RPS with k6, capture time-to-scale and error budget burn; simulate a dependency (DB) becoming the bottleneck instead of compute, showing autoscaling alone doesn't fix everything.

**Success metrics:** SLO attainment (e.g., 99.9% of requests <300ms), error-budget burn rate, cost per request at each scale tier. Business mapping: SLO breaches map directly to churn risk/SLA penalties for enterprise customers; cost-per-request at scale informs pricing/margin conversations.

**MVP:** Working HPA-based autoscaling, one Grafana dashboard (latency/error/traffic/saturation — the "four golden signals"), one SLO with alerting.
**Expanded:** Predictive scaling for known traffic events, chaos experiment (kill a pod under load) with automatic recovery, cost-per-request dashboard.

**Time/cost:** 20–30 hours; $10–30/month (EKS control plane + worker nodes during test windows — tear down after).

**Interview talking points:** Speak in SLO/error-budget language: "we defined a 99.9% latency SLO, and I can show you the error-budget burn during our worst load test and what mitigation reduced it by."

**Demo:** Grafana dashboard screenshots (golden signals), SLO burn-rate chart, load test report with before/after autoscaling tuning.

**Blog posts:**
- *Technical:* "Tuning Kubernetes HPA: What Cooldown Windows Actually Do Under Real Load"
- *Manager:* "SLOs and Error Budgets: A Shared Language Between Engineering and Product"
- *Executive:* "What a 99.9% SLA Actually Costs to Deliver (and What Breaks It)"

---

### Project 6: Centralized Logging & Monitoring Platform

**Problem statement:** Engineers are SSH-ing into boxes to `grep` logs during incidents, and MTTR is high because there's no single pane of glass.

**Architecture:** Fluent Bit/Vector agents → Loki or OpenSearch → Grafana, or CloudWatch Logs Insights, with alerting routed to PagerDuty/Slack. Add log-based SLO alerting and a runbook link in every alert.

**Why this architecture:**
- **Loki vs. OpenSearch/ELK vs. CloudWatch Logs vs. Datadog:** Loki is cheap because it only indexes labels, not full text (great for high-volume, low-cardinality logs); OpenSearch/ELK gives full-text search but costs much more in storage/compute; CloudWatch is zero-setup but expensive at high volume and has a weaker query experience; Datadog is fastest to value but the most expensive at scale. Evaluation criteria: log volume, query patterns (full-text vs. label-based), team size for self-hosting.

**Failure modes:** Log pipeline backpressure during incident (the exact moment you need it most) — mitigate with buffering/local disk spooling in the agent; alert fatigue from noisy thresholds (mitigate with alert tuning and burn-rate-based alerts instead of static thresholds); single point of failure in the logging cluster itself (mitigate with replication and a "logging system health" meta-alert).

**Scale/stress tests:** Generate 10x/100x log volume synthetically and measure ingestion lag and query latency degradation; simulate the logging backend going down during a "real" incident to test if teams have a fallback (direct instance access).

**Success metrics:** MTTD (mean time to detect) and MTTR before/after centralization, alert-to-noise ratio. Business mapping: MTTR reduction directly reduces incident cost (revenue-impacting minutes) and on-call burnout/attrition risk.

**MVP:** Centralized log shipping for one service, basic dashboard, one alert routed to Slack.
**Expanded:** Burn-rate alerting, runbook automation links, cost dashboard comparing Loki vs. equivalent CloudWatch cost at current volume.

**Time/cost:** 15–25 hours; $5–20/month self-hosted (or free tier equivalents for CloudWatch/Datadog trial).

**Interview talking points:** "I ran a real cost comparison — Loki at our log volume was ~1/5 the cost of CloudWatch Logs Insights, but it required us to own more operational complexity. I can walk through exactly where that breakeven point is."

**Demo:** Before/after MTTR chart, dashboard screenshots, an alert-to-runbook Slack message example.

**Blog posts:**
- *Technical:* "Loki vs. ELK vs. CloudWatch: A Real Cost-Per-GB Comparison"
- *Manager:* "Alert Fatigue Is a Retention Problem, Not Just a Noise Problem"
- *Executive:* "The Dollar Cost of Slow Incident Detection"

---

## ADVANCED TIER

### Project 7: Multi-Region Disaster Recovery Architecture

**Problem statement:** A revenue-critical service needs a documented, tested RTO/RPO for a regional cloud outage — currently there's no DR plan and leadership is being asked for one after a competitor's outage made news.

**Architecture:** Primary region + secondary region with Route 53 failover routing, cross-region DB replication (Aurora Global Database or async replica), S3 cross-region replication, and an automated failover runbook (scripted, not manual).

**Why this architecture (this is the core evaluation project):**
- **Active-active vs. active-passive (pilot light) vs. backup-and-restore:** Active-active gives near-zero RTO/RPO but roughly 2x infra cost and real data-consistency complexity; active-passive (pilot light) is a middle ground — lower standing cost, RTO in minutes, but requires scale-up automation tested regularly; backup-and-restore is cheapest but RTO can be hours and is only acceptable for non-critical workloads. Evaluation criteria: RTO/RPO requirement (driven by revenue-per-minute-of-downtime), budget, data consistency requirements.
- Explicitly compute: if downtime costs $X/minute and active-active costs $Y/month more than pilot-light, is the DR spend justified? This is the single best "translate technical choice into dollars" exercise in the whole portfolio.

**Failure modes:** Split-brain during failback (mitigate with clear, tested failback runbook and read-only mode during transition); replication lag causing data loss on failover (detect via replication-lag CloudWatch metric; mitigate by setting an explicit RPO target and choosing sync vs. async replication accordingly); DNS TTL delaying failover (mitigate with low TTL + health-check-based Route 53 failover records, tested in advance).

**Scale/stress tests:** Run an actual GameDay: kill the primary region (or simulate via chaos engineering / disabling health checks) and measure real RTO/RPO against the target; test failover under 10x normal load to see if secondary region capacity was sized correctly.

**Success metrics:** Actual measured RTO/RPO vs. target, cost of DR posture as % of infra spend, GameDay pass/fail history. Business mapping: this is the clearest ROI conversation in cloud engineering — "$Y/month buys us RTO of Z minutes, avoiding $X in projected revenue loss per outage-hour."

**MVP:** Documented and tested pilot-light DR for one critical service, one successful GameDay failover.
**Expanded:** Automated failover (no human in the loop for detection), active-active for the single highest-revenue path, quarterly GameDay cadence with exec-visible scorecard.

**Time/cost:** 25–40 hours; $20–60/month for standing secondary-region resources during testing (tear down non-persistent pieces after).

**Interview talking points:** Walk through the RTO/RPO-vs-cost curve you built — this is a signature senior/staff-level talking point that shows you think in business risk, not just architecture diagrams.

**Demo:** GameDay runbook doc, actual failover timing chart (target vs. achieved), cost-vs-RTO tradeoff graph.

**Blog posts:**
- *Technical:* "Active-Active vs. Pilot-Light vs. Backup-Restore: What Each Actually Costs at 3 RTO Targets"
- *Manager:* "Running Your First DR GameDay: A Runbook Template"
- *Executive:* "What Does an Hour of Downtime Actually Cost Us? A Framework for Justifying DR Spend"

---

### Project 8: Self-Service Internal Developer Platform (Platform Engineering)

**Problem statement:** As the org grows past ~20 engineers, every team is reinventing CI/CD, provisioning, and observability, and platform tickets are a growing bottleneck for a small infra team.

**Architecture:** EKS + ArgoCD (GitOps) + Backstage (developer portal/service catalog) + Terraform modules exposed as self-service templates + cost chargeback via Kubecost or tagging + OPA/Gatekeeper policy enforcement.

**Why this architecture:**
- **Backstage/self-service platform vs. "infra team as ticket queue" vs. fully decentralized (each team owns their own stack):** Ticket-queue model is simplest to start but doesn't scale past a certain team count (infra becomes the bottleneck); fully decentralized scales team autonomy but multiplies security/cost/compliance risk and duplicated effort; a self-service platform trades upfront build cost for long-term velocity and consistency. Evaluation criteria: number of product teams, infra team headcount, compliance requirements (decentralized = harder to audit).
- **ArgoCD (GitOps/pull) vs. traditional push-based CD (Jenkins/CodePipeline):** GitOps gives drift-detection and audit trail for free (cluster state always matches git) at the cost of a steeper learning curve and an extra component to run.

**Failure modes:** Golden-path templates become "golden cage" (too rigid, teams route around them) — mitigate by treating templates as versioned, forkable starting points, not mandates; ArgoCD/control-plane outage blocks all deploys org-wide (mitigate with a documented manual-deploy fallback and control-plane HA); policy engine (OPA) false-positives blocking legitimate deploys (mitigate with dry-run/warn mode before enforce mode).

**Scale/stress tests:** Onboard 10 simulated "teams" (namespaces/services) through the self-service flow and measure time-to-first-deploy per team; simulate the platform team headcount staying flat while service count grows 5x — does ticket volume actually stay flat (the core hypothesis)?

**Success metrics:** Time from "new service idea" to "running in prod," platform-team ticket volume over time, % of services following golden path, cost per team via chargeback. Business mapping: reduced time-to-market for new features across all product teams (multiplicative, not additive, impact) and clearer cost attribution for budget planning.

**MVP:** One golden-path service template (repo scaffold → CI → ArgoCD deploy), basic Backstage catalog with that template, cost tagging.
**Expanded:** Full Backstage plugin ecosystem (docs, on-call, cost), OPA policy enforcement, self-service ephemeral preview environments per PR.

**Time/cost:** 30–50 hours; $30–80/month for a real EKS cluster during build/demo (tear down between sessions).

**Interview talking points:** This project demonstrates staff/principal-level thinking — frame it as "solving an org-scaling problem, not a technology problem": the real deliverable is reducing coordination overhead as headcount grows, and you can quantify that with time-to-first-deploy numbers.

**Demo:** Backstage catalog screenshot, "time to first deploy" before/after chart, Kubecost chargeback dashboard.

**Blog posts:**
- *Technical:* "Building a Golden Path With ArgoCD and Backstage: What We Automated and What We Didn't"
- *Manager:* "When to Invest in Platform Engineering: A Team-Size Threshold Model"
- *Executive:* "Platform Engineering ROI: Why We Stopped Scaling the Infra Team Linearly With Product Teams"

---

### Project 9: Event-Driven Data Pipeline at Scale (With Security Review)

**Problem statement:** A product needs near-real-time analytics/notifications from user events (e.g., clickstream, IoT telemetry) at a volume too high for synchronous request/response processing, and the design must pass a security review before launch.

**Architecture:** Producers → Kinesis/Kafka (MSK) or EventBridge/SQS-SNS → stream processing (Lambda/Kinesis Data Analytics or Flink) → data lake (S3 + Glue + Athena) or warehouse (Redshift/Snowflake). Add encryption-in-transit/at-rest, IAM least-privilege, and a threat model doc.

**Why this architecture:**
- **Kinesis/Kafka (MSK) vs. SQS/SNS vs. EventBridge:** Kafka/Kinesis wins for high-throughput, ordered, replayable streams with multiple consumers (true streaming); SQS/SNS wins for simpler fan-out/queueing with lower operational complexity and cost at moderate volume; EventBridge wins for event-routing/orchestration between many services/SaaS integrations rather than raw high-volume data streaming. Evaluation criteria: throughput, need for replay/multiple independent consumers, ordering guarantees, operational complexity tolerance.
- **Self-managed Kafka vs. MSK (managed) vs. Kinesis:** MSK reduces operational burden vs. self-hosted Kafka at a cost premium; Kinesis is simplest to operate (fully serverless) but has less flexibility/ecosystem than Kafka.

**Failure modes (with security lens):** Poison-pill messages stalling a consumer (mitigate with dead-letter queues and per-message error isolation); over-permissioned IAM roles on Lambda consumers (mitigate with least-privilege per-function roles, verified with IAM Access Analyzer); unencrypted data at rest in the data lake (mitigate with SSE-KMS and bucket policy enforcement); consumer lag under load causing backpressure into producers (detect via `IteratorAge`/consumer-lag metrics; mitigate with auto-scaling consumers and shard/partition rebalancing).

**Scale/stress tests:** Push 10x and 100x normal event volume and measure consumer lag growth and cost curve (per-shard/per-partition cost vs. throughput); simulate a "hot partition" (one key dominating traffic) to test partitioning strategy; run a lightweight security review checklist (encryption, least privilege, network exposure) against the design as a deliverable.

**Success metrics:** End-to-end event latency (p50/p99), consumer lag, cost per million events processed, findings-closed from the security review. Business mapping: latency determines how "real-time" the analytics/notification feature can be marketed as; cost-per-event informs whether the feature is profitable at scale; a clean security review reduces launch risk/legal exposure.

**MVP:** Working producer→stream→consumer→storage pipeline with DLQ and basic IAM least-privilege, informal security checklist completed.
**Expanded:** Auto-scaling consumers, hot-partition detection/mitigation, formal threat model (STRIDE) document, cost-per-event dashboard.

**Time/cost:** 25–40 hours; $15–40/month (MSK is pricier — consider Kinesis or self-managed Kafka on small instances for prototyping, tear down after).

**Interview talking points:** Be ready to compare Kafka/Kinesis/SQS on ordering and replay semantics precisely — this is one of the most commonly probed system-design distinctions, and having built and stress-tested it yourself beats reciting definitions.

**Demo:** Consumer-lag dashboard under load, cost-per-million-events chart, a redacted security-review checklist/threat-model doc excerpt.

**Blog posts:**
- *Technical:* "Kafka vs. Kinesis vs. SQS/SNS: Ordering, Replay, and Cost Compared With Real Load Tests"
- *Manager:* "What a Security Review Actually Catches Before Launch (A Worked Example)"
- *Executive:* "Real-Time Analytics: What It Costs Per Million Events and When It's Worth Building"

---

## STANDALONE BLOG TOPICS (Analysis & Evaluation Practice)

| # | Title | Angle | Audience | Bloom's Level |
|---|-------|-------|----------|---------------|
| 1 | "Reserved Instances vs. Savings Plans vs. Spot: A 3-Year Cost Model" | Model real workload against all three pricing options | Managers | Evaluation |
| 2 | "Postmortem: The Autoscaling Bug That Cost Us $4K in One Weekend" | Root-cause + what monitoring would've caught it sooner | Engineers | Analysis |
| 3 | "Do You Actually Need Kubernetes? A Decision Framework" | Team size/workload thresholds where K8s stops paying off | Managers | Evaluation |
| 4 | "What Happens If Your Cloud Bill Doubles Overnight? A Stress-Test Walkthrough" | Simulated cost-spike scenario and response playbook | Executives | Analysis |
| 5 | "Multi-Cloud vs. Single-Cloud: The Real Cost of 'Avoiding Lock-In'" | Quantify egress/tooling overhead vs. negotiating leverage | Executives | Evaluation |
| 6 | "Postmortem: How a Misconfigured IAM Policy Led to a Near-Miss Data Exposure" | Detection gap analysis, not just the fix | Engineers | Analysis |
| 7 | "Buy vs. Build: When Datadog Is Worth 5x the Cost of Self-Hosted Observability" | Break-even analysis by team size/log volume | Managers | Evaluation |
| 8 | "What If We Lost Our Lead SRE Tomorrow? A Bus-Factor Audit of Our Infra" | Knowledge-concentration risk analysis | Managers | Analysis |
| 9 | "Serverless at 100x Scale: Where the Cost Curve Bends Against You" | Identify the traffic level where serverless stops being cheap | Engineers | Analysis |
| 10 | "The Real ROI of Infrastructure as Code: Measuring Provisioning Time Before/After" | Time-based ROI, not just "best practice" framing | Executives | Evaluation |
| 11 | "Comparing Three Incident-Response Postmortems: What Made One Recover 10x Faster" | Cross-incident comparative analysis | Managers | Analysis |
| 12 | "Should You Self-Host Your CI/CD? GitHub Actions vs. Self-Hosted Runners Cost/Control Tradeoff" | Cost vs. compliance/control tradeoff | Engineers | Evaluation |
| 13 | "What a SOC 2 Audit Actually Requires From Your Cloud Architecture" | Translate compliance requirements into concrete architecture decisions | Executives | Analysis |
| 14 | "The Hidden Tax of Manual Runbooks: Quantifying Toil Across a Quarter" | Time-tracking analysis of repetitive ops work | Managers | Analysis |
| 15 | "Evaluating Three Disaster Recovery Postures for a Single Revenue-Critical Service" | Direct RTO/RPO/cost matrix | Executives | Evaluation |
| 16 | "Why We Rejected a Popular Architecture Pattern for Our Use Case" | Contrarian trade-off writeup, defending a non-default choice | Engineers | Evaluation |
| 17 | "What If Traffic Grew 10x This Quarter? A Capacity Stress-Test Writeup" | Forward-looking capacity planning scenario | Managers | Analysis |
| 18 | "Translating an SLA Into Engineering Requirements: A Worked Example" | Bridge legal/sales commitments to concrete architecture | Executives | Evaluation |

---

## Study Habit Checklist (Learning a New Cloud Service — Business-First, Not Docs-First)

1. **Start with the business problem, not the service name.** Before opening docs, write one sentence: "What business constraint (cost, latency, compliance, team size) makes this service relevant right now?"
2. **Name 2–3 alternatives before reading about your target service.** Force yourself to list what else could solve this problem — this is what prevents "resume-driven architecture."
3. **Find the pricing page before the feature page.** Understand the billing model (per-request, per-hour, per-GB) first — it shapes every later architecture decision.
4. **Build the smallest possible version, then break it on purpose.** Kill a node, throttle a dependency, cut the budget in half — you learn failure modes faster by causing them than by reading about them.
5. **Write the trade-off before you forget why you made it.** Immediately after building, write 3 bullets: what you chose, what you rejected, and the one metric that decided it. This is your future interview answer.
6. **Translate the same decision three ways.** Write one sentence explaining the choice to an engineer (technical mechanism), a manager (team/velocity impact), and an executive (cost/risk/revenue) — do this every time, not just for portfolio pieces.
7. **Re-price it a quarter later.** Cloud pricing and best practices shift fast — revisit old projects' cost assumptions periodically to keep your mental model current, not frozen at "when I learned it."

---

## STANDALONE BLOG TOPICS — Nigerian Market / Fintech Focus

Same analysis/evaluation skill-building as the global list, but grounded in the constraints that actually shape infra decisions for a Nigerian fintech: CBN regulation, naira/USD forex exposure, NDPR data localization, NIBSS/switch reliability, salary-day traffic spikes, and patchy connectivity/power outside Lagos.

| # | Title | Angle | Audience | Bloom's Level |
|---|-------|-------|----------|---------------|
| 1 | "What CBN's Cloud Outsourcing Guidelines Actually Require From Your Architecture" | Translate the regulatory text into concrete infra/vendor decisions | Executives | Analysis |
| 2 | "Hedging a Cloud Bill Billed in USD Against Naira Devaluation" | Quantify FX exposure and compare reserved-capacity prepay vs. multi-cloud arbitrage vs. local-provider options | Executives | Evaluation |
| 3 | "AWS Cape Town vs. On-Prem Lagos vs. Local Data Centers (Rack Centre, MDXi): A Latency and Cost Comparison for NIBSS Instant Payments" | Real round-trip latency measurements against the payment switch, not marketing numbers | Engineers | Evaluation |
| 4 | "NDPR Data Localization vs. Global Cloud Regions: What You're Actually Trading Off" | Compliance risk vs. feature/cost advantage of global regions | Executives | Evaluation |
| 5 | "Postmortem: What Really Happens to a Fintech's Infra on Salary Day (25th/1st)" | Traffic-spike case study — where the bottleneck actually was (DB, switch integration, or gateway) | Engineers | Analysis |
| 6 | "Build vs. Buy: BVN/NIN Verification — NIMC Direct Integration vs. Prembly/Smile ID/Youverify" | Cost-per-verification, latency, and compliance-liability comparison | Managers | Evaluation |
| 7 | "Paystack/Flutterwave vs. Direct NIBSS/Switch Integration: When Does Owning Your Payment Rail Pay Off?" | Break-even analysis on transaction volume vs. integration/compliance cost | Managers | Evaluation |
| 8 | "Designing for Nigeria's Power and Connectivity Reality: Offline-First Architecture for POS/Agency Banking" | Trade-offs of sync-on-reconnect vs. always-online assumptions baked into most cloud tutorials | Engineers | Analysis |
| 9 | "Postmortem: A Failed NIP Transfer and the Reconciliation Nightmare That Followed" | Root-cause of a settlement mismatch and what monitoring/idempotency design would have caught it | Engineers | Analysis |
| 10 | "The Real Cost of Downtime for a Nigerian Neobank on Salary Day" | Revenue-per-minute-of-downtime model specific to predictable high-traffic windows | Executives | Evaluation |
| 11 | "In-Country Cloud (Galaxy Backbone, MTN, Rack Centre) vs. AWS/GCP/Azure: Sovereignty vs. Feature Maturity" | Decision matrix for regulated fintech workloads weighing data-residency comfort vs. tooling gap | Managers | Evaluation |
| 12 | "What a CBN/NDIC Audit Actually Checks in Your Cloud Architecture" | Translate audit checklist items into concrete IAM/encryption/logging requirements | Executives | Analysis |
| 13 | "Fraud Detection Infra: Managed ML (AWS Fraud Detector, in-house model) vs. Third-Party Nigerian Fraud APIs" | Cost-per-transaction and false-positive-rate trade-off specific to local fraud patterns | Managers | Evaluation |
| 14 | "Multi-Region DR for a Nigerian Fintech: Is a Second Nigerian Data Center or a Foreign Region the Right Secondary?" | RTO/RPO vs. data-localization-compliance trade-off unique to CBN rules | Executives | Evaluation |
| 15 | "What If USSD Goes Down but the App Doesn't? A Channel-Redundancy Stress Test" | Simulated telco-side outage and what failover across USSD/app/web channels actually requires | Engineers | Analysis |
| 16 | "Remittance Startups and FX API Reliability: Build vs. Buy for Exchange Rate Data" | Cost and uptime comparison of building a rate-aggregation service vs. paying for a provider | Managers | Evaluation |
| 17 | "Reputation and Infra Transparency: What Nigerian Fintechs Can Learn From Each Other's Public Outages" | Cross-incident comparison of public-facing incident communication vs. silence during downtime | Managers | Analysis |
| 18 | "Scaling a Payment Gateway 10x Without 10x-ing Your CBN Compliance Overhead" | Capacity-planning stress test that keeps audit/reporting requirements fixed while infra scales | Executives | Analysis |
