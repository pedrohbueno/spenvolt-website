import type { Residence } from '@/types/residences';

// TODO(API): substituir pelo output da API de consumo do mês atual.
// Endpoint sugerido: GET /api/residences/{id}/consumption?month=YYYY-MM
// Resposta esperada: { kwh: number, cost: number }
// Sem 'use server': precisa ser síncrona (a página usa o retorno direto).
export function getUsage(residence: Residence) {
  return { kwh: 0, cost: 0 };
}