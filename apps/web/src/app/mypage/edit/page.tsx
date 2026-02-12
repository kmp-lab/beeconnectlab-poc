'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { toast, ToastProvider } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { REGIONS } from '@/lib/regions';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const ACTIVITY_STATUSES = ['구직중', '재학중', '재직중', '기타'];

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
  residence: string | null;
  activityStatus: string;
  interestRegions: string[] | null;
  desiredJob: string | null;
  skills: string | null;
  marketingConsent: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    profileImageUrl: '',
    residence: '',
    activityStatus: '',
    interestRegions: [] as string[],
    desiredJob: '',
    skills: '',
    marketingConsent: false,
  });

  useEffect(() => {
    api<UserProfile>('/users/me')
      .then((p) => {
        setForm({
          name: p.name,
          phone: p.phone,
          profileImageUrl: p.profileImageUrl ?? '',
          residence: p.residence ?? '',
          activityStatus: p.activityStatus ?? '',
          interestRegions: p.interestRegions ?? [],
          desiredJob: p.desiredJob ?? '',
          skills: p.skills ?? '',
          marketingConsent: p.marketingConsent,
        });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login?returnUrl=/mypage/edit');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleRegion(region: string) {
    setForm((prev) => ({
      ...prev,
      interestRegions: prev.interestRegions.includes(region)
        ? prev.interestRegions.filter((r) => r !== region)
        : [...prev.interestRegions, region],
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/files/user-upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ message: 'Upload failed' }));
        throw new Error(data.message);
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, profileImageUrl: data.url }));
      toast('이미지가 업로드되었습니다.');
    } catch (err) {
      toast(
        err instanceof Error ? err.message : '업로드에 실패했습니다.',
        'error',
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: {
          name: form.name,
          phone: form.phone,
          profileImageUrl: form.profileImageUrl || null,
          residence: form.residence || null,
          activityStatus: form.activityStatus,
          interestRegions:
            form.interestRegions.length > 0 ? form.interestRegions : null,
          desiredJob: form.desiredJob || null,
          skills: form.skills || null,
          marketingConsent: form.marketingConsent,
        },
      });
      toast('저장되었습니다.');
      router.push('/mypage');
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '저장에 실패했습니다.',
        'error',
      );
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

  return (
    <ToastProvider>
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

        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold text-navy">내 정보 수정</h1>

          <div className="space-y-6">
            {/* Profile Image */}
            <section className="border border-gray-200 bg-white p-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                프로필 이미지
              </label>
              {form.profileImageUrl && (
                <div className="mb-2">
                  <img
                    src={
                      form.profileImageUrl.startsWith('http')
                        ? form.profileImageUrl
                        : `${API_BASE}${form.profileImageUrl}`
                    }
                    alt="프로필 미리보기"
                    className="h-24 w-24 border border-gray-200 object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="text-sm text-gray-600"
              />
              {uploading && (
                <p className="mt-1 text-xs text-gray-500">업로드 중...</p>
              )}
            </section>

            {/* Basic Info */}
            <section className="space-y-4 border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-navy">기본 정보</h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  거주지
                </label>
                <input
                  type="text"
                  name="residence"
                  value={form.residence}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  활동상태
                </label>
                <select
                  name="activityStatus"
                  value={form.activityStatus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                >
                  <option value="">선택</option>
                  {ACTIVITY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Job & Skills */}
            <section className="space-y-4 border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-navy">직무 및 역량</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  관심지역 (복수선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`px-3 py-1.5 text-sm font-medium ${
                        form.interestRegions.includes(region)
                          ? 'bg-navy text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  희망직무
                </label>
                <input
                  type="text"
                  name="desiredJob"
                  value={form.desiredJob}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  보유역량
                </label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>
            </section>

            {/* Marketing */}
            <section className="border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  마케팅 동의
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      marketingConsent: !prev.marketingConsent,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center transition-colors ${
                    form.marketingConsent ? 'bg-navy' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 bg-white transition-transform ${
                      form.marketingConsent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="bg-navy px-6 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/mypage')}
                className="border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="정보 수정"
          message="변경사항을 저장하시겠습니까?"
          onConfirm={handleSave}
          onCancel={() => setConfirmOpen(false)}
        />
      </main>
    </ToastProvider>
  );
}
