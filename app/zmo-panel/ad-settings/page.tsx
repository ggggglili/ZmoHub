'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../../components/toast';

interface AdConfig {
  id?: number;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export default function AdSettingsPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<AdConfig>({
    title: '',
    subtitle: '',
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/ad-config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('获取广告配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/ad-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        showToast('广告配置已保存', 'success');
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
        <h1 className="text-xl font-semibold text-gray-900">广告横幅配置</h1>
      </div>

      {/* 预览 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">预览</h3>
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-[5px] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-[5px] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{config.title}</p>
              <p className="text-xs text-white/70">{config.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              name="title"
              value={config.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="请输入广告标题"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              副标题
            </label>
            <input
              type="text"
              name="subtitle"
              value={config.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="请输入副标题描述"
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
          </div>
        </form>
      </div>
    </div>
  );
}
