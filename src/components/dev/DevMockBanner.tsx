'use client';

import { useState } from 'react';
import { isMockApiEnabled, mockApiEnabledMessage, resetMockState } from '@/lib/mock-api';
import { mockUsers } from '@/data/mockUsers';

export default function DevMockBanner() {
  const [hidden, setHidden] = useState(false);

  if (!isMockApiEnabled() || hidden) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #7c2d12, #ea580c)',
        color: '#fff',
        padding: '10px 16px',
        fontSize: '0.875rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #fdba74',
      }}
    >
      <div>
        <strong>DEV — Mock API</strong>
        <span style={{ marginLeft: 8, opacity: 0.95 }}>{mockApiEnabledMessage}</span>
        <div style={{ marginTop: 4, fontSize: '0.8rem', opacity: 0.9 }}>
          Admin: {mockUsers[0].email} / {mockUsers[0].password} · Customer: {mockUsers[1].email} /{' '}
          {mockUsers[1].password}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-sm"
          style={{ background: '#fff', color: '#7c2d12', border: 'none' }}
          onClick={() => {
            if (confirm('Reset semua data mock (produk, pesanan, user baru)?')) {
              resetMockState();
              window.location.reload();
            }
          }}
        >
          Reset data mock
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ color: '#fff' }}
          onClick={() => setHidden(true)}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
