import React from 'react';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(({ id, title, description }) => (
        <div key={id} className="bg-white text-black rounded-lg shadow-2xl p-5 max-w-sm border border-gray-100">
          {title && <p className="font-bold text-sm mb-1">{title}</p>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      ))}
    </div>
  );
}
