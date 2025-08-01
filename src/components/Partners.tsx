'use client';

const Partners = () => {
  return (
    <section className="py-32">
      <div className="container flex flex-col gap-20 mx-auto">
        {/* Main Message */}

        <h2 className="mb-4 text-3xl  text-black lg:text-7xl leading-tight">
          Invertí con propósito. <br /> Optimizá tu dinero en lo que te
          interesa.
        </h2>

        {/* Partner Logos */}
        <div className="flex items-center justify-start space-x-8 lg:space-x-16">
          {/* Placeholder logos - en un proyecto real, estos serían imágenes reales */}
        <img src="/des/des-1.png" alt="Partners"  className='w-auto h-20 object-cover' />

        <img src="/des/des-2.png" alt="Partners"  className='w-auto h-14 object-cover' />

        <img src="/des/des-3.png" alt="Partners"  className='w-auto h-12 object-cover' />
        </div>
      </div>
    </section>
  );
};

export default Partners;
