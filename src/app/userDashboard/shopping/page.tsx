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
        />
      )}
    </>
  );
}
