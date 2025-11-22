
import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';

type View = 'dashboard' | 'trades' | 'analysis' | 'journal' | 'chat';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'journal', label: '매매일지', icon: <BookOpenIcon /> },
    { id: 'trades', label: '거래 내역', icon: <ListBulletIcon /> },
    { id: 'dashboard', label: '대시보드', icon: <ChartBarIcon /> },
    { id: 'analysis', label: '분석', icon: <PresentationChartLineIcon /> },
    { id: 'chat', label: '커뮤니티', icon: <UserGroupIcon /> },
  ] as const;

  const navItemClasses = "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-300 text-sm font-medium";
  const activeClasses = "bg-accent text-highlight";
  const inactiveClasses = "text-text-secondary hover:bg-secondary hover:text-text-primary";

  return (
    <header className="bg-secondary shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-wider">
            TradingDiary<span className="text-highlight">Pro</span>
          </h1>
          <span className="text-lg">🇰🇷</span>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-2 bg-primary p-1 rounded-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`${navItemClasses} ${activeView === item.id ? activeClasses : inactiveClasses}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Mobile Nav */}
      <nav className="md:hidden bg-primary p-2 flex justify-around overflow-x-auto">
         {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center p-1 rounded-md text-xs min-w-[60px] ${activeView === item.id ? 'text-highlight' : 'text-text-secondary'}`}
              >
                {item.icon}
                <span className="mt-1 whitespace-nowrap">{item.label}</span>
              </button>
            ))}
      </nav>
    </header>
  );
};

export default Header;
