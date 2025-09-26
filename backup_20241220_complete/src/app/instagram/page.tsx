import Header from '@/components/Header'
import InstagramHero from '@/components/InstagramHero'
import InstagramExperienceList from '@/components/InstagramExperienceList'
import Footer from '@/components/Footer'

export default function InstagramPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <InstagramHero />
      <InstagramExperienceList />
      <Footer />
    </main>
  )
}
