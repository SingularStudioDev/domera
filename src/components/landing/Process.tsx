"use client";

import {
  CalendarIcon,
  CircleDollarSignIcon,
  HomeIcon,
  ListChecksIcon,
  MousePointerIcon,
} from "lucide-react";

const Process = () => {
  const steps = [
    {
      icon: HomeIcon,
      title: "Selecciona tu propiedad",
    },
    {
      icon: MousePointerIcon,
      title: "Hacé click en comprar",
    },
    {
      icon: ListChecksIcon,
      title: "Completa tu boleto de reserva",
    },
    {
      icon: CircleDollarSignIcon,
      title: "Hacé el deposito a tu escribana",
    },
    {
      icon: CalendarIcon,
      title: "En 30 días recibirás el boleto de compra ",
    },
  ];

  return (
    <section className="rounded-t-3xl bg-[#F5F5F5] px-4 py-14 md:py-16">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col gap-5 text-start md:gap-10">
          <h2 className="text-3xl leading-tight text-black lg:text-7xl">
            Transformá la manera de invertir en
            <br />
            propiedades en pozo
          </h2>
          <p className="text-xl leading-tight text-black lg:text-4xl">
            En muy pocos pasos ya podes ser propietario
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid w-full grid-cols-2 gap-4 py-12 md:grid-cols-3 md:gap-8 md:pt-44 md:pb-10 lg:grid-cols-5">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div key={step.title} className="text-center">
                {/* Icon */}
                <div className="bg-domera-blue mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <IconComponent className="h-12 w-12 text-[#0040FF]" />
                </div>

                {/* Content */}
                <h3 className="mx-auto max-w-[150px] text-lg text-black">
                  {step.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Process;
