"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExamData } from "../actions";

export default function ExamPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);

  useEffect(() => {
    // Fetch data soal saat komponen di-mount
    const loadData = async () => {
      const res = await getExamData();
      if (res.success && res.data) {
        setExamData(res.data);
      } else {
        alert(res.message || "Gagal memuat ujian. Silakan login kembali.");
        router.push("/");
      }
      setLoading(false);
    };
    loadData();

    // Timer Ujian
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>Memuat Soal Ujian...</div>;
  }

  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <h2>Belum ada soal di paket ini.</h2>
        <button className="btn-primary" onClick={() => router.push("/")}>Kembali</button>
      </div>
    );
  }

  const totalQuestions = examData.questions.length;
  const currentQData = examData.questions[currentQuestion - 1];
  
  const options = [
    { id: "A", text: currentQData.optionA },
    { id: "B", text: currentQData.optionB },
    { id: "C", text: currentQData.optionC },
    { id: "D", text: currentQData.optionD },
    { id: "E", text: currentQData.optionE },
  ];

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
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{examData.subjectName} - {examData.targetKelas}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Peserta: {examData.studentName} ({examData.studentNis})</p>
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
            <p className="question-text">{currentQData.text}</p>
            
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
