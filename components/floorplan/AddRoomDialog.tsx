'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { KIND_PLURAL, defaultRoomName, formatArea, freeSlots, isSlotFree, nextFreeSlot } from '@/lib/floorplan';
import { AREA_BY_KIND, KINDS, KIND_LABEL, MAX_PER_FLOOR, type RoomKind } from '@/lib/house-plan';
import type { Room } from '@/types/floorplan';

interface Props {
  rooms: Room[];
  initialKind?: RoomKind; // quando o "+" de um slot livre da planta foi clicado
  initialSlot?: number;
  onConfirm: (kind: RoomKind, slot: number, name: string) => void;
  onClose: () => void;
}

export default function AddRoomDialog({ rooms, initialKind, initialSlot, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const nameId = useId();
  const [kind, setKind] = useState<RoomKind | null>(
    initialKind && freeSlots(initialKind, rooms) > 0
      ? initialKind
      : (KINDS.find((k) => freeSlots(k, rooms) > 0) ?? null),
  );
  const [name, setName] = useState('');

  // <dialog> nativo: já traz foco preso, ESC para fechar e fundo escurecido.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  // O slot clicado na planta só vale para o tipo clicado; nos outros usa o primeiro livre.
  const slot =
    kind === null
      ? null
      : kind === initialKind && initialSlot && isSlotFree(kind, initialSlot, rooms)
        ? initialSlot
        : nextFreeSlot(kind, rooms);
  const free = kind ? freeSlots(kind, rooms) : 0;
  const needsName = kind === 'OUTROS';
  const canConfirm = kind !== null && slot !== null && (!needsName || name.trim().length > 0);
  const finalName = kind && slot ? name.trim() || defaultRoomName(kind, slot) : '';

  function submit(e: FormEvent) {
    e.preventDefault();
    if (kind && slot !== null && canConfirm) onConfirm(kind, slot, name.trim());
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto w-[min(92vw,30rem)] rounded-xl p-0 shadow-xl backdrop:bg-black/50"
    >
      <form onSubmit={submit} className="flex flex-col gap-5 p-6">
        <h2 id={titleId} className="text-lg font-bold text-dark-blue">
          Adicionar seção
        </h2>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-dark-blue">Tipo de seção</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KINDS.map((k) => {
              const left = freeSlots(k, rooms);
              return (
                <label key={k} className="relative">
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    disabled={left === 0}
                    onChange={() => setKind(k)}
                    className="peer sr-only"
                  />
                  <span className="flex cursor-pointer flex-col rounded-lg border border-slate-300 px-3 py-2 text-sm text-dark-blue transition-colors hover:bg-slate-50 peer-checked:border-dark-blue peer-checked:bg-dark-blue peer-checked:text-yellow peer-checked:hover:bg-dark-blue peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                    <span className="font-semibold">{KIND_LABEL[k]}</span>
                    <span className="text-xs opacity-80">
                      {left === 0 ? 'Sem vagas' : `${left} ${left === 1 ? 'livre' : 'livres'}`}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <p role="status" className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-dark-blue">
          {kind === null ? (
            'Todos os slots deste andar estão ocupados.'
          ) : (
            <>
              Slots livres de {KIND_PLURAL[kind].toLowerCase()}:{' '}
              <strong className="tabular-nums">
                {free} de {MAX_PER_FLOOR[kind]}
              </strong>
              . Depois de adicionar, restarão <strong className="tabular-nums">{Math.max(free - 1, 0)}</strong>.
            </>
          )}
        </p>

        {kind !== null && (
          <div>
            <label htmlFor={nameId} className="text-sm font-semibold text-dark-blue">
              {needsName ? 'Nome' : 'Nome (opcional)'}
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required={needsName}
              placeholder={needsName ? 'Ex.: Escritório, Lavanderia' : slot ? defaultRoomName(kind, slot) : ''}
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-dark-blue"
            />
            {slot !== null && (
              <p className="mt-2 text-xs text-gray-500">
                Será adicionado: <strong className="text-dark-blue">{finalName}</strong> · {formatArea(AREA_BY_KIND[kind])}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-dark-blue hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className="rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>
    </dialog>
  );
}
