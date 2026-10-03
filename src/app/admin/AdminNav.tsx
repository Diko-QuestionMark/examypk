'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/siswa', icon: '👤', label: 'Kelola Siswa' },
  { href: '/admin/bank-soal', icon: '📝', label: 'Bank Soal' },
  { href: '/admin/sesi', icon: '🔑', label: 'Sesi Ujian' },
];

export default function AdminNav() {
  const pathname = usePathname();

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

    </aside>
  );
}
