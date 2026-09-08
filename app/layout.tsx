import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rayain — Undangan digital yang terasa personal",
  description: "Kelola undangan digital, tamu, dan RSVP dalam satu ruang yang hangat.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
