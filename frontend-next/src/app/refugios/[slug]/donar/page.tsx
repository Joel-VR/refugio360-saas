'use client';

import { useEffect, useState } from 'react';
import { useParams }           from 'next/navigation';
import dynamic from 'next/dynamic';
const DonationForm = dynamic(() => import('./DonationForm'), { ssr: false });

interface Shelter {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_path: string | null;
  yape_phone: string | null;
  yape_owner: string | null;
  yape_qr_path: string | null;
  plin_phone: string | null;
  plin_owner: string | null;
  plin_qr_path: string | null;
}

export default function ShelterDonarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shelters`)
      .then(r => r.json())
      .then((data: Shelter[]) => {
        const found = data.find(s => s.slug === slug);
        if (found) setShelter(found);
        else setError('Albergue no encontrado.');
        setLoading(false);
      })
      .catch(() => { setError('Error al cargar el albergue.'); setLoading(false); });
  }, [slug]);

  if (loading) return <p className="text-center py-20 text-gray-400">Cargando...</p>;
  if (error)   return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!shelter) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Mensaje de bienvenida */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 text-center">
          {shelter.logo_path ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${shelter.logo_path}`}
              alt={shelter.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-4xl mx-auto mb-3">
              🏠
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{shelter.name}</h1>
          {shelter.description && (
            <p className="text-gray-500 mt-2 text-sm">{shelter.description}</p>
          )}
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            <p className="font-semibold mb-1">¿Cómo funciona?</p>
            <p>Realiza tu transferencia por Yape o Plin, luego completa el formulario con tu comprobante. Todas las donaciones son verificadas por el equipo del albergue en 24-48 horas.</p>
          </div>
        </div>

        {/* Formulario de donación */}
        <DonationForm shelter={shelter} />
      </div>
    </main>
  );
}