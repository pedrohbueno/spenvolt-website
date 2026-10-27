import { Suspense } from 'react';
import SavingsContent from '@/components/savings/SavingsContent';

export default function SavingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500" role="status">Carregando…</p>}>
      <SavingsContent />
    </Suspense>
  );
}
