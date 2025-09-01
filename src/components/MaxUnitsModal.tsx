"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MaxUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MaxUnitsModal({ isOpen, onClose }: MaxUnitsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Límite de unidades alcanzado</DialogTitle>
          <DialogDescription className="space-y-2 text-center">
            <span className="block">
              No puedes agregar más de 2 unidades a tu carrito de compras.
            </span>
            <span className="block">
              Para obtener más información sobre la compra de unidades
              adicionales, contacta con nuestro equipo.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cerrar
          </button>
          <a
            href="mailto:contacto@domera.com"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Contactar al equipo
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
