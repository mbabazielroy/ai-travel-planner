import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Travel Planner",
  description:
    "Generate, save, and share smart itineraries powered by OpenAI and Firebase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased text-slate-50 selection:bg-iris/30`}
      >
        {children}
      </body>
    </html>
  );
}
