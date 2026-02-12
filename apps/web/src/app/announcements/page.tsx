'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AnnouncementListItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  recruitStartDate: string;
  recruitEndDate: string;
  computedRecruitStatus: 'upcoming' | 'recruiting' | 'closed';
  createdAt: string;
  program: {
    regionSido: string;
    regionSigungu: string | null;
    benefits: string[] | null;
  };
}

function getDday(recruitEndDate: string): string {
  const end = new Date(recruitEndDate);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return '마감';
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
}

function getRecruitBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'recruiting':
      return {
        label: '모집중',
        className: 'bg-lime text-navy',
      };
    case 'upcoming':
      return {
        label: '모집예정',
        className: 'bg-navy text-white',
      };
    case 'closed':
      return {
        label: '모집완료',
        className: 'bg-gray-400 text-white',
      };
    default:
      return {
        label: status,
        className: 'bg-gray-300 text-gray-700',
      };
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnnouncementListItem[]>('/announcements')
      .then(setAnnouncements)
      .catch(() => {
        // silently handle
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/announcements" className="text-xl font-bold text-navy">
            비커넥트랩
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-navy hover:opacity-70"
          >
            로그인
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-navy">공고 목록</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">불러오는 중...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">등록된 공고가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((a) => {
              const badge = getRecruitBadge(a.computedRecruitStatus);
              const dday = getDday(a.recruitEndDate);
              const region = a.program.regionSigungu
                ? `${a.program.regionSido} ${a.program.regionSigungu}`
                : a.program.regionSido;

              return (
                <Link
                  key={a.id}
                  href={`/announcements/${a.id}`}
                  className="group block border border-gray-200 transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {a.thumbnailUrl ? (
                      <img
                        src={
                          a.thumbnailUrl.startsWith('http')
                            ? a.thumbnailUrl
                            : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}${a.thumbnailUrl}`
                        }
                        alt={a.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-bold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {a.computedRecruitStatus !== 'closed' && (
                      <span className="absolute right-3 top-3 bg-navy px-2.5 py-1 text-xs font-bold text-white">
                        {dday}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold text-navy group-hover:underline">
                      {a.name}
                    </h2>
                    <p className="mt-1.5 text-sm text-gray-500">{region}</p>
                    {a.program.benefits && a.program.benefits.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.program.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="border border-gray-300 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
