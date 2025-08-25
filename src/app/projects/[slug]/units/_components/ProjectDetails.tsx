interface ProjectDetailsProps {
  amenities: string;
  additionalFeatures: string;
}

export default function ProjectDetails({
  amenities,
  additionalFeatures,
}: ProjectDetailsProps) {
  const parseContent = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.slice(1); // Skip the title line
  };

  const parseAmenities = (amenitiesData: string): string[] => {
    try {
      // Si es un JSON string válido, parsearlo
      const parsed = JSON.parse(amenitiesData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Si no es array, retornar como array de un elemento
      return [parsed.toString()];
    } catch {
      // Si no es JSON válido, tratarlo como texto plano
      if (
        !amenitiesData ||
        amenitiesData.trim() === '' ||
        amenitiesData === 'Amenidades a confirmar'
      ) {
        return [];
      }
      // Si contiene saltos de línea, dividir por líneas y filtrar
      if (amenitiesData.includes('\n')) {
        return amenitiesData
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.toLowerCase().includes('amenidades'))
          .map((line) => line.replace(/^-\s*/, ''));
      }
      // Retornar como array de un elemento
      return [amenitiesData];
    }
  };

  return (
    <div className="mt-4 grid gap-8 md:mt-10 md:grid-cols-3">
      <div>
        <h3 className="mb-4 text-lg font-bold text-black">Aménities</h3>
        <div className="text-sm text-black">
          <ul className="list-none space-y-1">
            {parseAmenities(amenities).map((amenity, index) => (
              <li key={index}>- {amenity}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* TODO: Esto tambien tiene que estar en la base de datos como un notas adicionales */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-black">
          Características adicionales
        </h3>
        <div className="text-sm text-black">
          {parseContent(additionalFeatures).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
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
