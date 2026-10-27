export type ResidenceTab = 'devices' | 'members' | 'floorplan';

const TABS: { id: ResidenceTab; label: string }[] = [
  { id: 'floorplan', label: 'Planta' },
  { id: 'devices', label: 'Dispositivos' },
  { id: 'members', label: 'Membros' },
];

type Props = {
  value: ResidenceTab;
  onChange: (tab: ResidenceTab) => void;
};

export default function ResidenceTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Seções da residência" className="flex gap-2 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            value === tab.id ? 'bg-dark-blue text-yellow' : 'bg-white text-dark-blue shadow-sm hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
