interface ProjectHeroProps {
  title: string;
  price: string;
  location: string;
  date: string;
}

export default function ProjectHero({
  title,
  price,
  location,
  date,
}: ProjectHeroProps) {
  return (
    <section className="relative h-[95vh] overflow-hidden">
      <div>
        <div className="relative h-full overflow-hidden">
          <img
            src="/pro-hero.png"
            alt={title}
            className="h-[95vh] w-full rounded-b-3xl object-cover"
          />
          <div className="absolute inset-0 z-10 rounded-b-3xl bg-gradient-to-b from-black/10 to-black/50"></div>

          {/* Project Info Overlay */}
          <div className="absolute bottom-0 left-0 z-20 h-full w-full">
            <div className="container mx-auto flex h-full w-full flex-col items-start justify-between px-4 pt-28 pb-6 md:px-0">
              <div className="mb-4 flex gap-4">
                <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                  {location}
                </span>
                <span className="rounded-2xl bg-white px-4 py-2 text-lg font-medium text-black">
                  {date}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex w-fit flex-col gap-3 rounded-2xl bg-white px-6 py-2 text-black">
                  <h1 className="text-3xl font-semibold md:text-6xl">
                    {title}
                  </h1>
                  <p className="text-xl font-medium md:text-4xl">
                    Desde: {price}
                  </p>
                </div>

                {/* <img
                  src="/unit-spects.png"
                  alt={title}
                  className="hidden h-1/2 w-fit object-cover md:block"
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
