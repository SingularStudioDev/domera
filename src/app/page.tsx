import Hero from '@/components/landing/Hero';
import Partners from '@/components/landing/Partners';
import Projects from '@/components/landing/Projects';
import Process from '@/components/landing/Process';
import Footer from '@/components/Footer';
import Header from '@/components/header/Header';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Partners />
        <Projects />
        <Process />
      </main>

      <Footer />
    </>
  );
}
