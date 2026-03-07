const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function createTask(prompt: string) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('Не удалось создать задачу');
  return res.json();
}

export async function getAgents() {
  const res = await fetch(`${API_BASE}/agents`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Не удалось получить агентов');
  return res.json();
}

export async function getTimeline(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/timeline`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Не удалось получить timeline');
  return res.json();
}
