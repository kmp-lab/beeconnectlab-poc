'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AnnouncementDetail {
  id: string;
  name: string;
  thumbnailUrl: string;
  detailContent: string;
  recruitStartDate: string;
  recruitEndDate: string;
  publishStatus: 'published' | 'unpublished';
  computedRecruitStatus: 'upcoming' | 'recruiting' | 'closed';
  scheduleResult: string | null;
  scheduleTraining: string | null;
  scheduleOnsite: string | null;
  viewCount: number;
  createdAt: string;
  program: {
    name: string;
    host: string;
    organizer: string;
    regionSido: string;
    regionSigungu: string | null;
    activityStartDate: string;
    activityEndDate: string;
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<AnnouncementDetail>(`/announcements/${id}`)
      .then(setAnnouncement)
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleApply() {
    // Try to check auth status by calling /auth/me
    api<{ id: string }>('/auth/me')
      .then(() => {
        // User is logged in
        router.push(`/apply/${id}`);
      })
      .catch(() => {
        // Not logged in, redirect to login with returnUrl
        router.push(`/login?returnUrl=/announcements/${id}`);
      });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  if (notFound || !announcement) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <p className="text-lg text-gray-500">공고를 찾을 수 없습니다.</p>
        <Link
          href="/announcements"
          className="mt-4 text-sm font-bold text-navy hover:underline"
        >
          목록으로 돌아가기
        </Link>
      </main>
    );
  }

  const dday = getDday(announcement.recruitEndDate);
  const region = announcement.program.regionSigungu
    ? `${announcement.program.regionSido} ${announcement.program.regionSigungu}`
    : announcement.program.regionSido;
  const canApply =
    announcement.publishStatus === 'published' &&
    announcement.computedRecruitStatus === 'recruiting';

  const scheduleItems: { label: string; value: string }[] = [];
  if (announcement.scheduleResult) {
    scheduleItems.push({
      label: '결과발표',
      value: announcement.scheduleResult,
    });
  }
  if (announcement.scheduleTraining) {
    scheduleItems.push({
      label: '사전교육',
      value: announcement.scheduleTraining,
    });
  }
  if (announcement.scheduleOnsite) {
    scheduleItems.push({
      label: '현장체류',
      value: announcement.scheduleOnsite,
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
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

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/announcements"
          className="mb-6 inline-block text-sm text-gray-500 hover:text-navy"
        >
          &larr; 공고 목록
        </Link>

        {/* Title + D-day */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <span className="bg-lime px-2.5 py-1 text-xs font-bold text-navy">
              {dday}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy">{announcement.name}</h1>
        </div>

        {/* Info table */}
        <section className="mb-8 border-t-2 border-navy">
          <dl className="divide-y divide-gray-200">
            <div className="flex py-3">
              <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                주최
              </dt>
              <dd className="text-sm text-gray-700">
                {announcement.program.host}
              </dd>
            </div>
            <div className="flex py-3">
              <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                주관
              </dt>
              <dd className="text-sm text-gray-700">
                {announcement.program.organizer}
              </dd>
            </div>
            <div className="flex py-3">
              <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                활동지역
              </dt>
              <dd className="text-sm text-gray-700">{region}</dd>
            </div>
            <div className="flex py-3">
              <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                활동기간
              </dt>
              <dd className="text-sm text-gray-700">
                {formatDate(announcement.program.activityStartDate)} ~{' '}
                {formatDate(announcement.program.activityEndDate)}
              </dd>
            </div>
            <div className="flex py-3">
              <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                모집기간
              </dt>
              <dd className="text-sm text-gray-700">
                {formatDate(announcement.recruitStartDate)} ~{' '}
                {formatDate(announcement.recruitEndDate)}
              </dd>
            </div>
            {announcement.program.benefits &&
              announcement.program.benefits.length > 0 && (
                <div className="flex py-3">
                  <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                    혜택정보
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {announcement.program.benefits.map((b) => (
                      <span
                        key={b}
                        className="border border-gray-300 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {b}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
          </dl>
        </section>

        {/* Detail content (HTML) */}
        <section className="mb-8">
          <h2 className="mb-4 border-b-2 border-navy pb-2 text-base font-bold text-navy">
            상세내용
          </h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: announcement.detailContent }}
          />
        </section>

        {/* Schedule */}
        {scheduleItems.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 border-b-2 border-navy pb-2 text-base font-bold text-navy">
              이후 일정
            </h2>
            <dl className="divide-y divide-gray-200">
              {scheduleItems.map((item) => (
                <div key={item.label} className="flex py-3">
                  <dt className="w-28 shrink-0 text-sm font-bold text-navy">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-gray-700">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Apply button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="w-full bg-lime px-4 py-3.5 text-sm font-bold text-navy transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {canApply ? '지원하기' : '지원 불가'}
          </button>
          {!canApply && (
            <p className="mt-2 text-center text-xs text-gray-400">
              {announcement.computedRecruitStatus === 'closed'
                ? '모집이 종료되었습니다.'
                : announcement.computedRecruitStatus === 'upcoming'
                  ? '아직 모집이 시작되지 않았습니다.'
                  : '현재 지원할 수 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
