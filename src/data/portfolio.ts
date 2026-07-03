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
}

export const portfolio: PortfolioData = {
  name: 'Muyideen Morenigbade',
  role: 'DevOps & Cloud Engineer',
  email: 'morenigbademuyideen@gmail.com',
  github: 'https://github.com/mmuyideen',
  linkedin: 'https://linkedin.com/in/muyideenmorenigbade',
  blog: 'https://blog.mmuyideen.tech', // Replace with your Hashnode URL

  projects: [
    // Add the projects here
    // AKS GitOps Pipeline
    {
      id: 'aks-terraform-argocd',
      title: 'AKS GitOps Pipeline',
      command: 'run aks-gitops',
      description: [
        '# AKS cluster provisioned with Terraform and wired to ArgoCD',
        '# for declarative GitOps — no imperative kubectl in the pipeline.',
      ],
      stack: ['Terraform', 'Kubernetes', 'Azure', 'ArgoCD'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/mmuyideen/AKS-terraform-argocd',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/AKS-terraform-argocd/blob/689f2438344271aca17201fb68082e9beef32566/Architecturediagram.png?raw=true',
    },
    // EKS GitOps Pipeline
    {
      id: 'EKS-terraform-argocd',
      title: 'EKS GitOps Pipeline',
      command: 'run eks-gitops',
      description: [
        '# EKS cluster provisioned with Terraform and wired to ArgoCD',
        '# for declarative GitOps — no imperative kubectl in the pipeline.',
      ],
      stack: ['Terraform', 'Kubernetes', 'Azure', 'ArgoCD'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/mmuyideen/EKS-terraform-argocd',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/EKS-terraform-argocd/blob/2947de3050bb3479391a3bb82b504ea0795d6b2c/EKS-argo-diag.png?raw=true',
    },
    // AWS Three Tier App
    {
      id: 'AWS Three Tier app',
      title: 'AWS Three Tier App',
      command: 'run aws-three-tier',
      description: [
        '# AWS three-tier application architecture with CLI',
      ],
      stack: ['AWS', 'CLI', 'EC2', 'RDS', 'Load Balancers', 'VPC', 'Security Groups'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-3tier-webapp',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/aws-3tier-webapp/blob/1b36139f73827355caf8f48b43f90bcc091b7f97/Architecturediagram.png?raw=true',
    },
    // Azure Three Tier App
    {
      id: 'Azure Three Tier app',
      title: 'Azure Three Tier App',
      command: 'run azure-three-tier',
      description: [
        '# Azure three-tier application architecture with Terraform',
      ],
      stack: ['Azure', 'Terraform', 'VMSS', 'MySQL Database', 'App Gateway', 'Load Balancers', 'Private Endpoint', 'Azure CDN', 'DNS',],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-3tier-webapp',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/azure-3tier-webapp/blob/ac5d5fab32d2537359c515313d5d822c6957daae/week3-architecturediagram.png?raw=true',
    },
    // AWS Two Tier App
    {
      id: 'AWS two Tier app',
      title: 'AWS Two Tier App',
      command: 'run aws-two-tier',
      description: [
        '# AWS two-tier application architecture with Terraform',
      ],
      stack: ['AWS', 'EC2', 'RDS', 'Load Balancers', 'VPC', 'Security Groups', 'CloudFront', 'DNS', 'AWS Certificate Manager', 'Terraform'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-2tier-terraform',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/aws-2tier-terraform/blob/d6f8d34cf888c0b0ed642606998be90176b6929d/Architecturediagram.png?raw=true',
    },
    // Azure Two Tier App
    {
      id: 'Azure two Tier app',
      title: 'Azure Two Tier App',
      command: 'run azure-two-tier',
      description: [
        '# Azure two-tier application architecture with Terraform',
      ],
      stack: ['Azure', 'VMs', 'SQL Database', 'Load Balancers', 'VNet', 'Security Groups', 'DNS', 'Terraform'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-2tier-terraform',
          external: true,
        },
      ],
      // diagram: '/diagrams/aks-gitops.png',
      diagram: 'https://github.com/MMuyideen/aws-2tier-terraform/blob/d6f8d34cf888c0b0ed642606998be90176b6929d/Architecturediagram.png?raw=true',
    },
    // AWS Static Website
    {
      id: 'aws-static-website',
      title: 'AWS Static Website',
      command: 'run aws-static-website',
      description: [
        '# AWS static website architecture with GitHub Actions CI/CD pipeline',
      ],
      stack: ['AWS', 'S3', 'CloudFront', 'DNS', 'AWS Certificate Manager', 'CLI', 'GitHub Actions' ],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/aws-static-webapp-cicd',
          external: true,
        },
      ],
      // diagram: '/diagrams/aws-static-website.png',
      diagram: 'https://github.com/MMuyideen/aws-static-webapp-cicd/blob/23ed1b39deb5dc000c569b88eba8ff9f37186b46/web/AWS-Week1-diagram.png?raw=true',
    },
    // Azure Static Website
    {
      id: 'azure-static-website',
      title: 'Azure Static Website',
      command: 'run azure-static-website',
      description: [
        '# Azure static website architecture with Azure DevOps CI/CD pipeline',
      ],
      stack: ['Azure', 'Storage Accounts', 'Azure CDN', 'DNS', 'CLI', 'Azure DevOps Pipelines' ],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-static-webapp-cicd',
          external: true,
        },
      ],
      // diagram: '/diagrams/azure-static-website.png',
      diagram: 'https://github.com/MMuyideen/azure-static-webapp-cicd/blob/86d76d4ed3960e82f211ae69b8ad5e49c40040d6/web/Architecturediagram.png?raw=true',
    },
    // Azure Serverless Function App
    {
      id: 'azure-serverless-api',
      title: 'Azure Serverless Function App Terraform',
      command: 'run azure-serverless-function-app',
      description: [
        '# Azure Serverless Function App architecture with APIM, Front door and Terraform',
      ],
      stack: ['Azure', 'Terraform', 'Function Apps', 'API Management', 'Front Door', 'Azure CDN'],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-serverless-function-api',
          external: true,
        },
      ],
      // diagram: '/diagrams/azure-static-website.png',
      diagram: 'https://github.com/MMuyideen/azure-serverless-api/blob/20df44862ab84ef9fc256500993429e48c752073/Arch-diagram.png?raw=true',
    },
    // Azure AKS Monitor
    {
      id: 'azure-aks-monitor',
      title: 'Azure AKS Monitor',
      command: 'run azure-aks-monitor',
      description: [
        '# Azure AKS Monitor architecture ',
      ],
      stack: ['Azure', 'AKS', 'Azure Key Vault', 'Entra ID', 'Service Principal', ],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/MMuyideen/azure-aks-monitor',
          external: true,
        },
      ],
      // diagram: '/diagrams/azure-aks-monitor.png',
      // diagram: 'https://github.com/MMuyideen/azure-aks-monitor/blob/main/Arch-diagram.png?raw=true',
    },

  ],

  certifications: [
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified Trainer (MCT) 2026',
      date: '2026-01',
      verifyUrl: 'https://www.credly.com/badges/7b8de62b-ba25-4a54-b17a-ef6da2159dd0/public_url',
      badgeImage: '/assets/images/microsoft-certified-trainer-mct-2026.png',
    },
    {
      issuer: 'Microsoft',
      title: 'AZ-400 Microsoft Certified: DevOps Engineer Expert',
      date: '2026-04',
      verifyUrl: 'https://learn.microsoft.com/en-us/users/muyideenm/credentials/43bd58e6a9e3c6e5',
      badgeImage: '/assets/images/CERT-Expert-DevOps-Engineer-600x600.png',
    },
    {
      issuer: 'The Linux Foundation',
      title: 'KCNA: Kubernetes and Cloud Native Associate',
      date: '2025-08',
      verifyUrl: 'https://www.credly.com/badges/e7df1162-2a0f-46e7-a139-dfd2c3abb77c/',
      badgeImage: '/assets/images/kcna-kubernetes-and-cloud-native-associate.png',
    },
    {
      issuer: 'Amazon Web Services (AWS)',
      title: 'AWS Certified Solutions Architect – Associate',
      date: '2024-01',
      verifyUrl: 'https://www.credly.com/badges/b1d029b9-5870-4af0-9580-9c31db1d7696/',
      badgeImage: '/assets/images/aws-certified-solutions-architect-associate.png', // Replace
    },
    {
      issuer: 'Amazon Web Services (AWS)',
      title: 'AWS Certified Cloud Practitioner',
      date: '2023-10',
      verifyUrl: 'https://www.credly.com/badges/e7df1162-2a0f-46e7-a139-dfd2c3abb77c/',
      badgeImage: '/assets/images/aws-certified-cloud-practitioner.png',
    },
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified: Azure Administrator Associate',
      date: '2023-08',
      verifyUrl: 'https://learn.microsoft.com/en-gb/users/muyideenm/credentials/ac333bcc783f9764',
      badgeImage: '/assets/images/azure-administrator-associate.png',
    },
    {
      issuer: 'Microsoft',
      title: 'Microsoft Certified: Azure Fundamentals',
      date: '2022-08',
      verifyUrl: 'https://learn.microsoft.com/api/credentials/share/en-us/MuyideenM/F2D11B0DEDC24DF0?sharingId=63CC44E8B3AF8C6',
      badgeImage: '/assets/images/microsoft-certified-azure-fundamentals.png',
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
    { name: 'IaC', tools: ['Terraform', 'ARM Templates', 'CloudFormation', 'OpenTofu'] },
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
      company: 'Microsoft',
      period: '2023 – 2026',
      bullets: [
        'Designed and deployed scalable cloud environments using Terraform IaC, reducing manual provisioning time by 40%.',
        'Hardened cloud environments with Azure Policy and RBAC, ensuring 100% compliance with ISO 27001 standards.',
        'Built and maintained Azure DevOps YAML pipelines for automated CI/CD, enabling daily production deployments with zero downtime.',
        'Implemented Azure Monitor and Log Analytics with custom dashboards and proactive alerting, achieving 99.99% uptime.',
        'Reduced monthly cloud spend by 30% through Azure Advisor recommendations, Reserved Instances, and automated shutdown schedules.',
      ],
    },
    {
      role: 'Azure Cloud Engineer Intern',
      company: 'The Opad Hub Limited',
      period: '2021 – 2022',
      bullets: [
        'Installed, configured, and managed Windows and Linux VMs on Azure within virtual networks.',
        'Implemented Azure governance using policies, management groups, and RBAC through Microsoft Entra.',
        'Monitored Azure resource performance with logging and alerting tools, improving incident response times.',
        'Contributed to the design and deployment of high-availability IaaS and PaaS solutions for enterprise applications.',
      ],
    },
  ],
}
