'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from '@/components/Toast';

interface TalentListItem {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  email: string;
  profileImageUrl: string | null;
  residence: string | null;
  interestRegions: string[] | null;
  desiredJob: string | null;
  skills: string | null;
  activityStatus: string;
  specialHistory: string | null;
  managementRisk: string | null;
  recentProgram: string | null;
  accountStatus: string;
  marketingConsent: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface TalentListResponse {
  data: TalentListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const ACCOUNT_STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'withdrawn', label: '탈퇴' },
];

export default function TalentsPage() {
  const [response, setResponse] = useState<TalentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activityStatus, setActivityStatus] = useState('');
  const [specialHistory, setSpecialHistory] = useState('');
  const [managementRisk, setManagementRisk] = useState('');
  const [recentProgram, setRecentProgram] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [page, setPage] = useState(1);
  const [programs, setPrograms] = useState<string[]>([]);

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activityStatus) params.set('activityStatus', activityStatus);
      if (specialHistory) params.set('specialHistory', specialHistory);
      if (managementRisk) params.set('managementRisk', managementRisk);
      if (recentProgram) params.set('recentProgram', recentProgram);
      if (accountStatus) params.set('accountStatus', accountStatus);
      params.set('page', String(page));

      const data = await api<TalentListResponse>(
        `/admin/talents?${params.toString()}`,
      );
      setResponse(data);
    } catch {
      toast('인재 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    search,
    activityStatus,
    specialHistory,
    managementRisk,
    recentProgram,
    accountStatus,
    page,
  ]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  useEffect(() => {
    api<string[]>('/admin/talents/programs')
      .then(setPrograms)
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTalents();
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activityStatus) params.set('activityStatus', activityStatus);
      if (specialHistory) params.set('specialHistory', specialHistory);
      if (managementRisk) params.set('managementRisk', managementRisk);
      if (recentProgram) params.set('recentProgram', recentProgram);
      if (accountStatus) params.set('accountStatus', accountStatus);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(
        `${baseUrl}/admin/talents/export?${params.toString()}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talents_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('엑셀 다운로드에 실패했습니다.', 'error');
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR');
  }

  function genderLabel(g: string) {
    return g === 'male' ? '남' : '여';
  }

  function statusLabel(s: string) {
    switch (s) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'withdrawn':
        return '탈퇴';
      default:
        return s;
    }
  }

  function statusColor(s: string) {
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">청년 인재 관리</h1>
        <button
          type="button"
          onClick={handleExport}
          className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
        >
          엑셀 다운로드
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="이름 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
          >
            검색
          </button>
        </form>

        <select
          value={activityStatus}
          onChange={(e) => {
            setActivityStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
        >
          <option value="">활동상태 전체</option>
          <option value="활동중">활동중</option>
          <option value="활동종료">활동종료</option>
          <option value="미참여">미참여</option>
        </select>

        <select
          value={specialHistory}
          onChange={(e) => {
            setSpecialHistory(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
        >
          <option value="">특정이력 전체</option>
          <option value="우수인재">우수인재</option>
          <option value="장기참여자">장기참여자</option>
          <option value="신규">신규</option>
        </select>

        <select
          value={managementRisk}
          onChange={(e) => {
            setManagementRisk(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
        >
          <option value="">관리리스크 전체</option>
          <option value="정상">정상</option>
          <option value="주의">주의</option>
          <option value="경고">경고</option>
        </select>

        <select
          value={recentProgram}
          onChange={(e) => {
            setRecentProgram(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
        >
          <option value="">최근참여활동 전체</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {ACCOUNT_STATUS_OPTIONS.length > 0 && (
          <select
            value={accountStatus}
            onChange={(e) => {
              setAccountStatus(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          >
            {ACCOUNT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-700">프로필</th>
              <th className="px-3 py-3 font-medium text-gray-700">활동상태</th>
              <th className="px-3 py-3 font-medium text-gray-700">이름</th>
              <th className="px-3 py-3 font-medium text-gray-700">성별</th>
              <th className="px-3 py-3 font-medium text-gray-700">나이</th>
              <th className="px-3 py-3 font-medium text-gray-700">연락처</th>
              <th className="px-3 py-3 font-medium text-gray-700">이메일</th>
              <th className="px-3 py-3 font-medium text-gray-700">거주지</th>
              <th className="px-3 py-3 font-medium text-gray-700">관심지역</th>
              <th className="px-3 py-3 font-medium text-gray-700">희망직무</th>
              <th className="px-3 py-3 font-medium text-gray-700">보유역량</th>
              <th className="px-3 py-3 font-medium text-gray-700">특정이력</th>
              <th className="px-3 py-3 font-medium text-gray-700">
                관리리스크
              </th>
              <th className="px-3 py-3 font-medium text-gray-700">
                최근참여활동
              </th>
              <th className="px-3 py-3 font-medium text-gray-700">가입일시</th>
              <th className="px-3 py-3 font-medium text-gray-700">최근접속</th>
              <th className="px-3 py-3 font-medium text-gray-700">계정상태</th>
              <th className="px-3 py-3 font-medium text-gray-700">마케팅</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={18}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  로딩 중...
                </td>
              </tr>
            ) : response?.data.length === 0 ? (
              <tr>
                <td
                  colSpan={18}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  인재가 없습니다.
                </td>
              </tr>
            ) : (
              response?.data.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    {t.profileImageUrl ? (
                      <img
                        src={t.profileImageUrl}
                        alt=""
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center bg-gray-200 text-xs text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.activityStatus || '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={`/talents/${t.id}`}
                      className="font-medium text-[#0a1432] underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{genderLabel(t.gender)}</td>
                  <td className="px-3 py-3">{t.age}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{t.phone}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{t.email}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.residence ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.interestRegions?.join(', ') || '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.desiredJob ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.skills ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.specialHistory ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.managementRisk ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {t.recentProgram ?? '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatDate(t.lastLoginAt)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium ${statusColor(t.accountStatus)}`}
                    >
                      {statusLabel(t.accountStatus)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {t.marketingConsent ? 'Y' : 'N'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {response && response.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: response.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`border px-3 py-1 text-sm ${
                  p === page
                    ? 'border-[#0a1432] bg-[#0a1432] text-white'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= response.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
