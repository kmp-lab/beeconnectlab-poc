import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '비커넥트랩',
  description: '비커넥트랩 청년 포털',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
