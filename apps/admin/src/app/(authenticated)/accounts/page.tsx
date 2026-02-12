'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: 'pending' | 'approved';
  createdAt: string;
  approvedAt: string | null;
  approvedByName: string | null;
}

interface MeResponse {
  id: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const fetchAccounts = useCallback(async () => {
    try {
      const [data, meData] = await Promise.all([
        api<AdminAccount[]>('/admin/accounts'),
        api<MeResponse>('/admin/auth/me'),
      ]);
      setAccounts(data);
      setMe(meData);
    } catch {
      toast('계정 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function handleApprove(account: AdminAccount) {
    setConfirm({
      open: true,
      title: '가입 승인',
      message: `${account.name}(${account.email})을(를) 승인하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/accounts/${account.id}/approve`, {
            method: 'PATCH',
          });
          toast('승인되었습니다.');
          fetchAccounts();
        } catch (err) {
          toast(
            err instanceof ApiError ? err.message : '승인에 실패했습니다.',
            'error',
          );
        }
        setConfirm((prev) => ({ ...prev, open: false }));
      },
    });
  }

  function handleDelete(account: AdminAccount) {
    setConfirm({
      open: true,
      title: '관리자 삭제',
      message: `${account.name}(${account.email})을(를) 삭제하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/accounts/${account.id}`, {
            method: 'DELETE',
          });
          toast('삭제되었습니다.');
          fetchAccounts();
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

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR');
  }

  function statusLabel(status: string) {
    return status === 'approved' ? '완료' : '대기';
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        관리자 계정 관리
      </h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">이름</th>
              <th className="px-4 py-3 font-medium text-gray-700">이메일</th>
              <th className="px-4 py-3 font-medium text-gray-700">휴대폰</th>
              <th className="px-4 py-3 font-medium text-gray-700">조직</th>
              <th className="px-4 py-3 font-medium text-gray-700">가입 상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">
                가입 신청 일시
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">승인 일시</th>
              <th className="px-4 py-3 font-medium text-gray-700">
                승인 관리자
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{account.name}</td>
                <td className="px-4 py-3">{account.email}</td>
                <td className="px-4 py-3">{account.phone}</td>
                <td className="px-4 py-3">{account.organization}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      account.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {statusLabel(account.status)}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(account.createdAt)}</td>
                <td className="px-4 py-3">{formatDate(account.approvedAt)}</td>
                <td className="px-4 py-3">{account.approvedByName ?? '-'}</td>
                <td className="px-4 py-3">
                  {account.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(account)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      승인하기
                    </button>
                  )}
                  {account.status === 'approved' &&
                    me &&
                    account.id !== me.id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(account)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        삭제하기
                      </button>
                    )}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  등록된 관리자가 없습니다.
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
