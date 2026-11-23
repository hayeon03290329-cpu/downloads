import { AlertTriangle, ArrowRight, Eye, Heart } from 'lucide-react';

interface ContentSectionsProps {
  onOpenPurchase: () => void;
  onOpenProducts: () => void;
}

const CONCERNS = [
  {
    icon: AlertTriangle,
    title: '속건조로 인한 답답한 당김',
    desc: '세안 후 물기를 닦자마자 찾아오는 심한 당김 현상으로 피부가 숨쉬기 답답하신 분',
  },
  {
    icon: Eye,
    title: '들뜨고 밀리는 메이크업',
    desc: '기초를 탄탄히 발랐다고 생각했는데도 오후만 되면 화장이 들뜨고 각질이 부각되는 분',
  },
  {
    icon: Heart,
    title: '예민하고 쉽게 지치는 피부',
    desc: '작은 외부 자극에도 쉽게 붉어지고 편안한 진정과 수분 충전이 동시에 필요한 분',
  },
];

const FEATURES = [
  {
    num: '01',
    title: '5D 복합 저분자 히알루론산',
    desc: '크기가 다른 5가지 고·중·저분자 히알루론산이 피부 틈새마다 촘촘하게 수분을 공급하여 겉과 속을 동시에 채워줍니다.',
  },
  {
    num: '02',
    title: 'D-판테놀 & 알란토인 진정',
    desc: '예민해진 피부를 편안하게 다독여주는 판테놀과 알란토인 성분이 함유되어 자극받은 피부 장벽을 건강하게 케어합니다.',
  },
  {
    num: '03',
    title: '산뜻한 파란빛 수분 제형',
    desc: '끈적임이나 밀림 없이 산뜻하게 흡수되는 워터리한 제형으로 메이크업 전 단계에서도 완벽한 밀착력을 자랑합니다.',
  },
];

const PROOFS = [
  { metric: '올영 1위', desc: '올리브영 어워즈 에센스 부문 수상' },
  { metric: '99%', desc: '속보습 개선 만족도' },
  { metric: '화해 3관왕', desc: '뷰티 어워드 에센스 1위' },
  { metric: '비건 인증', desc: '한국 비건 정식 인증 완료' },
];

export default function ContentSections({
  onOpenPurchase,
  onOpenProducts,
}: ContentSectionsProps) {
  return (
    <>
      {/* 3. Skin Concern Section */}
      <section id="empathy" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-torriden-600 font-bold text-xs tracking-wider mb-2">SKIN CONCERN</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 [text-wrap:balance]">
            혹시 이런 피부 고민을 가지고 계신가요?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-sm sm:text-base">
            아무리 바깥에 크림을 덧발라도 속에서부터 느껴지는 건조함과 들뜨는 메이크업, 원인은 바로 &lsquo;진짜 속보습&rsquo;의 부족입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONCERNS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 bg-torriden-50 rounded-full flex items-center justify-center text-torriden-500 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-torriden-600 font-bold text-xs tracking-wider mb-2">CORE FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 [text-wrap:balance]">
              토리든 다이브인만의 3가지 핵심 강점
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
              피부 깊숙이 스며드는 촘촘한 수분 과학으로 놀라운 변화를 선사합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat) => (
              <div
                key={feat.num}
                className="bg-torriden-50/40 border border-torriden-100/70 p-8 rounded-3xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-white group"
              >
                <div className="w-12 h-12 bg-torriden-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm shadow-torriden-500/20 tabular-nums">
                  {feat.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feat.num}. {feat.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Social Proof Section */}
      <section id="proof" className="py-20 bg-gradient-to-b from-white to-torriden-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-torriden-600 font-bold text-xs tracking-wider mb-2">SOCIAL PROOF</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 [text-wrap:balance]">
              수많은 소비자가 증명하는 다이브인 세럼
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
              어워드 다관왕과 압도적인 만족도가 제품의 우수성을 말해줍니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {PROOFS.map((p) => (
              <div
                key={p.metric}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs"
              >
                <div className="text-3xl sm:text-4xl font-black text-torriden-500 mb-2 tabular-nums">
                  {p.metric}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-torriden-500 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight [text-wrap:balance]">
            당신의 피부에 닿는 가장 순수한 수분 충전
          </h2>
          <p className="text-torriden-100 text-base sm:text-lg max-w-2xl mx-auto">
            지금 바로 토리든 다이브인 세럼과 함께 3초 속보습의 놀라운 변화를 시작해보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onOpenPurchase}
              className="w-full sm:w-auto bg-white text-torriden-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-torriden-50 transition-all hover:-translate-y-0.5 text-base whitespace-nowrap min-h-[48px]"
            >
              다이브인 세럼 구매하기
            </button>
            <button
              type="button"
              onClick={onOpenProducts}
              className="w-full sm:w-auto bg-torriden-600/80 hover:bg-torriden-700 text-white border border-white/30 font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 text-base inline-flex items-center justify-center gap-2 whitespace-nowrap min-h-[48px]"
            >
              <span>토리든의 다른 제품 보러가기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center">
              <svg
                className="h-7 w-auto"
                viewBox="0 0 186 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="3" width="32" height="32" rx="4" stroke="#00A3FF" strokeWidth="2.6" />
                <rect x="7.5" y="8.5" width="21" height="21" rx="2" stroke="#006699" strokeWidth="1.4" />
                <circle cx="18" cy="19" r="4.2" fill="#00A3FF" />
                <text
                  x="44"
                  y="27.5"
                  fill="#FFFFFF"
                  fontFamily="Pretendard, Plus Jakarta Sans, -apple-system, sans-serif"
                  fontSize="25"
                  fontWeight="800"
                  letterSpacing="-0.8"
                >
                  Torriden
                </text>
              </svg>
            </div>
            <p className="text-xs tracking-widest text-gray-400 mt-2 font-semibold">
              DEEP DIVE INTO YOUR SKIN · YOUR SKIN IS OUR PLANET
            </p>
          </div>
          <div className="text-xs text-gray-400 text-center md:text-right space-y-1">
            <p>&copy; 2026 Torriden Inc. All Rights Reserved.</p>
            <p>클린뷰티 &amp; 지속 가능한 수분 솔루션</p>
          </div>
        </div>
      </footer>
    </>
  );
}
