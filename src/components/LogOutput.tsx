import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export function LogOutput() {
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Output Log</span>
        {logs.length > 0 && (
          <button className="btn" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={clearLogs}>
            Clear
          </button>
        )}
      </div>
      <div className="log-output" ref={ref}>
        {logs.length === 0
          ? <span style={{ color: 'var(--overlay0)' }}>No output yet.</span>
          : logs.map((l) => (
            <div key={l.id} className="log-entry">
              <span className="log-time">{l.time}</span>
              <span className={`log-${l.type}`}>{l.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
