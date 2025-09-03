interface UnitDescriptionProps {
  description: string;
  features: string[];
}

export default function UnitDescription({
  description,
  features,
}: UnitDescriptionProps) {
  return (
    <div className="my-16 min-h-[40dvh] rounded-3xl bg-[#F5F5F5] py-10">
      <div className="container mx-auto">
        <h3 className="mb-6 text-3xl font-bold text-black">Detalles</h3>
        <div className="text-lg whitespace-pre-line text-black">
          {description}
        </div>
        <ul className="mt-3">
          {features.map((feature, index) => (
            <li key={index} className="text-lg text-black">
              + {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
