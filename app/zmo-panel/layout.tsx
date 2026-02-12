'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ToastProvider } from '../components/toast';
import { ConfirmProvider } from '../components/confirm';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/zmo-panel/login') {
      router.push('/zmo-panel/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === '/zmo-panel/login') {
    return (
      <ToastProvider>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </ToastProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/zmo-panel', label: '插件管理', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
    { href: '/zmo-panel/settings', label: '群聊配置', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/zmo-panel/ad-settings', label: '广告配置', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.447-6.314a1.76 1.76 0 00-3.417.592v-6.317a1.76 1.76 0 013.417-.592l2.447 6.314a1.76 1.76 0 003.417-.592V5.882a1.76 1.76 0 013.417-.592l2.447 6.314a1.76 1.76 0 003.417-.592V12M4 12h16' },
    { href: '/zmo-panel/site-config', label: '站点配置', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z M12 2.252A8.997 8.997 0 0012 21.748 8.997 8.997 0 0012 2.252z' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/zmo-panel/login');
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-gray-50">
        {/* 移动端悬浮按钮 */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-[5px] shadow-lg z-40 flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

      {/* 侧边栏 - 桌面端固定，移动端可滑动 */}
      <aside className={`fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* 桌面端 Logo */}
        <div className="hidden lg:block p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-[5px] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="font-semibold text-gray-900">后台管理</span>
          </div>
        </div>

        {/* 移动端关闭按钮 */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-[5px] flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="font-semibold text-gray-900">后台管理</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-[5px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[5px] text-sm font-medium transition-colors mb-1 ${
                pathname === item.href
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-[5px] text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        </div>
      </aside>

      {/* 遮罩层 - 移动端侧边栏打开时显示 */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 - 响应式边距 */}
      <main className="lg:ml-60 p-4 lg:p-8">
        {children}
      </main>
    </div>
    </ConfirmProvider>
    </ToastProvider>
  );
}
