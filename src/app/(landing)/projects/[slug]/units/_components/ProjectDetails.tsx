interface ProjectDetailsProps {
  amenities: any;
  details: any;
}

export default function ProjectDetails({
  amenities,
  details,
}: ProjectDetailsProps) {
  // Parse amenities - extract text from {icon, text} format or use strings directly
  const parseAmenities = (amenitiesData: any): string[] => {
    if (!amenitiesData || !Array.isArray(amenitiesData)) return [];

    return amenitiesData.map((item: any) => {
      if (typeof item === "object" && item.text) {
        return item.text; // Format from DAL: {icon, text}
      }
      return String(item); // String format
    });
  };

  // Parse details - ensure array format
  const parseDetails = (detailsData: any): string[] => {
    if (!detailsData || !Array.isArray(detailsData)) return [];
    return detailsData;
  };

  const amenitiesList = parseAmenities(amenities);
  const detallesList = parseDetails(details);

  return (
    <div className="mt-4 grid md:mt-10 md:grid-cols-3">
      <div className="mr-5">
        <h3 className="mb-4 text-lg font-bold text-black">Amenities</h3>
        <div className="text-black">
          <ul className="list-none space-y-1">
            {amenitiesList.map((amenity: string, index: number) => (
              <li key={index}>- {amenity}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mr-5">
        <h3 className="mb-4 text-lg font-bold text-black">
          Características adicionales
        </h3>
        <div className="text-sm text-black">
          <ul className="list-none space-y-1">
            {detallesList.map((detalle: string, index: number) => (
              <li key={index}>- {detalle}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* TODO: Esto tiene que estar en la base de datos */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-black">Inversión</h3>
        <div className="text-sm text-black">
          <p className="mb-3">
            Proyecto se construye bajo la Ley de Vivienda Promovida N°18.795,
            que implica las siguientes exoneraciones por 10 años:
          </p>
          <p>- Exoneración del ITP.</p>
          <p>- Exoneración del I.R.P.F./ I.R.N.R. / I.R.A.E.</p>
          <p>- Exoneración de impuestos de ITP a la primera compra.</p>
          <div className="mt-3">
            <p>- Boleto de reserva: 10%</p>
            <p>- Compromiso de compra/venta: 20%</p>
            <p>- Pagos durante la obra: 60%</p>
            <p>- Salgo de contra entrega: 10%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
