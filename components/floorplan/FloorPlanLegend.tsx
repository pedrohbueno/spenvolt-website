import { DENSITY_UI } from './RoomTile';

export default function FloorPlanLegend() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="text-sm font-bold text-dark-blue">Legenda</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {Object.values(DENSITY_UI).map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-gray-500">
            <span aria-hidden="true" className={`h-3 w-3 rounded-full ${item.dot}`} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
