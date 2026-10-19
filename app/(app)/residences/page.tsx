'use client';
import type { Residence } from '@/types/residences';
import { findAll } from '@/lib/api/residences';
import { useEffect } from 'react';

interface Props {
  projects: Residence[];
}
export default function ResidencesPage({ projects }: Props) {


    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">Residências</h1>
            <p className="mt-2 text-muted">Gerenciamento de residências em breve.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
               
            </div>
        </main>
    );
}
