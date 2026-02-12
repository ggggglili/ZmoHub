'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // 检查是否已经同意过
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
      // 延迟触发滑入动画
      setTimeout(() => setAnimateIn(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setAnimateIn(false);
    setTimeout(() => setShow(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setAnimateIn(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 max-w-md transition-all duration-500 ease-out ${
        animateIn ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-[10px] shadow-2xl border border-gray-100 p-5">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">我们使用 Cookie</h3>
        
        {/* 内容 */}
        <p className="text-sm text-gray-500 mb-4">
          我们使用 Cookie 来改善您的体验、个性化内容、投放广告以及分析流量。
        </p>

        {/* 按钮组 */}
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-[5px] transition-colors"
          >
            接受全部
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-[5px] transition-colors"
          >
            拒绝全部
          </button>
        </div>
      </div>
    </div>
  );
}
