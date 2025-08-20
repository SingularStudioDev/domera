'use client';

const Hero = () => {
  const stats = [
    { value: '$0', label: 'Comisión inmobiliaria' },
    { value: '10+', label: 'Proyectos para elegir' },
    { value: '235+', label: 'Unidades disponibles' },
    { value: '6', label: 'Barrios para elegir' },
  ];

  return (
    <>
      <section className="relative mx-4 mt-10 h-[70vh] overflow-hidden md:mx-0 md:mt-30">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 container mx-auto">
          <div className="relative h-full overflow-hidden">
            <img
              src="/image-hero.png"
              alt="Propiedades en pozo"
              className="absolute inset-0 h-full w-full rounded-2xl object-cover"
            />
            <div className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-black/30 to-black/20"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto flex h-full flex-col items-start justify-start px-4 pt-6 pb-5 md:justify-between md:px-10 md:pt-10">
          <div className="text-white">
            <h1 className="mb-4 text-5xl leading-16 font-semibold md:leading-none md:font-[300] lg:text-7xl">
              Compra propiedades
              <br />
              <span>en pozo</span>
            </h1>
            <p className="text-3xl font-normal md:font-[200] lg:text-4xl">
              Sin comisiones inmobiliarias
            </p>
          </div>

          {/* Statistics - Desktop only */}
          <div className="hidden w-full grid-cols-4 justify-between gap-8 text-white lg:grid">
            {stats.map((stat, index) => (
              <div key={index} className="max-w-28 space-y-2 text-left">
                <div className="mb-1 text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm font-extralight tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics - Mobile below image */}
      <div className="container mx-auto mt-8 px-4 lg:hidden">
        <div className="grid w-full grid-cols-2 justify-between gap-8 text-black">
          {stats.map((stat, index) => (
            <div key={index} className="max-w-28 space-y-2 text-left">
              <div className="mb-1 text-5xl font-medium">{stat.value}</div>
              <div className="mt-2 text-sm tracking-wide opacity-80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;
