import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import '../styles/globals.css';
import { SiteHeader } from '../components/SiteHeader';
import { portfolioData } from '../data/portfolioData';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: `${portfolioData.personal.name} | ${portfolioData.personal.role}`,
  description: `Meet ${portfolioData.personal.name}, ${portfolioData.personal.role} in ${portfolioData.personal.location}. Explore RAG and LLM projects, experience, and full-stack web applications.`,
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${spaceGrotesk.className} fJfFLG_variable scroll-smooth`}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/font3.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('portfolio-theme');
                  if (saved) {
                    document.documentElement.dataset.theme = saved;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[var(--sc-ink)] selection:text-[var(--sc-canvas)]">
        <SiteHeader />
        <main id="main" className="flex-grow">
          {children}
        </main>
        <script src="/scrollcraft.js" async />
      </body>
    </html>
  );
}

