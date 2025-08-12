// src/client/components/nav/LayerTabs.tsx
import React from 'react';
import { useUrlState } from '../../hooks/useUrlState';

export default function LayerTabs() {
  const { box, update } = useUrlState();

  const tabClass = (active: boolean) =>
    `px-3 py-2 text-sm font-medium rounded-md border ${
      active ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'
    }`;

  return (
    <div role="tablist" aria-label="Inbox or Outbox" className="flex items-center gap-2">
      <button
        role="tab"
        aria-selected={box === 'incoming'}
        aria-controls="layer-incoming"
        className={tabClass(box === 'incoming')}
        onClick={() => update({ box: 'incoming' })}
        type="button"
      >
        Incoming
      </button>
      <button
        role="tab"
        aria-selected={box === 'outgoing'}
        aria-controls="layer-outgoing"
        className={tabClass(box === 'outgoing')}
        onClick={() => update({ box: 'outgoing' })}
        type="button"
      >
        Outgoing
      </button>
    </div>
  );
}
