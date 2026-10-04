'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { logoutAdmin } from './actions';

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/siswa', icon: '👤', label: 'Kelola Siswa' },
  { href: '/admin/bank-soal', icon: '📝', label: 'Bank Soal' },
  { href: '/admin/sesi', icon: '🔑', label: 'Sesi Ujian' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo" style={{ background: 'transparent', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/LOGOZERI.png" alt="Logo" width={40} height={40} style={{ objectFit: 'contain' }} priority />
        </div>
        <div className="sidebar-brand">
          <h2>CBT YPK</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', marginTop: 'auto' }}>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
        >
          🚪 Keluar
        </button>
      </div>

    </aside>
  );
}
