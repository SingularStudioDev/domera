'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DoorOpenIcon, LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { cn } from '@/utils/utils';

interface FloatingSidebarProps {
  menuItems: {
    title: string;
    href: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
  }[];
}

export function FloatingSidebar({ menuItems }: FloatingSidebarProps) {
  const [scrollY, setScrollY] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const calculateFooterHeight = () => {
      const footerElement = document.querySelector('footer');
      if (footerElement) {
        const footerRect = footerElement.getBoundingClientRect();
        setFooterHeight(footerRect.height);
      }
    };

    // Calculate footer height on mount and window resize
    calculateFooterHeight();
    window.addEventListener('resize', calculateFooterHeight);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateFooterHeight);
    };
  }, []);

  // Calculate translateY with footer collision detection
  const calculateTranslateY = () => {
    // Normal animation: move up when scrolling
    const baseTranslateY = Math.min(0, Math.max(-88, scrollY * -1));

    // Get footer position
    const footerElement = document.querySelector('footer');
    if (!footerElement) return baseTranslateY;

    const footerRect = footerElement.getBoundingClientRect();
    const footerTopInViewport = footerRect.top;

    // Calculate sidebar bottom position
    // Initial sidebar top: 112px (mt-28 = 7rem = 112px)
    // After animation: 112px - 88px = 24px (mt-6 = 1.5rem = 24px)
    // Sidebar height: calc(100vh - 136px)
    const sidebarTop = 112 + baseTranslateY; // Current top position
    const sidebarHeight = window.innerHeight - 136; // From CSS calc(100vh - 136px)
    const sidebarBottom = sidebarTop + sidebarHeight;

    // Margin before collision
    const collisionMargin = 20;

    // If sidebar would collide with footer, limit translateY
    if (sidebarBottom + collisionMargin > footerTopInViewport) {
      // Calculate how much we need to pull back
      const overlapAmount =
        sidebarBottom + collisionMargin - footerTopInViewport;
      return baseTranslateY - overlapAmount;
    }

    return baseTranslateY;
  };

  const translateY = calculateTranslateY();

  const isMenuItemActive = (itemHref: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 3) {
      const pathWithoutId = `/${pathSegments.slice(0, 2).join('/')}`;
      return pathWithoutId === itemHref;
    }

    return pathname === itemHref;
  };

  return (
    <motion.aside
      className={cn(
        'fixed z-[60] mt-28 w-64',
        'rounded-2xl border border-[#DCDCDC] bg-white',
        'flex flex-col'
      )}
      style={{
        height: 'calc(100vh - 136px)',
        translateY: `${translateY}px`,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 40,
      }}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-5 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = isMenuItemActive(item.href);

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2 text-base transition-all duration-300',
                    isActive
                      ? 'bg-primaryColor hover:bg-primaryColor-hover font-semibold text-white'
                      : 'bg-transparent text-gray-700 hover:bg-blue-50 hover:text-[#0004FF]'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="flex-shrink-0 p-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-base text-gray-700 transition-colors duration-300 hover:bg-blue-50 hover:text-[#0004FF]"
        >
          <DoorOpenIcon className="h-4 w-4" />
          <span>Salir</span>
        </Link>
      </div>
    </motion.aside>
  );
}
