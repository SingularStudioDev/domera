import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import Projects from '@/components/Projects';
import Process from '@/components/Process';
import Footer from '@/components/Footer';

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
