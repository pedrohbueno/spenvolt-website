export type HistoryType =
  | 'DEVICE_ADDED'
  | 'DEVICE_REMOVED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'RESIDENCE_ADDED'
  | 'RESIDENCE_UPDATED';

export type HistoryItem = {
  id: number;
  type: HistoryType;
  createdAt: string; // ISO 8601
};

// TODO(API): substituir pelo output da API de histórico.
// Endpoint sugerido: GET /api/history?limit=10  (mais recente primeiro)
// Resposta esperada: HistoryItem[]  ->  { id, type, createdAt }
// Ainda não existe no backend. Enquanto isso a lista fica vazia (mostra o estado vazio).
export async function findHistory(token: string): Promise<HistoryItem[]> {
  return [];
}