'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';

interface ParticipantItem {
  id: string;
  userId: string;
  userName: string;
  announcementName: string;
  jobType: string;
  participationStatus: string;
  evalTotalScore: number | null;
  evalScores: Record<string, number> | null;
  evalComment: string | null;
  role: string | null;
  evaluatedByName: string | null;
  evaluatedAt: string | null;
}

interface ProgramBasic {
  id: string;
  name: string;
  status: '예정' | '진행중' | '종료';
}

const EVAL_CRITERIA = [
  { key: 'attitude', label: '태도' },
  { key: 'professionalism', label: '전문성' },
  { key: 'collaboration', label: '협업' },
  { key: 'growth', label: '성장' },
  { key: 'contribution', label: '기여도' },
];

const PARTICIPATION_STATUS_OPTIONS = [
  { value: 'completed', label: '수료' },
  { value: 'dropped', label: '중도 이탈' },
  { value: 'period_ended', label: '활동 기간 종료' },
  { value: 'active', label: '활동 중' },
  { value: 'upcoming', label: '활동 예정' },
];

export default function EvaluatePage() {
  const params = useParams();
  const programId = params.id as string;

  const [program, setProgram] = useState<ProgramBasic | null>(null);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Evaluation form state
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [role, setRole] = useState('');
  const [evalComment, setEvalComment] = useState('');
  const [participationStatus, setParticipationStatus] = useState('completed');

  const fetchData = useCallback(async () => {
    try {
      const [programData, participantsData] = await Promise.all([
        api<ProgramBasic>(`/admin/programs/${programId}`),
        api<ParticipantItem[]>(`/admin/programs/${programId}/participants`),
      ]);
      setProgram(programData);
      setParticipants(participantsData);

      // Auto-select first participant if none selected
      if (participantsData.length > 0 && !selectedUserId) {
        setSelectedUserId(participantsData[0].userId);
        loadEvalForm(participantsData[0]);
      }
    } catch {
      toast('데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [programId, selectedUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function loadEvalForm(p: ParticipantItem) {
    if (p.evalScores) {
      setEvalScores(p.evalScores);
    } else {
      const defaults: Record<string, number> = {};
      for (const c of EVAL_CRITERIA) {
        defaults[c.key] = 50;
      }
      setEvalScores(defaults);
    }
    setRole(p.role ?? '');
    setEvalComment(p.evalComment ?? '');
    setParticipationStatus(
      p.participationStatus === 'period_ended'
        ? 'completed'
        : p.participationStatus,
    );
  }

  function handleSelectParticipant(p: ParticipantItem) {
    setSelectedUserId(p.userId);
    loadEvalForm(p);
  }

  function handleScoreChange(key: string, value: number) {
    setEvalScores((prev) => ({ ...prev, [key]: value }));
  }

  function computeTotal(): number {
    const values = Object.values(evalScores);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  async function handleSave() {
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await api(
        `/admin/programs/${programId}/participants/${selectedUserId}/evaluate`,
        {
          method: 'PUT',
          body: {
            evalScores,
            evalTotalScore: computeTotal(),
            role: role || undefined,
            evalComment: evalComment || undefined,
            participationStatus,
          },
        },
      );
      toast('평가가 저장되었습니다.');
      setShowConfirm(false);
      // Re-fetch to update the list
      const updated = await api<ParticipantItem[]>(
        `/admin/programs/${programId}/participants`,
      );
      setParticipants(updated);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '평가 저장에 실패했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedParticipant = participants.find(
    (p) => p.userId === selectedUserId,
  );

  function participationStatusLabel(status: string) {
    const labels: Record<string, string> = {
      upcoming: '활동 예정',
      active: '활동 중',
      period_ended: '활동 기간 종료',
      completed: '수료',
      dropped: '중도 이탈',
    };
    return labels[status] || status;
  }

  function participationBadge(status: string) {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      period_ended: 'bg-gray-100 text-gray-600',
      completed: 'bg-purple-100 text-purple-800',
      dropped: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  if (!program) {
    return <p className="text-gray-500">프로그램을 찾을 수 없습니다.</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/programs/${programId}`}
          className="text-sm text-gray-500 hover:text-[#0a1432]"
        >
          &larr; 프로그램 상세
        </Link>
        <h1 className="text-2xl font-bold text-[#0a1432]">참가자 평가</h1>
        <span className="text-sm text-gray-500">{program.name}</span>
      </div>

      <div className="flex gap-6">
        {/* Left: Participant list */}
        <div className="w-80 shrink-0">
          <h2 className="mb-3 text-sm font-bold text-[#0a1432]">
            참가자 목록 ({participants.length})
          </h2>
          <div className="border border-gray-200 bg-white">
            {participants.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                참가자가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectParticipant(p)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        selectedUserId === p.userId
                          ? 'bg-[#0a1432] text-white'
                          : 'text-[#0a1432] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.userName}</span>
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[10px] font-medium ${
                            selectedUserId === p.userId
                              ? 'bg-white/20 text-white'
                              : participationBadge(p.participationStatus)
                          }`}
                        >
                          {participationStatusLabel(p.participationStatus)}
                        </span>
                      </div>
                      <div
                        className={`mt-0.5 text-xs ${selectedUserId === p.userId ? 'text-white/70' : 'text-gray-500'}`}
                      >
                        {p.announcementName} / {p.jobType}
                      </div>
                      <div
                        className={`mt-0.5 text-xs ${selectedUserId === p.userId ? 'text-white/70' : 'text-gray-400'}`}
                      >
                        {p.evalTotalScore !== null
                          ? `평가 완료 (${p.evalTotalScore}점)`
                          : '미평가'}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Evaluation form */}
        <div className="min-w-0 flex-1">
          {selectedParticipant ? (
            <div className="border border-gray-200 bg-white p-6">
              {/* Evaluation status */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0a1432]">
                  {selectedParticipant.userName} 평가
                </h2>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium ${
                    selectedParticipant.evalTotalScore !== null
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedParticipant.evalTotalScore !== null
                    ? '완료'
                    : '미완료'}
                </span>
              </div>

              {/* Evaluation meta (shown when already evaluated) */}
              {selectedParticipant.evaluatedAt && (
                <div className="mb-6 border-b border-gray-100 pb-4">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">평가자</dt>
                      <dd className="mt-1 text-[#0a1432]">
                        {selectedParticipant.evaluatedByName ?? '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">평가 일시</dt>
                      <dd className="mt-1 text-[#0a1432]">
                        {new Date(
                          selectedParticipant.evaluatedAt,
                        ).toLocaleString('ko-KR')}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Evaluation scores (sliders) */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold text-[#0a1432]">
                  평가 점수
                </h3>
                <div className="space-y-4">
                  {EVAL_CRITERIA.map((c) => (
                    <div key={c.key}>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-sm text-gray-700">
                          {c.label}
                        </label>
                        <span className="text-sm font-medium text-[#0a1432]">
                          {evalScores[c.key] ?? 50}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={evalScores[c.key] ?? 50}
                        onChange={(e) =>
                          handleScoreChange(c.key, Number(e.target.value))
                        }
                        className="h-2 w-full cursor-pointer appearance-none bg-gray-200 accent-[#0a1432] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-[#0a1432]"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 text-right">
                  <span className="text-sm text-gray-500">총점(평균): </span>
                  <span className="text-lg font-bold text-[#0a1432]">
                    {computeTotal()}점
                  </span>
                </div>
              </div>

              {/* Role */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  역할 (선택)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  maxLength={200}
                  placeholder="예: 팀장, 기획자"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
                />
              </div>

              {/* Evaluation comment */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  평가 코멘트 (선택)
                </label>
                <textarea
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="참가자에 대한 평가 의견을 작성하세요."
                  className="w-full resize-none border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
                />
              </div>

              {/* Participation status */}
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  참여 상태
                </label>
                <select
                  value={participationStatus}
                  onChange={(e) => setParticipationStatus(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
                >
                  {PARTICIPATION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="bg-[#0a1432] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
              >
                저장하기
              </button>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">
                평가할 참가자를 선택하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm border border-gray-200 bg-white p-6">
            <h3 className="mb-2 text-lg font-bold text-[#0a1432]">평가 저장</h3>
            <p className="mb-6 text-sm text-gray-600">
              {selectedParticipant?.userName}님의 평가를 저장하시겠습니까? 기존
              평가가 있는 경우 덮어쓰기됩니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
