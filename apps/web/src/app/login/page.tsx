'use client';

import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">비커넥트랩</h1>
          <p className="mt-2 text-sm text-gray-500">로그인</p>
        </div>

        <div className="space-y-3">
          <a
            href={`${API_BASE}/auth/kakao`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] transition-colors hover:bg-[#FDD835]"
          >
            카카오 로그인
          </a>

          <a
            href={`${API_BASE}/auth/google`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Google 로그인
          </a>

          <Link
            href="/login/email"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            이메일 로그인
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
