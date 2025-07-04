import "../styles/globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { JSX } from "react";

import ReactQueryProvider from "@/providers/react-query-provider";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal AI Chatbot",
  description: "A Docker-first personal AI chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className={`${roboto.variable} antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
