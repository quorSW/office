'use client';

import { useEffect, useMemo, useState } from 'react';
import OfficeCanvas from '../components/office/OfficeCanvas';
import { createTask, getAgents } from '../lib/api';

type Agent = { id: string; name: string; role: string; state: string; energy: number };

type TaskResponse = {
  task_id: string;
  project_id: string;
  status: string;
  timeline?: { agent: string; summary: string }[];
};

const fallbackAgents: Agent[] = [
  { id: 'director', name: 'Mika', role: 'Director', state: 'planning', energy: 87 },
  { id: 'strategist', name: 'Lina', role: 'Strategist', state: 'working', energy: 81 },
  { id: 'developer', name: 'Noah', role: 'Developer', state: 'coding', energy: 92 },
  { id: 'reviewer', name: 'Iris', role: 'Reviewer', state: 'reviewing', energy: 76 },
  { id: 'qa', name: 'Ari', role: 'QA', state: 'testing', energy: 72 },
  { id: 'docs', name: 'Mio', role: 'Docs', state: 'documenting', energy: 78 },
  { id: 'enablement', name: 'Sora', role: 'Enablement', state: 'coffee_break', energy: 63 },
  { id: 'architect', name: 'Theo', role: 'Architect', state: 'working', energy: 84 }
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('Сделайте Telegram Mini App для продажи курсов с оплатой и админкой');
  const [agents, setAgents] = useState<Agent[]>(fallbackAgents);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<{ agent: string; summary: string }[]>([
    { agent: 'Director', summary: 'Офис готов принимать задачи.' },
    { agent: 'Developer', summary: 'Команда прогревает рабочие места и проверяет инструменты.' }
  ]);

  useEffect(() => {
    getAgents().then((data) => setAgents(data.agents || fallbackAgents)).catch(() => setAgents(fallbackAgents));
  }, []);

  const metrics = useMemo(() => {
    const active = agents.filter((a) => !['idle', 'resting'].includes(a.state)).length;
    const avgEnergy = Math.round(agents.reduce((s, a) => s + a.energy, 0) / agents.length);
    const coffee = agents.filter((a) => a.state === 'coffee_break').length;
    return { active, avgEnergy, coffee };
  }, [agents]);

  async function onSubmit() {
    setLoading(true);
    try {
      const data: TaskResponse = await createTask(prompt);
      if (data.timeline?.length) setTimeline(data.timeline);
      else {
        setTimeline([
          { agent: 'Director', summary: 'Принял задачу и создал проект.' },
          { agent: 'Strategist', summary: 'Собрал brief и ключевые требования.' },
          { agent: 'Developer', summary: 'Начал реализацию первой версии.' },
          { agent: 'QA', summary: 'Подготовил первичный список проверок.' },
          { agent: 'Docs', summary: 'Собирает README и handoff.' }
        ]);
      }
    } catch {
      setTimeline([
        { agent: 'Director', summary: 'Демо-режим: задача принята.' },
        { agent: 'Strategist', summary: 'Офис разбирает требования по задаче.' },
        { agent: 'Developer', summary: 'Разработчик приступил к реализации.' },
        { agent: 'QA', summary: 'Тестировщик готовит сценарии проверки.' },
        { agent: 'Docs', summary: 'Документация будет собрана после реализации.' }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="header">
        <div>
          <div className="logo">🏢 AI Office</div>
          <div className="sub">Уютный офис с живой командой AI-агентов, задачами и Telegram-чатом.</div>
        </div>
        <div className="badge warn">MVP starter</div>
      </div>

      <div className="grid">
        <section className="card officeCard">
          <div className="toolbar">
            <input
              className="input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Поставить задачу офису"
            />
            <button className="button" onClick={onSubmit} disabled={loading}>
              {loading ? 'Офис думает...' : 'Поставить задачу'}
            </button>
          </div>
          <div className="canvasWrap">
            <OfficeCanvas agents={agents} />
          </div>
          <div className="canvasHint">Сейчас это тёплый MVP-дизайн. Следующий шаг — привязать движения, статусы и отчёты к live-событиям backend и Telegram.</div>
        </section>

        <aside className="stack">
          <section className="card sideSection">
            <div className="sectionTitle">Сводка офиса</div>
            <div className="metricGrid">
              <div className="metric"><div className="sub">Активны</div><div className="metricValue">{metrics.active}</div></div>
              <div className="metric"><div className="sub">Средняя энергия</div><div className="metricValue">{metrics.avgEnergy}%</div></div>
              <div className="metric"><div className="sub">На кофе</div><div className="metricValue">{metrics.coffee}</div></div>
            </div>
          </section>

          <section className="card sideSection">
            <div className="sectionTitle">Команда</div>
            <div className="list">
              {agents.map((agent) => (
                <div className="agentItem" key={agent.id}>
                  <div className="row">
                    <div>
                      <div style={{ fontWeight: 800 }}>{agent.name}</div>
                      <div className="sub">{agent.role}</div>
                    </div>
                    <span className={`badge ${agent.state === 'coffee_break' ? 'rest' : ''}`}>{agent.state}</span>
                  </div>
                  <div className="footerNote">Энергия: {agent.energy}%</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card sideSection">
            <div className="sectionTitle">Лента офиса</div>
            <div className="list">
              {timeline.map((item, idx) => (
                <div className="feedItem" key={idx}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.agent}</div>
                  <div className="sub">{item.summary}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
