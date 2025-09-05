import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

export default function ProjectDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ProjectHero Skeleton */}
        <section className="relative h-[90dvh] overflow-hidden">
          <div>
            <div className="relative h-full overflow-hidden">
              <Skeleton className="h-[90dvh] w-full rounded-b-3xl" />

              {/* Project Info Overlay Skeleton */}
              <div className="absolute bottom-0 left-0 z-20 h-full w-full">
                <div className="container mx-auto flex h-full w-full flex-col items-start justify-between px-4 pt-28 pb-6 md:px-0">
                  <div className="mb-4 flex gap-4">
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                    <Skeleton className="h-12 w-24 rounded-2xl" />
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <div className="flex w-fit flex-col gap-3 rounded-2xl bg-white px-6 py-2">
                      <Skeleton className="h-8 w-64 md:h-14 md:w-96" />
                      <Skeleton className="h-6 w-48 md:h-10 md:w-72" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div>
          {/* ProjectInfo Skeleton */}
          <div className="container mx-auto px-4 py-8 md:px-0">
            <Skeleton className="mx-auto h-8 w-96" />
          </div>

          <div className="container mx-auto flex flex-col gap-10 px-4 md:flex-row md:px-0">
            <div className="flex flex-col gap-5">
              {/* ProjectDescription Skeleton */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-start justify-between md:flex-row">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="mb-2 h-8 w-48 md:mb-6" />
                    <div className="mb-8 max-w-[600px] space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col">
                      <Skeleton className="mb-2 h-5 w-20" />
                      <div className="mb-8 max-w-[600px] space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>

                    <div className="flex gap-5 md:gap-10">
                      <div>
                        <Skeleton className="mb-2 h-5 w-24" />
                        <div className="flex gap-4">
                          <Skeleton className="h-12 w-32" />
                        </div>
                      </div>

                      <div>
                        <Skeleton className="mb-2 h-5 w-24" />
                        <div className="flex gap-4">
                          <Skeleton className="h-12 w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ProjectDetails Skeleton */}
              <div className="mt-4 grid gap-8 md:mt-10 md:grid-cols-3">
                <div>
                  <Skeleton className="mb-4 h-6 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div>
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>

                <div>
                  <Skeleton className="mb-4 h-6 w-20" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>

              {/* ProjectImageCarousel Skeleton */}
              <div className="my-5 md:my-10">
                <Skeleton className="h-64 w-full rounded-lg md:h-96" />
                <div className="mt-4 flex justify-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
              </div>

              {/* ProjectLocation Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-64 w-full rounded-lg md:h-96" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>

              {/* ProjectProgress Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* AvailableUnits Skeleton */}
          <div className="container mx-auto px-4 py-8 md:px-0">
            <Skeleton className="mb-6 h-8 w-56" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <Skeleton className="mb-4 h-6 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="mt-4 h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
