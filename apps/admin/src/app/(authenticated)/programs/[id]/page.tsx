'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';

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
}

interface ProgramDetail {
  id: string;
  name: string;
  host: string;
  organizer: string;
  activityStartDate: string;
  activityEndDate: string;
  regionSido: string;
  regionSigungu: string | null;
  benefits: string[] | null;
  status: '예정' | '진행중' | '종료';
  announcements: AnnouncementItem[];
}

const REGIONS: Record<string, string[]> = {
  서울: [
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  부산: [
    '강서구',
    '금정구',
    '기장군',
    '남구',
    '동구',
    '동래구',
    '부산진구',
    '북구',
    '사상구',
    '사하구',
    '서구',
    '수영구',
    '연제구',
    '영도구',
    '중구',
    '해운대구',
  ],
  대구: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  인천: [
    '강화군',
    '계양구',
    '미추홀구',
    '남동구',
    '동구',
    '부평구',
    '서구',
    '연수구',
    '옹진군',
    '중구',
  ],
  광주: ['광산구', '남구', '동구', '북구', '서구'],
  대전: ['대덕구', '동구', '서구', '유성구', '중구'],
  울산: ['남구', '동구', '북구', '울주군', '중구'],
  세종: [],
  경기: [
    '가평군',
    '고양시',
    '과천시',
    '광명시',
    '광주시',
    '구리시',
    '군포시',
    '김포시',
    '남양주시',
    '동두천시',
    '부천시',
    '성남시',
    '수원시',
    '시흥시',
    '안산시',
    '안성시',
    '안양시',
    '양주시',
    '양평군',
    '여주시',
    '연천군',
    '오산시',
    '용인시',
    '의왕시',
    '의정부시',
    '이천시',
    '파주시',
    '평택시',
    '포천시',
    '하남시',
    '화성시',
  ],
  강원: [
    '강릉시',
    '고성군',
    '동해시',
    '삼척시',
    '속초시',
    '양구군',
    '양양군',
    '영월군',
    '원주시',
    '인제군',
    '정선군',
    '철원군',
    '춘천시',
    '태백시',
    '평창군',
    '홍천군',
    '화천군',
    '횡성군',
  ],
  충북: [
    '괴산군',
    '단양군',
    '보은군',
    '영동군',
    '옥천군',
    '음성군',
    '제천시',
    '증평군',
    '진천군',
    '청주시',
    '충주시',
  ],
  충남: [
    '계룡시',
    '공주시',
    '금산군',
    '논산시',
    '당진시',
    '보령시',
    '부여군',
    '서산시',
    '서천군',
    '아산시',
    '예산군',
    '천안시',
    '청양군',
    '태안군',
    '홍성군',
  ],
  전북: [
    '고창군',
    '군산시',
    '김제시',
    '남원시',
    '무주군',
    '부안군',
    '순창군',
    '완주군',
    '익산시',
    '임실군',
    '장수군',
    '전주시',
    '정읍시',
    '진안군',
  ],
  전남: [
    '강진군',
    '고흥군',
    '곡성군',
    '광양시',
    '구례군',
    '나주시',
    '담양군',
    '목포시',
    '무안군',
    '보성군',
    '순천시',
    '신안군',
    '여수시',
    '영광군',
    '영암군',
    '완도군',
    '장성군',
    '장흥군',
    '진도군',
    '함평군',
    '해남군',
    '화순군',
  ],
  경북: [
    '경산시',
    '경주시',
    '고령군',
    '구미시',
    '군위군',
    '김천시',
    '문경시',
    '봉화군',
    '상주시',
    '성주군',
    '안동시',
    '영덕군',
    '영양군',
    '영주시',
    '영천시',
    '예천군',
    '울릉군',
    '울진군',
    '의성군',
    '청도군',
    '청송군',
    '칠곡군',
    '포항시',
  ],
  경남: [
    '거제시',
    '거창군',
    '고성군',
    '김해시',
    '남해군',
    '밀양시',
    '사천시',
    '산청군',
    '양산시',
    '의령군',
    '진주시',
    '창녕군',
    '창원시',
    '통영시',
    '하동군',
    '함안군',
    '함양군',
    '합천군',
  ],
  제주: ['제주시', '서귀포시'],
};

const BENEFIT_OPTIONS = [
  '활동비 지급',
  '교육 프로그램',
  '멘토링',
  '네트워킹',
  '수료증 발급',
  '취업 연계',
  '주거 지원',
  '교통비 지원',
];

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    host: '',
    organizer: '',
    activityStartDate: '',
    activityEndDate: '',
    regionSido: '',
    regionSigungu: '',
    benefits: [] as string[],
  });

  const fetchProgram = useCallback(async () => {
    try {
      const data = await api<ProgramDetail>(`/admin/programs/${id}`);
      setProgram(data);
      setForm({
        name: data.name,
        host: data.host,
        organizer: data.organizer,
        activityStartDate: data.activityStartDate.slice(0, 10),
        activityEndDate: data.activityEndDate.slice(0, 10),
        regionSido: data.regionSido,
        regionSigungu: data.regionSigungu ?? '',
        benefits: data.benefits ?? [],
      });
    } catch {
      toast('프로그램 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const sigunguOptions = form.regionSido
    ? (REGIONS[form.regionSido] ?? [])
    : [];

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'regionSido') {
        return { ...prev, regionSido: value, regionSigungu: '' };
      }
      return { ...prev, [name]: value };
    });
  }

  function handleBenefitToggle(benefit: string) {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/admin/programs/${id}`, {
        method: 'PATCH',
        body: {
          ...form,
          regionSigungu: form.regionSigungu || null,
          benefits: form.benefits.length > 0 ? form.benefits : null,
        },
      });
      toast('수정되었습니다.');
      setEditing(false);
      fetchProgram();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '수정에 실패했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      예정: 'bg-blue-100 text-blue-800',
      진행중: 'bg-green-100 text-green-800',
      종료: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
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

  if (!program) {
    return <p className="text-gray-500">프로그램을 찾을 수 없습니다.</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0a1432]">{program.name}</h1>
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium ${statusBadge(program.status)}`}
          >
            {program.status}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="border border-[#0a1432] px-4 py-2 text-sm font-medium text-[#0a1432] hover:bg-gray-50"
        >
          {editing ? '취소' : '정보 수정'}
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="mb-8 max-w-2xl space-y-6 border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              프로그램명
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                주최
              </label>
              <input
                type="text"
                name="host"
                value={form.host}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                주관
              </label>
              <input
                type="text"
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                활동 시작일
              </label>
              <input
                type="date"
                name="activityStartDate"
                value={form.activityStartDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                활동 종료일
              </label>
              <input
                type="date"
                name="activityEndDate"
                value={form.activityEndDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                시/도
              </label>
              <select
                name="regionSido"
                value={form.regionSido}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none"
              >
                <option value="">선택</option>
                {Object.keys(REGIONS).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                시/군/구
              </label>
              <select
                name="regionSigungu"
                value={form.regionSigungu}
                onChange={handleChange}
                disabled={sigunguOptions.length === 0}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[#0a1432] focus:outline-none disabled:bg-gray-100"
              >
                <option value="">선택</option>
                {sigunguOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              혜택
            </label>
            <div className="flex flex-wrap gap-3">
              {BENEFIT_OPTIONS.map((benefit) => (
                <label
                  key={benefit}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.benefits.includes(benefit)}
                    onChange={() => handleBenefitToggle(benefit)}
                    className="accent-[#0a1432]"
                  />
                  {benefit}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0a1432] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </form>
      ) : (
        <div className="mb-8 border border-gray-200 bg-white p-6">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">주최</dt>
              <dd className="mt-1 text-[#0a1432]">{program.host}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">주관</dt>
              <dd className="mt-1 text-[#0a1432]">{program.organizer}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">활동기간</dt>
              <dd className="mt-1 text-[#0a1432]">
                {formatDate(program.activityStartDate)} ~{' '}
                {formatDate(program.activityEndDate)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">지역</dt>
              <dd className="mt-1 text-[#0a1432]">
                {program.regionSido}
                {program.regionSigungu ? ` ${program.regionSigungu}` : ''}
              </dd>
            </div>
            {program.benefits && program.benefits.length > 0 && (
              <div className="col-span-2">
                <dt className="font-medium text-gray-500">혜택</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {program.benefits.map((b) => (
                    <span
                      key={b}
                      className="bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                    >
                      {b}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Announcements linked to this program */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0a1432]">연결된 공고</h2>
        <Link
          href={`/announcements/new?programId=${id}`}
          className="bg-[#e1fb36] px-4 py-2 text-sm font-medium text-[#0a1432] hover:bg-[#e1fb36]/80"
        >
          공고 추가
        </Link>
      </div>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">공고명</th>
              <th className="px-4 py-3 font-medium text-gray-700">직종</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집인원</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">게시상태</th>
              <th className="px-4 py-3 font-medium text-gray-700">모집기간</th>
              <th className="px-4 py-3 font-medium text-gray-700">조회수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {program.announcements?.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/announcements/${a.id}/edit`}
                    className="text-[#0a1432] underline-offset-2 hover:underline"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{a.jobType}</td>
                <td className="px-4 py-3">{a.capacity}명</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${recruitBadge(a.computedRecruitStatus)}`}
                  >
                    {recruitStatusLabel(a.computedRecruitStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium ${a.publishStatus === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {a.publishStatus === 'published' ? '게시' : '비게시'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {formatDate(a.recruitStartDate)} ~{' '}
                  {formatDate(a.recruitEndDate)}
                </td>
                <td className="px-4 py-3">{a.viewCount}</td>
              </tr>
            ))}
            {(!program.announcements || program.announcements.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  연결된 공고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
