import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Agendamento Online',
  description: 'Agende seu horário de forma rápida e fácil',
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased bg-slate-950 text-white">
        {children}
      </body>
    </html>
  )
}
