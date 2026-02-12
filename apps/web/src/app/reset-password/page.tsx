'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { email },
      });
      setSent(true);
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

  async function handleResend() {
    setLoading(true);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { email },
      });
    } catch {
      // silently ignore resend errors
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">비밀번호 재설정</h1>
          <p className="mt-2 text-sm text-gray-500">
            {sent
              ? '비밀번호 재설정 링크를 발송했습니다.'
              : '가입한 이메일을 입력해 주세요.'}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="border border-lime bg-lime/10 p-4 text-center">
              <p className="text-sm text-navy">
                <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
                이메일을 확인해 주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-navy transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              이메일 다시 보내기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-navy focus:outline-none"
                placeholder="example@email.com"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '발송 중...' : '재설정 링크 발송'}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-navy">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
