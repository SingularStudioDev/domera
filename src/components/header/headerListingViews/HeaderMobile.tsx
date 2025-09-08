"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { syne } from "@/lib/utils/Fonts";
import { DoorOpenIcon, MenuIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { adminMenuItems, HeaderMenuItems, menuItems } from "../headerItems";

export default function HeaderMobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setIsMenuOpen(false);
  };

  return (
    <header className="absolute top-0 right-0 left-0 z-[999]">
      <div className="container mx-auto flex items-center justify-between gap-5 overflow-hidden">
        <div className="w-full rounded-b-2xl border border-[#DCDCDC] bg-[#F5F5F5]">
          <div className="flex h-[70px] w-full items-center justify-between px-6">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center">
                <h1
                  className={`${syne.className} text-primaryColor text-[30px] font-bold`}
                >
                  Domera
                </h1>
              </div>
            </Link>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen} modal={false}>
              <SheetTrigger asChild>
                <Button
                  id="mobile-menu-button"
                  className="text-primaryColor bg-transparent shadow-none hover:bg-transparent"
                >
                  <MenuIcon
                    style={{ width: "25px", height: "25px" }}
                    strokeWidth={2.2}
                  />
                </Button>
              </SheetTrigger>
              <SheetContent
                closeColor="text-primaryColor"
                closePosition="right"
                side="right"
                className="w-full border-[#DCDCDC] bg-[#F5F5F5]"
              >
                <SheetHeader>
                  <SheetTitle
                    className={`${syne.className} text-primaryColor absolute top-3 left-4 text-4xl font-bold`}
                  >
                    Domera
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-14 flex flex-col space-y-4">
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block rounded-md px-4 py-2 text-base font-medium transition-colors duration-200 ${
                            isActive
                              ? "text-primaryColor hover:text-primaryColor-hover bg-gray-100 hover:bg-gray-200"
                              : "hover:text-primaryColor text-black hover:bg-gray-100"
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  <Separator className="mx-4 border-[#DCDCDC]" />

                  {/* User Section */}
                  <div className="space-y-1">
                    {isLoading ? (
                      <div className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          Cargando...
                        </span>
                      </div>
                    ) : isAuthenticated && user ? (
                      // Authenticated user section
                      <>
                        <div className="mb-2 px-4 py-2">
                          <span className="text-sm font-medium text-gray-600">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                        {(isAdmin ? adminMenuItems : HeaderMenuItems).map(
                          (item) => {
                            const isActive = pathname === item.href;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center space-x-3 rounded-md px-4 py-2 text-base font-medium transition-colors duration-200 ${
                                  isActive
                                    ? "text-primaryColor hover:text-primaryColor-hover bg-gray-100 hover:bg-gray-200"
                                    : "hover:text-primaryColor text-black hover:bg-gray-100"
                                }`}
                              >
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                              </Link>
                            );
                          },
                        )}
                        <button
                          onClick={handleSignOut}
                          className="hover:text-primaryColor flex w-full items-center space-x-3 rounded-md px-4 py-3 text-left text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100"
                        >
                          <DoorOpenIcon className="h-5 w-5" />
                          <span>Salir</span>
                        </button>
                      </>
                    ) : (
                      // Non-authenticated user section
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="hover:text-primaryColor block rounded-md px-4 py-3 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100"
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsMenuOpen(false)}
                          className="hover:text-primaryColor block rounded-md px-4 py-3 text-base font-normal text-black transition-colors duration-200 hover:bg-gray-100"
                        >
                          Registrarse
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
