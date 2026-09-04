"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { updateShelterProfile, sanitizeErrorMessage } from "@/lib/api";
import type { Shelter } from "@/types/shelter";

const LocationPicker = dynamic(() => import("@/components/LocationPicker").then((m) => m.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-slate-custom-50/40" />,
});

type SearchResult = { display_name: string; lat: string; lon: string };

export function LocationPanel({ shelter: initialShelter }: { shelter: Shelter }) {
  const [shelter, setShelter] = useState(initialShelter);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    initialShelter.latitude != null && initialShelter.longitude != null
      ? { lat: initialShelter.latitude, lng: initialShelter.longitude }
      : null
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState(initialShelter.address ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", query.trim());
      url.searchParams.set("countrycodes", "pe");
      url.searchParams.set("limit", "5");
      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      const body: SearchResult[] = await res.json();
      if (body.length === 0) setError("No se encontraron resultados para esa dirección.");
      setResults(body);
    } catch {
      setError("No se pudo buscar la dirección. Inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  function pickResult(result: SearchResult) {
    setPin({ lat: Number(result.lat), lng: Number(result.lon) });
    setResults([]);
    setQuery(result.display_name);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPin({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("No se pudo obtener tu ubicación. Revisa los permisos del navegador y que la ubicación esté activada en el sistema.");
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 0 }
    );
  }

  async function save() {
    if (!pin) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateShelterProfile(shelter.id, { latitude: pin.lat, longitude: pin.lng });
      setShelter(updated);
      setMessage("Ubicación guardada.");
    } catch (err) {
      setError(sanitizeErrorMessage(err instanceof Error ? err.message : "No se pudo guardar la ubicación."));
    } finally {
      setLoading(false);
    }
  }

  const changed = pin && (pin.lat !== shelter.latitude || pin.lng !== shelter.longitude);

  return (
    <div className="rounded-3xl border border-slate-custom-50 bg-cream-50 p-8 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Ubicación</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-custom-900">Pin en el mapa</h3>
        <p className="mt-2 text-sm text-slate-custom-700">Busca tu dirección, usa tu ubicación actual, o haz clic en el mapa para ajustar el pin.</p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={search} className="flex flex-1 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Av. Colombia 325, Pueblo Libre"
            className="flex-1 rounded-xl border border-slate-custom-50 bg-cream-100 px-4 py-2.5 text-sm text-slate-custom-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl border border-slate-custom-50 px-4 py-2.5 text-sm font-medium text-slate-custom-700 hover:bg-slate-custom-50 disabled:opacity-50"
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </form>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="rounded-xl border border-slate-custom-50 px-4 py-2.5 text-sm font-medium text-slate-custom-700 hover:bg-slate-custom-50 disabled:opacity-50"
        >
          {locating ? "Ubicando..." : "Usar mi ubicación actual"}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mb-4 grid gap-1 rounded-xl border border-slate-custom-50 bg-white p-2 text-sm">
          {results.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => pickResult(result)}
                className="w-full rounded-lg px-3 py-2 text-left text-slate-custom-700 hover:bg-slate-custom-50"
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <LocationPicker
        latitude={pin?.lat ?? null}
        longitude={pin?.lng ?? null}
        onChange={(lat, lng) => setPin({ lat, lng })}
      />

      {message && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!changed || loading}
        className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar ubicación"}
      </button>
    </div>
  );
}
