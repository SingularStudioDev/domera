'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Menu,
  User,
  ShoppingCartIcon,
  StarIcon,
  MessagesSquareIcon,
  DoorOpenIcon,
  BellIcon,
  LayoutDashboardIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { syne } from '@/utils/Fonts';
import Link from 'next/link';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin()
  const pathname = usePathname();

  const userMenuItems = [
    { title: 'Perfil', href: '/userDashboard', icon: User },
    { title: 'Compras', href: '/userDashboard', icon: ShoppingCartIcon },
    { title: 'Favoritos', href: '/userDashboard/favorites', icon: StarIcon },
    { title: 'Chat', href: '/userDashboard/chat', icon: MessagesSquareIcon },
    { title: 'Notificaciones', href: '/dashboard', icon: BellIcon },
  ];

  const adminMenuItems = [
    { title: 'Perfil', href: '/dashboard/profile', icon: User },
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
    { title: 'Chat', href: '/dashboard/chat', icon: MessagesSquareIcon },
  ]

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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
                  className={`${syne.className} text-[40px] font-bold text-blue-600`}
                >
                  Domera
                </h1>
              </div>{' '}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden flex-1 justify-end lg:flex">
              <div className="flex items-center gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent py-0 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600"
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
          {/* User/Login Section - Desktop */}
          <div className="hidden items-center lg:flex">
            {isLoading ? (
              <div className="flex items-center px-7 py-2">
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : isAuthenticated && user ? (
              // Dropdown para usuario autenticado
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="focus:ring-0 focus:outline-none"
                >
                  <button className="hover:text-blue-60 flex cursor-pointer items-center space-x-2 rounded-md bg-transparent px-5 text-base font-normal transition-colors duration-200 hover:bg-gray-100">
                    <span className="max-w-24 truncate">{user.firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="mt-7 w-fit rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5] p-2"
                >
                  {(isAdmin ? adminMenuItems : userMenuItems).map((item) => {
                    const isActive = item.href === pathname;

                    return (
                      <DropdownMenuItem
                        key={item.title}
                        asChild
                        className="cursor-pointer"
                      >
                        <Link
                          href={item.href}
                          className={`pr-5 ${isActive ? 'bg-primaryColor hover:bg-primaryColor-hover text-[#dcdcdc]' : 'hover:text-primaryColor text-black'} flex items-center space-x-2 transition-colors duration-200`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-base font-normal">
                            {item.title}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="group flex cursor-pointer items-center space-x-2 transition-colors duration-200 hover:text-[#0004FF]"
                  >
                    <DoorOpenIcon className="h-4 w-4 group-hover:text-[#0004FF]" />
                    <span className="text-base font-normal group-hover:text-[#0004FF]">
                      Salir
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Dropdown para usuario no autenticado (login original)
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex cursor-pointer items-center space-x-1 rounded-md bg-transparent px-7 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600">
                    <span>Login</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mt-5 flex w-fit flex-col items-start justify-start rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5] p-4"
                >
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a
                      href="/login"
                      className="group flex items-center space-x-2 transition-colors duration-200 hover:text-[#0004FF]"
                    >
                      <span className="text-base font-normal group-hover:text-[#0004FF]">
                        Iniciar Sesión
                      </span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/register"
                      className="group flex cursor-pointer items-center space-x-2 transition-colors duration-200 hover:text-[#0004FF]"
                    >
                      <span className="text-base font-normal group-hover:text-[#0004FF]">
                        Registrarse
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
