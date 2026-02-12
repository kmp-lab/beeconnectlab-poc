'use client';

import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy">비커넥트랩</h1>
          <p className="mt-2 text-sm text-gray-500">로그인</p>
        </div>

        <div className="space-y-3">
          <a
            href={`${API_BASE}/auth/kakao`}
            className="flex w-full items-center justify-center gap-2 bg-[#FEE500] px-4 py-3.5 text-sm font-bold text-[#191919] transition-opacity hover:opacity-80"
          >
            카카오 로그인
          </a>

          <a
            href={`${API_BASE}/auth/google`}
            className="flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 transition-opacity hover:opacity-80"
          >
            Google 로그인
          </a>

          <Link
            href="/login/email"
            className="flex w-full items-center justify-center gap-2 bg-navy px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            이메일 로그인
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="font-bold text-navy hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
