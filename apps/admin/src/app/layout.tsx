import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: '비커넥트랩 관리자',
  description: '비커넥트랩 관리자 포털',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
