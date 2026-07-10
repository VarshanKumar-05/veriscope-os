import type { ResearchState } from '../types/shared.ts';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export interface HistoryItem {
  id: string;
  ticker: string;
  companyName: string;
  recommendation: string;
  confidence: number;
  status: string;
  pinned: boolean;
  createdAt: string;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch research history');
  return res.json();
}

export async function fetchReport(id: string): Promise<{ id: string; ticker: string; state: ResearchState; pinned: boolean; createdAt: string }> {
  const res = await fetch(`${API_BASE}/history/${id}`);
  if (!res.ok) throw new Error('Failed to fetch research report');
  return res.json();
}

export async function togglePin(id: string): Promise<{ success: boolean; pinned: boolean }> {
  const res = await fetch(`${API_BASE}/history/${id}/pin`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle pin');
  return res.json();
}

export async function deleteReport(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
}

export async function startResearch(ticker: string): Promise<{ id: string; ticker: string }> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to start research session');
  }
  return res.json();
}

export function getExportUrl(id: string): string {
  return `${API_BASE}/history/${id}/export`;
}

export interface SearchSuggestion {
  ticker: string;
  name: string;
  exchange: string;
  industry?: string;
}

export async function fetchSearch(query: string): Promise<SearchSuggestion[]> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch autocomplete suggestions');
  return res.json();
}
