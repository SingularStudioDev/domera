"use client";

import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

const faqItems = [
  {
    question: "Que es una inversion en pozo?",
    answer:
      "Una inversi�n en pozo es la compra de un inmueble que a�n no ha sido construido completamente. Los inversores compran unidades bas�ndose en planos y proyectos, generalmente a precios m�s bajos que las propiedades terminadas.",
  },
  {
    question:
      "¿Cuules son los riesgos de invertir en proyectos en construccion?",
    answer:
      "Los principales riesgos incluyen demoras en la construcci�n, cambios en el proyecto original, problemas financieros del desarrollador, y fluctuaciones del mercado inmobiliario. En Domera trabajamos solo con desarrolladores de confianza para minimizar estos riesgos.",
  },
  {
    question: "¿Como funciona el proceso de compra?",
    answer:
      "El proceso incluye: selecci�n de la unidad, reserva con documentaci�n inicial, seguimiento de la construcci�n a trav�s de nuestra plataforma, y escrituraci�n al finalizar la obra. Todo el proceso est� digitalizado para mayor transparencia.",
  },
  {
    question: "¿Que documentacion necesito para invertir?",
    answer:
      "Necesitas c�dula de identidad vigente, comprobantes de ingresos, y documentaci�n que respalde tu capacidad de inversi�n. Nuestro equipo te guiar� en todo el proceso documental.",
  },
  {
    question: "¿Puedo financiar mi inversion?",
    answer:
      "S�, trabajamos con diferentes entidades financieras para ofrecer opciones de financiamiento. Las condiciones var�an seg�n cada proyecto y tu perfil crediticio.",
  },
  {
    question: "¿Como puedo hacer seguimiento de mi inversion?",
    answer:
      "A trav�s de nuestra plataforma digital puedes ver el progreso de construcci�n en tiempo real, documentaci�n, pagos realizados, y toda la informaci�n relevante de tu inversi�n.",
  },
];

export default function FaqsPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  return (
    <>
      <Header />

      <main className="mt-24 min-h-screen md:mt-36">
        {/* Hero Section */}
        <section className="container mx-auto flex w-full flex-col px-6 md:px-0">
          <div className="flex w-full flex-col gap-4 text-start">
            <h1 className="landing-title">Preguntas frecuentes</h1>

            <p className="text-lg leading-relaxed text-black md:text-xl">
              Evacua todas tus dudas o escribenos si no encuentras la respuesta
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full rounded-t-3xl px-6 py-6 md:my-18">
          <div className="container mx-auto">
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-300">
                  <div
                    onClick={() => toggleItem(index)}
                    className="hover:text-primaryColor flex cursor-pointer items-center justify-between gap-10 py-6 text-black transition duration-300"
                  >
                    <span className="text-lg font-bold">{item.question}</span>
                    <ChevronDownIcon
                      className={`h-h min-h-5 w-5 min-w-5 transition-transform duration-300 ${
                        openItems.includes(index) ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {openItems.includes(index) && (
                    <div className="pb-6 text-gray-700">
                      <p className="text-base leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gray-100 p-6 py-12">
          <div className="container mx-auto text-start">
            <h3 className="dashboard-title mb-4">¿Aun tienes dudas?</h3>
            <p className="text-lg">
              Envianos un mail a{" "}
              <a
                href="mailto:contacto@domera.uy"
                className="text-primaryColor font-semibold hover:underline"
              >
                contacto@domera.uy
              </a>{" "}
              con todas tus dudas y te responderemos a la brevedad
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
