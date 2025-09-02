"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { syne } from "@/utils/Fonts";
import { ChevronDown, ChevronDownIcon, DoorOpenIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { adminMenuItems, HeaderMenuItems, menuItems } from "../headerItems";

export default function HeaderDesktop() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`${pathname.startsWith("/userDashboard") ? "absolute" : "fixed"} top-0 right-0 left-0 z-[2000] p-5`}
    >
      <div className="container mx-auto flex items-center justify-between gap-5 overflow-hidden">
        <div className="w-full rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5]">
          <div className="flex h-[70px] w-full items-center justify-between px-6">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center">
                <h1
                  className={`${syne.className} text-primaryColor text-[40px] font-bold`}
                >
                  Domera
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex flex-1 justify-end">
              <div className="flex items-center gap-6">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent py-0 text-base transition-colors duration-200 hover:bg-gray-100 ${
                        isActive
                          ? "text-primaryColor hover:text-primaryColor-hover font-medium"
                          : "hover:text-primaryColor font-normal text-black"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* User/Login Section */}
        <div className="flex h-[70px] w-fit max-w-52 items-center justify-center rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5] px-7">
          <div className="flex items-center">
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
                  <button className="hover:text-blue-60 flex cursor-pointer items-center space-x-2 rounded-md bg-transparent text-base font-normal transition-colors duration-200 hover:bg-gray-100">
                    <span className="w-fit max-w-44 truncate">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  className="mt-7 ml-4.5 w-fit rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5] p-2"
                >
                  {(isAdmin ? adminMenuItems : HeaderMenuItems).map((item) => {
                    const isActive = item.href === pathname;

                    return (
                      <DropdownMenuItem
                        key={item.title}
                        asChild
                        className="cursor-pointer"
                      >
                        <Link
                          href={item.href}
                          className={`pr-5 ${isActive ? "bg-primaryColor hover:bg-primaryColor-hover text-[#dcdcdc]" : "hover:text-primaryColor text-black"} flex items-center space-x-2 transition-colors duration-200`}
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
              // Dropdown para usuario no autenticado
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-full">
                  <button className="hover:text-primaryColor flex w-full cursor-pointer items-center justify-between gap-3 text-base font-normal text-black transition-colors duration-200 outline-none hover:bg-gray-100">
                    <span>Login</span>
                    <ChevronDown className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="mt-7 flex w-fit flex-col items-start justify-start rounded-2xl border border-[#DCDCDC] bg-[#F5F5F5] p-2"
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
        </div>
      </div>
    </header>
  );
}
