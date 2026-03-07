'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const AGENT_POSITIONS = [
  { name: 'Director', x: 80, y: 80, status: 'planning' },
  { name: 'Strategist', x: 220, y: 140, status: 'thinking' },
  { name: 'Developer', x: 160, y: 280, status: 'coding' },
  { name: 'QA', x: 420, y: 280, status: 'testing' },
  { name: 'Docs', x: 540, y: 140, status: 'documenting' },
];

export default function OfficePage() {
  const [prompt, setPrompt] = useState('Сделайте Telegram Mini App для продажи курсов с оплатой и админкой');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`, { cache: 'no-store' });
    const data = await res.json();
    setTasks(data.reverse());
  }

  useEffect(() => {
    loadTasks().catch(console.error);
  }, []);

  async function submitTask() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      await res.json();
      await loadTasks();
    } finally {
      setLoading(false);
    }
  }

  const latest = tasks[0];

  return (
    <main className="grid grid-2">
      <div className="grid">
        <div className="card">
          <h1>Управление офисом</h1>
          <p className="muted small">Один промт для всей команды. Director сам запускает пайплайн.</p>
          <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <p><button onClick={submitTask} disabled={loading}>{loading ? 'Запускаем офис...' : 'Поставить задачу офису'}</button></p>
        </div>
        <div className="office card">
          <div className="room" style={{ left: 20, top: 20, width: 240, height: 160 }}><div className="room-label">Переговорка</div></div>
          <div className="room" style={{ left: 40, top: 220, width: 260, height: 150 }}><div className="room-label">Разработка</div></div>
          <div className="room" style={{ left: 360, top: 220, width: 220, height: 150 }}><div className="room-label">QA и Docs</div></div>
          <div className="room" style={{ left: 420, top: 30, width: 160, height: 110 }}><div className="room-label">Кофе-зона</div></div>
          {AGENT_POSITIONS.map((agent) => (
            <div key={agent.name} className="agent" style={{ left: agent.x, top: agent.y }}>
              <div className="agent-label">{agent.name} · {agent.status}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <h2>Последняя задача</h2>
          {latest ? (
            <>
              <p><strong>{latest.task_id}</strong></p>
              <p className="muted small">{latest.prompt}</p>
              {latest.timeline.map((step: any, idx: number) => (
                <div className="timeline-item" key={idx}>
                  <strong>{step.agent}</strong>
                  <div className="small">{step.summary}</div>
                </div>
              ))}
            </>
          ) : <p className="muted">Пока задач нет.</p>}
        </div>
      </div>
    </main>
  );
}
