'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ProgramOption {
  id: string;
  name: string;
}

export default function NewAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProgramId = searchParams.get('programId') ?? '';

  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    programId: preselectedProgramId,
    name: '',
    jobType: '',
    capacity: 1,
    thumbnailUrl: '',
    detailContent: '',
    publishStatus: 'unpublished',
    recruitStartDate: '',
    recruitEndDate: '',
    scheduleResult: '',
    scheduleTraining: '',
    scheduleOnsite: '',
  });

  useEffect(() => {
    api<ProgramOption[]>('/admin/programs')
      .then(setPrograms)
      .catch(() => {});
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/files/upload`, {
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
      setForm((prev) => ({ ...prev, thumbnailUrl: data.url }));
      toast('썸네일이 업로드되었습니다.');
    } catch (err) {
      toast(
        err instanceof Error ? err.message : '업로드에 실패했습니다.',
        'error',
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.thumbnailUrl) {
      toast('썸네일 이미지를 업로드해주세요.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api('/admin/announcements', {
        method: 'POST',
        body: {
          ...form,
          capacity: Number(form.capacity),
          scheduleResult: form.scheduleResult || null,
          scheduleTraining: form.scheduleTraining || null,
          scheduleOnsite: form.scheduleOnsite || null,
        },
      });
      toast('공고가 생성되었습니다.');
      router.push('/announcements');
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '생성에 실패했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-[#0a1432]">새 공고 등록</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Section 1: 모집 관리 */}
        <section className="space-y-4 border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-[#0a1432]">모집 관리</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              프로그램 <span className="text-red-500">*</span>
            </label>
            <select
              name="programId"
              value={form.programId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            >
              <option value="">선택</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              공고명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={300}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                직종 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                모집인원 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
                min={1}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                모집 시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="recruitStartDate"
                value={form.recruitStartDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                모집 종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="recruitEndDate"
                value={form.recruitEndDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              게시 상태
            </label>
            <select
              name="publishStatus"
              value={form.publishStatus}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            >
              <option value="unpublished">비게시</option>
              <option value="published">게시</option>
            </select>
          </div>
        </section>

        {/* Section 2: 공고 내용 */}
        <section className="space-y-4 border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-[#0a1432]">공고 내용</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              썸네일 이미지 <span className="text-red-500">*</span>
            </label>
            {form.thumbnailUrl && (
              <div className="mb-2">
                <img
                  src={`${API_BASE}${form.thumbnailUrl}`}
                  alt="썸네일 미리보기"
                  className="h-32 w-auto border border-gray-200 object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="text-sm text-gray-600"
            />
            {uploading && (
              <p className="mt-1 text-xs text-gray-500">업로드 중...</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              상세 내용 <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={form.detailContent}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, detailContent: html }))
              }
            />
          </div>
        </section>

        {/* Section 3: 이후 일정 */}
        <section className="space-y-4 border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-[#0a1432]">이후 일정</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              결과 발표
            </label>
            <input
              type="text"
              name="scheduleResult"
              value={form.scheduleResult}
              onChange={handleChange}
              maxLength={200}
              placeholder="예: 2026년 3월 15일"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              사전 교육
            </label>
            <input
              type="text"
              name="scheduleTraining"
              value={form.scheduleTraining}
              onChange={handleChange}
              maxLength={200}
              placeholder="예: 2026년 3월 20일 ~ 3월 25일"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              현장 배치
            </label>
            <input
              type="text"
              name="scheduleOnsite"
              value={form.scheduleOnsite}
              onChange={handleChange}
              maxLength={200}
              placeholder="예: 2026년 4월 1일"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0a1432] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/announcements')}
            className="border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </>
  );
}
