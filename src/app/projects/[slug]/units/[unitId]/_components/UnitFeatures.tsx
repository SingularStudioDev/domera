interface UnitFeaturesProps {
  features: string[];
}

const UnitFeatures = ({ features }: UnitFeaturesProps) => {
  return (
    <div className="container mx-auto mb-16">
      <h3 className="mb-6 text-3xl font-bold text-black">Características</h3>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <li key={index} className="text-lg text-gray-700">
            • {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnitFeatures;