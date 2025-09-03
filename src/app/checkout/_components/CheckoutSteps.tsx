import Link from "next/link";

type Step = {
  number: number;
  label: string;
  href: string;
};

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps: Step[] = [
    { number: 1, label: "Selecciónde unidad", href: "/checkout" },
    { number: 2, label: "Adicionales", href: "/checkout/additional" },
    { number: 3, label: "Boleto de reserva", href: "/checkout/confirmation" },
  ];

  return (
    <div className="flex w-1/3 flex-col gap-4">
      {steps.map((step) => (
        <Link
          key={step.number}
          href={step.href}
          className="group flex w-full items-center gap-4 transition-colors duration-300"
        >
          <div
            className={`flex h-[60px] w-[40px] items-center justify-center text-3xl font-bold ${step.number === currentStep ? "bg-primaryColor group-hover:bg-primaryColor-hover text-white" : "bg-gray-200 text-black group-hover:bg-gray-300"}`}
          >
            {step.number}
          </div>
          <span className="max-w-[100px] text-black">{step.label}</span>
        </Link>
      ))}
    </div>
  );
}
