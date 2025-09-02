"use client";

import { syne } from "@/utils/Fonts";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="mt-28 min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto flex w-full flex-col gap-6 md:gap-12">
          <div className="flex w-full flex-col gap-6 md:h-[70dvh] md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="landing-title">Nosotros</h1>

              <p className="mb-16 max-w-[600px] text-lg leading-relaxed text-black md:text-xl">
                Somos el puente que conecta a inversores como tu con las
                oportunidades inmobiliarias mas solidas y rentables
              </p>

              <div>
                <h3 className="mb-4 text-xl font-bold text-black">
                  Profesionales
                </h3>
                <p className="max-w-[600px] text-lg leading-relaxed text-black">
                  Detras de Domera hay un equipo de profesionales con un
                  profundo conocimiento del mercado inmobiliario. Combinamos la
                  experiencia en marketing, desarrollo de proyectos y,
                  fundamentalmente, la seguridad de un equipo de escribanos para
                  ofrecerte una perspectiva 360 en cada inversion.
                </p>
              </div>
            </div>

            <div className="flex-1 md:ml-8">
              <img
                src="/service-img.png"
                alt="Edificio moderno con palmeras"
                className="h-64 w-full rounded-2xl object-cover object-center md:h-[70dvh]"
              />
            </div>
          </div>
        </section>

        {/* Purpose Section */}
        <section className="bg-[#F5F5F5] px-4 py-16 md:my-20">
          <div className="container mx-auto">
            <div className="mb-12 text-start">
              <h2 className="dashboard-title mb-4">Nuestro proposito</h2>
              <p className="max-w-2xl text-lg leading-relaxed text-black md:text-xl">
                Entendemos que la inversion en proyectos en pozo es un acto de
                confianza en el futuro.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
              {/* Column 1 */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl text-black md:text-2xl">
                  Simplificar lo complejo
                </h3>
                <p className="leading-relaxed text-black">
                  A travas de nuestra plataforma automatizada, transformamos un
                  proceso que antes era largo y tedioso en una experiencia
                  fluida y sin friccion.
                </p>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl text-black md:text-2xl">
                  Maximizar tu tiempo y recursos
                </h3>
                <p className="leading-relaxed text-black">
                  Al automatizar la documentacion, los pagos y el seguimiento,
                  te liberamos de las gestiones administrativas para que tu
                  inversion sea lo mas eficiente posible.
                </p>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl text-black md:text-2xl">
                  Generar confianza con la tecnologia
                </h3>
                <p className="leading-relaxed text-black">
                  Nuestro sistema no solo te guia, sino que tambien garantiza la
                  transparencia en cada transaccion, ofreciondote un control
                  total y en tiempo real sobre el progreso de tu inversion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto rounded-2xl bg-[#0040FF] p-6 text-white md:my-20">
          <div className="container mx-auto text-center">
            <p className="mx-auto mb-2 max-w-4xl text-xl leading-relaxed md:text-2xl">
              Te ofrecemos la tranquilidad de saber que tu inversion este
              gestionada con
              <br />
              <span className="font-bold">
                la precision de la tecnologia y el respaldo de un equipo de
                expertos.
              </span>
            </p>

            <h2 className={`${syne.className} text-[40px] font-bold`}>
              Domera
            </h2>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
