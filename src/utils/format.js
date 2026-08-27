import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function seasonLabel(semester) {
  if (!semester) return '';
  const season = semester.season === 'winter' ? 'Winter' : 'Summer';
  return `${season} ${semester.year}`;
}

export function groupLabel(group) {
  if (!group) return null;
  return `Group ${String(group.number).padStart(2, '0')}`;
}

export function timeAgo(date) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function setSeo({ title, description }) {
  if (title) document.title = `${title} · IUB LFE`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute('content', description);
}
