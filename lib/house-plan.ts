export type RoomKind = 'QUARTO' | 'BANHEIRO' | 'COZINHA' | 'SALA' | 'OUTROS';

export const KINDS: RoomKind[] = ['QUARTO', 'BANHEIRO', 'COZINHA', 'SALA', 'OUTROS'];

export const KIND_LABEL: Record<RoomKind, string> = {
  QUARTO: 'Quarto',
  BANHEIRO: 'Banheiro',
  COZINHA: 'Cozinha',
  SALA: 'Sala',
  OUTROS: 'Outros',
};

// Área média por tipo (m²), usada só para a densidade de consumo.
export const AREA_BY_KIND: Record<RoomKind, number> = {
  QUARTO: 10,
  BANHEIRO: 4.5,
  COZINHA: 9,
  SALA: 18,
  OUTROS: 8,
};

// Máximo por andar: é o que cabe no canvas (CANVAS_W x ~684) sem passar do tamanho mínimo.
export const MAX_PER_FLOOR: Record<RoomKind, number> = {
  QUARTO: 8,
  BANHEIRO: 7,
  COZINHA: 2,
  SALA: 3,
  OUTROS: 1,
};

export const canAddRoom = (kind: RoomKind, currentCount: number) => currentCount < MAX_PER_FLOOR[kind];

/* -------------------------------------------------------------------------- */
/* Parâmetros do desenho (unidades do SVG)                                    */
/* -------------------------------------------------------------------------- */

const CANVAS_W = 1000; // largura máxima da planta
const CANVAS_MIN_W = 520; // largura mínima, para poucos cômodos não ficarem gigantes

// w: largura ideal; min: o menor que o cômodo pode ficar quando a linha aperta.
const SIZE: Record<RoomKind, { w: number; min: number }> = {
  QUARTO: { w: 180, min: 135 },
  BANHEIRO: { w: 120, min: 90 },
  COZINHA: { w: 180, min: 135 },
  SALA: { w: 250, min: 188 },
  OUTROS: { w: 140, min: 105 },
};

const SOCIAL_H = 200;
const PRIVATE_H = 190;
const HALL_H = 52;
const CONNECTOR_W = 60; // passagem vertical entre os dois corredores

const FRAME = 3; // parede externa
const WALL = 1; // parede interna
const DOOR = 40; // largura da porta
const MIN_EDGE = 66; // divisa mínima para caber uma porta
const GAP = 3; // o vão da porta também cobre o traço de contorno dos cômodos

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Edge {
  orient: 'v' | 'h'; // v: parede vertical em x = pos; h: parede horizontal em y = pos
  pos: number;
  from: number;
  to: number;
}
interface Cell extends Rect {
  id: string; // 'QUARTO-2' ou 'HALL-1'
  kind: RoomKind | 'HALL';
  index: number;
}

export interface PlanSlot extends Rect {
  key: string; // 'QUARTO-2'
  kind: RoomKind;
  index: number;
  free: boolean; // true: slot vazio (convite para cadastrar)
}
export interface PlanDoor {
  opening: Rect;
  leaf: { x1: number; y1: number; x2: number; y2: number };
  arc: string;
}
export interface PlanWindow {
  box: Rect;
  line: { x1: number; y1: number; x2: number; y2: number };
}
export interface Plan {
  width: number;
  height: number;
  halls: Rect[];
  slots: PlanSlot[];
  passages: Rect[]; // aberturas entre corredores, sem porta
  doors: PlanDoor[];
  windows: PlanWindow[];
  links: [string, string][]; // ligações entre cômodos ('EXT' é a rua), úteis para testar
}

export interface PlanRoomRef {
  kind: RoomKind;
  slot: number;
}

/* -------------------------------------------------------------------------- */
/* Empacotamento: decide linhas, corredores e larguras                        */
/* -------------------------------------------------------------------------- */

type CellSpec = [key: string, width: number];
interface RowSpec {
  h: number;
  cells: CellSpec[];
}
interface Layout {
  rows: RowSpec[];
  entrance: 'top' | 'left';
}

