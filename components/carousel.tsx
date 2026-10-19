'use client';

import { useRef, type ReactNode } from 'react';

export default function Carousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl shadow-md hover:bg-slate-100"
      >
        ‹
      </button>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl shadow-md hover:bg-slate-100"
      >
        ›
      </button>
    </div>
  );
}