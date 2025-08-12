// src/client/hooks/useUrlState.ts
import { useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export type Box = 'incoming' | 'outgoing';
export type Archived = 'false' | 'true' | 'all';

function coerceBox(v: string | null): Box {
  return v === 'incoming' || v === 'outgoing' ? v : 'outgoing';
}
function coerceArchived(v: string | null): Archived {
  return v === 'true' || v === 'all' ? v : 'false';
}
function coerceFolder(v: string | null): string {
  return v && v.length > 0 ? v : 'all';
}

/**
 * URL is the single source of truth for dashboard state.
 * box=incoming|outgoing, folder=all|<id>, archived=false|true|all
 */
export function useUrlState() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = useMemo(() => {
    const box = coerceBox(params.get('box'));
    const folder = coerceFolder(params.get('folder'));
    const archived = coerceArchived(params.get('archived'));
    return { box, folder, archived };
  }, [params]);

  function update(next: Partial<{ box: Box; folder: string; archived: Archived }>) {
    const current = Object.fromEntries(params.entries());
    const merged = {
      box: state.box,
      folder: state.folder,
      archived: state.archived,
      ...current,
      ...next,
    };
    const sp = new URLSearchParams(merged as Record<string, string>);
    setParams(sp, { replace: false });
  }

  function ensureDefaults() {
    const needsDefaults =
      !params.get('box') || !params.get('folder') || !params.get('archived');
    if (needsDefaults) {
      const sp = new URLSearchParams(params);
      if (!params.get('box')) sp.set('box', 'outgoing');
      if (!params.get('folder')) sp.set('folder', 'all');
      if (!params.get('archived')) sp.set('archived', 'false');
      navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
    }
  }

  return { ...state, update, ensureDefaults };
}
