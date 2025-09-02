"use client";

import { useState } from "react";
import Link from "next/link";

import { syne } from "@/utils/Fonts";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeaderMobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
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

            <Button
              id="mobile-menu-button"
              className="text-primaryColor bg-transparent shadow-none hover:bg-transparent"
              onClick={handleMenuToggle}
            >
              <MenuIcon
                style={{ width: "25px", height: "25px" }}
                strokeWidth={2.2}
              />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
