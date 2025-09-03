interface ProjectDetailsProps {
  amenities: string | object | null;
}

export default function ProjectDetails({ amenities }: ProjectDetailsProps) {
  const parseAmenityData = (amenitiesData: string | object | null) => {
    // Si es null o undefined, retornar estructura vacía
    if (!amenitiesData) {
      return {
        detalles: [],
        amenities: [],
      };
    }

    // Si ya es un objeto, usarlo directamente
    if (typeof amenitiesData === "object" && !Array.isArray(amenitiesData)) {
      const data = amenitiesData as any;
      if (data.detalles || data.amenities) {
        return {
          detalles: data.detalles || [],
          amenities: data.amenities || [],
        };
      }
    }

    // Si es un array, tratarlo como amenities
    if (Array.isArray(amenitiesData)) {
      // Manejar el formato {icon, text} del DAL
      const processedAmenities = amenitiesData.map((item: any) => {
        if (typeof item === "object" && item.text) {
          return item.text; // Extraer solo el texto
        }
        return item.toString(); // Si es string u otro tipo
      });

      return {
        detalles: [],
        amenities: processedAmenities,
      };
    }

    // Si no es string, convertirlo
    const stringData =
      typeof amenitiesData === "string"
        ? amenitiesData
        : JSON.stringify(amenitiesData);
    try {
      // Si es un JSON string válido, parsearlo
      const parsed = JSON.parse(stringData);

      // Verificar si tiene la nueva estructura con detalles y amenities
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.detalles || parsed.amenities)
      ) {
        return {
          detalles: parsed.detalles || [],
          amenities: parsed.amenities || [],
        };
      }

      // Si es un array simple (formato anterior), tratarlo como amenities
      if (Array.isArray(parsed)) {
        // Manejar el formato {icon, text} del DAL
        const processedAmenities = parsed.map((item: any) => {
          if (typeof item === "object" && item.text) {
            return item.text; // Extraer solo el texto
          }
          return item.toString(); // Si es string u otro tipo
        });

        return {
          detalles: [],
          amenities: processedAmenities,
        };
      }

      // Si no es array ni objeto, retornar como amenity único
      return {
        detalles: [],
        amenities: [parsed.toString()],
      };
    } catch {
      // Si no es JSON válido, tratarlo como texto plano
      if (
        !stringData ||
        stringData.trim() === "" ||
        stringData === "Amenidades a confirmar"
      ) {
        return {
          detalles: [],
          amenities: [],
        };
      }

      // Si contiene saltos de línea, dividir por líneas y filtrar
      if (stringData.includes("\n")) {
        const items = stringData
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.toLowerCase().includes("amenidades"))
          .map((line) => line.replace(/^-\s*/, ""));

        return {
          detalles: [],
          amenities: items,
        };
      }

      // Retornar como amenity único
      return {
        detalles: [],
        amenities: [stringData],
      };
    }
  };

  const { detalles, amenities: amenitiesList } = parseAmenityData(amenities);

  return (
    <div className="mt-4 grid gap-8 md:mt-10 md:grid-cols-3">
      <div>
        <h3 className="mb-4 text-lg font-bold text-black">Amenities</h3>
        <div className="text-sm text-black">
          <ul className="list-none space-y-1">
            {amenitiesList.map((amenity: string, index: number) => (
              <li key={index}>- {amenity}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-black">
          Características adicionales
        </h3>
        <div className="text-sm text-black">
          <ul className="list-none space-y-1">
            {detalles.map((detalle: string, index: number) => (
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
