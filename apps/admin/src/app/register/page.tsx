'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api('/admin/auth/register', {
        method: 'POST',
        body: form,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('가입 신청 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            가입 신청 완료
          </h1>
          <p className="text-gray-600">
            가입 신청이 완료되었습니다. 승인 후 로그인 가능합니다.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            로그인 페이지로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          관리자 가입 신청
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="이메일 주소를 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              이름
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              휴대폰 번호
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="010-0000-0000"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '신청 중...' : '가입 신청'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
