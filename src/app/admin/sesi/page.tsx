'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { getSessions, createSession, getExamBanks } from '../actions';

interface Session {
  id: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  examBank?: { title: string; targetKelas: string; subject: { name: string } };
}

export default function SesiPage() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [examBanks, setExamBanks] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    const [sessRes, bankRes] = await Promise.all([getSessions(), getExamBanks()]);
    
    if (sessRes.success && sessRes.data) {
      const active = sessRes.data.find((s: Session) => s.isActive) || null;
      setActiveSession(active);
    }
    
    if (bankRes.success && bankRes.data) {
      // Hanya tampilkan paket soal yang sudah ada pertanyaannya (opsional, tapi baik untuk UX)
      setExamBanks(bankRes.data);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) {
      showToast('Pilih paket soal terlebih dahulu!', 'error');
      return;
    }

    setCreating(true);
    const result = await createSession(parseInt(selectedBankId));
    if (result.success) {
      showToast(result.message || 'Token baru berhasil dibuat.', 'success');
      setShowModal(false);
      setSelectedBankId('');
      loadData();
    } else {
      showToast(result.message || 'Gagal membuat token.', 'error');
    }
    setCreating(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
              <div className="token-card-label">Token Ujian Aktif</div>

              {activeSession ? (
                <>
                  <div className="token-card-value">
                    {activeSession.token}
                  </div>
                  <div className="token-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                      <strong>📝 Paket Soal:</strong> {activeSession.examBank?.title || 'Tidak diketahui'}
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                      <strong>👥 Kelas Target:</strong> {activeSession.examBank?.targetKelas || '-'}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Dibuat pada: {formatDate(activeSession.createdAt)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="token-card-empty">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                  <p>Belum ada ujian yang berlangsung</p>
                </div>
              )}

              <button
                className="admin-btn admin-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '2rem', padding: '0.85rem', fontSize: '1rem' }}
                onClick={() => setShowModal(true)}
              >
                🔑 Buat Token Ujian Baru
              </button>
              {activeSession && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#dc2626', marginTop: '1rem' }}>
                  *Membuat token baru akan menonaktifkan token yang sedang berjalan.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Buat Sesi Baru */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Mulai Sesi Ujian Baru</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Pilih paket soal yang ingin diujikan. Token baru akan dihasilkan secara otomatis.
            </p>
            <form onSubmit={handleCreate}>
              <div className="modal-form-group">
                <label>Pilih Paket Soal (Exam Bank)</label>
                <select 
                  className="modal-input" 
                  value={selectedBankId} 
                  onChange={(e) => setSelectedBankId(e.target.value)} 
                  required
                >
                  <option value="">-- Pilih Paket Soal --</option>
                  {examBanks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.title} (Mapel: {bank.subject?.name} | Kelas: {bank.targetKelas})
                    </option>
                  ))}
                </select>
                {examBanks.length === 0 && (
                  <small style={{ color: '#dc2626', marginTop: '0.5rem', display: 'block' }}>
                    Belum ada paket soal. Silakan buat di menu Bank Soal terlebih dahulu!
                  </small>
                )}
              </div>
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={creating || examBanks.length === 0}>
                  {creating ? '⏳ Sedang Membuat...' : 'Generate Token'}
                </button>
              </div>
            </form>
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
