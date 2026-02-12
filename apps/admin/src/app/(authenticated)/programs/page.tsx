'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ProgramItem {
  id: string;
  name: string;
  host: string;
  organizer: string;
  activityStartDate: string;
  activityEndDate: string;
  regionSido: string;
  regionSigungu: string | null;
  status: '예정' | '진행중' | '종료';
  createdAt: string;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const fetchPrograms = useCallback(async () => {
    try {
      const data = await api<ProgramItem[]>('/admin/programs');
      setPrograms(data);
    } catch {
      toast('프로그램 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  function handleDelete(program: ProgramItem) {
    setConfirm({
      open: true,
      title: '프로그램 삭제',
      message: `"${program.name}" 프로그램을 삭제하시겠습니까? 연결된 공고도 함께 삭제됩니다.`,
      action: async () => {
        try {
          await api(`/admin/programs/${program.id}`, { method: 'DELETE' });
          toast('삭제되었습니다.');
          fetchPrograms();
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

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      예정: 'bg-blue-100 text-blue-800',
      진행중: 'bg-green-100 text-green-800',
      종료: 'bg-gray-100 text-gray-600',
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
          프로그램 관리{' '}
          <span className="text-base font-normal text-gray-500">
            총 {programs.length}건
          </span>
        </h1>
        <Link
          href="/programs/new"
          className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
        >
          새 프로그램
        </Link>
      </div>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">
                프로그램명
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">주최</th>
              <th className="px-4 py-3 font-medium text-gray-700">주관</th>
              <th className="px-4 py-3 font-medium text-gray-700">지역</th>
              <th className="px-4 py-3 font-medium text-gray-700">활동기간</th>
              <th className="px-4 py-3 font-medium text-gray-700">상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">등록일</th>
              <th className="px-4 py-3 font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {programs.map((program) => (
              <tr key={program.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/programs/${program.id}`}
                    className="text-[#0a1432] underline-offset-2 hover:underline"
                  >
                    {program.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{program.host}</td>
                <td className="px-4 py-3">{program.organizer}</td>
                <td className="px-4 py-3">
                  {program.regionSido}
                  {program.regionSigungu ? ` ${program.regionSigungu}` : ''}
                </td>
                <td className="px-4 py-3">
                  {formatDate(program.activityStartDate)} ~{' '}
                  {formatDate(program.activityEndDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${statusBadge(program.status)}`}
                  >
                    {program.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(program.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(program)}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  등록된 프로그램이 없습니다.
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
