'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/components/Toast';

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

export default function NewProgramPage() {
  const router = useRouter();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api('/admin/programs', {
        method: 'POST',
        body: {
          ...form,
          regionSigungu: form.regionSigungu || null,
          benefits: form.benefits.length > 0 ? form.benefits : null,
        },
      });
      toast('프로그램이 생성되었습니다.');
      router.push('/programs');
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : '생성에 실패했습니다.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-[#0a1432]">
        새 프로그램 등록
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 bg-white p-6 border border-gray-200"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            프로그램명 <span className="text-red-500">*</span>
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
              주최 <span className="text-red-500">*</span>
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
              주관 <span className="text-red-500">*</span>
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
              활동 시작일 <span className="text-red-500">*</span>
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
              활동 종료일 <span className="text-red-500">*</span>
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
              시/도 <span className="text-red-500">*</span>
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0a1432] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a1432]/90 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/programs')}
            className="border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </>
  );
}
