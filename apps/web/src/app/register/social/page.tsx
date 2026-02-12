'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Gender } from '@beeconnectlab/shared-types';
import { REGIONS } from '@/lib/regions';

interface FormData {
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender | '';
  interestRegions: string[];
  desiredJob: string;
  skills: string;
}

interface Terms {
  ageVerification: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  marketing: boolean;
}

const inputClass =
  'mt-1 block w-full border border-gray-300 px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-navy focus:outline-none';

export default function SocialRegisterPage() {
  return (
    <Suspense>
      <SocialRegisterForm />
    </Suspense>
  );
}

function SocialRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    birthDate: '',
    gender: '',
    interestRegions: [],
    desiredJob: '',
    skills: '',
  });
  const [terms, setTerms] = useState<Terms>({
    ageVerification: false,
    serviceTerms: false,
    privacyPolicy: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function toggleRegion(region: string) {
    setForm((prev) => ({
      ...prev,
      interestRegions: prev.interestRegions.includes(region)
        ? prev.interestRegions.filter((r) => r !== region)
        : [...prev.interestRegions, region],
    }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name) newErrors.name = '이름을 입력해 주세요.';
    if (!form.phone) newErrors.phone = '휴대폰 번호를 입력해 주세요.';
    if (!form.birthDate) newErrors.birthDate = '생년월일을 입력해 주세요.';
    if (!form.gender) newErrors.gender = '성별을 선택해 주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const allRequired =
    terms.ageVerification && terms.serviceTerms && terms.privacyPolicy;
  const allChecked = allRequired && terms.marketing;

  function toggleAll() {
    const next = !allChecked;
    setTerms({
      ageVerification: next,
      serviceTerms: next,
      privacyPolicy: next,
      marketing: next,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !allRequired) return;

    setLoading(true);
    setServerError('');

    try {
      await api('/auth/register/social', {
        method: 'POST',
        body: {
          name: form.name,
          phone: form.phone,
          birthDate: form.birthDate,
          gender: form.gender,
          interestRegions:
            form.interestRegions.length > 0 ? form.interestRegions : undefined,
          desiredJob: form.desiredJob || undefined,
          skills: form.skills || undefined,
          marketingConsent: terms.marketing,
        },
      });
      router.push('/announcements');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">추가 정보 입력</h1>
          <p className="mt-2 text-sm text-gray-500">
            소셜 회원가입을 완료해 주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-navy"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              readOnly
              value={email}
              className="mt-1 block w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
          </div>

          <section className="space-y-4">
            <h2 className="border-b-2 border-navy pb-2 text-base font-bold text-navy">
              기본 정보
            </h2>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-navy"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClass}
                placeholder="실명을 입력해 주세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-navy"
              >
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  updateField('phone', e.target.value.replace(/\D/g, ''))
                }
                className={inputClass}
                placeholder="01012345678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-navy"
              >
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
                className={inputClass}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-navy">
                성별 <span className="text-red-500">*</span>
              </span>
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField('gender', Gender.MALE)}
                  className={`flex-1 border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.gender === Gender.MALE
                      ? 'border-navy bg-navy text-white'
                      : 'border-gray-300 text-gray-600 hover:border-navy'
                  }`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => updateField('gender', Gender.FEMALE)}
                  className={`flex-1 border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.gender === Gender.FEMALE
                      ? 'border-navy bg-navy text-white'
                      : 'border-gray-300 text-gray-600 hover:border-navy'
                  }`}
                >
                  여
                </button>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-gray-300 pb-2 text-base font-bold text-navy">
              추가 정보{' '}
              <span className="text-sm font-normal text-gray-400">(선택)</span>
            </h2>

            <div className="relative">
              <label className="block text-sm font-medium text-navy">
                관심지역
              </label>
              <button
                type="button"
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="mt-1 flex w-full items-center justify-between border border-gray-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
              >
                <span
                  className={
                    form.interestRegions.length > 0
                      ? 'text-navy'
                      : 'text-gray-400'
                  }
                >
                  {form.interestRegions.length > 0
                    ? form.interestRegions.join(', ')
                    : '관심지역을 선택해 주세요'}
                </span>
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showRegionDropdown && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg">
                  {REGIONS.map((region) => (
                    <label
                      key={region}
                      className="flex cursor-pointer items-center px-3 py-2 text-sm text-navy hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.interestRegions.includes(region)}
                        onChange={() => toggleRegion(region)}
                        className="mr-2 h-4 w-4 accent-navy"
                      />
                      {region}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="desiredJob"
                className="block text-sm font-medium text-navy"
              >
                희망직무
              </label>
              <input
                id="desiredJob"
                type="text"
                value={form.desiredJob}
                onChange={(e) => updateField('desiredJob', e.target.value)}
                className={inputClass}
                placeholder="희망 직무를 입력해 주세요"
              />
            </div>

            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-navy"
              >
                보유역량
              </label>
              <input
                id="skills"
                type="text"
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                className={inputClass}
                placeholder="보유 역량을 입력해 주세요"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="border-b border-gray-300 pb-2 text-base font-bold text-navy">
              이용약관 동의
            </h2>

            <label className="flex cursor-pointer items-center gap-2 border border-gray-300 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-4 w-4 accent-navy"
              />
              <span className="text-sm font-bold text-navy">전체 동의</span>
            </label>

            <div className="space-y-2 pl-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={terms.ageVerification}
                  onChange={() =>
                    setTerms((t) => ({
                      ...t,
                      ageVerification: !t.ageVerification,
                    }))
                  }
                  className="h-4 w-4 accent-navy"
                />
                <span className="text-sm text-gray-700">
                  만 14세 이상입니다{' '}
                  <span className="text-red-500">(필수)</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={terms.serviceTerms}
                  onChange={() =>
                    setTerms((t) => ({ ...t, serviceTerms: !t.serviceTerms }))
                  }
                  className="h-4 w-4 accent-navy"
                />
                <span className="text-sm text-gray-700">
                  서비스 이용약관 동의{' '}
                  <span className="text-red-500">(필수)</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={terms.privacyPolicy}
                  onChange={() =>
                    setTerms((t) => ({ ...t, privacyPolicy: !t.privacyPolicy }))
                  }
                  className="h-4 w-4 accent-navy"
                />
                <span className="text-sm text-gray-700">
                  개인정보 수집 및 이용 동의{' '}
                  <span className="text-red-500">(필수)</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={terms.marketing}
                  onChange={() =>
                    setTerms((t) => ({ ...t, marketing: !t.marketing }))
                  }
                  className="h-4 w-4 accent-navy"
                />
                <span className="text-sm text-gray-700">
                  마케팅 이용 동의 <span className="text-gray-400">(선택)</span>
                </span>
              </label>
            </div>
          </section>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={loading || !allRequired}
            className="w-full bg-lime px-4 py-3.5 text-sm font-bold text-navy transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
