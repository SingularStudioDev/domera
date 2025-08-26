interface InvestmentSectionProps {
  unitType: string;
  status: string;
}

const InvestmentSection = ({ unitType, status }: InvestmentSectionProps) => {
  return (
    <div className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="rounded-l-3xl bg-gray-100 p-8 pl-48">
          <h3 className="mb-6 text-3xl font-bold text-black">
            Inversión
          </h3>
          <div className="text-lg text-gray-700">
            <p>Información sobre inversión disponible próximamente.</p>
            <p>Tipo de unidad: {unitType}</p>
            <p>Estado: {status === 'available' ? 'Disponible' : 'No disponible'}</p>
          </div>
        </div>
        <div className="rounded-r-3xl bg-gray-200 p-8 pr-48">
          <h3 className="mb-6 text-3xl font-bold text-black">
            Boleto de reserva
          </h3>
          <div className="text-lg text-gray-700">
            <p>Al acceder al boleto de reserva, el comprador se compromete formalmente a adquirir la unidad.</p>
            <p>Contacta con nuestro equipo de ventas para obtener más información sobre el proceso de reserva.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSection;