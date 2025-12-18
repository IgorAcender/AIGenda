import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

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
      <body>
        <Navbar isAuthenticated={true} />
        {children}
      </body>
    </html>
  );
}
