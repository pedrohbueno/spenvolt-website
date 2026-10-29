'use client';

import Link from 'next/link';
import { AREA_BY_KIND, KIND_LABEL, MAX_PER_FLOOR, buildPlan, type PlanSlot, type RoomKind } from '@/lib/house-plan';
import { densityLevel, formatArea, type DensityLevel } from '@/lib/floorplan';
import { num } from '@/lib/format';

export interface PlanRoom {
  id: number | string;
  kind: RoomKind;
  slot: number; // número dentro do tipo: Quarto 1, Quarto 2...
  name: string;
  kwh: number | null;
}

interface HousePlanProps {
  rooms: PlanRoom[];
  onAddRoom?: (kind: RoomKind, slot: number) => void;
}

const LEVEL_UI: Record<DensityLevel, { label: string; shape: string; dot: string }> = {
  low: { label: 'Consumo baixo', shape: 'fill-green-50 stroke-green-500 group-hover:fill-green-100', dot: 'bg-green-500' },
  warning: { label: 'Em alerta', shape: 'fill-yellow-50 stroke-yellow-400 group-hover:fill-yellow-100', dot: 'bg-yellow-400' },
  high: { label: 'Acima do esperado', shape: 'fill-red-50 stroke-red-500 group-hover:fill-red-100', dot: 'bg-red-500' },
};

// Paredes de 8 unidades deixam folga: o scale não invade o cômodo vizinho.
const SLOT_MOTION =
  'group origin-center cursor-pointer outline-none [transform-box:fill-box] ' +
  'transition-[transform,filter] duration-200 ease-out ' +
  'hover:scale-[1.025] hover:[filter:drop-shadow(0_6px_8px_rgba(14,26,43,0.35))] ' +
  'focus-visible:scale-[1.025] focus-visible:[filter:drop-shadow(0_6px_8px_rgba(14,26,43,0.35))] ' +
  'active:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100';

const slotLabel = (slot: PlanSlot) =>
  MAX_PER_FLOOR[slot.kind] > 1 ? `${KIND_LABEL[slot.kind]} ${slot.index}` : KIND_LABEL[slot.kind];

// Nomes longos são cortados para caber no cômodo (o nome inteiro fica no tooltip).
function fit(name: string, width: number, compact: boolean) {
  const max = Math.floor((width - 12) / (compact ? 7.4 : 9));
  return name.length > max ? `${name.slice(0, Math.max(max - 1, 1))}…` : name;
}

function OccupiedSlot({ slot, room }: { slot: PlanSlot; room: PlanRoom }) {
  const ui = LEVEL_UI[densityLevel(room.kwh ?? 0, AREA_BY_KIND[slot.kind])];
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + slot.h / 2;
  const compact = slot.w < 110; // cômodos estreitos usam fonte menor

  return (
    // scroll={false}: só muda a query string, sem rolar a página.
    <Link
      href={`?room=${room.id}`}
      scroll={false}
      aria-label={`${room.name}, ${formatArea(AREA_BY_KIND[slot.kind])}, ${
        room.kwh === null ? 'sem dados' : `${num.format(room.kwh)} kWh`
      }, ${ui.label}`}
    >
      <g className={SLOT_MOTION}>
        <title>{room.name}</title>
        <rect
          x={slot.x + 1.5}
          y={slot.y + 1.5}
          width={slot.w - 3}
          height={slot.h - 3}
          rx={3}
          strokeWidth={3}
          className={`transition-[fill] duration-200 ${ui.shape}`}
        />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className={`pointer-events-none fill-dark-blue font-bold ${compact ? 'text-[13px]' : 'text-[17px]'}`}
        >
          {fit(room.name, slot.w, compact)}
        </text>
        <text x={cx} y={cy + 7} textAnchor="middle" className="pointer-events-none fill-gray-500 text-[12px]">
          {formatArea(AREA_BY_KIND[slot.kind])}
        </text>
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className={`pointer-events-none fill-dark-blue font-bold ${compact ? 'text-[13px]' : 'text-[15px]'}`}
        >
          {room.kwh === null ? '—' : `${num.format(room.kwh)} kWh`}
        </text>
      </g>
    </Link>
  );
}

