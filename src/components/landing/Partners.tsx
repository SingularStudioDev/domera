"use client";

const Partners = () => {
  return (
    <section className="px-4 py-10 md:px-0 md:py-22">
      <div className="container mx-auto flex flex-col gap-10 md:gap-20">
        {/* Main Message */}

        <h2 className="text-3xl leading-tight text-black lg:text-7xl">
          Invertí con propósito. <br /> Optimizá tu dinero en lo que te
          interesa.
        </h2>

        {/* Partner Logos */}
        <div className="flex items-center justify-start space-x-4 lg:space-x-16">
          {/* Placeholder logos - en un proyecto real, estos serían imágenes reales */}
          <img
            src="/des/des-1.png"
            alt="Partners"
            className="h-10 w-auto object-cover md:h-20"
          />

          <img
            src="/des/des-2.png"
            alt="Partners"
            className="h-8 w-auto object-cover md:h-14"
          />

          <img
            src="/des/des-3.png"
            alt="Partners"
            className="h-6 w-auto object-cover md:h-12"
          />
        </div>
      </div>
    </section>
  );
};

export default Partners;
