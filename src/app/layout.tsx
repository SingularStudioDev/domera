import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Domera - Compra propiedades en pozo sin comisiones',
  description:
    'Invertí en propiedades en pozo sin comisiones inmobiliarias. Más de 235 propiedades disponibles con 6 años de experiencia.',
  keywords:
    'propiedades, pozo, inversión, inmobiliaria, sin comisiones, Argentina',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
