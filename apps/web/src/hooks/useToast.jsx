import { useState, useCallback, createContext, useContext, createElement } from 'react';

let toastId = 0;

const ToastContext = createContext(null);

export function toast({ title, description, variant = 'default', duration = 4000 }) {
  const dispatch = getToastDispatch();
  if (!dispatch) return;
  const id = ++toastId;
  dispatch({ id, title, description, variant, duration });
  return id;
}

let _dispatch = null;
function getToastDispatch() {
  return _dispatch;
}

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  _dispatch = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, t.duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-in-right flex items-start gap-3 rounded-xl border p-4 shadow-lg ${
            t.variant === 'danger' ? 'bg-red-50 border-red-200 text-red-800' :
            t.variant === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            'bg-white border-surface-200 text-surface-900'
          }`}
        >
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm opacity-80 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      ))}
    </div>
  );
}
