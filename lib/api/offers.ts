'use server';

import { api } from './client';
import type { Offer } from '@/types/offers';

// TODO(API): o controller expõe /products/search sem o prefixo /api usado por api().
export async function searchOffers(token: string, query: string) {
  return api<Offer[]>('/products/search?query=' + encodeURIComponent(query), {
    method: 'GET',
    token,
  });
}