const HALL = 'HALL';
const kindOf = (key: string) => key.split('-')[0] as RoomKind | 'HALL';
const naturalWidth = (key: string) => (key === HALL ? CONNECTOR_W : SIZE[kindOf(key) as RoomKind].w);
const rowWidth = (keys: string[]) => keys.reduce((sum, k) => sum + naturalWidth(k), 0);

function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

// "Outros" vai para a linha mais vazia, para equilibrar as larguras.
function addOther(rows: string[][], other: string[], extra: number[] = []) {
  if (!other.length) return;
  let lightest = 0;
  rows.forEach((r, i) => {
    if (rowWidth(r) + (extra[i] ?? 0) < rowWidth(rows[lightest]) + (extra[lightest] ?? 0)) lightest = i;
  });
  rows[lightest].push(...other);
}

// Estica ou comprime a linha até somar exatamente `total`.
function scaleRow(keys: string[], total: number): CellSpec[] {
  const natural = rowWidth(keys);
  let used = 0;
  return keys.map((key, i) => {
    const w = i === keys.length - 1 ? total - used : Math.round((naturalWidth(key) * total) / natural);
    used += w;
    return [key, w] as CellSpec;
  });
}

function pack(slots: Record<RoomKind, number[]>): Layout {
  const keys = (kind: RoomKind) => slots[kind].map((n) => `${kind}-${n}`);
  const social = interleave(keys('SALA'), keys('COZINHA'));
  const quartos = keys('QUARTO');
  const banheiros = keys('BANHEIRO');
  const other = keys('OUTROS');
  const priv = interleave(quartos, banheiros);

  let cellRows: string[][];
  let bands: ('cells' | 'hall')[];
  let heights: number[];
  let entrance: 'top' | 'left' = 'top';

  if (priv.length <= 2) {
    // Poucos cômodos privados: sem corredor, os quartos abrem direto para a sala.
    cellRows = [social, priv];
    addOther(cellRows, other);
    bands = ['cells', 'cells'];
    heights = [SOCIAL_H, PRIVATE_H];
  } else if (rowWidth(priv) <= CANVAS_W * 1.1) {
    // Social em cima, corredor, privado embaixo.
    cellRows = [social, priv];
    addOther(cellRows, other);
    bands = ['cells', 'hall', 'cells'];
    heights = [SOCIAL_H, HALL_H, PRIVATE_H];
  } else {
    // Privado não cabe numa linha: divide em duas, com o social no meio e um corredor de cada lado.
    // Os pares quarto + banheiro ficam juntos.
    const units = quartos.map((q, i) => (banheiros[i] ? [q, banheiros[i]] : [q]));
    units.push(...banheiros.slice(quartos.length).map((b) => [b]));
    const total = rowWidth(priv);
    let cut = 1;
    let acc = 0;
    let bestGap = Infinity;
    units.forEach((u, i) => {
      acc += rowWidth(u);
      const gap = Math.abs(acc - total / 2);
      if (gap < bestGap && i < units.length - 1) {
        bestGap = gap;
        cut = i + 1;
      }
    });
    const p1 = units.slice(0, cut).flat();
    const p2 = units.slice(cut).flat();
    cellRows = [p1, social, p2];
    addOther(cellRows, other, [0, CONNECTOR_W, 0]);
    cellRows[1].push(HALL); // passagem que liga os dois corredores
    bands = ['cells', 'hall', 'cells', 'hall', 'cells'];
    heights = [PRIVATE_H, HALL_H, SOCIAL_H, HALL_H, PRIVATE_H];
    entrance = 'left';
  }

  const width = Math.min(CANVAS_W, Math.max(CANVAS_MIN_W, ...cellRows.map(rowWidth)));
  let next = 0;
  const rows = bands.map((band, i): RowSpec => {
    if (band === 'hall') return { h: heights[i], cells: [[HALL, width]] };
    return { h: heights[i], cells: scaleRow(cellRows[next++], width) };
  });
  return { rows, entrance };
}

/* -------------------------------------------------------------------------- */
/* Geometria: células, divisas, portas e janelas                              */
/* -------------------------------------------------------------------------- */

