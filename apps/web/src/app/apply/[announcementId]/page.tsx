'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
}

interface AnnouncementBrief {
  id: string;
  name: string;
  computedRecruitStatus: string;
  publishStatus: string;
}

interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
}

const REFERRAL_OPTIONS = [
  '비커넥트랩 홈페이지',
  'SNS (인스타그램, 페이스북 등)',
  '지인 소개',
  '대학교/학교 공지',
  '뉴스/미디어',
  '기타',
];

const inputClass =
  'mt-1 block w-full border border-gray-300 px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-navy focus:outline-none';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.announcementId as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementBrief | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // File states
  const [file1Uploading, setFile1Uploading] = useState(false);
  const [file1Result, setFile1Result] = useState<FileUploadResult | null>(null);

  const [file2Uploading, setFile2Uploading] = useState(false);
  const [file2Result, setFile2Result] = useState<FileUploadResult | null>(null);

  const [referralSource, setReferralSource] = useState('');

  useEffect(() => {
    Promise.all([
      api<UserProfile>('/auth/me'),
      api<AnnouncementBrief>(`/announcements/${announcementId}`),
    ])
      .then(([userRes, announcementRes]) => {
        setUser(userRes);
        setAnnouncement(announcementRes);
      })
      .catch(() => {
        // If not authenticated or announcement not found, redirect
        router.push(`/login?returnUrl=/announcements/${announcementId}`);
      })
      .finally(() => setLoading(false));
  }, [announcementId, router]);

  async function uploadFile(
    file: File,
    setUploading: (v: boolean) => void,
    setResult: (v: FileUploadResult | null) => void,
  ) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/user-files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message ?? 'Upload failed');
      }

      const result: FileUploadResult = await res.json();
      setResult(result);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : '파일 업로드에 실패했습니다.',
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFile1Change(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFile1Result(null);
      uploadFile(file, setFile1Uploading, setFile1Result);
    }
  }

  function handleFile2Change(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFile2Result(null);
      uploadFile(file, setFile2Uploading, setFile2Result);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !file1Result) return;

    setSubmitting(true);
    setServerError('');

    try {
      await api('/applications', {
        method: 'POST',
        body: {
          announcementId,
          applicantName: user.name,
          applicantEmail: user.email,
          applicantPhone: user.phone,
          fileUrl1: file1Result.url,
          fileName1: file1Result.filename,
          fileUrl2: file2Result?.url,
          fileName2: file2Result?.filename,
          referralSource: referralSource || undefined,
        },
      });
      router.push(`/apply/${announcementId}/complete`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  if (!user || !announcement) {
    return null;
  }

  const canSubmit =
    !submitting && !file1Uploading && !file2Uploading && !!file1Result;

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/announcements" className="text-xl font-bold text-navy">
            비커넥트랩
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href={`/announcements/${announcementId}`}
          className="mb-6 inline-block text-sm text-gray-500 hover:text-navy"
        >
          &larr; 공고로 돌아가기
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-navy">지원서 작성</h1>
        <p className="mb-8 text-sm text-gray-500">{announcement.name}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile info (read-only) */}
          <section className="space-y-4">
            <h2 className="border-b-2 border-navy pb-2 text-base font-bold text-navy">
              기본 정보
            </h2>

            <div>
              <label className="block text-sm font-medium text-navy">
                이름
              </label>
              <input
                type="text"
                value={user.name}
                readOnly
                className={`${inputClass} bg-gray-50`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">
                이메일
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className={`${inputClass} bg-gray-50`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">
                연락처
              </label>
              <input
                type="tel"
                value={user.phone}
                readOnly
                className={`${inputClass} bg-gray-50`}
              />
            </div>
          </section>

          {/* File upload */}
          <section className="space-y-4">
            <h2 className="border-b-2 border-navy pb-2 text-base font-bold text-navy">
              파일 첨부
            </h2>

            <div>
              <label className="block text-sm font-medium text-navy">
                첨부파일 1 <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-gray-400">
                PDF, DOC, DOCX, HWP (최대 10MB)
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp"
                onChange={handleFile1Change}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:border file:border-navy file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy hover:file:bg-gray-50"
              />
              {file1Uploading && (
                <p className="mt-1 text-xs text-gray-400">업로드 중...</p>
              )}
              {file1Result && (
                <p className="mt-1 text-xs text-green-600">
                  {file1Result.filename} 업로드 완료
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">
                첨부파일 2{' '}
                <span className="text-sm font-normal text-gray-400">
                  (선택)
                </span>
              </label>
              <p className="mb-2 text-xs text-gray-400">
                PDF, DOC, DOCX, HWP (최대 10MB)
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp"
                onChange={handleFile2Change}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:border file:border-navy file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy hover:file:bg-gray-50"
              />
              {file2Uploading && (
                <p className="mt-1 text-xs text-gray-400">업로드 중...</p>
              )}
              {file2Result && (
                <p className="mt-1 text-xs text-green-600">
                  {file2Result.filename} 업로드 완료
                </p>
              )}
            </div>
          </section>

          {/* Referral source */}
          <section className="space-y-4">
            <h2 className="border-b border-gray-300 pb-2 text-base font-bold text-navy">
              추가 정보{' '}
              <span className="text-sm font-normal text-gray-400">(선택)</span>
            </h2>

            <div>
              <label className="block text-sm font-medium text-navy">
                아웃바운더 인지 경로
              </label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className={inputClass}
              >
                <option value="">선택해 주세요</option>
                {REFERRAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-lime px-4 py-3.5 text-sm font-bold text-navy transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '제출하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
