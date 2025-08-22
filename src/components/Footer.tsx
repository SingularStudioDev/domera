'use client';
import { FaFacebookSquare } from 'react-icons/fa';
import { FaSquareXTwitter, FaSquareInstagram } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="relative z-50 rounded-t-3xl bg-[#011D6F] text-white">
      <div className="flex h-full flex-col justify-between">
        {/* Contact Info */}
        <div className="container mx-auto flex h-full flex-col justify-between gap-6 px-4 py-12 md:flex-row md:gap-1 md:px-0 md:py-22">
          <div className="flex flex-col items-start">
            <p className="mb-1 text-xl font-semibold">Contacto</p>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Mail: contacto@domera.com.uy
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Dirección: Edificio Mansa Inn
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Teléfono: 094123123
            </a>

            <nav
              className="mt-4 hidden items-center gap-3 text-3xl md:flex"
              aria-label="Redes sociales de Domera"
            >
              <a
                href="https://instagram.com/domera.uy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguir a Domera en Instagram"
                className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
              >
                <FaSquareInstagram aria-hidden="true" />
              </a>
              <a
                href="https://x.com/Domera_uy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80">
                  <FaSquareXTwitter />
                </button>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61579610845284"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguir a Domera en Facebook"
                className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
              >
                <FaFacebookSquare aria-hidden="true" />
              </a>
              {/* <a
            href="https://linkedin.com/company/domera"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Conectar con Domera en LinkedIn"
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <FaLinkedin aria-hidden="true" />
          </a> */}
            </nav>
          </div>

          <div className="flex flex-col items-start">
            <p className="mb-1 text-xl font-semibold">Legales</p>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Términos y condiciones
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Política de privacidad{' '}
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Política de cookies{' '}
            </a>
          </div>

          <div className="flex flex-col items-start">
            <p className="mb-1 text-xl font-semibold">Contenido</p>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Blog
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Preguntas frecuentes
            </a>
          </div>

          <div className="flex flex-col items-start">
            <p className="mb-1 text-xl font-semibold">Servicios</p>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Marketing
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Desarrollo web
            </a>
            <a
              href="mailto:inversiones@domera.com"
              className="font-light text-white"
            >
              Desarrolladoras
            </a>
          </div>

          <nav
            className="mt-4 flex items-center gap-3 text-3xl md:hidden"
            aria-label="Redes sociales de Domera"
          >
            <a
              href="https://instagram.com/domera.uy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a Domera en Instagram"
              className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
            >
              <FaSquareInstagram aria-hidden="true" />
            </a>
            <a
              href="https://x.com/Domera_uy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80">
                <FaSquareXTwitter />
              </button>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61579610845284"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a Domera en Facebook"
              className="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
            >
              <FaFacebookSquare aria-hidden="true" />
            </a>
            {/* <a
            href="https://linkedin.com/company/domera"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Conectar con Domera en LinkedIn"
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <FaLinkedin aria-hidden="true" />
          </a> */}
          </nav>
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
}
