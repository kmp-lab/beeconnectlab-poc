'use client';

import { useCallback, useEffect, useState } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let addToastFn: ((text: string, type: 'success' | 'error') => void) | null =
  null;

export function toast(text: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(text, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 text-sm text-white shadow-lg ${
              t.type === 'success' ? 'bg-navy' : 'bg-red-600'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
