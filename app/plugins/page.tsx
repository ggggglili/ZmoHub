'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Plugin {
  id: number;
  name: string;
  description: string;
  download_url: string;
  category: string;
  download_count: number;
  updated_at: string;
}

// 广告配置
interface AdConfig {
  title: string;
  subtitle: string;
  enabled: boolean;
}

// 高亮关键词
const highlightText = (text: string, keyword: string) => {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded">$1</mark>');
};

// 趋势图组件
function TrendDashboard({ plugins, loading, search }: { plugins: Plugin[]; loading?: boolean; search?: string }) {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    fetchAdConfig();
  }, []);

  const fetchAdConfig = async () => {
    try {
      const res = await fetch('/api/ad-config');
      const data = await res.json();
      if (data.success && data.config) {
        setAdConfig(data.config);
      }
    } catch (error) {
      console.error('获取广告配置失败:', error);
    } finally {
      setConfigLoading(false);
    }
  };
  // 计算各分类下载量（真实数据）
  const categoryStats = plugins.reduce((acc, plugin) => {
    const cat = plugin.category || '未分类';
    if (!acc[cat]) {
      acc[cat] = { category: cat, downloads: 0, count: 0 };
    }
    acc[cat].downloads += plugin.download_count;
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { category: string; downloads: number; count: number }>);

  // 按下载量排序
  const sortedCategories = Object.values(categoryStats)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 6);

  const maxDownloads = sortedCategories.length > 0 
    ? Math.max(...sortedCategories.map(c => c.downloads)) 
    : 1;

  // 获取热门插件排行
  const topPlugins = [...plugins]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 广告横幅 - 骨架屏或内容 */}
      {configLoading || loading ? (
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-[5px] p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-[5px]"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-48"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      ) : adConfig?.enabled ? (
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-[5px] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-[5px] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{adConfig.title}</p>
              <p className="text-xs text-white/70">{adConfig.subtitle}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 热门插件排行 - 骨架屏或内容 */}
      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">最受欢迎插件排行</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-[5px] animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : topPlugins.length > 0 ? (
          <div className="space-y-3">
            {topPlugins.map((plugin, index) => (
              <Link 
                key={plugin.id} 
                href={`/plugins/${plugin.id}`}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md rounded-[5px] transition-all duration-200"
              >
                <span className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-sm font-bold transition-transform duration-200 group-hover:scale-110 ${
                  index === 0 ? 'bg-black text-white' : 
                  index === 1 ? 'bg-gray-700 text-white' : 
                  index === 2 ? 'bg-gray-500 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 
                    className="font-medium text-gray-900"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(plugin.name, search || '') 
                    }}
                  />
                  <p 
                    className="text-sm text-gray-500 line-clamp-1"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(plugin.description || '暂无描述', search || '') 
                    }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-medium">{plugin.download_count}</span>
                  <span className="text-xs text-gray-400 block">次下载</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">暂无插件数据</p>
        )}
      </div>

      {/* 各分类下载量排行 - 骨架屏或内容 */}
      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">各分类下载量排行</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded-[5px] animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : sortedCategories.length > 0 ? (
          <div className="space-y-4">
            {sortedCategories.map((item) => (
              <div key={item.category} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-[5px] transition-all duration-200 hover:scale-[1.01]">
                <span className="w-16 text-sm text-gray-500 shrink-0">{item.category}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-[5px] overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-[5px] transition-all duration-700 ease-out group-hover:bg-gray-700"
                    style={{ width: `${(item.downloads / maxDownloads) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-sm font-medium text-gray-900 text-right group-hover:text-black transition-colors">
                  {item.downloads.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">暂无数据</p>
        )}
      </div>
    </div>
  );
}

interface Config {
  qq_group_name: string;
  qq_group_number: string;
  qq_group_link: string;
  site_name: string;
}

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('download_count');
  const [loading, setLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭排序下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  // 加载搜索历史
  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // 保存搜索历史
  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term.trim(), ...searchHistory.filter(h => h !== term.trim())].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  };

  // 高亮关键词
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded">$1</mark>');
  };

  // 点击外部关闭搜索历史
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [shareModal, setShareModal] = useState<{ show: boolean; plugin: Plugin | null }>({ show: false, plugin: null });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState<'trend' | 'list' | string>('trend');
  const [contentVisible, setContentVisible] = useState(true);
  const router = useRouter();

  const sortOptions = [
    { value: 'download_count', label: '按热度' },
    { value: 'created_at', label: '按时间' },
  ];

  // 切换标签带动画
  const switchTab = (tab: string, category: string = '') => {
    setContentVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setSelectedCategory(category);
      setSearch('');
      setLoading(true);
      setContentVisible(true);
    }, 150);
  };

  useEffect(() => {
    fetchPlugins();
    fetchConfig();
  }, []);

  const fetchPlugins = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      params.append('order', 'desc');

      const res = await fetch(`/api/plugins?${params}`);
      const data = await res.json();
      if (data.success) {
        setPlugins(data.plugins);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('获取插件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [search, selectedCategory, sortBy]);

  const handleDownload = (plugin: Plugin) => {
    const params = new URLSearchParams({
      url: plugin.download_url,
      name: plugin.name,
      id: plugin.id.toString(),
    });
    window.location.href = `/redirect?${params}`;
  };

  const handleShare = (plugin: Plugin) => {
    setShareModal({ show: true, plugin });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ show: true, message: '链接已复制到剪贴板', type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-2 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-black rounded-[5px] flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <h1 className="text-base font-semibold text-gray-900">{config?.site_name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={searchInputRef}>
                <input
                  type="text"
                  placeholder="搜索插件..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveSearchHistory(search);
                      setShowHistory(false);
                    }
                  }}
                  className="w-40 sm:w-48 px-3 py-1.5 pl-9 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none transition-all text-sm"
                />
                <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {/* 搜索历史下拉框 */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[5px] shadow-xl border border-gray-200 py-1 z-50">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-400">搜索历史</span>
                      <button
                        onClick={() => {
                          setSearchHistory([]);
                          localStorage.removeItem('search-history');
                        }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        清除
                      </button>
                    </div>
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearch(term);
                          saveSearchHistory(term);
                          setShowHistory(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{term}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="p-1.5 bg-gray-100 rounded-[5px] hover:bg-gray-200 transition-colors"
                  title="排序"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </button>
                
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-[5px] shadow-xl border border-black py-1 z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setLoading(true);
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          sortBy === option.value ? 'text-black font-medium' : 'text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowGroupModal(true)}
                className="p-1.5 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors"
                title="交流群"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50">
          <div className="max-w-full mx-auto px-2 py-2">
            <div className="flex items-center">
              {/* 固定标签区域 - 不滚动 */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => switchTab('trend', '')}
                  className={`px-4 py-1.5 rounded-[5px] text-sm font-medium whitespace-nowrap transition-all border ${
                    activeTab === 'trend'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  仪表盘
                </button>
                <button
                  onClick={() => switchTab('', '')}
                  className={`px-4 py-1.5 rounded-[5px] text-sm font-medium whitespace-nowrap transition-all border ${
                    activeTab === '' && selectedCategory === ''
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  全部
                </button>

                {/* 分隔线 */}
                <div className="w-px h-5 bg-gray-300 self-center mx-1"></div>
              </div>

              {/* 分类标签区域 - 可滚动 */}
              <div className="flex-1 overflow-x-auto scrollbar-hide ml-2">
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => switchTab(cat, cat)}
                      className={`px-4 py-1.5 rounded-[5px] text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === cat
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-full mx-auto px-2 pt-28 pb-12 transition-all duration-300 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {activeTab === 'trend' ? (
          <TrendDashboard plugins={plugins} loading={loading} search={search} />
        ) : activeTab === 'list' || activeTab === '' || categories.includes(activeTab) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 text-sm">数据库位于境外 如果加载较慢 请刷新页面</p>
              </div>
            ) : plugins.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                暂无插件
              </div>
            ) : (
              plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="group bg-white border border-gray-200 rounded-[5px] p-5 hover:border-gray-400 hover:shadow-lg transition-all duration-200 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 
                      className="font-medium text-gray-900"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(plugin.name, search) 
                      }}
                    />
                    {plugin.category && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-[5px]">
                        {plugin.category}
                      </span>
                    )}
                  </div>

                  <p 
                    className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(plugin.description || '暂无简介', search) 
                    }}
                  />

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1 text-red-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {plugin.download_count}
                    </span>
                    <span>{formatDate(plugin.updated_at)}</span>
                  </div>

                  <Link href={`/plugins/${plugin.id}`} className="mt-auto">
                    <button className="w-full py-2.5 bg-black text-white rounded-[5px] hover:bg-gray-800 active:bg-gray-900 transition-colors text-sm font-medium">
                      查看详情
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        ) : null}
      </main>

      {/* QQ群弹窗 */}
      {showGroupModal && config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowGroupModal(false)}
          />
          
          <div className="relative bg-white rounded-[5px] p-6 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setShowGroupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-[5px] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {config.qq_group_name}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                群号: {config.qq_group_number}
              </p>

              {config.qq_group_link ? (
                <a
                  href={config.qq_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors font-medium"
                  onClick={() => setShowGroupModal(false)}
                >
                  加入群聊
                </a>
              ) : (
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-[5px] hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 分享弹窗 */}
      {shareModal.show && shareModal.plugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShareModal({ show: false, plugin: null })}
          />
          
          <div className="relative bg-white rounded-[5px] p-6 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setShareModal({ show: false, plugin: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-[5px] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                分享「{shareModal.plugin.name}」
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                将插件分享给朋友
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/plugins/${shareModal.plugin?.id}`)}
                  className="w-full py-3 bg-black text-white rounded-[5px] hover:bg-gray-800 transition-colors font-medium"
                >
                  复制链接
                </button>
                <button
                  onClick={() => setShareModal({ show: false, plugin: null })}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-[5px] hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-[5px] text-white font-medium shadow-lg bg-black`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
