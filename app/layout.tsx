import type { Metadata, Viewport } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flux Meet - Cybernetic Anonymous Chats",
  description: "Secure, verified anonymous matchmaking and chats.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "overlays-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0a0a16] text-[#eeeeff] cyber-grid">
        {children}
      </body>
    </html>
  );
}
