import { dateFmt } from '@/lib/format';
import type { History } from '@/types/history';

const ENTITY_LABEL: Record<string, string> = {
    DEVICE: 'Dispositivo',
    MEMBER: 'Membro',
    RESIDENCE: 'Residência',
  };
const TYPE_LABEL: Record<string, string> = {
    ADDED: 'Adicionado:',
    UPDATED: 'Atualizada:',
    REMOVED: 'Removido:',
  };

function getEntityLabel(type: string, entityName: string): string {
  const entity = type.split('_')[0];
  const typeLabel = type.split('_')[1];
  console.log('getEntityLabel', { type, entityName, entity, typeLabel });

  return TYPE_LABEL[typeLabel] + ' ' + ENTITY_LABEL[entity] + ' - ' + entityName;
}
export function HistorySection({ items, loading }: { items: History[]; loading: boolean }) {
  
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
            {items.map((item) => {
              console.log('History ID:', item.id);
              return(
              <li key={"history-" + item.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-dark-blue">{getEntityLabel(item.type, item.entityName)}</span>
                <time dateTime={item.createdAt} className="text-gray-500">
                  {dateFmt.format(new Date(item.createdAt))}
                </time>
              </li>
            )})}
          </ul>
        )}
      </div>
    </section>
  );
}