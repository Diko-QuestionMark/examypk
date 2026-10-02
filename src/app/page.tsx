"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate loading for the exam test
    setTimeout(() => {
      setLoading(false);
      router.push("/exam");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src="/LOGOZERI.png" alt="Logo Yayasan Zeri" style={{ height: '140px', objectFit: 'contain', marginBottom: '1rem' }} />
        <h1>CBT Portal</h1>
      </div>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="token">Token Ujian / NIS</label>
          <input
            id="token"
            type="text"
            className="input-field"
            placeholder="Masukkan token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Memverifikasi..." : "Mulai Ujian"}
        </button>
      </form>
    </div>
  );
}
