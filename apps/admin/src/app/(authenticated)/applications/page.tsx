'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from '@/components/Toast';

interface ApplicationListItem {
  id: string;
  announcementId: string;
  announcementName: string;
  programName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  gender: string | null;
  age: number | null;
  status: string;
  referralSource: string | null;
  evalScore: number | null;
  createdAt: string;
}

interface ApplicationListResponse {
  data: ApplicationListItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface AnnouncementOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: 'submitted', label: '지원완료' },
  { value: 'first_pass', label: '1차 합격' },
  { value: 'final_pass', label: '최종 합격' },
  { value: 'rejected', label: '불합격' },
];

function statusLabel(s: string) {
  switch (s) {
    case 'submitted':
      return '지원완료';
    case 'first_pass':
      return '1차 합격';
    case 'final_pass':
      return '최종 합격';
    case 'rejected':
      return '불합격';
    default:
      return s;
  }
}

function statusColor(s: string) {
  switch (s) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'first_pass':
      return 'bg-yellow-100 text-yellow-800';
    case 'final_pass':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function genderLabel(g: string | null) {
  if (!g) return '-';
  return g === 'male' ? '남' : '여';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('ko-KR');
}

export default function ApplicationsPage() {
  const [response, setResponse] = useState<ApplicationListResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>(
    [],
  );
  const [announcements, setAnnouncements] = useState<AnnouncementOption[]>([]);
  const [page, setPage] = useState(1);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [announcementDropdownOpen, setAnnouncementDropdownOpen] =
    useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatuses.length > 0)
        params.set('status', selectedStatuses.join(','));
      if (selectedAnnouncements.length > 0)
        params.set('announcementId', selectedAnnouncements.join(','));
      params.set('page', String(page));

      const data = await api<ApplicationListResponse>(
        `/admin/applications?${params.toString()}`,
      );
      setResponse(data);
    } catch {
      toast('지원서 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedStatuses, selectedAnnouncements, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    api<AnnouncementOption[]>('/admin/applications/announcements')
      .then(setAnnouncements)
      .catch(() => {});
  }, []);

  function toggleStatus(value: string) {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
    setPage(1);
  }

  function toggleAnnouncement(value: string) {
    setSelectedAnnouncements((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
    setPage(1);
  }

  function buildFilterParams() {
    const params = new URLSearchParams();
    if (selectedStatuses.length > 0)
      params.set('status', selectedStatuses.join(','));
    if (selectedAnnouncements.length > 0)
      params.set('announcementId', selectedAnnouncements.join(','));
    return params.toString();
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      if (selectedStatuses.length > 0)
        params.set('status', selectedStatuses.join(','));
      if (selectedAnnouncements.length > 0)
        params.set('announcementId', selectedAnnouncements.join(','));

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(
        `${baseUrl}/admin/applications/export?${params.toString()}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('엑셀 다운로드에 실패했습니다.', 'error');
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">지원서 관리</h1>
        <button
          type="button"
          onClick={handleExport}
          className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
        >
          엑셀 다운로드
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-start gap-3">
        {/* Status multi-select dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setStatusDropdownOpen(!statusDropdownOpen);
              setAnnouncementDropdownOpen(false);
            }}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          >
            지원상태{' '}
            {selectedStatuses.length > 0
              ? `(${selectedStatuses.length})`
              : '전체'}
          </button>
          {statusDropdownOpen && (
            <div className="absolute z-10 mt-1 w-48 border border-gray-200 bg-white shadow-lg">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(opt.value)}
                    onChange={() => toggleStatus(opt.value)}
                    className="accent-[#0a1432]"
                  />
                  {opt.label}
                </label>
              ))}
              <div className="border-t border-gray-200 px-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatuses([]);
                    setPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Announcement multi-select dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAnnouncementDropdownOpen(!announcementDropdownOpen);
              setStatusDropdownOpen(false);
            }}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          >
            공고{' '}
            {selectedAnnouncements.length > 0
              ? `(${selectedAnnouncements.length})`
              : '전체'}
          </button>
          {announcementDropdownOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-64 overflow-y-auto border border-gray-200 bg-white shadow-lg">
              {announcements.map((ann) => (
                <label
                  key={ann.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAnnouncements.includes(ann.id)}
                    onChange={() => toggleAnnouncement(ann.id)}
                    className="accent-[#0a1432]"
                  />
                  <span className="truncate">{ann.name}</span>
                </label>
              ))}
              {announcements.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-500">
                  공고가 없습니다.
                </p>
              )}
              <div className="border-t border-gray-200 px-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnnouncements([]);
                    setPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-700">공고명</th>
              <th className="px-3 py-3 font-medium text-gray-700">지원일자</th>
              <th className="px-3 py-3 font-medium text-gray-700">이름</th>
              <th className="px-3 py-3 font-medium text-gray-700">성별</th>
              <th className="px-3 py-3 font-medium text-gray-700">나이</th>
              <th className="px-3 py-3 font-medium text-gray-700">연락처</th>
              <th className="px-3 py-3 font-medium text-gray-700">이메일</th>
              <th className="px-3 py-3 font-medium text-gray-700">지원상태</th>
              <th className="px-3 py-3 font-medium text-gray-700">유입경로</th>
              <th className="px-3 py-3 font-medium text-gray-700">평가점수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  로딩 중...
                </td>
              </tr>
            ) : response?.data.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  지원서가 없습니다.
                </td>
              </tr>
            ) : (
              response?.data.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {app.announcementName}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={`/applications/${app.id}?${buildFilterParams()}`}
                      className="font-medium text-[#0a1432] underline"
                    >
                      {app.applicantName}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{genderLabel(app.gender)}</td>
                  <td className="px-3 py-3">{app.age ?? '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {app.applicantPhone}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {app.applicantEmail}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium ${statusColor(app.status)}`}
                    >
                      {statusLabel(app.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {app.referralSource ?? '-'}
                  </td>
                  <td className="px-3 py-3">{app.evalScore ?? '-'}</td>
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
