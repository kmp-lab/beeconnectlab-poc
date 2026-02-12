import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-navy">404</h1>
      <p className="mt-4 text-lg text-navy">페이지를 찾을 수 없습니다</p>
      <p className="mt-2 text-sm text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link
        href="/announcements"
        className="mt-8 inline-block bg-lime px-8 py-3 text-sm font-bold text-navy hover:opacity-80"
      >
        공고 목록으로 이동
      </Link>
    </main>
  );
}
