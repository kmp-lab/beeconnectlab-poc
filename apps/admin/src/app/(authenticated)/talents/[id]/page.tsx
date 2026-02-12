'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface TalentDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  age: number;
  profileImageUrl: string | null;
  residence: string | null;
  interestRegions: string[] | null;
  desiredJob: string | null;
  skills: string | null;
  activityStatus: string;
  specialHistory: string | null;
  managementRisk: string | null;
  accountStatus: string;
  marketingConsent: boolean;
  provider: string;
  createdAt: string;
  lastLoginAt: string | null;
  recentProgram: string | null;
  applications: ApplicationItem[];
  activities: ActivityItem[];
}

interface ApplicationItem {
  id: string;
  announcementId: string;
  announcementName: string;
  programName: string;
  status: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  programName: string;
  announcementName: string;
  participationStatus: string;
  role: string | null;
  evalTotalScore: number | null;
  createdAt: string;
}

interface NoteItem {
  id: string;
  content: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

const SPECIAL_HISTORY_OPTIONS = ['', '우수인재', '장기참여자', '신규'];
const MANAGEMENT_RISK_OPTIONS = ['', '정상', '주의', '경고'];

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [talent, setTalent] = useState<TalentDetail | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ open: false, title: '', message: '', action: () => {} });

  const fetchTalent = useCallback(async () => {
    try {
      const data = await api<TalentDetail>(`/admin/talents/${id}`);
      setTalent(data);
    } catch {
      toast('인재 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await api<NoteItem[]>(`/admin/talents/${id}/notes`);
      setNotes(data);
    } catch {
      // silent
    }
  }, [id]);

  useEffect(() => {
    fetchTalent();
    fetchNotes();
  }, [fetchTalent, fetchNotes]);

  function handleStatusToggle() {
    if (!talent) return;
    const newStatus = talent.accountStatus === 'active' ? 'inactive' : 'active';
    const label = newStatus === 'active' ? '활성' : '비활성';
    setConfirm({
      open: true,
      title: '계정 상태 변경',
      message: `${talent.name}의 계정을 "${label}"(으)로 변경하시겠습니까?`,
      action: async () => {
        try {
          await api(`/admin/talents/${id}/status`, {
            method: 'PATCH',
            body: { accountStatus: newStatus },
          });
          toast('계정 상태가 변경되었습니다.');
          fetchTalent();
        } catch (err) {
          toast(
            err instanceof ApiError ? err.message : '변경에 실패했습니다.',
            'error',
          );
        }
        setConfirm((prev) => ({ ...prev, open: false }));
      },
    });
  }

  async function handleTagsChange(
    field: 'specialHistory' | 'managementRisk',
    value: string,
  ) {
    try {
      await api(`/admin/talents/${id}/tags`, {
        method: 'PATCH',
        body: { [field]: value || null },
      });
      toast('변경되었습니다.');
      fetchTalent();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '변경에 실패했습니다.',
        'error',
      );
    }
  }

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await api(`/admin/talents/${id}/notes`, {
        method: 'POST',
        body: { content: noteContent.trim() },
      });
      setNoteContent('');
      toast('메모가 저장되었습니다.');
      fetchNotes();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '메모 저장에 실패했습니다.',
        'error',
      );
    }
  }

  async function handleDeleteNote(noteId: string) {
    setConfirm({
      open: true,
      title: '메모 삭제',
      message: '이 메모를 삭제하시겠습니까?',
      action: async () => {
        try {
          await api(`/admin/talents/notes/${noteId}`, { method: 'DELETE' });
          toast('메모가 삭제되었습니다.');
          fetchNotes();
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

  function genderLabel(g: string) {
    return g === 'male' ? '남성' : '여성';
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

  function appStatusLabel(s: string) {
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

  function participationLabel(s: string) {
    switch (s) {
      case 'upcoming':
        return '예정';
      case 'active':
        return '활동중';
      case 'period_ended':
        return '기간종료';
      case 'completed':
        return '완료';
      case 'dropped':
        return '중도포기';
      default:
        return s;
    }
  }

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  if (!talent) {
    return <p className="text-gray-500">인재를 찾을 수 없습니다.</p>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => router.push('/talents')}
        className="mb-4 text-sm text-gray-600 hover:text-gray-900"
      >
        &larr; 목록으로
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        인재 상세 - {talent.name}
      </h1>

      {/* Profile / Job / Account Info */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">프로필 정보</h2>
          <div className="flex items-start gap-4">
            {talent.profileImageUrl ? (
              <img
                src={talent.profileImageUrl}
                alt=""
                className="h-16 w-16 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center bg-gray-200 text-xs text-gray-500">
                N/A
              </div>
            )}
            <div className="space-y-1 text-sm">
              <InfoRow label="이름" value={talent.name} />
              <InfoRow label="성별" value={genderLabel(talent.gender)} />
              <InfoRow label="나이" value={`${talent.age}세`} />
              <InfoRow label="생년월일" value={talent.birthDate} />
              <InfoRow label="연락처" value={talent.phone} />
              <InfoRow label="이메일" value={talent.email} />
              <InfoRow label="거주지" value={talent.residence ?? '-'} />
              <InfoRow
                label="관심지역"
                value={talent.interestRegions?.join(', ') || '-'}
              />
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">직무 정보</h2>
          <div className="space-y-1 text-sm">
            <InfoRow label="희망직무" value={talent.desiredJob ?? '-'} />
            <InfoRow label="보유역량" value={talent.skills ?? '-'} />
            <InfoRow label="활동상태" value={talent.activityStatus || '-'} />
            <InfoRow label="최근참여활동" value={talent.recentProgram ?? '-'} />
          </div>
        </div>

        {/* Account Info */}
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">계정 정보</h2>
          <div className="space-y-1 text-sm">
            <InfoRow label="가입방법" value={talent.provider} />
            <InfoRow label="가입일시" value={formatDate(talent.createdAt)} />
            <InfoRow label="최근접속" value={formatDate(talent.lastLoginAt)} />
            <InfoRow
              label="마케팅동의"
              value={talent.marketingConsent ? 'Y' : 'N'}
            />
            <div className="flex items-center gap-2 py-1">
              <span className="w-20 font-medium text-gray-700">계정상태</span>
              <span className="font-medium">
                {statusLabel(talent.accountStatus)}
              </span>
              {talent.accountStatus !== 'withdrawn' && (
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className={`ml-2 px-3 py-1 text-xs font-medium text-white ${
                    talent.accountStatus === 'active'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {talent.accountStatus === 'active' ? '비활성화' : '활성화'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">특정 이력</h2>
          <select
            value={talent.specialHistory ?? ''}
            onChange={(e) => handleTagsChange('specialHistory', e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          >
            {SPECIAL_HISTORY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o || '없음'}
              </option>
            ))}
          </select>
        </div>
        <div className="border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">관리 리스크</h2>
          <select
            value={talent.managementRisk ?? ''}
            onChange={(e) => handleTagsChange('managementRisk', e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          >
            {MANAGEMENT_RISK_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o || '없음'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications */}
      <div className="mb-6 border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">공고 지원 이력</h2>
        {talent.applications.length === 0 ? (
          <p className="text-sm text-gray-500">지원 이력이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    프로그램
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    공고명
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    지원상태
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    지원일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {talent.applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{app.programName}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/announcements/${app.announcementId}/applications/${app.id}`}
                        target="_blank"
                        className="text-[#0a1432] underline"
                      >
                        {app.announcementName}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{appStatusLabel(app.status)}</td>
                    <td className="px-3 py-2">{formatDate(app.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activities */}
      <div className="mb-6 border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">참여 활동</h2>
        {talent.activities.length === 0 ? (
          <p className="text-sm text-gray-500">참여 활동이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    프로그램
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    공고명
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    참여상태
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">역할</th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    평가점수
                  </th>
                  <th className="px-3 py-2 font-medium text-gray-700">
                    등록일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {talent.activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{act.programName}</td>
                    <td className="px-3 py-2">{act.announcementName}</td>
                    <td className="px-3 py-2">
                      {participationLabel(act.participationStatus)}
                    </td>
                    <td className="px-3 py-2">{act.role ?? '-'}</td>
                    <td className="px-3 py-2">{act.evalTotalScore ?? '-'}</td>
                    <td className="px-3 py-2">{formatDate(act.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-6 border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">메모</h2>
        <form onSubmit={handleCreateNote} className="mb-4 flex gap-2">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="메모를 입력하세요..."
            rows={2}
            className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!noteContent.trim()}
            className="self-end bg-[#0a1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
          >
            저장
          </button>
        </form>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">메모가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between border-b border-gray-100 pb-3"
              >
                <div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {note.createdByName} | {formatDate(note.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="ml-4 text-xs text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="w-20 shrink-0 font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
