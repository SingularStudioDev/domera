"use client";

import { useIsMobile } from "@/hooks/use-mobile";

import HeaderDesktop from "./headerListingViews/HeaderDesktop";
import HeaderMobile from "./headerListingViews/HeaderMobile";

export default function Header() {
  const isMobile = useIsMobile();

  return isMobile ? <HeaderMobile /> : <HeaderDesktop />;
}
