// src/app/layout.tsx
import "@/styles/globals.css";

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
