"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletConnectButton, WalletInfo } from "@/components/web3/WalletConnectButton";
import { ARBITRUM_CHAIN_ID } from "@/lib/web3/config";

export type PaymentMethod = "escrow" | "traditional";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onWalletConnected?: () => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  onWalletConnected,
}: PaymentMethodSelectorProps) {
  const [mounted, setMounted] = useState(false);
  
  // Safe access to wagmi hooks only after mounting
  let isConnected = false;
  let chain: any = null;
  
  try {
    const account = useAccount();
    isConnected = mounted ? account.isConnected : false;
    chain = mounted ? account.chain : null;
  } catch (error) {
    // If wagmi hooks fail, keep default values
    console.warn("Wagmi hooks not available:", error);
  }
  
  const isOnArbitrum = chain?.id === ARBITRUM_CHAIN_ID;
  const isEscrowReady = mounted && isConnected && isOnArbitrum;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Método de Reserva
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Selecciona cómo deseas asegurar tu reserva de USD 200:
        </p>
      </div>

      <div className="space-y-4">
        {/* Escrow Web3 Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedMethod === "escrow"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onMethodChange("escrow")}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="escrow"
                name="payment-method"
                value="escrow"
                checked={selectedMethod === "escrow"}
                onChange={() => onMethodChange("escrow")}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="escrow" className="block text-sm font-medium text-gray-900 cursor-pointer">
                  🔒 Escrow Descentralizado (Recomendado)
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  Pago seguro con Kleros en Arbitrum. <strong>Devolvible</strong> si no se puede continuar con la compra por motivos de la plataforma o desarrolladora.
                </p>
                <div className="mt-2 text-xs text-green-600 space-y-1">
                  <div>✅ Transparente y verificable en blockchain</div>
                  <div>✅ Sistema de arbitraje justo</div>
                  <div>✅ Control total de tus fondos</div>
                </div>
              </div>
            </div>
            {selectedMethod === "escrow" && !isEscrowReady && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Requiere Wallet
              </span>
            )}
          </div>

          {selectedMethod === "escrow" && mounted && (
            <div className="mt-4 ml-7">
              {!isConnected ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Conecta tu wallet para usar el escrow descentralizado:
                  </p>
                  <WalletConnectButton onConnect={onWalletConnected} />
                </div>
              ) : (
                <WalletInfo />
              )}
            </div>
          )}
        </div>

        {/* Traditional Payment Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedMethod === "traditional"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onMethodChange("traditional")}
        >
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="traditional"
              name="payment-method"
              value="traditional"
              checked={selectedMethod === "traditional"}
              onChange={() => onMethodChange("traditional")}
              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <label htmlFor="traditional" className="block text-sm font-medium text-gray-900 cursor-pointer">
                💳 Pago Tradicional
              </label>
              <p className="mt-1 text-sm text-gray-600">
                Pago procesado y validado por Domera. <strong>NO devolvible</strong> sin importar el motivo de cancelación.
              </p>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div>• Proceso más simple</div>
                <div>• Sin necesidad de wallet</div>
                <div>• Riesgo de pérdida total en caso de cancelación</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {mounted && selectedMethod === "escrow" && !isEscrowReady && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {!isConnected 
              ? "⚡ Conecta tu wallet para continuar con el escrow"
              : "🔄 Cambia a la red Arbitrum para usar el escrow"
            }
          </p>
        </div>
      )}

      {selectedMethod === "traditional" && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            ⚠️ <strong>Importante:</strong> Los pagos tradicionales no son devolvibles bajo ninguna circunstancia.
          </p>
        </div>
      )}
    </div>
  );
}