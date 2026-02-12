'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api<AdminUser>('/admin/auth/me')
      .then(setUser)
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/programs', label: '프로그램 관리' },
    { href: '/announcements', label: '공고 관리' },
    { href: '/applications', label: '지원서 관리' },
    { href: '/talents', label: '인재 관리' },
    { href: '/contents', label: '콘텐츠 관리' },
    { href: '/accounts', label: '계정 관리' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/accounts" className="text-lg font-bold text-gray-900">
              비커넥트랩 관리자
            </Link>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathname.startsWith(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <span className="text-sm text-gray-600">{user.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
