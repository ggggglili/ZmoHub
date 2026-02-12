'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../../components/toast';

export default function PluginFormPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const isEdit = params.id && params.id !== 'new';
  const pluginId = isEdit ? parseInt(params.id as string) : null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    download_url: '',
    category: '',
    install_guide: '',
    version: '1.0.0',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && pluginId) {
      fetchPlugin();
    }
  }, [isEdit, pluginId]);

  const fetchPlugin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/plugins/${pluginId}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.plugin.name,
          description: data.plugin.description || '',
          download_url: data.plugin.download_url,
          category: data.plugin.category || '',
          install_guide: data.plugin.install_guide || '',
          version: data.plugin.version || '1.0.0',
        });
      }
    } catch (error) {
      console.error('获取插件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const url = isEdit ? `/api/plugins/${pluginId}` : '/api/plugins';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? '插件已更新' : '插件已创建', 'success');
        if (isEdit) {
          // 编辑模式：刷新数据，不跳转
          fetchPlugin();
        } else {
          // 新建模式：跳转到列表页
          router.push('/zmo-panel');
        }
      } else {
        showToast(data.error || data.message || '保存失败', 'error');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/zmo-panel"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEdit ? '编辑插件' : '添加插件'}
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              插件名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="请输入插件名称"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="如：工具、娱乐、效率等"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              版本号
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="如：1.0.0、1.2.3"
            />
            <p className="text-xs text-gray-400 mt-1">保存时会将此版本记录到历史版本</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              下载链接 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="download_url"
              value={formData.download_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="https://pan.baidu.com/s/xxxxx"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              插件描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm resize-none"
              placeholder="请输入插件描述"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              安装说明
            </label>
            <textarea
              name="install_guide"
              value={formData.install_guide}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm resize-none"
              placeholder="请输入安装说明，支持 Markdown 格式
例如：
1. 下载插件文件
2. 打开浏览器扩展管理页面
3. 将文件拖拽到页面中安装"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white rounded-[5px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              href="/zmo-panel"
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-[5px] text-sm font-medium transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
