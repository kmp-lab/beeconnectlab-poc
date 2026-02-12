'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  profileImageUrl: string | null;
  residence: string | null;
  activityStatus: string;
  interestRegions: string[] | null;
  desiredJob: string | null;
  skills: string | null;
  marketingConsent: boolean;
  createdAt: string;
}

interface ApplicationItem {
  id: string;
  announcementName: string;
  jobType: string;
  region: string;
  createdAt: string;
  fileUrl1: string;
  fileName1: string;
  fileUrl2: string | null;
  fileName2: string | null;
  status: string;
}

interface ActivityItem {
  id: string;
  programName: string;
  region: string;
  activityStartDate: string | null;
  activityEndDate: string | null;
  participationStatus: string;
}

function genderLabel(g: string) {
  return g === 'male' ? '남성' : g === 'female' ? '여성' : g;
}

function calcAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    submitted: '지원완료',
    first_pass: '1차 합격',
    final_pass: '최종 합격',
    rejected: '탈락',
  };
  return map[status] ?? status;
}

function participationLabel(status: string) {
  const map: Record<string, string> = {
    upcoming: '예정',
    active: '활동중',
    period_ended: '기간종료',
    completed: '수료',
    dropped: '중도포기',
  };
  return map[status] ?? status;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR');
}

export default function MypagePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<UserProfile>('/users/me'),
      api<ApplicationItem[]>('/users/me/applications'),
      api<ActivityItem[]>('/users/me/activities'),
    ])
      .then(([p, apps, acts]) => {
        setProfile(p);
        setApplications(apps);
        setActivities(acts);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?returnUrl=/mypage');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/announcements" className="text-xl font-bold text-navy">
            비커넥트랩
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/interviews"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              인터뷰
            </Link>
            <Link
              href="/mypage"
              className="text-sm font-bold text-navy hover:opacity-70"
            >
              마이페이지
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-navy">마이페이지</h1>
          <Link
            href="/mypage/edit"
            className="bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light"
          >
            내 정보 수정
          </Link>
        </div>

        {/* Profile Info */}
        <section className="mb-8 border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-navy">프로필 정보</h2>
          <div className="flex gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-gray-100">
              {profile.profileImageUrl ? (
                <img
                  src={
                    profile.profileImageUrl.startsWith('http')
                      ? profile.profileImageUrl
                      : `${API_BASE}${profile.profileImageUrl}`
                  }
                  alt="프로필"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-400">
                  {profile.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500">이름</span>
                <p className="font-medium text-navy">{profile.name}</p>
              </div>
              <div>
                <span className="text-gray-500">이메일</span>
                <p className="font-medium text-navy">{profile.email}</p>
              </div>
              <div>
                <span className="text-gray-500">연락처</span>
                <p className="font-medium text-navy">{profile.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">성별</span>
                <p className="font-medium text-navy">
                  {genderLabel(profile.gender)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">나이</span>
                <p className="font-medium text-navy">
                  {calcAge(profile.birthDate)}세
                </p>
              </div>
              <div>
                <span className="text-gray-500">거주지</span>
                <p className="font-medium text-navy">
                  {profile.residence || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">활동상태</span>
                <p className="font-medium text-navy">
                  {profile.activityStatus || '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job & Skills */}
        <section className="mb-8 border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-navy">직무 및 역량</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-gray-500">관심지역</span>
              <p className="font-medium text-navy">
                {profile.interestRegions?.join(', ') || '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">희망직무</span>
              <p className="font-medium text-navy">
                {profile.desiredJob || '-'}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">보유역량</span>
              <p className="font-medium text-navy">{profile.skills || '-'}</p>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="mb-8 border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-navy">계정 정보</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-gray-500">가입일시</span>
              <p className="font-medium text-navy">
                {formatDate(profile.createdAt)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">마케팅 동의</span>
              <p className="font-medium text-navy">
                {profile.marketingConsent ? '동의' : '미동의'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={async () => {
                await api('/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </section>

        {/* Applications */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-navy">공고 지원 이력</h2>
          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    공고명
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">직무</th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    활동지역
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    지원일자
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    첨부파일1
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    첨부파일2
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    지원상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{app.announcementName}</td>
                    <td className="px-4 py-3">{app.jobType}</td>
                    <td className="px-4 py-3">{app.region}</td>
                    <td className="px-4 py-3">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`${API_BASE}${app.fileUrl1}`}
                        download={app.fileName1}
                        className="text-navy underline-offset-2 hover:underline"
                      >
                        {app.fileName1}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {app.fileUrl2 ? (
                        <a
                          href={`${API_BASE}${app.fileUrl2}`}
                          download={app.fileName2 ?? undefined}
                          className="text-navy underline-offset-2 hover:underline"
                        >
                          {app.fileName2}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">{statusLabel(app.status)}</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      지원 이력이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Activities */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-navy">참여 활동</h2>
          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    프로그램명
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    활동지역
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    활동기간
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    참여상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{act.programName}</td>
                    <td className="px-4 py-3">{act.region}</td>
                    <td className="px-4 py-3">
                      {act.activityStartDate && act.activityEndDate
                        ? `${formatDate(act.activityStartDate)} ~ ${formatDate(act.activityEndDate)}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {participationLabel(act.participationStatus)}
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      참여 활동이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
