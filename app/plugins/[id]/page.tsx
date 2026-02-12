'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Plugin {
  id: number;
  name: string;
  description: string;
  download_url: string;
  category: string;
  download_count: number;
  updated_at: string;
  created_at: string;
  version?: string;
  platform?: string[];
  install_guide?: string;
}

interface Version {
  id: number;
  version_number: string;
  name: string;
  description: string;
  download_url: string;
  category: string;
  install_guide?: string;
  created_at: string;
}

interface RelatedPlugin {
  id: number;
  name: string;
  description: string;
  category: string;
  download_count: number;
}

export default function PluginDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [relatedPlugins, setRelatedPlugins] = useState<RelatedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState<'install' | 'history' | 'related'>('install');

  useEffect(() => {
    fetchPlugin();
    fetchVersions();
    fetchRelated();
  }, [params.id]);

  const fetchPlugin = async () => {
    try {
      const res = await fetch(`/api/plugins/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setPlugin(data.plugin);
      }
    } catch (error) {
      console.error('获取插件详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/plugins/${params.id}/versions`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.versions);
      }
    } catch (error) {
      console.error('获取版本历史失败:', error);
    }
  };

  const fetchRelated = async () => {
    try {
      const res = await fetch(`/api/plugins/${params.id}/related`);
      const data = await res.json();
      if (data.success) {
        setRelatedPlugins(data.related);
      }
    } catch (error) {
      console.error('获取相关推荐失败:', error);
    }
  };

  const handleDownload = () => {
    if (!plugin) return;
    const params = new URLSearchParams({
      url: plugin.download_url,
      name: plugin.name,
      id: plugin.id.toString(),
    });
    window.location.href = `/redirect?${params}`;
  };

  const handleShare = () => {
    if (!plugin) return;
    const url = `${window.location.origin}/plugins/${plugin.id}`;
    navigator.clipboard.writeText(url);
    setToast({ show: true, message: '链接已复制到剪贴板', type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">插件不存在</p>
          <Link href="/plugins" className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-[5px]">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-2 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-[5px] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-base font-medium text-gray-900 truncate max-w-[200px]">
              {plugin.name}
            </span>
            {plugin.category && (
              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-[5px]">
                {plugin.category}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-full mx-auto px-2 pt-20 pb-12">
        {/* 功能介绍 */}
        <div className="bg-gray-50 rounded-[5px] p-6 mb-8 border border-black">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">功能介绍</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {plugin.description || '暂无详细描述'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-black text-white rounded-[5px] font-medium hover:bg-gray-800 transition-colors"
          >
            立即下载
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-[5px] hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* 下载统计信息 */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1 text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {plugin.download_count} 次下载
          </span>
          <span>更新于 {formatDate(plugin.updated_at)}</span>
          {plugin.version && <span>版本 {plugin.version}</span>}
        </div>

        {/* 标签页切换 */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('install')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'install' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              安装说明
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              版本历史
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'related' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              相关推荐
            </button>
          </div>
        </div>

        {/* 标签内容 */}
        <div className="min-h-[200px]">
          {activeTab === 'install' && (
            <div className="[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-900 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-800 [&_h4]:text-base [&_h4]:font-medium [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-gray-800 [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-gray-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1.5 [&_li]:text-gray-700 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_em]:text-gray-700 [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-4 [&_blockquote]:bg-gray-50 [&_blockquote]:rounded-r-[5px] [&_blockquote_p]:mb-0 [&_blockquote_p]:text-gray-600 [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:bg-black [&_a:hover]:text-white [&_a:hover]:no-underline [&_a:hover]:px-1 [&_a:hover]:py-0.5 [&_a:hover]:rounded [&_a]:transition-all [&_hr]:my-6 [&_hr]:border-gray-300 [&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:rounded-[5px] [&_table]:overflow-hidden [&_th]:bg-gray-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:border-b [&_th]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-gray-700 [&_td]:border-b [&_td]:border-gray-200 [&_tr:last-child_td]:border-b-0 [&_img]:max-w-full [&_img]:rounded-[5px] [&_img]:my-4 [&_img]:border [&_img]:border-gray-200 [&_del]:line-through [&_del]:text-gray-500">
              {plugin.install_guide ? (
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text';
                      return !inline ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language}
                          PreTag="div"
                          className="rounded-[5px] my-4 w-full"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {plugin.install_guide}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400">暂无说明</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {versions.length > 0 ? (
                versions.map((version, index) => (
                  <div key={version.id} className="flex items-start gap-4 group">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${index === 0 ? 'bg-black' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">v{version.version_number}</span>
                        <span className="text-xs text-gray-400">{formatDate(version.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-500">{version.description || '版本更新'}</p>
                    </div>
                    <button
                      onClick={() => window.open(`/redirect?url=${encodeURIComponent(version.download_url)}&name=${encodeURIComponent(version.name)}&id=${version.id}`, '_blank')}
                      className="p-2 bg-black text-white rounded-[5px] hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="下载此版本"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">v1.0.0</span>
                      <span className="text-xs text-gray-400">{formatDate(plugin.updated_at)}</span>
                    </div>
                    <p className="text-sm text-gray-500">初始版本发布</p>
                  </div>
                  <button
                    onClick={() => window.open(`/redirect?url=${encodeURIComponent(plugin.download_url)}&name=${encodeURIComponent(plugin.name)}&id=${plugin.id}`, '_blank')}
                    className="p-2 bg-black text-white rounded-[5px] hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    title="下载此版本"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPlugins.length > 0 ? (
                relatedPlugins.map((related) => (
                  <Link
                    key={related.id}
                    href={`/plugins/${related.id}`}
                    className="bg-gray-50 rounded-[5px] p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{related.name}</h3>
                      <span className="text-xs px-2 py-1 bg-white text-gray-600 rounded-[5px] shrink-0 ml-2">
                        {related.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{related.description || '暂无描述'}</p>
                    <p className="text-xs text-gray-400 mt-2">{related.download_count} 次下载</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 col-span-2 text-center py-8">暂无相关推荐</p>
              )}
            </div>
          )}
        </div>
      </main>

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
