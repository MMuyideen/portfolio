export interface Project {
  id: string
  title: string
  command: string
  description: string[]
  stack: string[]
  links: Array<{ label: string; href: string; external?: boolean }>
  diagram?: string
}

export interface Certification {
  issuer: string
  title: string
  date: string
  verifyUrl: string
  badgeImage?: string
}

export interface ExperienceEntry {
  role: string
  company: string
  period: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  period: string
  type: 'degree' | 'bootcamp'
  url?: string
}

export interface SkillCategory {
  name: string
  tools: string[]
}

/** A project shown on the résumé, referenced by `Project.id`. */
export interface ResumeProjectRef {
  id: string
  /** Overrides the project's own copy where the shell-comment voice doesn't fit. */
  title?: string
  summary?: string
}

/**
 * Content that exists only on the résumé (/resume). Everything else it renders
 * — experience, skills, certifications, education, projects — is read from the
 * fields above, so the page, the PDF, and the home page cannot drift apart.
 */
export interface ResumeData {
  headline: string
  summary: string
  projects: ResumeProjectRef[]
}

export interface PortfolioData {
  name: string
  role: string
  email: string
  github: string
  linkedin: string
  blog: string
  projects: Project[]
  certifications: Certification[]
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillCategory[]
  resume: ResumeData
}

