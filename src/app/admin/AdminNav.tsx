'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/siswa', icon: '👤', label: 'Kelola Siswa' },
  { href: '/admin/sesi', icon: '🔑', label: 'Sesi Ujian' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">C</div>
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
