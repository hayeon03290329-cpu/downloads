import { useState } from 'react';
import { Check, Droplets, ExternalLink, Leaf, Minus, Plus, Shield, Sparkles, X } from 'lucide-react';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (quantity: number) => void;
}

export function PurchaseModal({ open, onClose, onComplete }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!open) return null;

  const totalPrice = (21000 * quantity).toLocaleString('ko-KR');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-torriden-100 text-torriden-600 rounded-full flex items-center justify-center mx-auto">
            <Droplets className="w-7 h-7" />
          </div>
          <h3 id="purchase-modal-title" className="text-2xl font-extrabold text-gray-900">
            토리든 다이브인 세럼
          </h3>
          <p className="text-gray-600 text-sm">
            50ml 기획세트를 바로 주문하실 수 있는 시뮬레이션 결제 창입니다.
          </p>

          <div className="bg-torriden-50 p-4 rounded-2xl text-left text-xs text-gray-700 space-y-2 border border-torriden-100">
            <p className="font-bold text-torriden-700">상품 정보</p>
            <p>용량 · 50ml 기획세트 (무료배송)</p>
            <div className="flex items-center justify-between pt-2 border-t border-torriden-100">
              <span className="font-semibold text-gray-700">수량 선택</span>
              <div className="inline-flex items-center gap-2 bg-white rounded-lg border border-torriden-200 px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  aria-label="수량 감소"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100"
                  aria-label="수량 증가"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm font-extrabold text-gray-900 pt-1">
              <span>최종 결제 금액</span>
              <span className="text-torriden-600 tabular-nums">{totalPrice}원</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                onComplete(quantity);
                setQuantity(1);
              }}
              className="flex-1 bg-torriden-500 hover:bg-torriden-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-md shadow-torriden-500/20"
            >
              주문 완료하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductsModalProps {
  open: boolean;
  onClose: () => void;
}

const OTHER_PRODUCTS = [
  {
    tag: '5D 수분 충전',
    title: '다이브인 수딩 크림 & 토너',
    desc: '저분자 히알루론산으로 세안 직후부터 크림 단계까지 빈틈없는 수분 레이어링',
    icon: Droplets,
    cardBg: 'border-sky-100 bg-sky-50/60 hover:border-torriden-300',
    iconBg: 'bg-torriden-500',
    tagColor: 'text-torriden-600',
  },
  {
    tag: '5D 시카 진정',
    title: '밸런스풀 시카 진정 세럼',
    desc: '민감하고 붉어진 피부를 산뜻하게 다독여주는 T-Percent 특허 시카 케어',
    icon: Leaf,
    cardBg: 'border-emerald-100 bg-emerald-50/60 hover:border-emerald-300',
    iconBg: 'bg-emerald-500',
    tagColor: 'text-emerald-700',
  },
  {
    tag: '5D 세라마이드 장벽',
    title: '솔리드인 세라마이드 크림',
    desc: '무너진 피부 장벽을 탄탄하게 채워 깊은 보습감을 선사하는 고보습 장벽 케어',
    icon: Shield,
    cardBg: 'border-amber-100 bg-amber-50/60 hover:border-amber-300',
    iconBg: 'bg-amber-400',
    tagColor: 'text-amber-700',
  },
  {
    tag: '5D 콜라겐 · 비타C',
    title: '셀메이징 탄력 & 잡티 앰플',
    desc: '저분자 콜라겐 모공 탄력 및 5가지 비타민C 브라이트닝 기능성 케어',
    icon: Sparkles,
    cardBg: 'border-rose-100 bg-rose-50/60 hover:border-rose-300',
    iconBg: 'bg-rose-400',
    tagColor: 'text-rose-600',
  },
];

export function ProductsModal({ open, onClose }: ProductsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="products-modal-title"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <p className="text-torriden-600 text-xs font-extrabold tracking-wider mb-1">
              TORRIDEN LINEUP
            </p>
            <h3 id="products-modal-title" className="text-2xl font-extrabold text-gray-900">
              토리든의 다른 제품 라인업
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              피부 고민별 성분 중심 · 흡수 설계 솔루션을 만나보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {OTHER_PRODUCTS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href="https://www.torriden.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-4 rounded-2xl border hover:bg-white hover:shadow-md transition-all flex items-start gap-3.5 ${item.cardBg}`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold ${item.tagColor}`}>{item.tag}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-torriden-500 transition-colors shrink-0" />
                  </div>
                  <h4 className="font-extrabold text-gray-900 mt-0.5 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </a>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="sm:w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            닫기
          </button>
          <a
            href="https://www.torriden.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-2/3 bg-torriden-500 hover:bg-torriden-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-md shadow-torriden-500/20 flex items-center justify-center gap-2"
          >
            <span>토리든 공식몰에서 전체 제품 보기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface OrderToastProps {
  message: string | null;
}

export function OrderToast({ message }: OrderToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-toast-in">
      <span className="w-6 h-6 rounded-full bg-torriden-500 text-white flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5" />
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
