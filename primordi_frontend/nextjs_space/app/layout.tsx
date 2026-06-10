import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Primor | Couro Artesanal',
  description: 'Produtos de couro artesanais feitos à mão com dedicação e qualidade excepcional.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Primor | Couro Artesanal',
    description: 'Produtos de couro artesanais feitos à mão com dedicação e qualidade excepcional.',
    images: ['https://www.primorcouro.com.br/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Primor | Couro Artesanal',
    description: 'Produtos de couro artesanais feitos à mão com dedicação e qualidade excepcional.',
    images: ['https://www.primorcouro.com.br/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={`${dmSans.variable} ${cormorant.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
