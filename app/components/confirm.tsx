'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialog extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<ConfirmDialog[]>([]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      setDialogs((prev) => [...prev, { ...options, id, resolve }]);
    });
  }, []);

  const handleConfirm = (id: string, result: boolean) => {
    const dialog = dialogs.find((d) => d.id === id);
    if (dialog) {
      dialog.resolve(result);
      setDialogs((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogs.map((dialog) => (
        <div
          key={dialog.id}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => handleConfirm(dialog.id, false)}
          />

          {/* 对话框 */}
          <div className="relative bg-white rounded-[5px] p-6 w-full max-w-sm shadow-2xl">
            {/* 标题 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {dialog.title || '确认操作'}
            </h3>

            {/* 消息 */}
            <p className="text-gray-500 text-sm mb-6">
              {dialog.message}
            </p>

            {/* 按钮 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleConfirm(dialog.id, false)}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[5px] text-sm font-medium transition-colors"
              >
                {dialog.cancelText || '取消'}
              </button>
              <button
                onClick={() => handleConfirm(dialog.id, true)}
                className={`flex-1 px-4 py-2.5 text-white rounded-[5px] text-sm font-medium transition-colors ${
                  dialog.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : dialog.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {dialog.confirmText || '确定'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}
