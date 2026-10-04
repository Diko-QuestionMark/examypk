'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../AdminNav';
import { 
  getExamBanks, createExamBank, deleteExamBank,
  getSubjects, createSubject,
  getQuestions, createQuestion, updateQuestion, deleteQuestion 
} from '../actions';

export default function BankSoalPage() {
  const [viewMode, setViewMode] = useState<'banks' | 'questions'>('banks');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data
  const [subjects, setSubjects] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any | null>(null);

  // Modals
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [bankForm, setBankForm] = useState({ title: '', subjectId: '', targetKelas: '' });
  
  const emptyQForm = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', correctAnswer: 'A' };
  const [qForm, setQForm] = useState(emptyQForm);
  const [editingQId, setEditingQId] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const loadInitialData = async () => {
    setLoading(true);
    const [subRes, bankRes] = await Promise.all([getSubjects(), getExamBanks()]);
    if (subRes.success) setSubjects(subRes.data || []);
    if (bankRes.success) setBanks(bankRes.data || []);
    setLoading(false);
  };

  const loadQuestionsData = async (bankId: number) => {
    setLoading(true);
    const res = await getQuestions(bankId);
    if (res.success) setQuestions(res.data || []);
    setLoading(false);
  };

  // --- Handlers ---
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const res = await createSubject(subjectName);
    if (res.success) {
      showToast('Mapel ditambahkan', 'success');
      setShowSubjectModal(false);
      setSubjectName('');
      loadInitialData();
    } else {
      showToast(res.message, 'error');
    }
    setFormLoading(false);
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const res = await createExamBank({
      title: bankForm.title,
      subjectId: parseInt(bankForm.subjectId),
      targetKelas: bankForm.targetKelas,
    });
    if (res.success) {
      showToast('Paket Soal dibuat', 'success');
      setShowBankModal(false);
      setBankForm({ title: '', subjectId: '', targetKelas: '' });
      loadInitialData();
    } else {
      showToast(res.message, 'error');
    }
    setFormLoading(false);
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Yakin hapus paket soal ini dan SEMUA isinya?')) return;
    const res = await deleteExamBank(id);
    if (res.success) {
      showToast('Paket dihapus', 'success');
      loadInitialData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleOpenBank = (bank: any) => {
    setSelectedBank(bank);
    setViewMode('questions');
    loadQuestionsData(bank.id);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = { ...qForm, examBankId: selectedBank.id };
    
    let res;
    if (editingQId) {
      res = await updateQuestion(editingQId, payload);
    } else {
      res = await createQuestion(payload);
    }

    if (res.success) {
      showToast('Soal disimpan', 'success');
      setShowQuestionModal(false);
      loadQuestionsData(selectedBank.id);
    } else {
      showToast(res.message, 'error');
    }
    setFormLoading(false);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    const res = await deleteQuestion(id);
    if (res.success) {
      showToast('Soal dihapus', 'success');
      loadQuestionsData(selectedBank.id);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>{viewMode === 'banks' ? 'Bank Soal (Paket Ujian)' : `Soal: ${selectedBank?.title}`}</h1>
            <p>{viewMode === 'banks' ? 'Kelola daftar paket ujian Anda' : `Kelola pertanyaan untuk paket ini`}</p>
          </div>
          <div className="topbar-actions">
            {viewMode === 'banks' ? (
              <>
                <button className="admin-btn admin-btn-ghost" onClick={() => setShowSubjectModal(true)}>
                  ➕ Tambah Mapel Baru
                </button>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowBankModal(true)}>
                  ➕ Buat Paket Soal
                </button>
              </>
            ) : (
              <>
                <button className="admin-btn admin-btn-ghost" onClick={() => setViewMode('banks')}>
                  ⬅️ Kembali
                </button>
                <button className="admin-btn admin-btn-primary" onClick={() => { setQForm(emptyQForm); setEditingQId(null); setShowQuestionModal(true); }}>
                  ➕ Tambah Soal
                </button>
              </>
            )}
          </div>
        </div>

        <div className="admin-content">
          <div className="table-card">
            {loading ? (
              <div className="empty-state"><p>Memuat data...</p></div>
            ) : viewMode === 'banks' ? (
              // BANK LIST
              banks.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Paket</th>
                      <th>Mapel</th>
                      <th>Kelas</th>
                      <th>Total Soal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.title}</td>
                        <td><span className="badge badge-kelas">{b.subject.name}</span></td>
                        <td>{b.targetKelas}</td>
                        <td>{b._count.questions} soal</td>
                        <td>
                          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleOpenBank(b)} style={{ marginRight: '5px' }}>
                            Buka Soal
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteBank(b.id)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Belum ada paket soal. Buat Paket Soal terlebih dahulu.</p>
                </div>
              )
            ) : (
              // QUESTIONS LIST
              questions.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Teks Soal</th>
                      <th>Jawaban Benar</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td>{idx + 1}</td>
                        <td style={{ maxWidth: '400px' }}>{q.text.length > 80 ? q.text.substring(0,80) + '...' : q.text}</td>
                        <td><span className="badge badge-active">{q.correctAnswer}</span></td>
                        <td>
                          <button className="admin-btn admin-btn-warning admin-btn-sm" onClick={() => {
                            setQForm(q); setEditingQId(q.id); setShowQuestionModal(true);
                          }} style={{ marginRight: '5px' }}>
                            Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteQuestion(q.id)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Paket ini belum memiliki soal. Klik Tambah Soal untuk memulai.</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah Mata Pelajaran</h3>
            <form onSubmit={handleCreateSubject}>
              <div className="modal-form-group">
                <label>Nama Mapel (misal: Matematika)</label>
                <input className="modal-input" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowSubjectModal(false)}>Batal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formLoading}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Buat Paket Soal Baru</h3>
            <form onSubmit={handleCreateBank}>
              <div className="modal-form-group">
                <label>Nama Paket (misal: UAS Ganjil MTK)</label>
                <input className="modal-input" value={bankForm.title} onChange={e => setBankForm({...bankForm, title: e.target.value})} required />
              </div>
              <div className="modal-form-group">
                <label>Mata Pelajaran</label>
                <select className="modal-input" value={bankForm.subjectId} onChange={e => setBankForm({...bankForm, subjectId: e.target.value})} required>
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {subjects.length === 0 && <small style={{color:'red'}}>Buat Mapel terlebih dahulu!</small>}
              </div>
              <div className="modal-form-group">
                <label>Kelas Target (Pilih atau Ketik Sendiri)</label>
                <input 
                  className="modal-input" 
                  list="kelas-options"
                  value={bankForm.targetKelas} 
                  onChange={e => setBankForm({...bankForm, targetKelas: e.target.value})} 
                  placeholder="Pilih atau ketik kelas..."
                  required 
                />
                <datalist id="kelas-options">
                  <option value="10 A" />
                  <option value="10 B" />
                  <option value="10 C" />
                  <option value="11 A" />
                  <option value="11 B" />
                  <option value="11 C" />
                  <option value="12 A" />
                  <option value="12 B" />
                  <option value="12 C" />
                  <option value="12 D" />
                </datalist>
              </div>
              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowBankModal(false)}>Batal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formLoading || subjects.length === 0}>Buat Paket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <h3>{editingQId ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
            <form onSubmit={handleSaveQuestion}>
              <div className="modal-form-group">
                <label>Teks Soal</label>
                <textarea className="modal-input" rows={3} value={qForm.text} onChange={e => setQForm({...qForm, text: e.target.value})} required style={{ resize: 'vertical' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                <div className="modal-form-group"><label>Opsi A</label><input className="modal-input" value={qForm.optionA} onChange={e => setQForm({...qForm, optionA: e.target.value})} required /></div>
                <div className="modal-form-group"><label>Opsi B</label><input className="modal-input" value={qForm.optionB} onChange={e => setQForm({...qForm, optionB: e.target.value})} required /></div>
                <div className="modal-form-group"><label>Opsi C</label><input className="modal-input" value={qForm.optionC} onChange={e => setQForm({...qForm, optionC: e.target.value})} required /></div>
                <div className="modal-form-group"><label>Opsi D</label><input className="modal-input" value={qForm.optionD} onChange={e => setQForm({...qForm, optionD: e.target.value})} required /></div>
                <div className="modal-form-group"><label>Opsi E</label><input className="modal-input" value={qForm.optionE} onChange={e => setQForm({...qForm, optionE: e.target.value})} required /></div>
                <div className="modal-form-group">
                  <label>Jawaban Benar</label>
                  <select className="modal-input" value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: e.target.value})} required>
                    {['A','B','C','D','E'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowQuestionModal(false)}>Batal</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formLoading}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
          </div>
        </div>
      )}
    </>
  );
}

