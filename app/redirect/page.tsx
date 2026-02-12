'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  const url = searchParams.get('url') || '';
  const name = searchParams.get('name') || '外部链接';
  const id = searchParams.get('id');

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 增加下载计数
  useEffect(() => {
    if (id) {
      fetch(`/api/plugins/${id}/download`, { method: 'POST' }).catch(console.error);
    }
  }, [id]);

  const handleGo = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 解析域名用于显示
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (!url) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">链接无效</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-[5px]">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 警告图标 */}
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* 标题 */}
        <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
          即将访问站外链接
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          您正在离开本站访问第三方网站，请注意账号财产安全
        </p>

        {/* 链接信息卡片 */}
        <div className="bg-gray-50 border border-gray-200 rounded-[5px] p-4 mb-6">
          <p className="text-xs text-gray-400 mb-2">目标链接</p>
          <p className="text-sm text-gray-700 font-medium break-all">{getDomain(url)}</p>
        </div>

        {/* 提示信息 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-[5px] p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">安全提示</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• 请勿在非官方页面输入账号密码</li>
                <li>• 认准正规网盘域名</li>
                <li>• 如有疑问请在 QQ 群咨询</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleGo}
            disabled={countdown > 0}
            className="w-full py-3 bg-black text-white rounded-[5px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {countdown > 0 ? `确定访问 (${countdown}s)` : '确定访问'}
          </button>
          <Link
            href="/"
            className="block w-full py-3 text-gray-600 bg-gray-100 rounded-[5px] font-medium hover:bg-gray-200 transition-colors text-center"
          >
            返回首页
          </Link>
        </div>

        {/* 底部说明 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          该链接由用户「{name}」提供，与本站无关
        </p>
      </div>
    </div>
  );
}
