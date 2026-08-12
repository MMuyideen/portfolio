import { Helmet } from 'react-helmet-async'
import { personSchema, websiteSchema } from '../lib/structuredData'
import { Hero } from '../components/Hero'
import { Impact } from '../components/Impact'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { Education } from '../components/Education'
import { TechStack } from '../components/TechStack'
import { Certifications } from '../components/Certifications'
import { LatestPosts } from '../components/LatestPosts'
import { SiteArchitecture } from '../components/SiteArchitecture'
import { Contact } from '../components/Contact'
import { portfolio } from '../data/portfolio'
import { SITE_URL } from '../lib/site'

const TITLE =
  'Muyideen Morenigbade | Cloud Platform & DevOps Engineer | Azure, AWS, Kubernetes & Terraform'

// No percentages here either: the Impact section stopped leading with them,
// and a description that advertises figures the page doesn't show is the worst
// of both — a claim placed exactly where nobody can check it.
const DESCRIPTION =
  'Cloud Platform & DevOps Engineer designing and automating reliable cloud platforms on Azure and AWS with Terraform, Kubernetes and GitOps.'

export function Home() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta
          property="og:image:alt"
          content="Muyideen Morenigbade — Cloud Platform & DevOps Engineer. Azure, AWS, Terraform, Kubernetes."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">
          {JSON.stringify(personSchema())}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema())}
        </script>
      </Helmet>

      {/* Positioning → measured results → proof of work → how it was built
          → credentials → writing → the site itself → reach out. Impact sits
          directly under the hero because it is the fastest answer to "is this
          person any good". */}
      <Hero />
      <Impact impact={portfolio.impact} />
      <Projects />
      <Experience experience={portfolio.experience} />
      <TechStack skills={portfolio.skills} />
      <Certifications />
      <Education education={portfolio.education} />
      <LatestPosts />
      <SiteArchitecture />
      <Contact
        email={portfolio.email}
        github={portfolio.github}
        linkedin={portfolio.linkedin}
      />
    </>
  )
}
