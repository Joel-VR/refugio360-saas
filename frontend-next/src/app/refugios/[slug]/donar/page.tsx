'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { RoleGate } from '@/lib/RoleGate';
import { SiteHeader, type NavLink } from '@/components/SiteHeader';
import { API_BASE_URL as API } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

const DonationFlow = dynamic(() => import('./DonationFlow'), { ssr: false });

const ACCOUNT_NAV_LINKS: NavLink[] = [

  { href: "/refugios", label: "Refugios", exact: true  },
  { href: "/cuenta/adopciones", label: "Mi Adopción" },
  { href: "/cuenta/donaciones", label: "Donaciones" },
  { href: "/cuenta/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/cuenta/mascotas-encontradas", label: "Mascotas encontradas" },
  { href: "/cuenta", label: "Mi cuenta"},
];

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
  accepts_donations: boolean;
  payment_methods: {
    yape: { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null };
    plin: { enabled: boolean; phone: string | null; owner: string | null; qr_path: string | null };
  };
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

export default function ShelterDonarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/public/shelters/${slug}`)
      .then((r) => r.json())
      .then((found: Shelter) => {
        if (found?.id) setShelter(found);
        else setError('Albergue no encontrado.');
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el albergue.');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <p className="text-center py-20 text-gray-400">Cargando...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!shelter) return null;

  return (
    <RoleGate allow={["natural_person"]}>
      <div className="min-h-screen bg-gray-50">
        <SiteHeader navLinks={ACCOUNT_NAV_LINKS} />

        <main className="py-10 px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Botón Volver */}
            <div className="mb-6">
              <Link
                href={`/refugios/`}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-brand-600"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a refugios
              </Link>
            </div>

            {/* Mensaje de bienvenida */}
            <div className="bg-cream-50 rounded-2xl shadow p-6 mb-6 text-center">
              {shelter.logo_path ? (
                <img
                  src={mediaUrl(shelter.logo_path)}
                  alt={shelter.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-4xl mx-auto mb-3">
                  ðŸ 
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">{shelter.name}</h1>
              {shelter.description && (
                <p className="text-gray-500 mt-2 text-sm">{shelter.description}</p>
              )}
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 text-left">
                <p className="font-semibold mb-1">¿Cómo funciona?</p>
                <p>Realiza tu transferencia por Yape o Plin, luego completa el formulario con tu comprobante. Todas las donaciones son verificadas por el equipo del albergue en 24-48 horas.</p>
              </div>
            </div>

            {/* Formulario de donación */}
            <DonationFlow shelter={shelter as never} />
          </div>
        </main>
      </div>
    </RoleGate>
  );
}


