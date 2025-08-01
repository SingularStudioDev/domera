'use client';

const Footer = () => {
  return (
    <footer className="h-[70vh] rounded-t-3xl bg-[#011D6F] text-white">
      <div className="flex h-full flex-col justify-between">
        {/* Contact Info */}
        <div className="container mx-auto flex h-full flex-col justify-center gap-1">
          <p className="text-xl font-semibold">Contacto</p>
          <a
            href="mailto:inversiones@domera.com"
            className="font-light text-white"
          >
            inversiones@domera.com
          </a>
        </div>

        {/* Large Logo */}

        <img
          src="/domera-logo.png"
          alt="Domera"
          className="h-auto w-full object-cover"
        />
      </div>
    </footer>
  );
};

export default Footer;
