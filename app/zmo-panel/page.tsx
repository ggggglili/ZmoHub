'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '../components/toast';
import { useConfirm } from '../components/confirm';

interface Plugin {
  id: number;
  name: string;
  description: string;
  download_url: string;
  category: string;
  download_count: number;
  updated_at: string;
}

const ITEMS_PER_PAGE = 15;

export default function PluginsPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/plugins');
      const data = await res.json();
      if (data.success) {
        setPlugins(data.plugins);
      }
    } catch (error) {
      console.error('获取插件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: '删除插件',
      message: `确定要删除「${name}」这个插件吗？此操作无法撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
    });
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/plugins/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setPlugins(plugins.filter((p) => p.id !== id));
        showToast('插件已删除', 'success');
      } else {
        showToast(data.error || '删除失败', 'error');
      }
    } catch (error) {
      console.error('删除失败:', error);
      showToast('删除失败', 'error');
    }
  };

  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 分页逻辑
  const totalItems = filteredPlugins.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlugins = filteredPlugins.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 搜索时重置页码
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // 页码变化时滚动到顶部
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      {/* 搜索和添加按钮同一行 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索插件..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
        />
        <Link
          href="/zmo-panel/plugins/new"
          className="px-6 py-2 bg-black text-white rounded-[5px] text-sm font-medium hover:bg-gray-800 transition-colors text-center whitespace-nowrap"
        >
          添加插件
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 桌面端表格 */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-[5px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">插件名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">分类</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">下载次数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">更新时间</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPlugins.map((plugin) => (
                  <tr key={plugin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{plugin.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{plugin.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-[5px]">
                        {plugin.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{plugin.download_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(plugin.updated_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/zmo-panel/plugins/${plugin.id}`}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-[5px] transition-colors"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(plugin.id, plugin.name)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-[5px] transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片列表 */}
          <div className="md:hidden space-y-3">
            {paginatedPlugins.map((plugin) => (
              <div key={plugin.id} className="bg-white border border-gray-200 rounded-[5px] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plugin.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{plugin.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-[5px] shrink-0 ml-2">
                    {plugin.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>下载: {plugin.download_count}</span>
                  <span>{new Date(plugin.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/zmo-panel/plugins/${plugin.id}`}
                    className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[5px] transition-colors text-center"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(plugin.id, plugin.name)}
                    className="flex-1 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-[5px] transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {paginatedPlugins.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              暂无插件数据
            </div>
          )}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-6">
              {/* 分页按钮 */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-[5px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={index} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-1.5 text-sm rounded-[5px] transition-colors ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-[5px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
              
              {/* 共计插件数 - 底部居中 */}
              <p className="text-center text-gray-400 text-sm">
                共 {totalItems} 个插件，第 {currentPage}/{totalPages} 页
              </p>
            </div>
          )}
          
          {/* 只有一页时显示总数 */}
          {totalPages === 1 && totalItems > 0 && (
            <p className="text-center text-gray-400 text-sm mt-4">
              共 {totalItems} 个插件
            </p>
          )}
        </>
      )}
    </div>
  );
}
