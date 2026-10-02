"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "./actions";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const result = await verifyLogin(nis, password, token);
    
    if (result.success) {
      alert(result.message);
      router.push("/exam");
    } else {
      setErrorMsg(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src="/LOGOZERI.png" alt="Logo Yayasan Zeri" style={{ height: '140px', objectFit: 'contain', marginBottom: '1rem' }} />
        <h1>CBT Portal</h1>
      </div>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="nis">Nomor Induk Siswa (NIS)</label>
          <input
            id="nis"
            type="text"
            className="input-field"
            placeholder="Masukkan NIS..."
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="Masukkan Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="token">Token Ruangan</label>
          <input
            id="token"
            type="text"
            className="input-field"
            placeholder="Token dari Pengawas..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Memverifikasi..." : "Mulai Ujian"}
        </button>
        {errorMsg && (
          <p style={{ color: '#dc3545', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