function layoutCells(layout: Layout) {
  const cells: Cell[] = [];
  const width = layout.rows[0].cells.reduce((sum, [, w]) => sum + w, 0);
  let y = 0;
  let halls = 0;

  for (const r of layout.rows) {
    let x = 0;
    for (const [key, w] of r.cells) {
      const hall = key === HALL;
      const [kind, index] = hall ? [HALL, 0] : key.split('-');
      cells.push({
        id: hall ? `HALL-${++halls}` : key,
        kind: kind as Cell['kind'],
        index: Number(index),
        x,
        y,
        w,
        h: r.h,
      });
      x += w;
    }
    y += r.h;
  }
  return { cells, width, height: y };
}

function sharedEdge(a: Rect, b: Rect): Edge | null {
  if (a.x + a.w === b.x || b.x + b.w === a.x) {
    const pos = a.x + a.w === b.x ? b.x : a.x;
    const from = Math.max(a.y, b.y);
    const to = Math.min(a.y + a.h, b.y + b.h);
    if (to > from) return { orient: 'v', pos, from, to };
  }
  if (a.y + a.h === b.y || b.y + b.h === a.y) {
    const pos = a.y + a.h === b.y ? b.y : a.y;
    const from = Math.max(a.x, b.x);
    const to = Math.min(a.x + a.w, b.x + b.w);
    if (to > from) return { orient: 'h', pos, from, to };
  }
  return null;
}

// Porta numa parede vertical em x = xw, com o topo em `top`, abrindo para o lado `into`.
function verticalDoor(xw: number, top: number, into: 'left' | 'right', outer = 0): PlanDoor {
  const s = into === 'right' ? 1 : -1;
  const wall = FRAME + xw;
  const y = FRAME + top;
  const edge = wall + s * (WALL / 2); // borda do cômodo onde a porta abre
  return {
    opening: { x: wall - WALL / 2 - (outer || GAP), y, w: WALL + (outer || GAP) + GAP, h: DOOR },
    leaf: { x1: edge, y1: y, x2: edge + s * DOOR, y2: y },
    arc: `M ${edge + s * DOOR} ${y} A ${DOOR} ${DOOR} 0 0 ${s === 1 ? 1 : 0} ${edge} ${y + DOOR}`,
  };
}

// Porta numa parede horizontal em y = yw, com a esquerda em `left`, abrindo para o lado `into`.
function horizontalDoor(yw: number, left: number, into: 'top' | 'bottom', outer = 0): PlanDoor {
  const s = into === 'bottom' ? 1 : -1;
  const wall = FRAME + yw;
  const x = FRAME + left;
  const edge = wall + s * (WALL / 2);
  return {
    opening: { x, y: wall - WALL / 2 - (outer || GAP), w: DOOR, h: WALL + (outer || GAP) + GAP },
    leaf: { x1: x, y1: edge, x2: x, y2: edge + s * DOOR },
    arc: `M ${x} ${edge + s * DOOR} A ${DOOR} ${DOOR} 0 0 ${s === 1 ? 0 : 1} ${x + DOOR} ${edge}`,
  };
}

function interiorDoor(edge: Edge, into: Rect): PlanDoor {
  const mid = (edge.from + edge.to) / 2;
  // Em parede vertical a porta sobe um pouco, para a folha não cruzar o nome do cômodo.
  const high = Math.min(edge.from + 14, mid - DOOR / 2);
  return edge.orient === 'v'
    ? verticalDoor(edge.pos, high, into.x >= edge.pos ? 'right' : 'left')
    : horizontalDoor(edge.pos, mid - DOOR / 2, into.y >= edge.pos ? 'bottom' : 'top');
}

// A porta da rua atravessa também a parede externa, que é mais grossa que as internas.
function entranceDoor(cell: Cell, side: 'top' | 'left'): PlanDoor {
  const outer = FRAME - WALL / 2;
  return side === 'top'
    ? horizontalDoor(0, cell.x + cell.w / 2 - DOOR / 2, 'bottom', outer)
    : verticalDoor(0, cell.y + cell.h / 2 - DOOR / 2, 'right', outer);
}

