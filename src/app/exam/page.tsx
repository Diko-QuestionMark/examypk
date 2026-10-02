"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExamPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Mock questions
  const totalQuestions = 20;
  const questionText = "Berdasarkan teks di atas, kesimpulan manakah yang paling tepat untuk menggambarkan situasi ekonomi pada masa tersebut? Perhatikan setiap faktor yang telah disebutkan dalam paragraf 2 dan 3 sebelum memilih jawaban Anda.";
  const options = [
    { id: "A", text: "Tingkat inflasi sangat rendah sehingga daya beli masyarakat meningkat tajam." },
    { id: "B", text: "Terjadi stagnasi ekonomi yang ditandai dengan kurangnya investasi asing." },
    { id: "C", text: "Pertumbuhan ekonomi stabil meskipun ada sedikit fluktuasi pada nilai tukar." },
    { id: "D", text: "Pemerintah berhasil menekan angka pengangguran melalui program padat karya." },
    { id: "E", text: "Defisit anggaran membengkak karena subsidi energi yang terlalu besar." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion]: optionId });
  };

  const handleFinish = () => {
    if (confirm("Apakah Anda yakin ingin mengakhiri ujian? Jawaban yang sudah dikirim tidak dapat diubah kembali.")) {
      alert("Ujian Selesai! Terima kasih.");
      router.push("/");
    }
  };

  return (
    <div className="exam-layout">
      {/* Header */}
      <header className="exam-header">
        <div className="exam-header-left">
          <img src="/LOGOZERI.png" alt="Logo Zeri" style={{ height: '50px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Bahasa Indonesia - Kelas XII</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Peserta: Siswa Zeri (CBT-2024)</p>
          </div>
        </div>
        <div className="exam-timer">
          Sisa Waktu: {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="exam-body">
        {/* Left Side: Question */}
        <div className="exam-content">
          <div className="question-container">
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Soal No. {currentQuestion}</h3>
            <p className="question-text">{questionText}</p>
            
            <div className="options-list">
              {options.map((opt) => (
                <div 
                  key={opt.id} 
                  className={`option-item ${answers[currentQuestion] === opt.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAnswer(opt.id)}
                >
                  <div style={{ fontWeight: 'bold', width: '30px' }}>{opt.id}.</div>
                  <div>{opt.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-secondary" 
              disabled={currentQuestion === 1}
              onClick={() => setCurrentQuestion(curr => curr - 1)}
            >
              &laquo; Soal Sebelumnya
            </button>
            <button 
              className="btn-primary" 
              style={{ marginLeft: 'auto' }}
              disabled={currentQuestion === totalQuestions}
              onClick={() => setCurrentQuestion(curr => curr + 1)}
            >
              Soal Selanjutnya &raquo;
            </button>
          </div>
        </div>

        {/* Right Side: Sidebar Navigation */}
        <aside className="exam-sidebar">
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            Daftar Soal
          </h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#28a745', borderRadius: '2px' }}></div> Sudah Dijawab
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '12px', height: '12px', border: '1px solid var(--border-color)', borderRadius: '2px' }}></div> Belum
            </div>
          </div>

          <div className="nav-grid">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                className={`nav-btn ${answers[num] ? 'answered' : ''} ${currentQuestion === num ? 'active' : ''}`}
                onClick={() => setCurrentQuestion(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button className="btn-danger" onClick={handleFinish}>
            Selesai Ujian
          </button>
        </aside>
      </div>
    </div>
  );
}
