'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '../actions';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Mencoba login dengan:', username);
      const res = await loginAdmin(username, password);
      console.log('Respons dari server action:', res);
      
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.message || 'Login gagal');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error saat memanggil server action:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga di browser');
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Login Admin</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Masukkan kredensial Anda untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              placeholder="admin_master"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.75rem', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Sedang masuk...' : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
