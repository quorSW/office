'use client';

import { useEffect, useRef } from 'react';

type Agent = { id: string; name: string; role: string; state: string; energy: number };

const desks = [
  { x: 120, y: 130 }, { x: 280, y: 130 }, { x: 440, y: 130 },
  { x: 120, y: 300 }, { x: 280, y: 300 }, { x: 440, y: 300 },
  { x: 700, y: 150 }, { x: 700, y: 320 }
];

export default function OfficeCanvas({ agents }: { agents: Agent[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const width = 980;
    const height = 560;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(DPR, DPR);
    (ctx as any).imageSmoothingEnabled = false;

    let t = 0;
    let frame = 0;

    const drawWorker = (x: number, y: number, state: string, i: number) => {
      const blink = Math.sin(t / 9 + i) * 0.5 + 0.5;
      const bob = state === 'coffee_break' ? Math.sin(t / 6 + i) * 2 : 0;
      const dx = state === 'coffee_break' ? 16 + (Math.sin(t / 20 + i) * 22) : 0;
      const px = x + dx;
      const py = y + bob;

      ctx.fillStyle = '#2f241d';
      ctx.fillRect(px - 8, py + 10, 16, 6);
      ctx.fillStyle = '#e8c29d';
      ctx.fillRect(px - 5, py - 10, 10, 10);
      ctx.fillStyle = '#4f78a8';
      ctx.fillRect(px - 6, py, 12, 12);
      ctx.fillStyle = '#2c211b';
      ctx.fillRect(px - 5, py - 12, 10, 3);
      ctx.fillStyle = '#1a1613';
      ctx.fillRect(px - 2, py - 7, 1, 1);
      ctx.fillRect(px + 1, py - 7, 1, 1);
      if (blink > 0.25) {
        ctx.fillRect(px - 3, py - 3, 2, 1);
      }
      if (state === 'working' || state === 'coding' || state === 'reviewing') {
        ctx.fillStyle = '#8dd7ff';
        ctx.fillRect(x + 18, y - 12, 18, 14);
      }
      if (state === 'coffee_break') {
        ctx.fillStyle = '#f2b35f';
        ctx.fillRect(px + 8, py + 1, 4, 5);
      }
      ctx.fillStyle = 'rgba(0,0,0,.20)';
      ctx.fillRect(px - 10, py + 18, 20, 4);
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // room
      ctx.fillStyle = '#7b6655';
      ctx.fillRect(24, 24, 932, 512);
      ctx.fillStyle = '#3b3028';
      ctx.fillRect(24, 24, 932, 20);
      ctx.fillStyle = '#54453a';
      ctx.fillRect(24, 44, 932, 492);

      // windows
      ctx.fillStyle = '#5e4737';
      ctx.fillRect(70, 52, 120, 54);
      ctx.fillRect(220, 52, 120, 54);
      ctx.fillRect(370, 52, 120, 54);
      ctx.fillStyle = '#f3b96a';
      ctx.fillRect(76, 58, 108, 42);
      ctx.fillRect(226, 58, 108, 42);
      ctx.fillRect(376, 58, 108, 42);

      // warm light pools
      ctx.fillStyle = 'rgba(242,179,95,.12)';
      ctx.fillRect(80, 110, 780, 360);

      // meeting room / coffee area / lounge
      ctx.fillStyle = '#6f5a4a';
      ctx.fillRect(600, 70, 300, 140);
      ctx.fillRect(600, 240, 300, 120);
      ctx.fillRect(600, 390, 300, 100);
      ctx.fillStyle = '#8b735d';
      ctx.fillRect(665, 116, 160, 40); // meeting table
      ctx.fillStyle = '#8f6442';
      ctx.fillRect(648, 270, 40, 22); // coffee machine
      ctx.fillStyle = '#c2a187';
      ctx.fillRect(720, 420, 90, 28); // sofa
      ctx.fillRect(812, 420, 48, 28);

      // desks
      desks.forEach((d, idx) => {
        ctx.fillStyle = '#8b6a52';
        ctx.fillRect(d.x - 32, d.y - 18, 64, 28);
        ctx.fillStyle = '#2d231c';
        ctx.fillRect(d.x - 20, d.y + 12, 40, 8);
        ctx.fillStyle = '#7dc1cf';
        ctx.fillRect(d.x + 8, d.y - 12, 18, 14);
        ctx.fillStyle = '#d2b39b';
        ctx.fillRect(d.x - 26, d.y - 8, 8, 8);
      });

      agents.forEach((agent, i) => {
        const desk = desks[i % desks.length];
        drawWorker(desk.x - 10, desk.y, agent.state, i);

        ctx.fillStyle = 'rgba(42,35,30,.92)';
        ctx.fillRect(desk.x - 44, desk.y - 48, 88, 18);
        ctx.fillStyle = '#f1dfc8';
        ctx.font = '11px sans-serif';
        ctx.fillText(agent.name, desk.x - 36, desk.y - 35);
        ctx.fillStyle = '#c9b29a';
        ctx.fillText(agent.state.replace('_', ' '), desk.x - 36, desk.y - 22);
      });
    };

    loop();
    return () => cancelAnimationFrame(frame);
  }, [agents]);

  return <canvas ref={ref} />;
}
