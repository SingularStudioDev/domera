"use client";

import { useState } from "react";

import { ArrowDownIcon, ChevronDownIcon } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

export default function ServicesPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const marketingServices = [
    {
      title: "Estrategia Digital Personalizada",
      description:
        "Desarrollamos planes de marketing digital específicos para cada proyecto, incluyendo análisis de mercado, posicionamiento de marca y estrategias de contenido adaptadas al perfil de inversor ideal.",
    },
    {
      title: "Campañas de Marketing Dirigidas",
      description:
        "Ejecutamos campañas publicitarias en múltiples canales digitales (Google Ads, Facebook, Instagram, LinkedIn) con segmentación precisa para alcanzar inversores calificados y maximizar conversiones.",
    },
    {
      title: "Gestión de Contenido y Branding",
      description:
        "Creamos contenido visual y escrito de alta calidad, incluyendo renders, videos promocionales, copywriting especializado y material de marketing que destaque los beneficios únicos de cada proyecto.",
    },
  ];

  const investorBenefits = [
    {
      number: "01",
      title: "Respaldo Profesional",
      description:
        "Ofrecemos un servicio integral y automatizado para que tu inversion sea segura, rentable y sin complicaciones.",
    },
    {
      number: "02",
      title: "Analisis de Mercado",
      description:
        "Evaluamos cada proyecto con criterios estrictos de ubicacion, desarrolladora y rentabilidad potencial.",
    },
    {
      number: "03",
      title: "Sin Comisiones",
      description:
        "Compras directamente con la desarrolladora sin intermediarios, maximizando tu retorno de inversion.",
    },
    {
      number: "04",
      title: "Seguimiento Completo",
      description:
        "Te acompañamos desde la reserva hasta la entrega de tu propiedad con seguimiento personalizado.",
    },
  ];

  const developerBenefits = [
    {
      number: "01",
      title: "Canal de Ventas Digital",
      description:
        "Accede a una plataforma moderna que conecta tu proyecto con inversores calificados de forma eficiente.",
    },
    {
      number: "02",
      title: "Marketing Especializado",
      description:
        "Promocionamos tus proyectos con estrategias digitales dirigidas al publico inversor ideal.",
    },
    {
      number: "03",
      title: "Proceso Automatizado",
      description:
        "Simplificamos el proceso de venta con herramientas digitales que agilizan la gestion comercial.",
    },
    {
      number: "04",
      title: "Red de Profesionales",
      description:
        "Conectamos tu proyecto con una red de escribanos y profesionales especializados en pre-construccion.",
    },
  ];

  return (
    <>
      <Header />

      <main className="mt-24 min-h-screen md:mt-28">
        {/* Header Section */}
        <section className="container mx-auto flex w-full flex-col gap-6 rounded-3xl bg-[#F5F5F5] p-6 md:gap-12 md:p-10">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Title */}

            <h1 className="text-4xl font-light text-black md:text-6xl">
              Servicios
            </h1>

            {/* Introduction Text */}

            <p className="max-w-[600px] text-lg leading-relaxed text-black md:text-xl">
              Domera es la plataforma para acceder a las mejores oportunidades
              de inversión en propiedades en pozo en Uruguay. Conectamos a
              inversores con proyectos de las desarrolladoras más sólidas y
              prestigiosas del país.
            </p>
          </div>

          <img
            src="/service-img.png"
            alt="Edificio moderno - Render arquitect�nico"
            className="h-64 w-full rounded-2xl object-cover object-center md:h-[50dvh]"
          />
        </section>

        {/* Why Domera Section */}
        <section className="px-4 py-16 md:py-20">
          <div className="container mx-auto flex flex-col gap-10">
            <h2 className="dashboard-title">¿Por qué Domera?</h2>

            <div className="grid flex-col gap-10">
              {/* Investors Section */}
              <div>
                <h3 className="mb-8 text-2xl font-semibold text-black">
                  Inversores
                </h3>
                <div className="gird-cols-1 grid gap-5 md:gap-0 lg:grid-cols-4">
                  {investorBenefits.map((benefit) => (
                    <div key={benefit.number} className="flex flex-col gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-5xl text-[#0040FF] md:text-6xl">
                          {benefit.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-4 text-lg text-black md:text-xl">
                          {benefit.title}
                        </h4>
                        <p className="leading-relaxed text-black">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developers Section */}
              <div>
                <h3 className="mb-8 text-2xl font-semibold text-black">
                  Desarrolladoras
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-0">
                  {developerBenefits.map((benefit) => (
                    <div key={benefit.number} className="flex flex-col gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-5xl text-[#0040FF] md:text-6xl">
                          {benefit.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-4 text-lg text-black md:text-xl">
                          {benefit.title}
                        </h4>
                        <p className="leading-relaxed text-black">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-[80dvh] bg-[#F5F5F5] py-12 md:py-22">
          <div className="container mx-auto flex w-full flex-col-reverse items-start gap-12 px-4 md:flex-row md:px-0">
            {/* Imagen a la izquierda */}
            <div className="flex-1">
              <img
                src="/service-img-2.png"
                alt="Marketing para desarrolladoras - Servicios digitales"
                className="h-[636px] w-[607px] rounded-2xl object-cover"
              />
            </div>

            {/* Marketing para desarrolladoras - Desplegables a la derecha */}
            <div className="flex-1">
              <h2 className="mb-8 text-3xl font-semibold text-black md:text-4xl">
                Marketing para desarrolladoras
              </h2>

              <div className="space-y-0">
                {marketingServices.map((service, index) => (
                  <div key={index} className="border-b border-gray-300">
                    <div
                      onClick={() => toggleItem(index)}
                      className="flex cursor-pointer items-center justify-between gap-10 py-6 text-black transition duration-300 hover:text-[#0040FF]"
                    >
                      <span className="text-lg font-bold">{service.title}</span>
                      <ArrowDownIcon
                        className={`h-5 min-h-5 w-5 min-w-5 transition-transform duration-300 ${
                          openItems.includes(index) ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {openItems.includes(index) && (
                      <div className="pb-6 text-gray-700">
                        <p className="text-base leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