function FreeSlot({ slot, onAdd }: { slot: PlanSlot; onAdd?: (kind: RoomKind, slot: number) => void }) {
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + slot.h / 2;
  const label = slotLabel(slot);
  const compact = slot.w < 110;
  const add = () => onAdd?.(slot.kind, slot.index);

  return (
    <g
      className={onAdd ? SLOT_MOTION : 'group'}
      role={onAdd ? 'button' : undefined}
      tabIndex={onAdd ? 0 : undefined}
      aria-label={onAdd ? `Adicionar ${label}` : undefined}
      onClick={onAdd ? add : undefined}
      onKeyDown={
        onAdd
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                add();
              }
            }
          : undefined
      }
    >
      <rect
        x={slot.x + 3}
        y={slot.y + 3}
        width={slot.w - 6}
        height={slot.h - 6}
        rx={3}
        strokeWidth={2}
        strokeDasharray="7 6"
        className="fill-gray-100 stroke-gray-400 transition-colors duration-200 group-hover:fill-gray-200"
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        className={`pointer-events-none fill-gray-500 font-bold ${compact ? 'text-[13px]' : 'text-[15px]'}`}
      >
        {label}
      </text>
      <text x={cx} y={cy + 3} textAnchor="middle" className="pointer-events-none fill-gray-400 text-[12px]">
        Livre
      </text>
      {onAdd && (
        <g transform={`translate(${cx} ${cy + 27})`} className="pointer-events-none">
          <circle r={11} className="fill-white stroke-gray-400 transition-colors group-hover:stroke-blue-start" strokeWidth={1.5} />
          <path
            d="M-5 0H5M0 -5V5"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="stroke-gray-400 group-hover:stroke-blue-start"
          />
        </g>
      )}
    </g>
  );
}

export default function HousePlan({ rooms, onAddRoom }: HousePlanProps) {
  const plan = buildPlan(rooms);
  const bySlot = new Map(rooms.map((r) => [`${r.kind}-${r.slot}`, r]));

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${plan.width} ${plan.height}`}
          role="group"
          aria-label="Planta da residência"
          className="mx-auto h-auto w-full overflow-visible"
          style={{ minWidth: plan.width * 0.6, maxWidth: plan.width * 1.4 }}
        >
          <rect width={plan.width} height={plan.height} rx={8} className="fill-dark-blue" />

          {plan.halls.map((h, i) => (
            <rect key={`hall-${i}`} x={h.x} y={h.y} width={h.w} height={h.h} className="fill-slate-100" />
          ))}

          {plan.slots.map((slot) => {
            const room = bySlot.get(slot.key);
            return slot.free || !room ? (
              <FreeSlot key={slot.key} slot={slot} onAdd={onAddRoom} />
            ) : (
              <OccupiedSlot key={slot.key} slot={slot} room={room} />
            );
          })}

          {/* Portas e janelas ficam por cima, para o hover dos cômodos não cobri-las. */}
          {plan.passages.map((p, i) => (
            <rect key={`pass-${i}`} x={p.x} y={p.y} width={p.w} height={p.h} className="fill-slate-100" />
          ))}

          {plan.windows.map((w, i) => (
            <g key={`win-${i}`} className="pointer-events-none">
              <rect x={w.box.x} y={w.box.y} width={w.box.w} height={w.box.h} className="fill-blue-100" />
              <line x1={w.line.x1} y1={w.line.y1} x2={w.line.x2} y2={w.line.y2} strokeWidth={1.5} className="stroke-dark-blue" />
            </g>
          ))}

          {plan.doors.map((d, i) => (
            <g key={`door-${i}`} className="pointer-events-none">
              <rect x={d.opening.x} y={d.opening.y} width={d.opening.w} height={d.opening.h} className="fill-white" />
              <path d={d.arc} fill="none" strokeWidth={1} strokeDasharray="3 3" className="stroke-gray-400" />
              <line
                x1={d.leaf.x1}
                y1={d.leaf.y1}
                x2={d.leaf.x2}
                y2={d.leaf.y2}
                strokeWidth={2.5}
                strokeLinecap="round"
                className="stroke-dark-blue"
              />
            </g>
          ))}
        </svg>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda">
        {Object.values(LEVEL_UI).map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-gray-500">
            <span aria-hidden="true" className={`h-3 w-3 rounded-full ${item.dot}`} />
            {item.label}
          </li>
        ))}
        <li className="flex items-center gap-2 text-sm text-gray-500">
          <span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-dashed border-gray-400 bg-gray-100" />
          Livre
        </li>
      </ul>
    </div>
  );
}
