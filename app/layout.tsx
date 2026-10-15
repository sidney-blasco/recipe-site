import type { Metadata } from "next";
import { Fraunces, Homemade_Apple, Libre_Caslon_Text } from "next/font/google";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Placeholder handwriting; will be swapped for a custom font or card scans.
const hand = Homemade_Apple({
  variable: "--font-homemade",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Convivial",
  description: "A personal recipe collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${caslon.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ground text-ink font-body">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
