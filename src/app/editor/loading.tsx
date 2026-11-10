
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function EditorHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-6 w-28" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </header>
  );
}

function EditorTabsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1.5">
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-3 w-44 max-w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

function PhonePreviewSkeleton() {
  return (
    <div className="w-[270px] overflow-hidden rounded-[42px] border-[6px] border-gray-900 bg-white shadow-xl">
      <div className="flex h-[560px] flex-col items-center overflow-hidden px-5 pt-12">
        <Skeleton className="mb-5 h-20 w-20 rounded-full" />

        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-3 h-3 w-48" />
        <Skeleton className="mt-2 h-3 w-32" />

        <div className="mt-9 w-full space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <Skeleton className="mt-auto mb-8 h-3 w-24" />
      </div>
    </div>
  );
}

export default function EditorLoading() {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
      <EditorHeaderSkeleton />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:px-10 lg:pb-0 lg:pt-0">
        {/* Mobile editor / preview switch */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1.5 lg:hidden">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-12">
          {/* Editor */}
          <section className="min-w-0 lg:h-full lg:overflow-hidden lg:pb-16">
            <div className="mb-4 flex items-center justify-between gap-3 pt-2 lg:pt-10">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-40 max-w-[45%]" />
            </div>

            <EditorTabsSkeleton />

            <div className="mt-5">
              <ProfileFormSkeleton />
            </div>
          </section>

          {/* Desktop live preview */}
          <aside className="hidden flex-col items-center justify-center gap-5 lg:flex">
            <Skeleton className="h-4 w-28" />
            <PhonePreviewSkeleton />
            <Skeleton className="h-4 w-36" />
          </aside>
        </div>
      </main>
    </div>
  );
}
