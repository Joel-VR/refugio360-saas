'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Shelter {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_path: string | null;
}

export default function DonarPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading]   = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/shelters`)
      .then(r => r.json())
      .then(data => { setShelters(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          ❤️ Quiero Donar
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Selecciona el albergue al que deseas apoyar
        </p>

        {loading ? (
          <p className="text-center text-gray-400">Cargando albergues...</p>
        ) : shelters.length === 0 ? (
          <p className="text-center text-gray-400">No hay albergues disponibles.</p>
        ) : (
          <div className="grid gap-4">
            {shelters.map(shelter => (
              <button
                key={shelter.id}
                onClick={() => router.push(`/refugios/${shelter.slug}/donar`)}
                className="flex items-center gap-4 bg-white rounded-xl shadow p-5 hover:shadow-md hover:border-orange-400 border-2 border-transparent transition text-left"
              >
                {shelter.logo_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${shelter.logo_path}`}
                    alt={shelter.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                    🏠
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{shelter.name}</p>
                  {shelter.description && (
                    <p className="text-gray-500 text-sm line-clamp-1">{shelter.description}</p>
                  )}
                </div>
                <span className="ml-auto text-orange-500 font-bold text-xl">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}