export interface BarItem {
  id: number;
  label: string;
  value: number;
  caption: string;
}

export default function ConsumptionBars({ items, label }: { items: BarItem[]; label: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul aria-label={label} className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-center justify-between gap-4 text-sm">
            <span className="truncate font-semibold text-dark-blue">{item.label}</span>
            <span className="shrink-0 text-gray-500">{item.caption}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-linear-to-r from-green-start to-green-end"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
