import { useEffect, useState } from 'react';
import { healthResponseSchema, type HealthResponse } from '@app/shared';

// Default to same-origin (relative "/api/..."), which is how production is served:
// the Worker handles /api/* on the same custom domain as the Pages site, so no CORS.
// For local dev where the API runs on a separate port, set PUBLIC_API_URL
// (e.g. http://localhost:3000).
const apiUrl = import.meta.env.PUBLIC_API_URL ?? '';

export default function ApiStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return healthResponseSchema.parse(await response.json());
      })
      .then(setHealth)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Request failed'));
  }, []);

  return (
    <div className="mt-6 rounded-lg border border-emerald-200 bg-white p-4 text-sm shadow-sm">
      <p className="font-medium">API connection</p>
      {health ? (
        <p className="mt-1 text-emerald-800">{health.status} · {health.service}</p>
      ) : error ? (
        <p className="mt-1 text-rose-700">Could not connect: {error}</p>
      ) : (
        <p className="mt-1 text-slate-500">Checking API…</p>
      )}
    </div>
  );
}
