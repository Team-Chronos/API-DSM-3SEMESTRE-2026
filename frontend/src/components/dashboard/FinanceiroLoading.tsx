export default function FinanceiroLoading() {
  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        <div className="h-36 animate-pulse rounded-2xl bg-[#232329]" />

        <div className="grid gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl bg-[#232329]"
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-155 animate-pulse rounded-2xl bg-[#232329]" />
            <div className="h-155 animate-pulse rounded-2xl bg-[#232329]" />
          </div>

          <div className="h-170.25 animate-pulse rounded-2xl bg-[#232329]" />
        </div>
      </div>
    </section>
  );
}
