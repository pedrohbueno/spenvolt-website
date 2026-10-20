import { HistoryItem, HistoryType } from '@/lib/api/history';
import { dateFmt } from '@/lib/format';

const HISTORY_LABEL: Record<HistoryType, string> = {
  DEVICE_ADDED: 'Dispositivo adicionado',
  DEVICE_REMOVED: 'Dispositivo removido',
  MEMBER_ADDED: 'Membro adicionado',
  MEMBER_REMOVED: 'Membro excluído',
  RESIDENCE_ADDED: 'Residência adicionada',
  RESIDENCE_UPDATED: 'Residência atualizada',
};

export function HistorySection({ items, loading }: { items: HistoryItem[]; loading: boolean }) {
  return (
    <section aria-labelledby="history-title" className="mt-12">
      <h2 id="history-title" className="text-2xl font-bold">
        Histórico de alterações
      </h2>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-lg">
        {loading ? (
          <p className="text-sm text-gray-500" role="status">Carregando histórico…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhuma alteração por enquanto. Adicionar uma residência, dispositivo ou membro aparece aqui.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-dark-blue">{HISTORY_LABEL[item.type]}</span>
                <time dateTime={item.createdAt} className="text-gray-500">
                  {dateFmt.format(new Date(item.createdAt))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}