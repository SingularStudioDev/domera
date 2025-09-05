import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";

export function UnitPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24">
        <div>
          {/* UnitHeader Skeleton */}
          <div className="container mx-auto px-4 py-4 md:px-0">
            <Skeleton className="h-6 w-48" />
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="container mx-auto grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch">
            {/* UnitImageDisplay Skeleton */}
            <div>
              <Skeleton className="h-[564px] w-full rounded-3xl" />
            </div>

            {/* UnitInfo Skeleton */}
            <div className="flex h-full flex-col">
              {/* Unit Title and Info */}
              <div className="flex-1 space-y-6">
                {/* Unit Title and Heart */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-start gap-2">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-10 w-80" />
                  </div>
                </div>

                {/* Unit Details Grid */}
                <div className="space-y-4">
                  {/* Location Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>

                  {/* Orientation Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>

                  {/* Bathrooms Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>

                  {/* Bedrooms Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>

                  {/* Area Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>

                  {/* Completion Row */}
                  <div className="flex gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="mt-6 rounded-2xl border py-6 pr-4 pl-6">
                <div className="flex items-end justify-between">
                  <div>
                    <Skeleton className="mb-2 h-6 w-16" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <Skeleton className="h-12 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* UnitDescription Skeleton */}
          <div className="my-16 min-h-[40dvh] rounded-3xl bg-[#F5F5F5] py-10">
            <div className="container mx-auto">
              <Skeleton className="mb-6 h-8 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* UnitGallery Skeleton */}
          <div className="container mx-auto px-4 py-8 md:px-0">
            <Skeleton className="mb-6 h-8 w-32" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* InvestmentSection Skeleton */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="min-h-[40dvh] rounded-l-3xl bg-[#F5F5F5] p-8 pl-48">
                <Skeleton className="mb-6 h-8 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
              <div className="min-h-[40dvh] rounded-r-3xl bg-[#ECECEC] p-8 pr-48">
                <Skeleton className="mb-6 h-8 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ProcessSection Skeleton */}
          <section className="py-16">
            <div className="container mx-auto">
              <div className="flex flex-col gap-10 text-start">
                <Skeleton className="h-8 w-32" />
              </div>

              <div className="grid w-full grid-cols-1 gap-8 pt-20 pb-10 md:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
                    <Skeleton className="mx-auto h-6 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BottomCTA Skeleton */}
          <div className="container mx-auto px-4 py-8 md:px-0">
            <div className="rounded-3xl bg-gray-100 p-8 text-center">
              <Skeleton className="mx-auto mb-4 h-8 w-64" />
              <Skeleton className="mx-auto mb-6 h-4 w-96" />
              <Skeleton className="mx-auto h-12 w-48" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
