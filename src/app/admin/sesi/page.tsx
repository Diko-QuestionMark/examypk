'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { getSessions, createSession, toggleSession, deleteSession } from '../actions';

interface Session {
  id: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
}

export default function SesiPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadSessions = async () => {
    setLoading(true);
    const result = await getSessions();
    if (result.success && result.data) {
      setSessions(result.data);
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
      showToast(result.message || 'Sesi berhasil dibuat.', 'success');
      loadSessions();
    } else {
      showToast(result.message || 'Gagal membuat sesi.', 'error');
    }
    setCreating(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const result = await toggleSession(id, !currentActive);
    if (result.success) {
      showToast(result.message || 'Status diubah.', 'success');
      loadSessions();
    } else {
      showToast(result.message || 'Gagal mengubah status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteSession(deleteTarget.id);
    if (result.success) {
      showToast(result.message || 'Sesi dihapus.', 'success');
      loadSessions();
    } else {
      showToast(result.message || 'Gagal menghapus sesi.', 'error');
    }
    setDeleteTarget(null);
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    showToast(`Token "${token}" disalin ke clipboard.`, 'success');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeSessions = sessions.filter((s) => s.isActive).length;

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>Sesi Ujian</h1>
            <p>Buat dan kelola sesi ujian (token ruangan)</p>
          </div>
          <div className="topbar-actions">
            <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? '⏳ Membuat...' : '🔑 Buat Sesi Baru'}
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Quick Stats */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card green">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{activeSessions}</div>
              <div className="stat-label">Sesi Aktif</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-icon">🔒</div>
              <div className="stat-value">{sessions.length - activeSessions}</div>
              <div className="stat-label">Sesi Nonaktif</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{sessions.length}</div>
              <div className="stat-label">Total Sesi</div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-card-header">
              <h2>
                🔑 Daftar Sesi Ujian
                <span className="header-count">{sessions.length} sesi</span>
              </h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadSessions} disabled={loading}>
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <p>Memuat data sesi...</p>
              </div>
            ) : sessions.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Token</th>
                    <th>Status</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, idx) => (
                    <tr key={session.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="token-display">{session.token}</span>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          style={{ marginLeft: '0.5rem' }}
                          onClick={() => copyToken(session.token)}
                          title="Salin token"
                        >
                          📋
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${session.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {session.isActive ? '● Aktif' : '○ Nonaktif'}
                        </span>
                      </td>
                      <td>{formatDate(session.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className={`admin-btn admin-btn-sm ${session.isActive ? 'admin-btn-warning' : 'admin-btn-success'}`}
                            onClick={() => handleToggle(session.id, session.isActive)}
                          >
                            {session.isActive ? '⏸️ Nonaktifkan' : '▶️ Aktifkan'}
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => setDeleteTarget(session)}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>Belum ada sesi ujian. Klik &quot;Buat Sesi Baru&quot; untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Konfirmasi Hapus Sesi</h3>
            <p className="confirm-text">
              Apakah Anda yakin ingin menghapus sesi dengan token <strong className="token-display">{deleteTarget.token}</strong>?
            </p>
            <p className="confirm-warning">Siswa yang menggunakan token ini tidak akan bisa login lagi.</p>
            <div className="modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteTarget(null)}>
                Batal
              </button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>
                🗑️ Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
