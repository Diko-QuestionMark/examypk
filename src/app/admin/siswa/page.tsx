'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../actions';

interface Student {
  id: number;
  nis: string;
  password: string;
  name: string;
  kelas: string;
  createdAt: Date;
}

type ModalMode = 'create' | 'edit' | null;

export default function SiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nis: '', password: '', name: '', kelas: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudents();
    if (result.success && result.data) {
      setStudents(result.data);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const openCreate = () => {
    setFormData({ nis: '', password: '', name: '', kelas: '' });
    setEditingStudent(null);
    setModalMode('create');
  };

  const openEdit = (student: Student) => {
    setFormData({
      nis: student.nis,
      password: student.password,
      name: student.name,
      kelas: student.kelas,
    });
    setEditingStudent(student);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingStudent(null);
    setFormData({ nis: '', password: '', name: '', kelas: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    let result;
    if (modalMode === 'create') {
      result = await createStudent(formData);
    } else if (modalMode === 'edit' && editingStudent) {
      result = await updateStudent(editingStudent.id, formData);
    }

    if (result?.success) {
      showToast(result.message || 'Berhasil!', 'success');
      closeModal();
      loadStudents();
    } else {
      showToast(result?.message || 'Terjadi kesalahan.', 'error');
    }

    setFormLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteStudent(deleteTarget.id);
    if (result.success) {
      showToast(result.message || 'Berhasil dihapus.', 'success');
      loadStudents();
    } else {
      showToast(result.message || 'Gagal menghapus.', 'error');
    }
    setDeleteTarget(null);
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.kelas.toLowerCase().includes(q);
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>Kelola Siswa</h1>
            <p>Tambah, edit, dan hapus data siswa</p>
          </div>
          <div className="topbar-actions">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari nama, NIS, kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="admin-btn admin-btn-primary" onClick={openCreate}>
              ➕ Tambah Siswa
            </button>
          </div>
        </div>

        <div className="admin-content">
          <div className="table-card">
            <div className="table-card-header">
              <h2>
                👤 Data Siswa
                <span className="header-count">{filteredStudents.length} siswa</span>
              </h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadStudents} disabled={loading}>
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <p>Memuat data siswa...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>NIS</th>
                    <th>Kelas</th>
                    <th>Tanggal Daftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{student.name}</td>
                      <td>
                        <span className="token-display" style={{ fontSize: '0.8rem' }}>
                          {student.nis}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-kelas">{student.kelas}</span>
                      </td>
                      <td>{formatDate(student.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="admin-btn admin-btn-warning admin-btn-sm"
                            onClick={() => openEdit(student)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => setDeleteTarget(student)}
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
                <p>{search ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa. Klik "Tambah Siswa" untuk memulai.'}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === 'create' ? '➕ Tambah Siswa Baru' : '✏️ Edit Data Siswa'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="modal-form-group">
                <label>Nama Lengkap</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>NIS</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Masukkan NIS"
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Password</label>
                <input
                  className="modal-input"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                />
              </div>
              <div className="modal-form-group">
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
              Apakah Anda yakin ingin menghapus siswa <strong>{deleteTarget.name}</strong> (NIS: {deleteTarget.nis})?
            </p>
            <p className="confirm-warning">Tindakan ini tidak dapat dibatalkan.</p>
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
