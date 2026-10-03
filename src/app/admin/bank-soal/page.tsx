'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../actions';

interface Question {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  subject: string;
  kelas: string;
  createdAt: Date;
}

type ModalMode = 'create' | 'edit' | null;

const emptyForm = {
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  optionE: '',
  correctAnswer: 'A',
  subject: '',
  kelas: '',
};

export default function BankSoalPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = await getQuestions();
    if (result.success && result.data) {
      setQuestions(result.data);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingQuestion(null);
    setModalMode('create');
  };

  const openEdit = (q: Question) => {
    setFormData({
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      optionE: q.optionE,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      kelas: q.kelas,
    });
    setEditingQuestion(q);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingQuestion(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    let result;
    if (modalMode === 'create') {
      result = await createQuestion(formData);
    } else if (modalMode === 'edit' && editingQuestion) {
      result = await updateQuestion(editingQuestion.id, formData);
    }

    if (result?.success) {
      showToast(result.message || 'Berhasil!', 'success');
      closeModal();
      loadQuestions();
    } else {
      showToast(result?.message || 'Terjadi kesalahan.', 'error');
    }

    setFormLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteQuestion(deleteTarget.id);
    if (result.success) {
      showToast(result.message || 'Berhasil dihapus.', 'success');
      loadQuestions();
    } else {
      showToast(result.message || 'Gagal menghapus.', 'error');
    }
    setDeleteTarget(null);
  };

  const filteredQuestions = questions.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.text.toLowerCase().includes(s) ||
      q.subject.toLowerCase().includes(s) ||
      q.kelas.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>Bank Soal</h1>
            <p>Tambah, edit, dan hapus soal ujian</p>
          </div>
          <div className="topbar-actions">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari soal, mapel, kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>
              ➕ Tambah Soal
            </button>
          </div>
        </div>

        <div className="admin-content">
          <div className="table-card">
            <div className="table-card-header">
              <h2>
                📝 Daftar Soal
                <span className="header-count">{filteredQuestions.length} soal</span>
              </h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadQuestions} disabled={loading}>
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <p>Memuat data soal...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Soal</th>
                    <th>Mapel</th>
                    <th>Kelas</th>
                    <th>Jawaban</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, idx) => (
                    <tr key={q.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500, color: '#1a1a2e', maxWidth: '320px' }}>
                        {q.text.length > 80 ? q.text.substring(0, 80) + '...' : q.text}
                      </td>
                      <td><span className="badge badge-kelas">{q.subject}</span></td>
                      <td>{q.kelas}</td>
                      <td>
                        <span className="badge badge-active">{q.correctAnswer}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="admin-btn admin-btn-warning admin-btn-sm" onClick={() => openEdit(q)}>
                            ✏️ Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(q)}>
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
                <p>{search ? 'Tidak ada soal yang cocok.' : 'Belum ada soal. Klik "Tambah Soal" untuk memulai.'}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>{modalMode === 'create' ? '➕ Tambah Soal Baru' : '✏️ Edit Soal'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="modal-form-group" style={{ flex: 1 }}>
                  <label>Mata Pelajaran</label>
                  <input
                    className="modal-input"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Contoh: Bahasa Indonesia"
                    required
                  />
                </div>
                <div className="modal-form-group" style={{ flex: 1 }}>
                  <label>Kelas</label>
                  <input
                    className="modal-input"
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: XII-IPA-1"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Teks Soal</label>
                <textarea
                  className="modal-input"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Masukkan teks soal..."
                  required
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-form-group">
                <label>Opsi A</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Opsi B</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Opsi C</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Opsi D</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Opsi E</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.optionE}
                  onChange={(e) => setFormData({ ...formData, optionE: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Jawaban Benar</label>
                <select
                  className="modal-input"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formLoading}>
                  {formLoading ? '⏳ Menyimpan...' : modalMode === 'create' ? '➕ Tambah' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Konfirmasi Hapus</h3>
            <p className="confirm-text">
              Apakah Anda yakin ingin menghapus soal ini?
            </p>
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
