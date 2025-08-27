'use client';

import { useState } from 'react';
import PropertyCard from '@/components/custom-ui/PropertyCard';
import { ShoppingSheet } from './_components/ShoppingSheet';

export default function ShoppingDashboardPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto pt-26">
        {/* Header */}
        <div className="flex items-center mb-4 justify-between">
          <h1 className="dashboard-title">Compras</h1>
        </div>

        <div className="grid grid-cols-3">
          <PropertyCard
            imageUrl="/pro/pro-2.png"
            location="Carrasco"
            deliveryDate="Ene 2027"
            progress={35}
            title="Winks Americas"
            price="$167.000"
            address="Av. de las Américas & Melchora Cuenca"
            bedrooms={2}
            garages={1}
            actionLabel="Firma boleto de reserva"
            onAction={() => setIsSheetOpen(true)}
          />
        </div>
      </div>

      {isSheetOpen && (
        <ShoppingSheet
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          projectName="Winks Americas"
          projectSubtitle="Torre Residencial Premium"
          projectAmount="US$ 285.000"
          progressPercentage={75}
          payments={[
            { name: "Reserva", amount: "US$ 5.000", dueDate: "15/01/2025", status: "Pendiente" },
            { name: "Primera cuota", amount: "US$ 25.000", dueDate: "15/02/2025", status: "Pendiente" },
            { name: "Segunda cuota", amount: "US$ 25.000", dueDate: "15/03/2025", status: "Pendiente" },
            { name: "Entrega", amount: "US$ 230.000", dueDate: "15/12/2025", status: "Pendiente" },
          ]}
          blueprints={[
            { name: "Planos unidad 604", url: "#" },
            { name: "Planos cochera 02", url: "#" },
          ]}
        />
      )}
    </>
  );
}
