'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { getSessions, createSession } from '../actions';

interface Session {
  id: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
}

export default function SesiPage() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadActiveSession = async () => {
    setLoading(true);
    const result = await getSessions();
    if (result.success && result.data) {
      const active = result.data.find((s: Session) => s.isActive) || null;
      setActiveSession(active);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleCreate = async () => {
    setCreating(true);
    const result = await createSession();
    if (result.success) {
      showToast(result.message || 'Token baru berhasil dibuat.', 'success');
      loadActiveSession();
    } else {
      showToast(result.message || 'Gagal membuat token.', 'error');
    }
    setCreating(false);
  };



  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>Sesi Ujian</h1>
            <p>Token ruangan untuk siswa masuk ujian</p>
          </div>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="token-card">
              <div className="token-card-label">Token Aktif Saat Ini</div>

              {activeSession ? (
                <>
                  <div className="token-card-value">
                    {activeSession.token}
                  </div>
                  <div className="token-card-meta">
                    <span>Dibuat: {formatDate(activeSession.createdAt)}</span>
                  </div>
                </>
              ) : (
                <div className="token-card-empty">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                  <p>Belum ada token aktif</p>
                </div>
              )}

              <button
                className="admin-btn admin-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '0.75rem' }}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? '⏳ Membuat...' : '🔑 Buat Token Baru'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
