'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface InterviewItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  link: string;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function ContentsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const fetchInterviews = useCallback(async () => {
    try {
      const data = await api<InterviewItem[]>('/admin/contents');
      setInterviews(data);
    } catch {
      toast('인터뷰 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  function handleDelete(item: InterviewItem) {
    setConfirm({
      open: true,
      title: '인터뷰 삭제',
      message: `"${item.title}" 인터뷰를 삭제하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/contents/${item.id}`, { method: 'DELETE' });
          toast('삭제되었습니다.');
          fetchInterviews();
        } catch (err) {
          toast(
            err instanceof ApiError ? err.message : '삭제에 실패했습니다.',
            'error',
          );
        }
        setConfirm((prev) => ({ ...prev, open: false }));
      },
    });
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0a1432]">
          콘텐츠 관리{' '}
          <span className="text-base font-normal text-gray-500">
            총 {interviews.length}건
          </span>
        </h1>
        <Link
          href="/contents/new"
          className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
        >
          새 인터뷰
        </Link>
      </div>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700 w-16">
                썸네일
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">제목</th>
              <th className="px-4 py-3 font-medium text-gray-700">설명</th>
              <th className="px-4 py-3 font-medium text-gray-700">등록일시</th>
              <th className="px-4 py-3 font-medium text-gray-700">등록자</th>
              <th className="px-4 py-3 font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interviews.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="h-10 w-14 overflow-hidden bg-gray-100">
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
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        -
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/contents/${item.id}/edit`}
                    className="text-[#0a1432] underline-offset-2 hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                  {item.description}
                </td>
                <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">{item.createdBy?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/contents/${item.id}/edit`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {interviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  등록된 인터뷰가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.action}
        onCancel={() => setConfirm((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
