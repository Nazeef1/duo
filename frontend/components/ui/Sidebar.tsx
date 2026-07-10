'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Trophy, User, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Learn', path: '/', icon: BookOpen },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="sidebar">
      <Link href="/" className="sidebar-logo">
        <Sparkles size={32} strokeWidth={2.5} />
        <span>duolingo</span>
      </Link>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <li key={item.name}>
              <Link 
                href={item.path} 
                className={`sidebar-item-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={24} strokeWidth={2.5} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div style={{ marginTop: 'auto', fontSize: '13px', color: '#afafaf', paddingLeft: '16px' }}>
        © 2026 Duolingo Clone
      </div>
    </div>
  );
}
