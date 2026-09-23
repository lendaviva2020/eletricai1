import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'EletricAI | Sistema Operacional Industrial com IA (NBR 5410 / IEC 61131-3)',
  description: 'Plataforma SaaS multi-tenant que unifica engenharia elétrica (NBR 5410, NBR 14039, NR-10), automação IEC 61131-3, PLC, SCADA e Digital Twin com IA generativa e shared tag engine.',
  openGraph: {
    title: 'EletricAI | Sistema Operacional Industrial com IA',
    description: 'Plataforma SaaS multi-tenant de engenharia elétrica e automação industrial brasileira.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EletricAI | Sistema Operacional Industrial com IA',
    description: 'Plataforma SaaS multi-tenant de engenharia elétrica e automação industrial brasileira.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
