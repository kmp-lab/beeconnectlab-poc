'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function NewInterviewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    thumbnailUrl: '',
    title: '',
    description: '',
    link: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await api('/admin/contents', {
        method: 'POST',
        body: form,
      });
      toast('인터뷰가 등록되었습니다.');
      router.push('/contents');
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '등록에 실패했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-[#0a1432]">새 인터뷰 등록</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <section className="space-y-4 border border-gray-200 bg-white p-6">
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
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={300}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              placeholder="인터뷰 설명을 작성해주세요..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              링크 (브런치 URL 등) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              required
              maxLength={500}
              placeholder="https://brunch.co.kr/..."
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
            onClick={() => router.push('/contents')}
            className="border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </>
  );
}
