import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/* The monospace the product never actually had: `--font-mono` pointed at a
   Geist variable nothing loaded, so every `font-mono` in the app quietly fell
   back to Poppins — which is why a tool call's payload read as prose rather
   than as the code it is. */
const robotoMono = Roboto_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TARS",
  description: "Tars Virtual Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${robotoMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
