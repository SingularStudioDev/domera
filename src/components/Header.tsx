'use client';

import { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { syne } from '@/utils/Fonts';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Proyectos', href: '/projects' },
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
            <Link href="/">
              <div className="flex items-center">
                <h1
                  className={`${syne.className} text-5xl font-bold text-blue-600`}
                >
                  Domera
                </h1>
              </div>{' '}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 justify-end lg:flex">
              <div className="flex items-center space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-0 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Login Button and Mobile Menu */}

        <div className="flex h-[70px] w-fit items-center rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5]">
          {/* Login Button - Desktop */}
          <div className="hidden items-center lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex cursor-pointer items-center space-x-1 rounded-md bg-transparent px-7 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600">
                  <span>Login</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex  w-fit p-4 rounded-2xl border border-[#DCDCDC] mt-5 bg-[#F5F5F5] flex-col justify-start items-start">
                <DropdownMenuItem asChild>
                  <a href="#login">Iniciar Sesión</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register">Registrarse</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
