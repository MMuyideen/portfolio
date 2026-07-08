import { Helmet } from 'react-helmet-async'
import { Hero } from '../components/Hero'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { Education } from '../components/Education'
import { TechStack } from '../components/TechStack'
import { Certifications } from '../components/Certifications'
import { LatestPosts } from '../components/LatestPosts'
import { Contact } from '../components/Contact'
import { portfolio } from '../data/portfolio'

const SITE_URL = 'https://www.muyideen.dev'

export function Home() {
  return (
    <>
      <Helmet>
        <title>Muyideen Morenigbade — DevOps & Cloud Engineer</title>
        <meta
          name="description"
          content="DevOps & Cloud Engineer specialising in Azure, AWS, OpenShift, Terraform, Kubernetes, and CI/CD pipelines."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Hero />
      <Experience experience={portfolio.experience} />
      <Projects projects={portfolio.projects} />
      <Education education={portfolio.education} />
      <TechStack skills={portfolio.skills} />
      <Certifications certifications={portfolio.certifications} />
      <LatestPosts />
      <Contact
        email={portfolio.email}
        github={portfolio.github}
        linkedin={portfolio.linkedin}
      />
    </>
  )
}
