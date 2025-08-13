// src/client/pages/outbox/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ⬅️ add
import LayerTabs from '../../components/nav/LayerTabs';
import FolderRail from '../../components/folders/FolderRail';
import MobileFolderDrawer from '../../components/folders/MobileFolderDrawer';
import { useUrlState } from '../../hooks/useUrlState';
import HandshakeList from '../../features/handshakes/HandshakeList';

export default function Dashboard() {
  const { box, ensureDefaults } = useUrlState();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    ensureDefaults();
  }, []); // run once

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile: open folders */}
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 border rounded-md"
              onClick={() => setDrawerOpen(true)}
              type="button"
              aria-label="Open folders"
              title="Open folders"
            >
              <span className="block w-4 h-px bg-current mb-1" />
              <span className="block w-4 h-px bg-current mb-1" />
              <span className="block w-4 h-px bg-current" />
            </button>
            <div className="text-lg font-semibold">Handshake</div>
          </div>

          <div className="flex items-center gap-3">
            <LayerTabs />
            {/* New Handshake */}
            <Link
              to="/outbox/handshakes/new"
              className="px-3 py-2 rounded bg-black text-white text-sm hover:opacity-90"
            >
              New Handshake
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer for folders/filters */}
      <MobileFolderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="max-w-6xl mx-auto px-4 py-4 flex gap-4">
        {/* Desktop folder rail */}
        <FolderRail />

        <section
          className="flex-1"
          id={box === 'outgoing' ? 'layer-outgoing' : 'layer-incoming'}
          aria-live="polite"
        >
          {box === 'outgoing' ? (
            <HandshakeList />
          ) : (
            <div className="p-6 border border-dashed rounded-lg text-sm text-gray-700">
              <div className="font-medium mb-2">Incoming (tokened Inbox)</div>
              <p>
                Use your tokened links to view submissions:
                <br />
                <code>/inbox/handshakes/:handshakeId?token=…</code>
                <br />
                <code>/inbox/submissions/:submissionId?token=…&amp;handshakeId=:id</code>
              </p>
              <p className="mt-3 text-gray-500">
                This panel will list incoming items in a later pass. No server changes required.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
