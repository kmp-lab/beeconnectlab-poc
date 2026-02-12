'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AnnouncementBrief {
  id: string;
  name: string;
}

export default function ApplyCompletePage() {
  const params = useParams();
  const announcementId = params.announcementId as string;
  const [announcementName, setAnnouncementName] = useState('');

  useEffect(() => {
    if (!announcementId) return;
    api<AnnouncementBrief>(`/announcements/${announcementId}`)
      .then((a) => setAnnouncementName(a.name))
      .catch(() => {
        // silently handle
      });
  }, [announcementId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-lime">
            <svg
              className="h-8 w-8 text-navy"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy">
            지원이 완료되었습니다
          </h1>
          {announcementName && (
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-bold text-navy">{announcementName}</span>에
              지원서가 성공적으로 접수되었습니다.
            </p>
          )}
          <p className="mt-2 text-sm text-gray-400">
            지원 결과는 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/mypage"
            className="block w-full bg-navy px-4 py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            접수 확인하기
          </Link>
          <Link
            href="/announcements"
            className="block w-full border border-navy px-4 py-3.5 text-center text-sm font-bold text-navy transition-opacity hover:opacity-70"
          >
            다른 프로그램 둘러보기
          </Link>
        </div>
      </div>
    </main>
  );
}
