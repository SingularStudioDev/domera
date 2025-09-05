"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import MainButton from "@/components/custom-ui/MainButton";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  isSubmitting?: boolean;
}

export function TermsModal({
  open,
  onOpenChange,
  onAccept,
  isSubmitting = false,
}: TermsModalProps) {
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledToBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    if (isScrolledToBottom) {
      setHasScrolledTerms(true);
    }
  };

  const handleAccept = () => {
    if (acceptedTerms) {
      onAccept();
    }
  };

  const handleClose = () => {
    setHasScrolledTerms(false);
    setAcceptedTerms(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[80dvh] w-2xl max-w-2xl flex-col"
        showCloseButton={false}
      >
        <div
          className="w-full flex-1 overflow-y-auto pr-2"
          onScroll={handleTermsScroll}
        >
          <div className="w-full space-y-4 text-sm text-gray-700">
            <h1 className="text-2xl font-semibold">Términos y Condiciones</h1>
            <p>
              Al completar este formulario, usted acepta que Domera S.A. utilice
              la información proporcionada para generar el boleto de reserva
              correspondiente a la unidad seleccionada.
            </p>

            <p>
              La información personal suministrada será tratada de acuerdo con
              la Ley N° 18.331 de Protección de Datos Personales de Uruguay y
              será utilizada exclusivamente para los fines relacionados con la
              operación inmobiliaria.
            </p>

            <p>
              El boleto de reserva generado tendrá validez legal una vez firmado
              digitalmente por ambas partes a través de los sistemas habilitados
              (Agesic, Abitab). La firma digital tendrá el mismo valor jurídico
              que una firma manuscrita según la legislación uruguaya vigente.
            </p>

            <p>
              Los datos proporcionados en este formulario son de su exclusiva
              responsabilidad. Cualquier inexactitud en la información
              suministrada podría afectar la validez del boleto de reserva y el
              proceso de compra.
            </p>

            <p>
              Domera S.A. se compromete a mantener la confidencialidad de sus
              datos y no compartirlos con terceros sin su consentimiento
              expreso, salvo en los casos establecidos por la ley.
            </p>

            <p>
              Al marcar la opción sobre el uso de escribana, usted está
              indicando su preferencia para el proceso notarial. Esta selección
              podrá ser modificada posteriormente en coordinación con nuestro
              equipo legal.
            </p>

            <p>
              El envío de este formulario no constituye una obligación de
              compra. El proceso continuará con la generación del boleto de
              reserva, el cual establecerá los términos y condiciones
              específicos de la operación.
            </p>

            <p>
              Para cualquier consulta sobre el tratamiento de sus datos
              personales o el proceso de compra, puede contactarnos a través de
              los canales oficiales de Domera S.A.
            </p>

            <p>
              La reserva de la unidad tendrá una validez de 15 días calendario a
              partir de la fecha de firma del boleto de reserva. Durante este
              período, la unidad quedará reservada exclusivamente para el
              solicitante.
            </p>

            <p>
              En caso de desistimiento por parte del solicitante dentro del
              período de validez, se aplicarán las condiciones establecidas en
              el boleto de reserva correspondiente.
            </p>

            <p>
              Domera S.A. se reserva el derecho de verificar la información
              proporcionada y podrá solicitar documentación adicional para
              completar el proceso de reserva.
            </p>

            <p>
              El presente formulario y los datos contenidos en él tienen
              carácter confidencial y no podrán ser utilizados para fines
              distintos a los expresamente autorizados.
            </p>

            <p className="font-medium">
              Al continuar, usted declara haber leído, entendido y aceptado
              estos términos y condiciones.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={!hasScrolledTerms}
              className="text-primaryColor h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <label
              htmlFor="accept-terms"
              className="ml-2 cursor-pointer text-sm text-gray-700 select-none"
            >
              He leído y acepto los términos y condiciones
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:flex-col">
          <div className="w-full">
            {!hasScrolledTerms && (
              <p className="text-sm text-gray-500">
                Debe desplazarse hasta el final del texto para poder aceptar los
                términos
              </p>
            )}
          </div>

          <div className="flex w-full justify-between">
            <button
              onClick={handleClose}
              className="text-primaryColor w-fit cursor-pointer"
            >
              Cancelar
            </button>

            <MainButton
              onClick={handleAccept}
              disabled={!acceptedTerms || isSubmitting}
              showArrow
              className="text-sm"
            >
              {isSubmitting ? "Enviando..." : "Confirmar y aceptar"}
            </MainButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
