'use client';

import { useState, useEffect } from 'react';

interface Config {
  qq_group_name: string;
  qq_group_number: string;
  qq_group_link: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config>({
    qq_group_name: '',
    qq_group_number: '',
    qq_group_link: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.message || data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
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
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">群聊配置</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[5px] p-6">
        {saved && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-[5px]">
            保存成功！
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              群名称
            </label>
            <input
              type="text"
              name="qq_group_name"
              value={config.qq_group_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="如：插件交流群"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              群号码
            </label>
            <input
              type="text"
              name="qq_group_number"
              value={config.qq_group_number}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="如：123456789"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              加群链接
            </label>
            <input
              type="url"
              name="qq_group_link"
              value={config.qq_group_link}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-[5px] focus:ring-2 focus:ring-gray-300 outline-none text-sm"
              placeholder="https://qm.qq.com/xxxxx"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-black text-white rounded-[5px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </form>
      </div>
    </div>
  );
}
