import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ExperienceList from '@/components/ExperienceList'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ExperienceList />
      <Footer />
    </main>
  )
}