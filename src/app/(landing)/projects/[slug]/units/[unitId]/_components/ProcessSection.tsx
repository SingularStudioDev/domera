import {
  CircleDollarSign,
  Home,
  ListCheck,
  MousePointer,
  Wallet,
} from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      icon: Home,
      title: "Selecciona tu propiedad",
    },
    {
      icon: MousePointer,
      title: "Hacé click en comprar",
    },
    {
      icon: ListCheck,
      title: "Completa tu boleto de reserva",
    },
    {
      icon: CircleDollarSign,
      title: "Hace el deposito y espera la escritura",
    },
    {
      icon: Wallet,
      title: "En 30 días recibirás el boleto de compra",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col gap-10 text-start">
          <h2 className="text-3xl font-bold text-black">Proceso</h2>
        </div>

        {/* Process Steps */}
        <div className="grid w-full grid-cols-1 gap-8 pt-20 pb-10 md:grid-cols-3 lg:grid-cols-5">
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
}
