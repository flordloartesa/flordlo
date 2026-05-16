import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulário de inscrição - Meditt",
  description: "Formulário de inscrição para eventos.",
};

export default function InscricaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}