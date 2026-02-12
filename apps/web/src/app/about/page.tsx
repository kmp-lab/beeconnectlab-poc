import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/announcements" className="text-xl font-bold text-navy">
            비커넥트랩
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm font-bold text-navy hover:opacity-70"
            >
              소개
            </Link>
            <Link
              href="/announcements"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              공고
            </Link>
            <Link
              href="/interviews"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              인터뷰
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-navy hover:opacity-70"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-navy">비커넥트랩</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            청년과 지역을 연결하는 플랫폼, 비커넥트랩은 지역의 다양한 활동
            기회를 청년들에게 제공합니다.
          </p>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border border-gray-200 p-6">
              <h3 className="mb-3 text-lg font-bold text-navy">
                지역 활동 연결
              </h3>
              <p className="text-sm text-gray-600">
                전국 각 지역의 프로그램과 활동 기회를 한눈에 확인하고 지원할 수
                있습니다.
              </p>
            </div>
            <div className="border border-gray-200 p-6">
              <h3 className="mb-3 text-lg font-bold text-navy">
                맞춤형 공고 안내
              </h3>
              <p className="text-sm text-gray-600">
                관심 지역과 희망 직무에 맞는 공고를 제공하여 효율적인 활동
                탐색을 돕습니다.
              </p>
            </div>
            <div className="border border-gray-200 p-6">
              <h3 className="mb-3 text-lg font-bold text-navy">
                참여자 인터뷰
              </h3>
              <p className="text-sm text-gray-600">
                실제 활동에 참여한 청년들의 생생한 이야기를 통해 활동의 가치를
                확인해보세요.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <Link
            href="/announcements"
            className="inline-block bg-lime px-8 py-3 text-sm font-bold text-navy hover:opacity-80"
          >
            공고 보러가기
          </Link>
        </section>
      </div>
    </main>
  );
}
