import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

// Premium Typography setup
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

// Professional SEO & Link Sharing Metadata
export const metadata: Metadata = {
  title: "FlowOptimizer | Traffic Matrix Engine",
  description: "A high-fidelity urban traffic modeling and simulation tool. Computes mass-conserved traffic flow using applied linear algebra and the Moore-Penrose Pseudo-inverse.",
  authors: [{ name: "Ashish Singh" }],
  keywords: ["Traffic Optimization", "Linear Algebra", "React Flow", "Urban Planning", "SVD", "Moore-Penrose"],
  openGraph: {
    title: "FlowOptimizer | Traffic Matrix Engine",
    description: "Simulate and optimize urban traffic flow with pure linear algebra.",
    type: "website",
    siteName: "FlowOptimizer Engine"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 flex flex-col min-h-screen`}>
        {/* Sonner Toast Provider configured for premium aesthetics */}
        <Toaster position="top-center" richColors theme="light" />
        {children}
      </body>
    </html>
  );
}