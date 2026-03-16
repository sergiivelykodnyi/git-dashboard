import type { GitFile } from '../types';

interface Props { files: GitFile[] }

const statusClass: Record<string, string> = {
  M: 'fs-M', A: 'fs-A', D: 'fs-D', R: 'fs-R',
  '?': 'fs-unknown', ' ': 'fs-unknown',
};

function fileStatus(f: GitFile) {
  const s = (f.index !== ' ' && f.index !== '?') ? f.index : f.working_dir;
  return s || '?';
}

export function FileList({ files }: Props) {
  if (!files.length) return null;
  return (
    <div className="card">
      <div className="card-title">Changed Files ({files.length})</div>
      <div className="file-list">
        {files.map((f) => {
          const s = fileStatus(f);
          return (
            <div key={f.path} className="file-item">
              <div className={`file-status ${statusClass[s] ?? 'fs-unknown'}`}>{s}</div>
              <div className="file-path">{f.path}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
