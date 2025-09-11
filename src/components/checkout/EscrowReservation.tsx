"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEscrow, CreateEscrowParams } from "@/lib/web3/hooks/useEscrow";
import { ESCROW_CONFIG, DOMERA_RECEIVER_ADDRESS, TEST_DATA } from "@/lib/web3/config";
import MainButton from "@/components/custom-ui/MainButton";

interface EscrowReservationProps {
  onEscrowCreated: (transactionId: string, transactionHash: string) => void;
  onError: (error: string) => void;
  propertyData?: {
    id: string;
    title: string;
    price: string;
    location: string;
  };
  disabled?: boolean;
}

export function EscrowReservation({
  onEscrowCreated,
  onError,
  propertyData,
  disabled = false
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
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createReservationEscrow = async () => {
    // Check if we're in demo mode
    if (ESCROW_CONFIG.demoMode) {
      setIsCreating(true);
      
      // Simulate a transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      const metaEvidence: CreateEscrowParams['metaEvidence'] = {
        title: `Reserva de Propiedad: ${propertyData.title}`,
        description: `Escrow de reserva de ${ESCROW_CONFIG.paymentAmountUSD} USD para la propiedad ${propertyData.title} ubicada en ${propertyData.location}. Los fondos serán liberados al completar el proceso de compra o devueltos si la plataforma o desarrolladora no puede continuar con el proceso.`,
        question: "¿Debe liberarse el pago de reserva?",
        rulingOptions: {
          type: "single-select",
          titles: [
            "Rechazar liberación",
            "Liberar pago a Domera",
            "Devolver pago al comprador"
          ],
          descriptions: [
            "El escrow permanece bloqueado",
            "El pago se libera a Domera (compra completada o comprador incumple)",
            "El pago se devuelve al comprador (plataforma/desarrolladora no puede continuar)"
          ]
        }
      };

      const escrowParams: CreateEscrowParams = {
        receiverAddress: DOMERA_RECEIVER_ADDRESS,
        amount: ESCROW_CONFIG.paymentAmount, // Use config amount (0.001 ETH for dev, 0.1 ETH for prod)
        timeoutHours: ESCROW_CONFIG.timeoutPayment / 3600, // Convert seconds to hours
        metaEvidence
      };

      const result = await createEscrow(escrowParams);

      if (result.error) {
        onError(result.error);
        return;
      }

      if (result.transactionHash) {
        setLastTransactionHash(result.transactionHash);
      }

    } catch (error) {
      console.error('Error creating reservation escrow:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && lastTransactionHash) {
      // In a real implementation, you would parse the transaction logs to get the transaction ID
      // For now, we'll use a placeholder
      const transactionId = "pending"; // This should be extracted from transaction logs
      onEscrowCreated(transactionId, lastTransactionHash);
      setLastTransactionHash(null);
    }
  }, [isSuccess, lastTransactionHash, onEscrowCreated]);

  const canCreateEscrow = mounted && (ESCROW_CONFIG.demoMode || isReady) && !disabled && !isCreating && !isLoading;

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            🔒 Reserva con Escrow Descentralizado
          </h4>
          <div className="text-sm text-blue-800">
            <p>Cargando configuración del escrow...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          🔒 Reserva con Escrow Descentralizado
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            Se creará un escrow de <strong>{ESCROW_CONFIG.paymentAmountUSD} USD</strong> (≈{ESCROW_CONFIG.paymentAmount} ETH) que será:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Devuelto automáticamente</strong> si la plataforma o desarrolladora no puede continuar</li>
            <li><strong>Liberado a Domera</strong> al completar la compra exitosamente</li>
            <li><strong>Disputado a través de Kleros</strong> en caso de desacuerdo</li>
          </ul>
          {ESCROW_CONFIG.demoMode && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-xs text-yellow-800">
                🧪 <strong>Modo Demo:</strong> No se realizarán transacciones reales en blockchain
              </p>
            </div>
          )}
        </div>
      </div>

      {propertyData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Propiedad:</strong> {propertyData.title}</p>
            <p><strong>Ubicación:</strong> {propertyData.location}</p>
            <p><strong>Precio:</strong> {propertyData.price}</p>
            <p><strong>Comprador:</strong> {address && `${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          </div>
        </div>
      )}

      {!ESCROW_CONFIG.demoMode && !isReady && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Conecta tu wallet y asegúrate de estar en Arbitrum para continuar
          </p>
        </div>
      )}

      <MainButton
        onClick={createReservationEscrow}
        disabled={!canCreateEscrow}
        showArrow
        className="w-full"
      >
        {isCreating || isLoading 
          ? "Creando Escrow..." 
          : "🔒 Crear Reserva con Escrow"
        }
      </MainButton>

      {(isCreating || isLoading) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ⏳ Procesando transacción en blockchain. Por favor no cierres esta ventana...
          </p>
        </div>
      )}
    </div>
  );
}