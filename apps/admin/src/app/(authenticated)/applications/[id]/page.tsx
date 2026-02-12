'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ApplicationDetail {
  id: string;
  announcementId: string;
  announcementName: string;
  programName: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  fileUrl1: string;
  fileName1: string;
  fileUrl2: string | null;
  fileName2: string | null;
  referralSource: string | null;
  status: string;
  createdAt: string;
  prevId: string | null;
  nextId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    age: number;
    profileImageUrl: string | null;
    residence: string | null;
    activityStatus: string;
  } | null;
  evaluations: EvaluationItem[];
  statusLogs: StatusLogItem[];
}

interface EvaluationItem {
  id: string;
  scoreCriteria1: number;
  scoreCriteria2: number;
  scoreCriteria3: number;
  totalScore: number;
  memo: string | null;
  evaluatedById: string;
  evaluatedByName: string;
  createdAt: string;
}

interface StatusLogItem {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  changedByName: string;
  createdAt: string;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  submitted: ['first_pass', 'final_pass', 'rejected'],
  first_pass: ['final_pass', 'rejected'],
  final_pass: ['rejected'],
  rejected: ['first_pass', 'final_pass'],
};

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

function genderLabel(g: string) {
  return g === 'male' ? '남성' : '여성';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('ko-KR');
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  // Evaluation form
  const [score1, setScore1] = useState(50);
  const [score2, setScore2] = useState(50);
  const [score3, setScore3] = useState(50);
  const [evalMemo, setEvalMemo] = useState('');

  const filterParams = searchParams.toString();

  const fetchDetail = useCallback(async () => {
    try {
      const queryStr = filterParams ? `?${filterParams}` : '';
      const data = await api<ApplicationDetail>(
        `/admin/applications/${id}${queryStr}`,
      );
      setDetail(data);
      setSelectedStatus(data.status);
    } catch {
      toast('지원서를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, filterParams]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  function handleStatusChange(newStatus: string) {
    if (newStatus === detail?.status) return;
    setSelectedStatus(newStatus);
    setConfirm({
      open: true,
      title: '상태 변경',
      message: `지원 상태를 "${statusLabel(newStatus)}"(으)로 변경하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/applications/${id}/status`, {
            method: 'PATCH',
            body: { status: newStatus },
          });
          toast('상태가 변경되었습니다.');
          fetchDetail();
        } catch (err) {
          toast(
            err instanceof ApiError ? err.message : '변경에 실패했습니다.',
            'error',
          );
          setSelectedStatus(detail?.status ?? '');
        }
        setConfirm((prev) => ({ ...prev, open: false }));
      },
    });
  }

  async function handleCreateEvaluation(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(`/admin/applications/${id}/evaluations`, {
        method: 'POST',
        body: {
          scoreCriteria1: score1,
          scoreCriteria2: score2,
          scoreCriteria3: score3,
          memo: evalMemo || undefined,
        },
      });
      toast('평가가 저장되었습니다.');
      setScore1(50);
      setScore2(50);
      setScore3(50);
      setEvalMemo('');
      fetchDetail();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '평가 저장에 실패했습니다.',
        'error',
      );
    }
  }

  function handleDeleteEvaluation(evalId: string) {
    setConfirm({
      open: true,
      title: '평가 삭제',
      message: '이 평가를 삭제하시겠습니까?',
      action: async () => {
        try {
          await api(`/admin/applications/evaluations/${evalId}`, {
            method: 'DELETE',
          });
          toast('평가가 삭제되었습니다.');
          fetchDetail();
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

  function navigateTo(targetId: string | null) {
    if (!targetId) return;
    const qs = filterParams ? `?${filterParams}` : '';
    router.push(`/applications/${targetId}${qs}`);
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  if (!detail) {
    return <p className="text-gray-500">지원서를 찾을 수 없습니다.</p>;
  }

  const allowedTransitions = STATUS_TRANSITIONS[detail.status] ?? [];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {detail.announcementName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!detail.prevId}
            onClick={() => navigateTo(detail.prevId)}
            className="border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            disabled={!detail.nextId}
            onClick={() => navigateTo(detail.nextId)}
            className="border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            다음
          </button>
          <button
            type="button"
            onClick={() => router.push(`/applications?${filterParams}`)}
            className="border border-gray-300 px-3 py-1 text-sm"
          >
            닫기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Profile + Files */}
        <div className="space-y-6 lg:col-span-1">
          {/* Applicant Profile */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              지원자 프로필
            </h2>
            {detail.user && (
              <div className="flex items-start gap-4">
                {detail.user.profileImageUrl ? (
                  <img
                    src={detail.user.profileImageUrl}
                    alt=""
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center bg-gray-200 text-xs text-gray-500">
                    N/A
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  <InfoRow label="이름" value={detail.user.name} />
                  <InfoRow label="이메일" value={detail.user.email} />
                  <InfoRow label="연락처" value={detail.user.phone} />
                  <InfoRow
                    label="성별"
                    value={genderLabel(detail.user.gender)}
                  />
                  <InfoRow label="나이" value={`${detail.user.age}세`} />
                  <InfoRow
                    label="거주지"
                    value={detail.user.residence ?? '-'}
                  />
                  <InfoRow
                    label="활동상태"
                    value={detail.user.activityStatus || '-'}
                  />
                </div>
              </div>
            )}
            {detail.user && (
              <Link
                href={`/talents/${detail.user.id}`}
                target="_blank"
                className="mt-3 inline-block text-sm text-[#0a1432] underline"
              >
                인재 상세 보기
              </Link>
            )}
          </div>

          {/* Files */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">첨부파일</h2>
            <div className="space-y-2">
              <a
                href={detail.fileUrl1}
                download={detail.fileName1}
                className="block text-sm text-[#0a1432] underline"
              >
                {detail.fileName1}
              </a>
              {detail.fileUrl2 && detail.fileName2 && (
                <a
                  href={detail.fileUrl2}
                  download={detail.fileName2}
                  className="block text-sm text-[#0a1432] underline"
                >
                  {detail.fileName2}
                </a>
              )}
            </div>
          </div>

          {/* Application info */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">지원 정보</h2>
            <div className="space-y-1 text-sm">
              <InfoRow label="지원일시" value={formatDate(detail.createdAt)} />
              <InfoRow label="유입경로" value={detail.referralSource ?? '-'} />
            </div>
          </div>
        </div>

        {/* Right column: Status + Evaluation */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Change */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              지원 상태 변경
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium ${statusColor(detail.status)}`}
              >
                현재: {statusLabel(detail.status)}
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              >
                <option value={detail.status}>
                  {statusLabel(detail.status)} (현재)
                </option>
                {allowedTransitions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status change history */}
            {detail.statusLogs.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  상태 변경 이력
                </h3>
                <div className="space-y-1">
                  {detail.statusLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <span>{statusLabel(log.fromStatus)}</span>
                      <span>→</span>
                      <span>{statusLabel(log.toStatus)}</span>
                      <span className="text-gray-400">|</span>
                      <span>{log.changedByName}</span>
                      <span className="text-gray-400">|</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Evaluation Form */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">평가</h2>
            <form onSubmit={handleCreateEvaluation} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  항목 1: {score1}점
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score1}
                  onChange={(e) => setScore1(Number(e.target.value))}
                  className="w-full accent-[#0a1432]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  항목 2: {score2}점
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score2}
                  onChange={(e) => setScore2(Number(e.target.value))}
                  className="w-full accent-[#0a1432]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  항목 3: {score3}점
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score3}
                  onChange={(e) => setScore3(Number(e.target.value))}
                  className="w-full accent-[#0a1432]"
                />
              </div>
              <div className="text-sm font-medium text-gray-700">
                총점: {score1 + score2 + score3}점
              </div>
              <div>
                <textarea
                  value={evalMemo}
                  onChange={(e) => setEvalMemo(e.target.value)}
                  placeholder="메모 (최대 200자)"
                  maxLength={200}
                  rows={2}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {evalMemo.length}/200
                </p>
              </div>
              <button
                type="submit"
                className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90"
              >
                평가 저장
              </button>
            </form>
          </div>

          {/* Evaluation History */}
          <div className="border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">평가 이력</h2>
            {detail.evaluations.length === 0 ? (
              <p className="text-sm text-gray-500">평가 이력이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {detail.evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between border-b border-gray-100 pb-3"
                  >
                    <div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-gray-900">
                          총점: {ev.totalScore}점
                        </span>
                        <span className="text-gray-500">
                          ({ev.scoreCriteria1} + {ev.scoreCriteria2} +{' '}
                          {ev.scoreCriteria3})
                        </span>
                      </div>
                      {ev.memo && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {ev.memo}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {ev.evaluatedByName} | {formatDate(ev.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvaluation(ev.id)}
                      className="ml-4 text-xs text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.action}
        onCancel={() => {
          setSelectedStatus(detail?.status ?? '');
          setConfirm((prev) => ({ ...prev, open: false }));
        }}
      />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="w-16 shrink-0 font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
