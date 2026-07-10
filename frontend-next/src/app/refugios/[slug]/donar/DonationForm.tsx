'use client';

import { useEffect, useState } from 'react';

interface Animal {
  id: number;
  name: string;
  species: string;
  photos: { photo_path: string }[];
}

interface Shelter {
  id: number;
  name: string;
  yape_phone: string | null;
  yape_owner: string | null;
  yape_qr_path: string | null;
  plin_phone: string | null;
  plin_owner: string | null;
  plin_qr_path: string | null;
}

interface Props {
  shelter: Shelter;
}

export default function DonationForm({ shelter }: Props) {
  const [animals, setAnimals]           = useState<Animal[]>([]);
  const [donorName, setDonorName]       = useState('');
  const [email, setEmail]               = useState('');
  const [isAnonymous, setIsAnonymous]   = useState(false);
  const [donationType, setDonationType] = useState<'general' | 'specific'>('general');
  const [animalId, setAnimalId]         = useState<number | null>(null);
  const [isRecurring, setIsRecurring]   = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/animals`)
      .then(r => r.json())
      .then(data => setAnimals(data.filter((a: any) => a.shelter_id === shelter.id && a.lifecycle_status === 'apto')))
      .catch(() => {});
  }, [shelter.id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isAnonymous && !donorName.trim()) e.donorName = 'El nombre es requerido si no donas como anónimo.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'El email no es válido.';
    if (donationType === 'specific' && !animalId) e.animalId = 'Selecciona un animal para apadrinar.';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    alert('✅ Paso 1 completado. En la siguiente entrega se agrega el comprobante y el envío.');
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Formulario de donación</h2>

      {/* Datos del donante */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => { setIsAnonymous(e.target.checked); if (e.target.checked) setDonorName(''); }}
            className="w-4 h-4 accent-orange-500"
          />
          Donar como anónimo
        </label>

        {!isAnonymous && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Tipo de donación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de donación</label>
        <div className="flex gap-3">
          {(['general', 'specific'] as const).map(type => (
            <button
              key={type}
              onClick={() => { setDonationType(type); setAnimalId(null); }}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition ${
                donationType === type
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-orange-300'
              }`}
            >
              {type === 'general' ? '🌍 Donación General' : '🐾 Apadrinar Animal'}
            </button>
          ))}
        </div>
      </div>

      {/* Selector dinámico de animales */}
      {donationType === 'specific' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un animal</label>
          {animals.length === 0 ? (
            <p className="text-sm text-gray-400">No hay animales disponibles para apadrinar.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {animals.map(animal => (
                <button
                  key={animal.id}
                  onClick={() => setAnimalId(animal.id)}
                  className={`border-2 rounded-xl p-3 text-left transition ${
                    animalId === animal.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {animal.photos?.[0] ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${animal.photos[0].photo_path}`}
                      alt={animal.name}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-20 bg-orange-100 rounded-lg mb-2 flex items-center justify-center text-3xl">
                      🐾
                    </div>
                  )}
                  <p className="font-semibold text-sm text-gray-800">{animal.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{animal.species}</p>
                </button>
              ))}
            </div>
          )}
          {errors.animalId && <p className="text-red-500 text-xs mt-1">{errors.animalId}</p>}
        </div>
      )}

      {/* Donación recurrente */}
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
          className="w-4 h-4 accent-orange-500"
        />
        ¿Deseas que sea un padrinazgo mensual?
      </label>

      {/* Botón continuar */}
      <button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
      >
        Continuar →
      </button>
    </div>
  );
}