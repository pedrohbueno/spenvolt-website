'use client';

import { useState, type FormEvent } from 'react';

type Props = {
  query: string;
  categories: string[];
  onSearch: (query: string) => void;
};

export default function OfferSearchBar({ query, categories, onSearch }: Props) {
  const [draft, setDraft] = useState(query);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = draft.trim();
    if (term) onSearch(term);
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} role="search" className="flex gap-2">
        <label className="sr-only" htmlFor="offer-search">Buscar produto</label>
        <input
          id="offer-search"
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ex.: geladeira, ar-condicionado"
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-dark-blue"
        />
        <button
          type="submit"
          className="rounded-lg bg-dark-blue px-4 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Buscar
        </button>
      </form>

      {categories.length > 0 && (
        <div role="group" aria-label="Sugestões dos seus aparelhos" className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = query.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setDraft(c);
                  onSearch(c);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-dark-blue text-yellow' : 'bg-white text-dark-blue shadow-sm hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
