'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface AnnouncementItem {
  id: string;
  name: string;
  jobType: string;
  capacity: number;
  publishStatus: string;
  computedRecruitStatus: string;
  recruitStartDate: string;
  recruitEndDate: string;
  viewCount: number;
  program: { id: string; name: string } | null;
  createdAt: string;
}

const RECRUIT_FILTERS = [
  { value: '', label: '전체' },
  { value: 'upcoming', label: '모집예정' },
  { value: 'recruiting', label: '모집중' },
  { value: 'closed', label: '모집종료' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const fetchAnnouncements = useCallback(async () => {
    try {
      const query = filter ? `?recruitStatus=${filter}` : '';
      const data = await api<AnnouncementItem[]>(
        `/admin/announcements${query}`,
      );
      setAnnouncements(data);
    } catch {
      toast('공고 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  function handleDelete(item: AnnouncementItem) {
    setConfirm({
      open: true,
      title: '공고 삭제',
      message: `"${item.name}" 공고를 삭제하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/announcements/${item.id}`, { method: 'DELETE' });
          toast('삭제되었습니다.');
          fetchAnnouncements();
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

  async function handleDuplicate(item: AnnouncementItem) {
    try {
      await api(`/admin/announcements/${item.id}/duplicate`, {
        method: 'POST',
      });
      toast('공고가 복제되었습니다.');
      fetchAnnouncements();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '복제에 실패했습니다.',
        'error',
      );
    }
  }

  function recruitStatusLabel(status: string) {
    const labels: Record<string, string> = {
      upcoming: '모집예정',
      recruiting: '모집중',
      closed: '모집종료',
    };
    return labels[status] || status;
  }

  function recruitBadge(status: string) {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      recruiting: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0a1432]">
          공고 관리{' '}
          <span className="text-base font-normal text-gray-500">
            총 {announcements.length}건
          </span>
        </h1>
        <Link
          href="/announcements/new"
          className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
        >
          새 공고
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {RECRUIT_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              setLoading(true);
            }}
            className={`px-3 py-1.5 text-sm font-medium ${
              filter === f.value
                ? 'bg-[#0a1432] text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">공고명</th>
              <th className="px-4 py-3 font-medium text-gray-700">프로그램</th>
              <th className="px-4 py-3 font-medium text-gray-700">직종</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집인원</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">게시상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집기간</th>
              <th className="px-4 py-3 font-medium text-gray-700">조회수</th>
              <th className="px-4 py-3 font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {announcements.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/announcements/${item.id}/edit`}
                    className="text-[#0a1432] underline-offset-2 hover:underline"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.program?.name ?? '-'}
                </td>
                <td className="px-4 py-3">{item.jobType}</td>
                <td className="px-4 py-3">{item.capacity}명</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${recruitBadge(item.computedRecruitStatus)}`}
                  >
                    {recruitStatusLabel(item.computedRecruitStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${item.publishStatus === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {item.publishStatus === 'published' ? '게시' : '비게시'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {formatDate(item.recruitStartDate)} ~{' '}
                  {formatDate(item.recruitEndDate)}
                </td>
                <td className="px-4 py-3">{item.viewCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      복제
                    </button>
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
            {announcements.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  등록된 공고가 없습니다.
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
