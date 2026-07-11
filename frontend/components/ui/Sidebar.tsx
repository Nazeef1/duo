'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { MoreHorizontal } from 'lucide-react';

const AVATAR_COLORS = ['#ff4b4b', '#ff9600', '#58cc02', '#1cb0f6', '#a560e8', '#e63946'];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { username } = useUserStore();

  const menuItems = [
    { name: 'Learn', path: '/', icon: '/icons/home.png' },
    { name: 'Practice', path: '/practice', icon: '/icons/dumbell.png' },
    { name: 'Leaderboards', path: '/leaderboard', icon: '/icons/lightning.png' },
    { name: 'Quests', path: '/quests', icon: '/icons/treasure-chest.png' },
    { name: 'Shop', path: '/shop', icon: '/icons/shop.png' },
    { name: 'Profile', path: '/profile', icon: null, isAvatar: true },
    { name: 'Settings', path: '/settings', icon: null, isMore: true },
  ];

  return (
    <div className="sidebar">
      <Link href="/" className="sidebar-logo" style={{ display: 'flex', justifyContent: 'center', paddingLeft: '0px', marginBottom: '32px', width: '100%' }}>
        <img 
          src="/mascot/title.svg" 
          alt="duolingo" 
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
        />
      </Link>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = item.path === '/' 
            ? pathname === '/'
            : item.path.startsWith('/#')
              ? false  // hash routes are never "active" in the traditional sense
              : pathname.startsWith(item.path);
          
          return (
            <li key={item.name}>
              <Link 
                href={item.path} 
                className={`sidebar-item-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.path.startsWith('/#')) {
                    e.preventDefault();
                    alert('Practice feature: Review your mistakes loop in lesson players!');
                  }
                }}
              >
                {item.isAvatar ? (
                  <div 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: getAvatarColor(username), 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 900,
                      border: isActive ? '2px solid white' : 'none'
                    }}
                  >
                    {username[0].toUpperCase()}
                  </div>
                ) : item.isMore ? (
                  <MoreHorizontal size={24} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <img 
                    src={item.icon || ''} 
                    alt={item.name} 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      objectFit: 'contain',
                      filter: isActive ? 'none' : 'grayscale(30%) opacity(75%)'
                    }} 
                  />
                )}
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px' }}>
        For demo purposes only
      </div>
    </div>
  );
}
