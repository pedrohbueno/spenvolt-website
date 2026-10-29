import HousePlan, { type PlanRoom } from '@/components/floorplan/HousePlan';
const rooms: PlanRoom[] = [
  { id: 1, kind: 'SALA',     slot: 1, name: 'Sala',     kwh: 72 },
  { id: 2, kind: 'COZINHA',  slot: 1, name: 'Cozinha',  kwh: 95 },
  { id: 3, kind: 'QUARTO',   slot: 1, name: 'Quarto 1', kwh: 40 },
  { id: 4, kind: 'QUARTO',   slot: 2, name: 'Quarto 2', kwh: 40 },
  { id: 5, kind: 'QUARTO',   slot: 3, name: 'Quarto 3', kwh: 40 },
  { id: 6, kind: 'BANHEIRO', slot: 1, name: 'Banheiro', kwh: 12 },
];
export default function Floor() {
    return (
        <div className="flex flex-col gap-4">
            <HousePlan rooms={rooms} />
        </div>
    );
}