// Com quem cada tipo de cômodo faz divisa pela porta, em ordem de preferência.
const DOOR_PREFERENCE: Record<RoomKind, (RoomKind | 'HALL')[]> = {
  QUARTO: ['HALL', 'SALA'],
  BANHEIRO: ['HALL', 'QUARTO', 'SALA'],
  COZINHA: ['SALA', 'HALL'],
  SALA: ['HALL'],
  OUTROS: ['HALL', 'COZINHA', 'SALA'],
};

function windowFor(cell: Cell, width: number, height: number, skip?: 'top' | 'left'): PlanWindow | null {
  const sides = [
    { side: 'top', on: cell.y === 0, len: cell.w },
    { side: 'bottom', on: cell.y + cell.h === height, len: cell.w },
    { side: 'left', on: cell.x === 0, len: cell.h },
    { side: 'right', on: cell.x + cell.w === width, len: cell.h },
  ].filter((s) => s.on && s.side !== skip);

  const best = sides.sort((a, b) => b.len - a.len)[0];
  if (!best || best.len < 60) return null;

  const size = cell.kind === 'BANHEIRO' ? 30 : Math.min(Math.max(best.len * 0.4, 40), 110);
  const thick = FRAME + WALL / 2;

  if (best.side === 'top' || best.side === 'bottom') {
    const x = FRAME + cell.x + cell.w / 2 - size / 2;
    const y = best.side === 'top' ? 0 : FRAME + height - WALL / 2;
    return { box: { x, y, w: size, h: thick }, line: { x1: x, y1: y + thick / 2, x2: x + size, y2: y + thick / 2 } };
  }
  const y = FRAME + cell.y + cell.h / 2 - size / 2;
  const x = best.side === 'left' ? 0 : FRAME + width - WALL / 2;
  return { box: { x, y, w: thick, h: size }, line: { x1: x + thick / 2, y1: y, x2: x + thick / 2, y2: y + size } };
}

const inset = (c: Rect): Rect => ({
  x: FRAME + c.x + WALL / 2,
  y: FRAME + c.y + WALL / 2,
  w: c.w - WALL,
  h: c.h - WALL,
});

/* -------------------------------------------------------------------------- */
/* Montagem da planta                                                         */
/* -------------------------------------------------------------------------- */

// Cada tipo mostra os cômodos cadastrados mais UM slot livre (se ainda não chegou ao máximo).
function slotsByKind(rooms: PlanRoomRef[]) {
  const slots = {} as Record<RoomKind, number[]>;
  const free = new Set<string>();

  for (const kind of KINDS) {
    const used = [...new Set(rooms.filter((r) => r.kind === kind).map((r) => r.slot))]
      .sort((a, b) => a - b)
      .slice(0, MAX_PER_FLOOR[kind]);
    const list = [...used];
    if (used.length < MAX_PER_FLOOR[kind]) {
      let n = 1;
      while (used.includes(n)) n++;
      list.push(n);
      free.add(`${kind}-${n}`);
    }
    slots[kind] = list.sort((a, b) => a - b);
  }
  return { slots, free };
}

const cache = new Map<string, Plan>();

