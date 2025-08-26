interface UnitDescriptionProps {
  description: string;
}

const UnitDescription = ({ description }: UnitDescriptionProps) => {
  return (
    <div className="container mx-auto mb-16">
      <h3 className="mb-6 text-3xl font-bold text-black">Descripción</h3>
      <div className="whitespace-pre-line text-lg text-gray-700">
        {description}
      </div>
    </div>
  );
};

export default UnitDescription;