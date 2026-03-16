import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'err';
}

let toastId = 0;
let externalAdd: ((msg: string, type: 'ok' | 'err') => void) | null = null;

export function toast(msg: string, type: 'ok' | 'err' = 'ok') {
  externalAdd?.(msg, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    externalAdd = (msg, type) => {
      const id = toastId++;
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    };
    return () => { externalAdd = null; };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 999 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'ok' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
