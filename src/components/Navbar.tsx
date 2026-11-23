import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenPurchase: () => void;
}

const NAV_LINKS = [
  { href: '#hero', label: '3D 제품보기' },
  { href: '#game', label: '3D 미니게임' },
  { href: '#empathy', label: '피부고민' },
  { href: '#features', label: '핵심성분' },
  { href: '#proof', label: '어워드 & 후기' },
];

export default function Navbar({ onOpenPurchase }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Mark */}
        <a
          href="#hero"
          className="flex items-center shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-torriden-500 rounded-md"
          aria-label="토리든 공식 브랜드 홈"
        >
          <svg
            className="h-7 w-auto"
            viewBox="0 0 186 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Torriden 공식 로고"
          >
            <rect x="2" y="3" width="32" height="32" rx="4" stroke="#00A3FF" strokeWidth="2.6" />
            <rect x="7.5" y="8.5" width="21" height="21" rx="2" stroke="#bae0ff" strokeWidth="1.4" />
            <circle cx="18" cy="19" r="4.2" fill="#00A3FF" />
            <text
              x="44"
              y="27.5"
              fill="#090D16"
              fontFamily="Pretendard, Plus Jakarta Sans, -apple-system, sans-serif"
              fontSize="25"
              fontWeight="800"
              letterSpacing="-0.8"
            >
              Torriden
            </text>
          </svg>
        </a>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-600">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 hover:text-torriden-600 hover:underline underline-offset-4 transition-colors py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPurchase}
            className="bg-torriden-500 hover:bg-torriden-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-sm shadow-torriden-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0 min-h-[40px]"
          >
            구매하기
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-torriden-50 hover:text-torriden-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
