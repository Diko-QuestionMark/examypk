'use client';

import { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import { getDashboardStats } from './actions';

interface Student {
  id: number;
  nis: string;
  name: string;
  kelas: string;
  createdAt: Date;
}

interface Session {
  id: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
}

interface DashboardData {
  totalStudents: number;
  totalSessions: number;
  activeSessions: number;
  recentStudents: Student[];
  recentSessions: Session[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getDashboardStats();
    if (result.success && result.data) {
      setData(result.data);
    }
    setLoading(false);
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

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>Dashboard</h1>
            <p>Ringkasan data CBT YPK</p>
          </div>
          <div className="topbar-actions">
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadData} disabled={loading}>
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : data ? (
            <>
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{data.totalStudents}</div>
                  <div className="stat-label">Total Siswa</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{data.totalSessions}</div>
                  <div className="stat-label">Total Sesi Ujian</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{data.activeSessions}</div>
                  <div className="stat-label">Sesi Aktif</div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-icon">🔒</div>
                  <div className="stat-value">{data.totalSessions - data.activeSessions}</div>
                  <div className="stat-label">Sesi Nonaktif</div>
                </div>
              </div>

              {/* Recent Data */}
              <div className="section-grid">
                {/* Recent Students */}
                <div className="table-card">
                  <div className="table-card-header">
                    <h2>
                      👤 Siswa Terbaru
                      <span className="header-count">{data.totalStudents}</span>
                    </h2>
                  </div>
                  {data.recentStudents.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>NIS</th>
                          <th>Kelas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentStudents.map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{s.name}</td>
                            <td><span className="token-display" style={{ fontSize: '0.8rem' }}>{s.nis}</span></td>
                            <td><span className="badge badge-kelas">{s.kelas}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      <p>Belum ada data siswa.</p>
                    </div>
                  )}
                </div>

                {/* Recent Sessions */}
                <div className="table-card">
                  <div className="table-card-header">
                    <h2>
                      🔑 Sesi Terbaru
                      <span className="header-count">{data.totalSessions}</span>
                    </h2>
                  </div>
                  {data.recentSessions.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Status</th>
                          <th>Dibuat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentSessions.map((s) => (
                          <tr key={s.id}>
                            <td><span className="token-display">{s.token}</span></td>
                            <td>
                              <span className={`badge ${s.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                {s.isActive ? '● Aktif' : '○ Nonaktif'}
                              </span>
                            </td>
                            <td>{formatDate(s.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      <p>Belum ada sesi ujian.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <p>Gagal memuat data dashboard.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
