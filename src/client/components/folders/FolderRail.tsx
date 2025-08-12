// src/client/components/folders/FolderRail.tsx
import React from 'react';
import { useUrlState } from '../../hooks/useUrlState';

/**
 * UI-only folders for MVP. Always includes "All".
 * When folder persistence ships, replace this with API-backed data.
 */
const PLACEHOLDER_FOLDERS: { id: string; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'clients', name: 'Clients (UI-only)' },
  { id: 'events', name: 'Events (UI-only)' },
];

export default function FolderRail() {
  const { folder, update, archived } = useUrlState();

  const itemClass = (active: boolean) =>
    `w-full text-left px-3 py-2 rounded-md text-sm ${
      active ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
    }`;

  return (
    <aside
      className="w-56 shrink-0 border-r border-gray-200 p-3 hidden md:block"
      aria-label="Folders and filters"
    >
      <div className="mb-3 text-xs font-semibold uppercase text-gray-500">Folders</div>
      <div className="flex flex-col gap-1" role="list">
        {PLACEHOLDER_FOLDERS.map((f) => (
          <button
            key={f.id}
            role="listitem"
            className={itemClass(folder === f.id)}
            onClick={() => update({ folder: f.id })}
            type="button"
            title="Folders are UI-only in MVP"
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Filter</div>
        <label htmlFor="archived-filter" className="sr-only">
          Archived filter
        </label>
        <select
          id="archived-filter"
          className="w-full border rounded-md px-2 py-1 text-sm"
          value={archived}
          onChange={(e) => update({ archived: e.target.value as 'false' | 'true' | 'all' })}
        >
          <option value="false">Active</option>
          <option value="true">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="mt-6">
        <button
          className="text-xs underline"
          onClick={() => update({ folder: 'all' })}
          type="button"
        >
          See all handshakes
        </button>
      </div>
    </aside>
  );
}
