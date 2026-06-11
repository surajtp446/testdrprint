import * as React from 'react';

const ToastContext = React.createContext(null);

export function Toast({ title, description, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white text-black rounded-lg shadow-2xl p-5 max-w-sm border border-gray-200">
      {title && <p className="font-bold text-sm mb-1">{title}</p>}
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}

export function ToastProvider({ children }) {
  return <>{children}</>;
}
export function ToastViewport() { return null; }
export function ToastTitle({ children }) { return <p className="font-bold text-sm">{children}</p>; }
export function ToastDescription({ children }) { return <p className="text-sm">{children}</p>; }
export function ToastClose() { return null; }
export function ToastAction({ children }) { return <button>{children}</button>; }
