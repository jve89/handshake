// src/client/components/folders/MobileFolderDrawer.tsx
import React from "react";
import { useUrlState } from "../../hooks/useUrlState";

type Folder = { id: string; name: string };

const FOLDERS: Folder[] = [
  { id: "all", name: "All" },
  { id: "clients", name: "Clients (UI-only)" },
  { id: "events", name: "Events (UI-only)" },
];

export default function MobileFolderDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { folder, update, archived } = useUrlState();

  function chooseFolder(id: string) {
    update({ folder: id });
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 h-full w-80 bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Folders and filters"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Folders</div>
          <button className="text-sm underline" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="p-3">
          <div className="flex flex-col gap-1 mb-6" role="list">
            {FOLDERS.map((f) => (
              <button
                key={f.id}
                role="listitem"
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  folder === f.id
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => chooseFolder(f.id)}
                type="button"
                title="Folders are UI-only in MVP"
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
            Filter
          </div>
          <label htmlFor="archived-filter-mobile" className="sr-only">
            Archived filter
          </label>
          <select
            id="archived-filter-mobile"
            className="w-full border rounded-md px-2 py-2 text-sm"
            value={archived}
            onChange={(e) =>
              update({ archived: e.target.value as "false" | "true" | "all" })
            }
          >
            <option value="false">Active</option>
            <option value="true">Archived</option>
            <option value="all">All</option>
          </select>

          <div className="mt-6">
            <button
              className="text-xs underline"
              onClick={() => chooseFolder("all")}
              type="button"
            >
              See all handshakes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
