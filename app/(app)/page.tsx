'use client';

import { useEffect, useState } from "react";
import { findAll } from '@/lib/api/residences';
import { Residence } from "@/types/residences";
import Carousel from "@/components/carousel";

export default function Home() {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [name, setName] = useState('');
  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';
    const userName = sessionStorage.getItem('name') ?? '';
    setName(userName);
    setResidences([]);
    findAll(token).then((data) => {
      
      setResidences(data);
    }).catch((error) => {
      console.error('Error fetching residences:', error);
    });
  }, []);

  return (
    <main className="p-8">
      <div className="mt-15 rounded-xl bg-dark-blue w-full h-34 flex items-center justify-between p-8">
        <h1 className="text-white">Olá, {name}! Seja bem-vindo.</h1>
        <div className="flex">
          <h1 className="text-yellow">
            {residences.reduce((sum, r) => sum + (r.monthlyCostLimit || 0), 0).toFixed(2)}
          </h1>
        </div>
      </div>
      <h1 className="mt-50   text-2xl font-bold">Minhas Residências</h1>
      <div className="p-8 flex flex-col items-center justify-center">
        <Carousel>
          {residences.map((r) => (
            <div key={r.id} className="w-100 shrink-0 snap-start rounded-xl shadow-lg bg-white">
              <div className="px-6 py-4">
                <div className="mb-2 gap-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{r.name}</h2>
                  <span className="inline-block rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                    {r.monthlyCostLimit ? r.monthlyCostLimit - 300 < 0 ? "Limite Estourado": "tranquilo" : 'Sem limite de custo'}
                  </span>
                </div>
                <p className="text-gray-700 text-base">
                  {r.address}
                </p>
                <p className="text-gray-700 text-base">
                  {r.tariff}
                </p>
                <p className="text-gray-700 text-base">
                  {r.monthlyCostLimit ? `R$ ${r.monthlyCostLimit.toFixed(2)}` : 'Sem limite de custo'}
                </p>
                <p className="text-gray-700 text-base">
                  {r.monthlyKwhLimit ? `${r.monthlyKwhLimit} kWh` : 'Sem limite de consumo'}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      
    </main>
  );
}
