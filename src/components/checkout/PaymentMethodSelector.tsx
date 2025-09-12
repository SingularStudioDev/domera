"use client";

import { useEffect, useState } from "react";

import { useCheckoutStore } from "@/stores/checkoutStore";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Shield,
  Wallet,
} from "lucide-react";
import { useAccount } from "wagmi";

import { cn } from "@/lib/utils";
import { ARBITRUM_CHAIN_ID } from "@/lib/web3/config";
import { switchToArbitrumSepolia, getNetworkSwitchMessage } from "@/lib/web3/network-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  WalletConnectButton,
  WalletInfo,
} from "@/components/web3/WalletConnectButton";

export type PaymentMethod = "escrow" | "traditional" | null;

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
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const { items, currentProject, getTotalPrice } = useCheckoutStore();

  // Safe access to wagmi hooks with error handling
  let isConnected = false;
  let chain: any = null;
  let address: string | undefined = undefined;

  try {
    const account = useAccount();
    isConnected = mounted && account.isConnected;
    chain = mounted ? account.chain : null;
    address = mounted ? account.address : undefined;
  } catch (error) {
    // If wagmi hooks fail, keep default values and show helpful message
    console.warn("Wagmi hooks not available - Web3Provider may not be properly configured:", error);
    isConnected = false;
    chain = null;
    address = undefined;
  }

  const isOnArbitrum = chain?.id === ARBITRUM_CHAIN_ID;
  const isEscrowReady = mounted && isConnected && isOnArbitrum;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchToArbitrum = async () => {
    setIsSwitchingNetwork(true);
    try {
      const success = await switchToArbitrumSepolia();
      if (success && onWalletConnected) {
        onWalletConnected();
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground mb-4 text-2xl font-semibold">
          Método de Reserva
        </h3>
      </div>

      <div className="space-y-4">
        {items.length > 0 && currentProject && (
          <div className="rounded-lg bg-gray-50 p-6">
            <h5 className="mb-4 font-bold">Detalles de la Reserva</h5>
            <div className="grid grid-cols-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Propiedad</span>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between"
                    >
                      <span>{item.unitTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="flex flex-col gap-1">
                <span className="font-bold">Proyecto</span>{" "}
                {currentProject.name}
              </p>

              <p className="flex flex-col gap-1">
                <span className="font-bold">Precio total</span> $
                {getTotalPrice().toLocaleString()}
              </p>

              <p className="flex flex-col gap-1">
                <span className="font-bold">Monto de reserva</span> USD200
              </p>
            </div>
          </div>
        )}

        {/* Escrow Web3 Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedMethod === "escrow"
              ? "ring-primaryColor border-primaryColor bg-[#F9FBFF] ring-1"
              : "hover:border-muted-foreground/30",
          )}
          onClick={() => onMethodChange("escrow")}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <input
                  type="radio"
                  id="escrow"
                  name="payment-method"
                  value="escrow"
                  checked={selectedMethod === "escrow"}
                  onChange={() => onMethodChange("escrow")}
                  className="text-primaryColor focus:ring-primaryColor border-border mt-1 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <label
                      htmlFor="escrow"
                      className="text-foreground block cursor-pointer text-sm font-semibold"
                    >
                      Pago Descentralizado
                    </label>
                    <Badge
                      variant="secondary"
                      className="bg-primaryColor/10 text-primaryColor rounded-full text-xs"
                    >
                      Recomendado
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">
                    Pago seguro con Kleros en Arbitrum.{" "}
                    <span className="text-primaryColor font-semibold">
                      Reembolsable
                    </span>{" "}
                    si no se puede continuar con la compra por motivos de la
                    plataforma o desarrolladora.
                  </p>
                  <div className="space-y-1.5">
                    <div
                      className={`flex items-center gap-2 text-xs ${selectedMethod === "escrow" ? "text-primaryColor" : "text-green-600"}`}
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Transparente y verificable en blockchain</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${selectedMethod === "escrow" ? "text-primaryColor" : "text-green-600"}`}
                    >
                      {" "}
                      <CheckCircle className="h-3 w-3" />
                      <span>Sistema de arbitraje justo</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${selectedMethod === "escrow" ? "text-primaryColor" : "text-green-600"}`}
                    >
                      {" "}
                      <CheckCircle className="h-3 w-3" />
                      <span>Control total de tus fondos</span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedMethod === "escrow" && !isEscrowReady && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-xs"
                >
                  <Wallet className="h-3 w-3" />
                  Requiere Wallet
                </Badge>
              )}
            </div>

            {selectedMethod === "escrow" && mounted && (
              <div className="mt-6 ml-8">
                {!isConnected ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      Conecta tu wallet para usar el escrow descentralizado:
                    </p>
                    <WalletConnectButton onConnect={onWalletConnected} />
                  </div>
                ) : !isOnArbitrum ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      {getNetworkSwitchMessage(chain?.id)}:
                    </p>
                    <button
                      onClick={handleSwitchToArbitrum}
                      disabled={isSwitchingNetwork}
                      className="flex w-full items-center justify-center rounded-lg bg-primaryColor px-4 py-2 text-sm font-medium text-white hover:bg-primaryColor/90 disabled:opacity-50"
                    >
                      {isSwitchingNetwork ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Cambiando red...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Cambiar a Arbitrum Sepolia
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <WalletInfo />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traditional Payment Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedMethod === "traditional"
              ? "ring-primaryColor bg-[#F9FBFF] ring-2"
              : "hover:border-muted-foreground/30",
          )}
          onClick={() => onMethodChange("traditional")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <input
                type="radio"
                id="traditional"
                name="payment-method"
                value="traditional"
                checked={selectedMethod === "traditional"}
                onChange={() => onMethodChange("traditional")}
                className="border-border mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <label
                    htmlFor="traditional"
                    className="text-foreground block cursor-pointer text-sm font-semibold"
                  >
                    Pago Tradicional
                  </label>
                </div>
                <p className="text-muted-foreground mb-3 text-sm">
                  Pago procesado y validado por Domera.{" "}
                  <span className="text-primaryColor font-semibold">
                    No reembolsable
                  </span>{" "}
                  sin importar el motivo de cancelación.
                </p>
                <div className="space-y-1.5">
                  <div
                    className={`flex items-center gap-2 text-xs ${selectedMethod === "traditional" ? "text-primaryColor" : "text-green-600"}`}
                  >
                    <span>Proceso más simple</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${selectedMethod === "traditional" ? "text-primaryColor" : "text-green-600"}`}
                  >
                    <span>Sin necesidad de wallet</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {mounted && selectedMethod === "escrow" && !isEscrowReady && (
        <Card className="border-primaryColor/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primaryColor h-2 w-2 animate-pulse rounded-full" />
              <p className="text-primaryColor text-sm font-medium">
                {!isConnected
                  ? "Conecta tu wallet para continuar con el escrow"
                  : `${getNetworkSwitchMessage(chain?.id)} para usar el escrow`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
