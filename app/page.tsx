'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SiteConfig {
  site_name: string;
  site_description: string;
}

export default function WelcomePage() {
  const [hovered, setHovered] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('获取站点配置失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* 主内容区 */}
      <div className="text-center">
        {/* Logo */}
        <div 
          className={`w-24 h-24 bg-black rounded-[5px] flex items-center justify-center mx-auto mb-8 transition-transform duration-300 ${hovered ? 'scale-110' : ''}`}
        >
          <span className="text-white text-4xl font-bold">Z</span>
        </div>

        {/* 主标题 */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          {config?.site_name}
        </h1>

        {/* 副标题 */}
        <p className="text-gray-400 text-lg mb-12 max-w-md">
          {config?.site_description}
        </p>

        {/* 进入按钮 */}
        <Link
          href="/plugins"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-[5px] font-medium text-lg hover:bg-gray-800 transition-all duration-200 group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          进入站点
          <svg 
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-300 text-sm">
          简单 · 实用 · 高效
        </p>
      </div>

      {/* 装饰性背景元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  );
}
