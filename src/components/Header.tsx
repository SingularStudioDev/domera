'use client';

import { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syne } from '@/utils/Fonts';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const menuItems = [
    { name: 'Propiedades', href: '#propiedades' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Preguntas', href: '#preguntas' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-[999] p-5">
      <div className="container mx-auto flex items-center justify-between gap-5 overflow-hidden">
        <div className="w-full rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5]">
          <div className="flex h-[70px] w-full items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className={`${syne.className} text-5xl font-bold text-blue-600`}
              >
                Domera
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 justify-end lg:flex">
              <div className="flex items-center space-x-8">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-0 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Login Button and Mobile Menu */}

        <div className="flex h-[70px] w-fit items-center rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5]">
          {/* Login Button - Desktop */}
          <div className="hidden items-center lg:flex">
            <div className="relative">
              <button
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className="flex cursor-pointer items-center space-x-1 rounded-md bg-transparent px-7 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600"
              >
                <span>Login</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isLoginOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-2 shadow-lg">
                  <a
                    href="#login"
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                  >
                    Iniciar Sesión
                  </a>
                  <a
                    href="#register"
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                  >
                    Registrarse
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            id="mobile-menu-button"
            className="bg-transparent text-[#252525] shadow-none hover:bg-transparent lg:hidden"
            onClick={handleMenuToggle}
          >
            <Menu style={{ width: '25px', height: '25px' }} strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
