'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { Gender } from '@beeconnectlab/shared-types';
import { REGIONS } from '@/lib/regions';

interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender | '';
  interestRegions: string[];
  desiredJob: string;
  skills: string;
}

const initialForm: FormData = {
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  birthDate: '',
  gender: '',
  interestRegions: [],
  desiredJob: '',
  skills: '',
};

interface Terms {
  ageVerification: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  marketing: boolean;
}

const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
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
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') {
      setEmailChecked(false);
      setEmailAvailable(false);
    }
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

  async function checkEmail() {
    if (!form.email) return;
    try {
      await api<{ available: boolean }>('/auth/check-email', {
        method: 'POST',
        body: { email: form.email },
      });
      setEmailChecked(true);
      setEmailAvailable(true);
      setErrors((prev) => ({ ...prev, email: undefined }));
    } catch {
      setEmailChecked(true);
      setEmailAvailable(false);
      setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.email) newErrors.email = '이메일을 입력해 주세요.';
    else if (!emailChecked || !emailAvailable)
      newErrors.email = '이메일 중복 확인이 필요합니다.';

    if (!form.password) newErrors.password = '비밀번호를 입력해 주세요.';
    else if (!PASSWORD_REGEX.test(form.password))
      newErrors.password = '8~16자 영문, 숫자, 특수기호를 포함해 주세요.';

    if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

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
      await api('/auth/register', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
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
    <main className="flex min-h-screen justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-sm text-gray-500">비커넥트랩에 가입하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">계정 정보</h2>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="example@email.com"
                />
                <button
                  type="button"
                  onClick={checkEmail}
                  className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  중복확인
                </button>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {emailChecked && emailAvailable && (
                <p className="mt-1 text-sm text-green-600">
                  사용 가능한 이메일입니다.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="8~16자 영문, 숫자, 특수기호"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                type="password"
                required
                value={form.passwordConfirm}
                onChange={(e) => updateField('passwordConfirm', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>
          </section>

          {/* Profile info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="실명을 입력해 주세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="01012345678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700"
              >
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                성별 <span className="text-red-500">*</span>
              </span>
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField('gender', Gender.MALE)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    form.gender === Gender.MALE
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => updateField('gender', Gender.FEMALE)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    form.gender === Gender.FEMALE
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  여
                </button>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </section>

          {/* Optional info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              추가 정보{' '}
              <span className="text-sm font-normal text-gray-400">(선택)</span>
            </h2>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                관심지역
              </label>
              <button
                type="button"
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <span
                  className={
                    form.interestRegions.length > 0
                      ? 'text-gray-900'
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
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                  {REGIONS.map((region) => (
                    <label
                      key={region}
                      className="flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.interestRegions.includes(region)}
                        onChange={() => toggleRegion(region)}
                        className="mr-2 h-4 w-4 rounded border-gray-300"
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
                className="block text-sm font-medium text-gray-700"
              >
                희망직무
              </label>
              <input
                id="desiredJob"
                type="text"
                value={form.desiredJob}
                onChange={(e) => updateField('desiredJob', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="희망 직무를 입력해 주세요"
              />
            </div>

            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700"
              >
                보유역량
              </label>
              <input
                id="skills"
                type="text"
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="보유 역량을 입력해 주세요"
              />
            </div>
          </section>

          {/* Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              이용약관 동의
            </h2>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-900">
                전체 동의
              </span>
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
                  className="h-4 w-4 rounded border-gray-300"
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
                  className="h-4 w-4 rounded border-gray-300"
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
                  className="h-4 w-4 rounded border-gray-300"
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
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  마케팅 이용 동의 <span className="text-gray-400">(선택)</span>
                </span>
              </label>
            </div>
          </section>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={loading || !allRequired}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
