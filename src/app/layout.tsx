// src/app/layout.tsx
import "@/styles/globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Bandroom",
  description: "Welcome to Bandroom!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
