import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SkincareGame3D from './components/SkincareGame3D';
import ContentSections from './components/ContentSections';
import { OrderToast, ProductsModal, PurchaseModal } from './components/Modals';

export default function App() {
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number>(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPurchaseOpen(false);
        setProductsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleCompletePurchase = (quantity: number) => {
    setPurchaseOpen(false);
    setToastMsg(`다이브인 세럼 ${quantity}개 주문이 성공적으로 접수되었습니다!`);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar onOpenPurchase={() => setPurchaseOpen(true)} />

      <main>
        <HeroSection
          onOpenPurchase={() => setPurchaseOpen(true)}
          onOpenProducts={() => setProductsOpen(true)}
        />

        <SkincareGame3D onOpenPurchase={() => setPurchaseOpen(true)} />

        <ContentSections
          onOpenPurchase={() => setPurchaseOpen(true)}
          onOpenProducts={() => setProductsOpen(true)}
        />
      </main>

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onComplete={handleCompletePurchase}
      />

      <ProductsModal open={productsOpen} onClose={() => setProductsOpen(false)} />

      <OrderToast message={toastMsg} />
    </div>
  );
}