export function buildPlan(rooms: PlanRoomRef[]): Plan {
  const { slots, free } = slotsByKind(rooms);
  const cacheKey = KINDS.map((k) => slots[k].map((n) => `${n}${free.has(`${k}-${n}`) ? 'f' : ''}`).join(',')).join('|');
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const layout = pack(slots);
  const { cells, width, height } = layoutCells(layout);
  const doors: PlanDoor[] = [];
  const passages: Rect[] = [];
  const links: [string, string][] = [];
  const seen = new Set<string>();
  const pairKey = (a: string, b: string) => [a, b].sort().join('|');

  const entrance = cells.find((c) => c.kind === 'SALA')!;
  doors.push(entranceDoor(entrance, layout.entrance));
  links.push(['EXT', entrance.id]);

  const neighborsOf = (cell: Cell) =>
    cells
      .filter((o) => o !== cell)
      .map((o) => ({ cell: o, edge: sharedEdge(cell, o) }))
      .filter((n): n is { cell: Cell; edge: Edge } => !!n.edge);

  // Corredores se abrem entre si, sem porta.
  for (const cell of cells.filter((c) => c.kind === 'HALL')) {
    for (const { cell: other, edge } of neighborsOf(cell)) {
      if (other.kind !== 'HALL' || seen.has(pairKey(cell.id, other.id))) continue;
      seen.add(pairKey(cell.id, other.id));
      links.push([cell.id, other.id]);
      // 0,5 a mais de cada lado evita uma emenda visível entre os dois corredores.
      passages.push(
        edge.orient === 'h'
          ? { x: FRAME + edge.from + WALL / 2, y: FRAME + edge.pos - WALL / 2 - 0.5, w: edge.to - edge.from - WALL, h: WALL + 1 }
          : { x: FRAME + edge.pos - WALL / 2 - 0.5, y: FRAME + edge.from + WALL / 2, w: WALL + 1, h: edge.to - edge.from - WALL },
      );
    }
  }

  const addDoor = (cell: Cell, other: Cell, edge: Edge) => {
    seen.add(pairKey(cell.id, other.id));
    doors.push(interiorDoor(edge, cell));
    links.push([cell.id, other.id]);
  };

  // Uma porta por cômodo, seguindo a preferência do tipo.
  for (const cell of cells) {
    if (cell.kind === 'HALL') continue;
    const neighbors = neighborsOf(cell).filter((n) => n.edge.to - n.edge.from >= MIN_EDGE);

    for (const wanted of DOOR_PREFERENCE[cell.kind]) {
      const pick = neighbors
        .filter((n) => n.cell.kind === wanted)
        .sort((a, b) => {
          // Banheiro prefere o quarto de mesmo número (suíte).
          const suite = (n: typeof a) => (cell.kind === 'BANHEIRO' && n.cell.index === cell.index ? 1 : 0);
          return suite(b) - suite(a) || b.edge.to - b.edge.from - (a.edge.to - a.edge.from);
        })[0];
      if (!pick) continue;
      if (!seen.has(pairKey(cell.id, pick.cell.id))) addDoor(cell, pick.cell, pick.edge);
      break;
    }
  }

  // Rede de segurança: todo cômodo precisa ser alcançável a partir da rua.
  const reachable = () => {
    const adj = new Map<string, string[]>();
    for (const [a, b] of links) {
      adj.set(a, [...(adj.get(a) ?? []), b]);
      adj.set(b, [...(adj.get(b) ?? []), a]);
    }
    const reached = new Set(['EXT']);
    const queue = ['EXT'];
    while (queue.length) for (const n of adj.get(queue.shift()!) ?? []) if (!reached.has(n)) (reached.add(n), queue.push(n));
    return reached;
  };
  for (let guard = 0; guard < cells.length; guard++) {
    const reached = reachable();
    const lost = cells.find((c) => !reached.has(c.id));
    if (!lost) break;
    const via = neighborsOf(lost)
      .filter((n) => reached.has(n.cell.id) && n.edge.to - n.edge.from >= MIN_EDGE)
      .sort((a, b) => b.edge.to - b.edge.from - (a.edge.to - a.edge.from))[0];
    if (!via) break;
    addDoor(lost, via.cell, via.edge);
  }

  const windows = cells
    .filter((c) => c.kind !== 'HALL')
    .map((c) => windowFor(c, width, height, c.id === entrance.id ? layout.entrance : undefined))
    .filter((w): w is PlanWindow => !!w);

  const plan: Plan = {
    width: width + FRAME * 2,
    height: height + FRAME * 2,
    halls: cells.filter((c) => c.kind === 'HALL').map(inset),
    slots: cells
      .filter((c) => c.kind !== 'HALL')
      .map((c) => ({ key: c.id, kind: c.kind as RoomKind, index: c.index, free: free.has(c.id), ...inset(c) })),
    passages,
    doors,
    windows,
    links,
  };
  cache.set(cacheKey, plan);
  return plan;
}

// Menor largura que cada tipo aceita; usado nos testes e para validar os máximos.
export const MIN_WIDTH: Record<RoomKind, number> = {
  QUARTO: SIZE.QUARTO.min,
  BANHEIRO: SIZE.BANHEIRO.min,
  COZINHA: SIZE.COZINHA.min,
  SALA: SIZE.SALA.min,
  OUTROS: SIZE.OUTROS.min,
};
export const PLAN_WALL = WALL;
