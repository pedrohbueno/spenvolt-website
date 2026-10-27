'use client';

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const GAP_REM = 1; // equivale ao gap-4
const DESKTOP_QUERY = '(min-width: 768px)';

// 3 itens visíveis no desktop, 1 no mobile.
function subscribeToViewport(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
const getVisible = () => (window.matchMedia(DESKTOP_QUERY).matches ? 3 : 1);
const getServerVisible = () => 3;

// Distância em px entre o início de um item e o do próximo.
function getStep(el: HTMLElement) {
  const first = el.children[0] as HTMLElement | undefined;
  const second = el.children[1] as HTMLElement | undefined;
  if (!first) return 0;
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
}

function ArrowButton({
  side,
  label,
  disabled,
  onClick,
  children,
}: {
  side: 'left' | 'right';
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute ${side}-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl shadow-md transition duration-200 md:grid enabled:hover:scale-110 enabled:hover:bg-slate-100 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none`}
    >
      {children}
    </button>
  );
}

export default function Carousel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0); // primeiro item visível
  const visible = useSyncExternalStore(subscribeToViewport, getVisible, getServerVisible);

  const items = Children.toArray(children);
  const count = items.length;
  const lastIndex = Math.max(count - visible, 0);

  const syncIndex = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const step = getStep(el);
    if (!step) return;
    setIndex(Math.min(Math.max(Math.round(el.scrollLeft / step), 0), lastIndex));
  }, [lastIndex]);

  // Recalcula ao redimensionar (o ResizeObserver também dispara na montagem).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(syncIndex);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncIndex]);

  function go(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const step = getStep(el);
    const current = Math.round(el.scrollLeft / step);
    const target = Math.min(Math.max(current + dir, 0), lastIndex);
    el.scrollTo({ left: target * step, behavior: 'smooth' });
  }
  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      className={`relative md:px-12 ${className ?? ''}`}
    >
      <ArrowButton side="left" label="Anterior" disabled={index <= 0} onClick={() => go(-1)}>
        ‹
      </ArrowButton>

      <div
        ref={ref}
        onScroll={syncIndex}
        className={`flex snap-x snap-mandatory scroll-px-3 gap-4 overflow-x-auto px-3 py-6 scrollbar-none [&::-webkit-scrollbar]:hidden ${
          count < visible ? 'justify-center' : ''
        }`}
      >
        {items.map((child, i) => (
          <div
            key={i}
            style={{ flexBasis: `calc((100% - ${(visible - 1) * GAP_REM}rem) / ${visible})` }}
            className="min-w-0 shrink-0 grow-0 snap-start transition-[scale,translate] duration-300 ease-out hover:-translate-y-1.5 hover:scale-105 motion-reduce:transition-none *:block"
          >
            {child}
          </div>
        ))}
      </div>

      <ArrowButton side="right" label="Próximo" disabled={index >= lastIndex} onClick={() => go(1)} >
        ›
      </ArrowButton>
    </div>
  );
}