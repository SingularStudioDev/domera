"use client";

import { useEffect, useState } from "react";

import { useAccount } from "wagmi";

import {
  DOMERA_RECEIVER_ADDRESS,
  ESCROW_CONFIG,
  TEST_DATA,
} from "@/lib/web3/config";
import { CreateEscrowParams, useEscrow } from "@/lib/web3/hooks/useEscrow";
import { createEscrowReservationAction, CreateEscrowInput } from "@/lib/actions/escrow";
import MainButton from "@/components/custom-ui/MainButton";

interface EscrowReservationProps {
  onEscrowCreated: (transactionId: string, transactionHash: string) => void;
  onError: (error: string) => void;
  propertyData?: {
    id: string;
    title: string;
    price: string;
    location: string;
    projectId?: string;
  };
  formData?: {
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
    };
  };
  disabled?: boolean;
}

export function EscrowReservation({
  onEscrowCreated,
  onError,
  propertyData,
  formData,
  disabled = false,
}: EscrowReservationProps) {
  const [mounted, setMounted] = useState(false);

  // Safe access to wagmi hooks only after mounting
  let address: string | undefined;
  let createEscrow: any;
  let isLoading = false;
  let isSuccess = false;
  let isReady = false;

  try {
    const account = useAccount();
    const escrowHook = useEscrow();

    if (mounted) {
      address = account.address;
      createEscrow = escrowHook.createEscrow;
      isLoading = escrowHook.isLoading;
      isSuccess = escrowHook.isSuccess;
      isReady = escrowHook.isReady;
    }
  } catch (error) {
    console.warn("Wagmi hooks not available:", error);
    createEscrow = async () => ({ error: "Wallet not connected" });
  }
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createReservationEscrow = async () => {
    // Check if we're in demo mode
    if (ESCROW_CONFIG.demoMode) {
      setIsCreating(true);

      // Simulate a transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Return test data
      const testTxHash = TEST_DATA.testTxHashes.create;
      const testTxId = TEST_DATA.testTransactionIds.pending;

      setIsCreating(false);
      onEscrowCreated(testTxId, testTxHash);
      return;
    }

    if (!isReady) {
      onError("Wallet no conectada o red incorrecta");
      return;
    }

    if (!propertyData) {
      onError("Datos de propiedad no disponibles");
      return;
    }

    setIsCreating(true);

    try {
      // Create meta evidence for the escrow
      const metaEvidence: CreateEscrowParams["metaEvidence"] = {
        title: `Reserva de Propiedad: ${propertyData.title}`,
        description: `Escrow de reserva de ${ESCROW_CONFIG.paymentAmountUSD} USD para la propiedad ${propertyData.title} ubicada en ${propertyData.location}. Los fondos serán liberados al completar el proceso de compra o devueltos si la plataforma o desarrolladora no puede continuar con el proceso.`,
        question: "¿Debe liberarse el pago de reserva?",
        rulingOptions: {
          type: "single-select",
          titles: [
            "Rechazar liberación",
            "Liberar pago a Domera",
            "Devolver pago al comprador",
          ],
          descriptions: [
            "El escrow permanece bloqueado",
            "El pago se libera a Domera (compra completada o comprador incumple)",
            "El pago se devuelve al comprador (plataforma/desarrolladora no puede continuar)",
          ],
        },
      };

      const escrowParams: CreateEscrowParams = {
        receiverAddress: DOMERA_RECEIVER_ADDRESS,
        amount: ESCROW_CONFIG.paymentAmount, // Use config amount (0.001 ETH for dev, 0.1 ETH for prod)
        timeoutHours: ESCROW_CONFIG.timeoutPayment / 3600, // Convert seconds to hours
        propertyId: propertyData.id,
        propertyTitle: propertyData.title,
        metaEvidence,
      };

      const result = await createEscrow(escrowParams);

      if (result.error) {
        onError(result.error);
        setIsCreating(false);
        return;
      }

      // Transaction was successful
      if (result.transactionHash && address && propertyData) {
        try {
          // Create record in database immediately
          const escrowInput: CreateEscrowInput = {
            propertyId: propertyData.id,
            propertyTitle: propertyData.title,
            propertyData: {
              id: propertyData.id,
              title: propertyData.title,
              price: propertyData.price,
              location: propertyData.location,
              projectId: propertyData.projectId,
            },
            formData: {
              personalInfo: formData?.personalInfo || {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
              },
              paymentMethod: "escrow" as const,
            },
            escrowData: {
              contractEscrowId: "0", // This will be updated when we parse the transaction logs
              transactionHash: result.transactionHash,
              amount: ESCROW_CONFIG.paymentAmount,
              receiverAddress: DOMERA_RECEIVER_ADDRESS,
              buyerAddress: address,
              timeoutTimestamp: Math.floor(Date.now() / 1000) + (ESCROW_CONFIG.timeoutPayment),
              metaEvidence: JSON.stringify(metaEvidence),
            },
          };

          const dbResult = await createEscrowReservationAction(escrowInput);
          
          if (dbResult.success) {
            onEscrowCreated(dbResult.data?.contractEscrowId || "pending", result.transactionHash);
          } else {
            onError(dbResult.error || "Error saving escrow to database");
          }
        } catch (dbError) {
          console.error("Error saving escrow to database:", dbError);
          onError("Error saving escrow to database");
        }
      }
    } catch (error) {
      console.error("Error creating reservation escrow:", error);
      onError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsCreating(false);
    }
  };


  const canCreateEscrow =
    mounted &&
    (ESCROW_CONFIG.demoMode || isReady) &&
    !disabled &&
    !isCreating &&
    !isLoading;

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="border-primaryColor bg-primaryColor rounded-lg border p-4">
          <h4 className="text-primaryColor mb-2 font-medium">
            Reserva con Escrow Descentralizado
          </h4>
          <div className="text-primaryColor text-sm">
            <p>Cargando configuración del escrow...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-black">
        <h4 className="mb-2 font-medium">Reserva con Escrow Descentralizado</h4>
        <div className="space-y-2 text-sm">
          <p>
            Se creará un escrow de{" "}
            <strong>{ESCROW_CONFIG.paymentAmountUSD} USD</strong> (≈
            {ESCROW_CONFIG.paymentAmount} ETH) que será:
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>
              <strong>Devuelto automáticamente</strong> si la plataforma o
              desarrolladora no puede continuar
            </li>
            <li>
              <strong>Liberado a Domera</strong> al completar la compra
              exitosamente
            </li>
            <li>
              <strong>Disputado a través de Kleros</strong> en caso de
              desacuerdo
            </li>
          </ul>
          {ESCROW_CONFIG.demoMode && (
            <div className="mt-2 rounded border border-yellow-300 bg-yellow-100 p-2">
              <p className="text-xs text-yellow-800">
                🧪 <strong>Modo Demo:</strong> No se realizarán transacciones
                reales en blockchain
              </p>
            </div>
          )}
        </div>
      </div>

      {!ESCROW_CONFIG.demoMode && !isReady && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Conecta tu wallet y asegúrate de estar en Arbitrum para continuar
          </p>
        </div>
      )}

      <MainButton
        onClick={createReservationEscrow}
        disabled={!canCreateEscrow}
        showArrow
        className="w-fit"
      >
        {isCreating || isLoading
          ? "Creando Escrow..."
          : "Crear Reserva con Escrow"}
      </MainButton>

      {(isCreating || isLoading) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Procesando transacción en blockchain. Por favor no cierres esta
            ventana...
          </p>
        </div>
      )}
    </div>
  );
}
