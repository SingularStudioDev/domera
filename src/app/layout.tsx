import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Web3Provider } from "@/components/web3/Web3Provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domera - Compra propiedades en pozo sin comisiones",
  description:
    "Invertí en propiedades en pozo sin comisiones inmobiliarias. Más de 235 propiedades disponibles con 6 años de experiencia.",
  keywords:
    "propiedades, pozo, inversión, inmobiliaria, sin comisiones, Uruguay",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <Web3Provider>
            {children}
          </Web3Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
