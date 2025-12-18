import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIGenda - SaaS de Agendamento',
  description: 'Sistema profissional de agendamento online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
