import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import Hero from "@/components/landing/Hero";
import Partners from "@/components/landing/Partners";
import Process from "@/components/landing/Process";
import Projects from "@/components/landing/Projects";

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
