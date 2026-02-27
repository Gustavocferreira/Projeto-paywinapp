import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PayWinApp - Finanças Pessoais',
  description: 'Organize suas finanças de forma simples e inteligente com ajuda de um Agente Financeiro',
  keywords: ['finanças pessoais', 'gestão financeira', 'economia', 'metas financeiras'],
  authors: [{ name: 'PayWinApp Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        {/* Skip to main content link (acessibilidade) */}
        <a href="#main-content" className="skip-to-main">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
