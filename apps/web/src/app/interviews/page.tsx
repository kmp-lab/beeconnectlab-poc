'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface InterviewItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<InterviewItem[]>('/interviews')
      .then(setInterviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/announcements" className="text-xl font-bold text-navy">
            비커넥트랩
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              소개
            </Link>
            <Link
              href="/announcements"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              공고
            </Link>
            <Link
              href="/interviews"
              className="text-sm font-bold text-navy hover:opacity-70"
            >
              인터뷰
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-navy">인터뷰</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">불러오는 중...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">등록된 인터뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {item.thumbnailUrl ? (
                    <img
                      src={
                        item.thumbnailUrl.startsWith('http')
                          ? item.thumbnailUrl
                          : `${API_BASE}${item.thumbnailUrl}`
                      }
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-base font-bold text-navy group-hover:underline">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
