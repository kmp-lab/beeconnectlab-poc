'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

const inputClass =
  'mt-1 block w-full border border-gray-300 px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-navy focus:outline-none';

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense>
      <ResetPasswordConfirmForm />
    </Suspense>
  );
}

function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!PASSWORD_REGEX.test(password)) {
      setError('8~16자 영문, 숫자, 특수기호를 포함해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await api('/auth/reset-password/confirm', {
        method: 'POST',
        body: { token, newPassword: password },
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-navy">비밀번호 변경 완료</h1>
          <p className="text-sm text-gray-500">
            비밀번호가 성공적으로 변경되었습니다.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-navy px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            로그인하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">새 비밀번호 설정</h1>
          <p className="mt-2 text-sm text-gray-500">
            새로운 비밀번호를 입력해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy"
            >
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="8~16자 영문, 숫자, 특수기호"
            />
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-navy"
            >
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-navy">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
