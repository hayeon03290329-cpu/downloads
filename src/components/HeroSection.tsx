import { ArrowRight, Droplets } from 'lucide-react';
import ProductViewer3D from './ProductViewer3D';

interface HeroSectionProps {
  onOpenPurchase: () => void;
  onOpenProducts: () => void;
}

export default function HeroSection({ onOpenPurchase, onOpenProducts }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-torriden-50/50 via-white to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <p className="text-xs font-bold tracking-wide text-torriden-700">
              올영 1위* <span aria-hidden="true" className="mx-1.5 text-torriden-200">·</span> 5D 복합 저분자 히알루론산 세럼
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] [text-wrap:balance]">
              피부가 마시는
              <br />
              가장 깊은 수분,
              <br />
              <span className="text-torriden-500">3초 속보습</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed">
              속당김 없이 촘촘하게 채워지는 5D 복합 저분자 히알루론산의 청량한 수분 진정 솔루션을 3D로 직접 살펴보고 체험해보세요.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenPurchase}
                className="w-full sm:w-auto bg-torriden-500 hover:bg-torriden-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-torriden-500/25 transition-all hover:-translate-y-0.5 text-base whitespace-nowrap min-h-[48px]"
              >
                지금 바로 구매하기
              </button>
              <a
                href="#game"
                className="w-full sm:w-auto bg-torriden-50 text-torriden-700 hover:bg-torriden-100 font-bold px-6 py-3.5 rounded-xl border border-torriden-200 transition-all text-center inline-flex items-center justify-center gap-2 whitespace-nowrap min-h-[48px]"
              >
                <Droplets className="w-4 h-4 text-torriden-500" />
                <span>3D 세럼 바르기 게임</span>
              </a>
              <button
                type="button"
                onClick={onOpenProducts}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 hover:text-torriden-600 font-bold px-6 py-3.5 rounded-xl border border-gray-200 hover:border-torriden-200 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap min-h-[48px]"
              >
                <span>토리든의 다른 제품 보러가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ProductViewer3D />
        </div>
      </div>
    </section>
  );
}
