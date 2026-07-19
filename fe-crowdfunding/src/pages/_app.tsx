import { AuthProvider } from "@/components/AuthContent";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google"; // 1. Import font

// 2. Konfigurasi font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter", // Membuat CSS variable untuk font
});

import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    // 3. Bungkus semuanya dengan tag <main> yang sudah diberi kelas font
    <main className={`${inter.variable} font-sans`}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </main>
  );
}