export const portfolio: PortfolioData = {
  name: 'Muyideen Morenigbade',
  role: 'DevOps & Cloud Engineer',
  email: 'contact@muyideen.dev',
  github: 'https://github.com/MMuyideen',
  linkedin: 'https://linkedin.com/in/muyideenmorenigbade',
  blog: 'https://www.muyideen.dev/blog', // Self-hosted blog (/blog route)

  /**
   * Ordered by engineering depth, most involved first — the Projects section
   * renders this array in order and only reveals the first four before the
   * "show all" expander, so the ranking decides what a visitor actually sees.
   *
   * Every entry was checked against the repository it links to: the title
   * describes what the code does, and `stack` lists only technologies that
   * appear in that repo.
   */
  projects: [
    // Reusable Terraform modules + callable GitHub Actions workflows
    {
      id: 'terraform-modules-and-pipelines',
      title: 'Multi-Cloud Terraform Module Library',
      command: 'run module-library',
      description: [
        '# Eighteen reusable Terraform modules spanning Azure, AWS and GCP,',
        '# published alongside the pipelines that consume them: composite',
        '# actions for OIDC cloud login and fmt/validate, plus callable',
        '# plan/apply/destroy workflows other repos reference by tag.',
      ],
      stack: ['Terraform', 'GitHub Actions', 'Azure', 'AWS', 'GCP', 'OIDC', 'Dependabot'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/terraform-modules-and-pipelines',
          external: true,
        },
      ],
    },
    // Custom Kubernetes controller in Python (kopf)
    {
      id: 'python-kubernetes-operator',
      title: 'Kubernetes WebApp Operator',
      command: 'run webapp-operator',
      description: [
        '# A Kubernetes operator that reconciles a custom WebApp resource into',
        '# Deployments, Services and HPAs, with OpenAPI validation on the CRD,',
        '# owner references for garbage collection, and kopf timers that sync',
        '# health back to the resource status.',
      ],
      stack: ['Python', 'kopf', 'Kubernetes', 'CRDs', 'RBAC', 'Docker', 'pytest', 'GitHub Actions'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/python-kubernetes-operator',
          external: true,
        },
      ],
    },
    // AKS GitOps Pipeline
    {
      id: 'aks-terraform-argocd',
      title: 'AKS GitOps Pipeline',
      command: 'run aks-gitops',
      description: [
        '# AKS provisioned by Terraform modules, then a GitHub Actions pipeline',
        '# that builds the image, rewrites the tag in the manifest and commits it',
        '# — ArgoCD applies the change, so no imperative kubectl in the pipeline.',
      ],
      stack: ['Terraform', 'Kubernetes', 'Azure', 'ArgoCD', 'Docker', 'Key Vault', 'GitHub Actions'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/AKS-terraform-argocd',
          external: true,
        },
      ],
      diagram: '/diagrams/aks-gitops.png',
    },
    // EKS GitOps Pipeline
    {
      id: 'eks-terraform-argocd',
      title: 'EKS GitOps Pipeline',
      command: 'run eks-gitops',
      description: [
        '# EKS cluster and its IAM roles built from Terraform modules, with a',
        '# containerised Django app delivered through an ArgoCD sync manifest',
        '# rather than applied by hand.',
      ],
      stack: ['Terraform', 'Kubernetes', 'AWS', 'EKS', 'ArgoCD', 'IAM', 'Docker'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/EKS-terraform-argocd',
          external: true,
        },
      ],
      diagram: '/diagrams/eks-gitops.png',
    },
    // Azure Two Tier App
    {
      id: 'azure-2tier-webapp',
      title: 'Azure Two-Tier App',
      command: 'run azure-two-tier',
      description: [
        '# Two-tier Azure architecture split across eight Terraform modules —',
        '# scale set behind an Application Gateway, MySQL Flexible Server reached',
        '# over a private DNS zone, jumpbox for admin access, secrets in Key Vault.',
      ],
      stack: ['Azure', 'Terraform', 'VMSS', 'App Gateway', 'MySQL Flexible Server', 'Private DNS', 'Key Vault', 'Azure CDN'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-2tier-webapp',
          external: true,
        },
      ],
    },
    // AWS Two Tier App
    {
      id: 'aws-2tier-terraform',
      title: 'AWS Two-Tier App',
      command: 'run aws-two-tier',
      description: [
        '# Two-tier AWS architecture composed from seven Terraform modules:',
        '# autoscaling group behind an ALB, RDS in private subnets reached',
        '# through NAT, and CloudFront fronting it on an ACM certificate.',
      ],
      stack: ['AWS', 'Terraform', 'EC2', 'Auto Scaling', 'RDS', 'ALB', 'VPC', 'CloudFront', 'ACM'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-2tier-terraform',
          external: true,
        },
      ],
      diagram: '/diagrams/aws-two-tier.png',
    },
    // Azure Serverless Function App
    {
      id: 'azure-serverless-api',
      title: 'Azure Serverless API',
      command: 'run azure-serverless-api',
      description: [
        '# A Python Function App published behind API Management and Front Door,',
        '# provisioned by Terraform with Application Insights and Event Hub',
        '# diagnostics wired in at the same time.',
      ],
      stack: ['Azure', 'Terraform', 'Function Apps', 'Python', 'API Management', 'Front Door', 'App Insights', 'Event Hubs'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-serverless-api',
          external: true,
        },
      ],
      diagram: '/diagrams/azure-serverless-api.png',
    },
    // AKS + Bank of Anthos microservices workload
    {
      id: 'azure-aks-monitor',
      title: 'AKS Microservices Platform',
      command: 'run aks-microservices',
      description: [
        '# A zone-redundant, autoscaling AKS cluster built from Terraform modules',
        '# with its own service principal and Key Vault, used to run the',
        '# Bank of Anthos microservices suite as a realistic workload.',
      ],
      stack: ['Azure', 'Terraform', 'AKS', 'Kubernetes', 'Key Vault', 'Entra ID', 'Microservices'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-aks-monitor',
          external: true,
        },
      ],
    },
    // Azure Three Tier App
    {
      id: 'azure-3tier-webapp',
      title: 'Azure Three-Tier App',
      command: 'run azure-three-tier',
      description: [
        '# Web, app and data tiers scripted end to end with the Azure CLI:',
        '# Application Gateway at the edge, an internal load balancer between',
        '# tiers, and MySQL Flexible Server resolved over a private DNS zone.',
      ],
      stack: ['Azure', 'Azure CLI', 'Bash', 'App Gateway', 'Load Balancer', 'MySQL Flexible Server', 'Private DNS', 'NSG'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-3tier-webapp',
          external: true,
        },
      ],
      diagram: '/diagrams/azure-three-tier.png',
    },
    // AWS Three Tier App
    {
      id: 'aws-3tier-webapp',
      title: 'AWS Three-Tier App',
      command: 'run aws-three-tier',
      description: [
        '# Web, app and data tiers stood up from the AWS CLI, each tier behind',
        '# its own load balancer and driven by launch templates so instances',
        '# come back configured.',
      ],
      stack: ['AWS', 'AWS CLI', 'Bash', 'EC2', 'RDS', 'Load Balancers', 'VPC', 'Security Groups'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-3tier-webapp',
          external: true,
        },
      ],
      diagram: '/diagrams/aws-three-tier.png',
    },
    // AWS Static Website
    {
      id: 'aws-static-webapp-cicd',
      title: 'AWS Static Site with CI/CD',
      command: 'run aws-static-website',
      description: [
        '# S3 origin behind CloudFront on an ACM certificate, bootstrapped by a',
        '# single CLI script and redeployed by GitHub Actions on every push.',
      ],
      stack: ['AWS', 'S3', 'CloudFront', 'ACM', 'AWS CLI', 'GitHub Actions'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-static-webapp-cicd',
          external: true,
        },
      ],
      diagram: '/diagrams/aws-static-website.png',
    },
    // Azure Static Website
    {
      id: 'azure-static-webapp-cicd',
      title: 'Azure Static Site with CI/CD',
      command: 'run azure-static-website',
      description: [
        '# Static site served from a storage account with a CDN endpoint in',
        '# front, deployed by an Azure DevOps pipeline that runs the same CLI',
        '# script used to create it.',
      ],
      stack: ['Azure', 'Storage Accounts', 'Azure CDN', 'Azure CLI', 'Azure DevOps Pipelines'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-static-webapp-cicd',
          external: true,
        },
      ],
      diagram: '/diagrams/azure-static-website.png',
    },
  ],

  certifications: [
    {
      issuer: 'Microsoft',
      title: 'AZ-305 Microsoft Certified: Azure Solutions Architect Expert',
      date: '2026-08',
      verifyUrl: 'https://learn.microsoft.com/en-us/users/muyideenm/credentials/86a2c05bb8a43811',
      badgeImage: '/certifications/az-305.webp',
    },
    {
      issuer: 'Microsoft',
      title: 'AZ-400 Microsoft Certified: DevOps Engineer Expert',
      date: '2026-04',
      verifyUrl: 'https://learn.microsoft.com/en-us/users/muyideenm/credentials/43bd58e6a9e3c6e5',
      badgeImage: '/certifications/CERT-Expert-DevOps-Engineer-600x600.png',
    },
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified Trainer (MCT) 2026',
      date: '2026-01',
      verifyUrl: 'https://www.credly.com/badges/7b8de62b-ba25-4a54-b17a-ef6da2159dd0/public_url',
      badgeImage: '/certifications/microsoft-certified-trainer-mct-2026.png',
    },
    {
      issuer: 'The Linux Foundation',
      title: 'KCNA: Kubernetes and Cloud Native Associate',
      date: '2025-08',
      verifyUrl: 'https://www.credly.com/badges/e7df1162-2a0f-46e7-a139-dfd2c3abb77c/',
      badgeImage: '/certifications/kcna-kubernetes-and-cloud-native-associate.png',
    },
    {
      issuer: 'Amazon Web Services (AWS)',
      title: 'AWS Certified Solutions Architect – Associate',
      date: '2024-01',
      verifyUrl: 'https://www.credly.com/badges/b1d029b9-5870-4af0-9580-9c31db1d7696/',
      badgeImage: '/certifications/aws-certified-solutions-architect-associate.png', // Replace
    },
    {
      issuer: 'Amazon Web Services (AWS)',
      title: 'AWS Certified Cloud Practitioner',
      date: '2023-10',
      verifyUrl: 'https://www.credly.com/badges/e7df1162-2a0f-46e7-a139-dfd2c3abb77c/',
      badgeImage: '/certifications/aws-certified-cloud-practitioner.png',
    },
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified: Azure Administrator Associate',
      date: '2023-08',
      verifyUrl: 'https://learn.microsoft.com/en-gb/users/muyideenm/credentials/ac333bcc783f9764',
      badgeImage: '/certifications/azure-administrator-associate.png',
    },
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified: Azure Fundamentals',
      date: '2022-08',
      verifyUrl: 'https://learn.microsoft.com/api/credentials/share/en-us/MuyideenM/F2D11B0DEDC24DF0?sharingId=63CC44E8B3AF8C6',
      badgeImage: '/certifications/microsoft-certified-azure-fundamentals.png',
    },
  ],

  education: [
    {
      degree: 'B.Sc Computer Science',
      institution: 'Kwara State University',
      period: 'Class of 2021',
      type: 'degree' as const,
    },
    {
      degree: 'Cloud Engineering',
      institution: 'AltSchool Africa',
      period: '2024 – 2025',
      type: 'bootcamp' as const,
      url: 'https://altschoolafrica.com/',
    },
    {
      degree: 'Cloud & DevOps Engineering',
      institution: 'Darey.io',
      period: '2025 – 2026',
      type: 'bootcamp' as const,
      url: 'https://darey.io/',
    },
  ],

  skills: [
    { name: 'Cloud', tools: ['AWS', 'Azure', 'GCP', 'DigitalOcean'] },
    { name: 'Containers', tools: ['Kubernetes', 'Docker', 'ArgoCD', 'AKS', 'EKS'] },
    { name: 'IaC', tools: ['Terraform', 'ARM Templates', 'CloudFormation'] },
    { name: 'CI/CD', tools: ['GitHub Actions', 'Azure DevOps', 'Jenkins', 'CircleCI'] },
    { name: 'Observability', tools: ['Prometheus', 'Grafana', 'Azure Monitor', 'CloudWatch', 'New Relic'] },
    { name: 'Scripting', tools: ['Python', 'PowerShell', 'Bash', 'YAML'] },
    { name: 'Security', tools: ['Azure Policy', 'RBAC', 'IAM', 'MFA', 'Microsoft Entra'] },
    { name: 'Networking', tools: ['DNS', 'VPN', 'Load Balancing', 'WAF', 'Firewalls', 'VNet'] },
  ],

  experience: [
    {
      role: 'Cloud/DevOps Engineer',
      company: 'Perizer',
      period: '2025 – present',
      bullets: [
        'Led design and implementation of end-to-end CI/CD pipelines using GitHub Actions and Azure DevOps, reducing deployment times by 60%.',
        'Automated infrastructure provisioning with Terraform and ARM Templates across Azure and AWS, eliminating manual configuration drift.',
        'Built and managed containerised workflows using Docker and Kubernetes (AKS/EKS), improving platform reliability and fault tolerance.',
        'Implemented monitoring and alerting using Azure Monitor, Prometheus, and Grafana, maintaining 99.9% service availability.',
        'Enforced cloud security through Azure Policy, RBAC, and automated compliance checks, reducing audit findings.',
      ],
    },
    {
      role: 'Azure Cloud Support Engineer',
      company: 'Teknowledge',
      period: '2023 – 2026',
      bullets: [
        'Designed and deployed scalable cloud environments using Terraform IaC, reducing manual provisioning time by 40%.',
        'Hardened cloud environments with Azure Policy and RBAC, ensuring 100% compliance with ISO 27001 standards.',
        'Built and maintained Azure DevOps YAML pipelines for automated CI/CD, enabling daily production deployments with zero downtime.',
        'Implemented Azure Monitor and Log Analytics with custom dashboards and proactive alerting, achieving 99.99% uptime.',
        'Reduced monthly cloud spend by 30% through Azure Advisor recommendations, Reserved Instances, and automated shutdown schedules.',
      ],
    },
  ],

  resume: {
    headline:
      'Infrastructure that provisions, deploys, and recovers without hands on it.',
    summary:
      'DevOps & Cloud Engineer with 5+ years building and running production infrastructure on Azure and AWS. I own delivery end to end — GitHub Actions, Azure DevOps, and ArgoCD across multi-environment Kubernetes clusters — provision every environment from reusable Terraform modules, and hold availability with Prometheus, Grafana, and Azure Monitor. Governance is code too: Azure Policy, RBAC, and automated compliance checks instead of review meetings. Azure Solutions Architect Expert and DevOps Engineer Expert, AWS SAA, KCNA, and Microsoft Certified Trainer.',


    // The top of the complexity ranking in `projects`, trimmed to four so the
    // section holds one page. Summaries are overridden because the shell-comment
    // voice on the home page runs long once flattened into a sentence.
    projects: [
      {
        id: 'terraform-modules-and-pipelines',
        summary:
          'Eighteen reusable Terraform modules across Azure, AWS and GCP, shipped with the composite actions and callable plan/apply/destroy workflows other repositories consume.',
      },
      {
        id: 'python-kubernetes-operator',
        summary:
          'A Python operator that reconciles a custom WebApp resource into Deployments, Services and HPAs, with a validated CRD, least-privilege RBAC and a tested release pipeline.',
      },
      {
        id: 'aks-terraform-argocd',
        summary:
          'AKS provisioned from Terraform modules, with CI that builds the image and commits the new tag for ArgoCD to apply — no imperative kubectl in the pipeline.',
      },
      {
        id: 'azure-serverless-api',
        summary:
          'A Python Function App behind API Management and Front Door, provisioned with Terraform alongside its Application Insights and Event Hub diagnostics.',
      },
    ],
  },
}
