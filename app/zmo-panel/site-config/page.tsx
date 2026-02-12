'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../../components/toast';

interface SiteConfig {
  site_name: string;
  site_description: string;
}

export default function SiteConfigPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<SiteConfig>({
    site_name: 'ZmoHub',
    site_description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      if (data.success) {
        setConfig({
          site_name: data.config.site_name || 'ZmoHub',
          site_description: data.config.site_description || '',
        });
      }
    } catch (error) {
      console.error('获取站点配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        showToast('站点配置已保存', 'success');
      } else {
        showToast(data.error || '保存失败', 'error');
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
    setConfig(prev => ({ ...prev, [name]: value }));
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
        <h1 className="text-xl font-semibold text-gray-900">站点配置</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              站点名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="site_name"
              value={config.site_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="请输入站点名称"
              required
            />
            <p className="text-xs text-gray-400 mt-1">显示在页面标题、导航栏等位置</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              站点描述
            </label>
            <textarea
              name="site_description"
              value={config.site_description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm resize-none"
              placeholder="请输入站点描述，用于SEO和首页展示"
            />
            <p className="text-xs text-gray-400 mt-1">用于SEO优化和首页描述</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-black text-white rounded-[5px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
