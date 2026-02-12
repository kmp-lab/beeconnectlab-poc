'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-navy">500</h1>
      <p className="mt-4 text-lg text-navy">오류가 발생했습니다</p>
      <p className="mt-2 text-sm text-gray-500">
        일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-block bg-lime px-8 py-3 text-sm font-bold text-navy hover:opacity-80"
      >
        다시 시도
      </button>
    </main>
  );
}
