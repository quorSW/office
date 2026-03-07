:root {
  --bg: #1b1714;
  --panel: #2a231e;
  --panel-2: #332a24;
  --line: #5b4a3e;
  --text: #f1dfc8;
  --muted: #c9b29a;
  --gold: #f2b35f;
  --coffee: #8f6442;
  --accent: #7ec3b4;
  --danger: #d27a6e;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: radial-gradient(circle at top, #34281f, var(--bg) 55%); color: var(--text); font-family: Inter, Arial, sans-serif; }
body { min-height: 100vh; }
a { color: inherit; text-decoration: none; }
.page { max-width: 1440px; margin: 0 auto; padding: 24px; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.logo { font-size: 24px; font-weight: 800; letter-spacing: .02em; }
.sub { color: var(--muted); font-size: 14px; }
.grid { display: grid; grid-template-columns: 1.7fr .95fr; gap: 18px; }
.card { background: linear-gradient(180deg, rgba(63,49,39,.95), rgba(36,29,24,.96)); border: 1px solid var(--line); border-radius: 22px; box-shadow: 0 20px 40px rgba(0,0,0,.28); }
.officeCard { overflow: hidden; }
.toolbar { display: flex; gap: 12px; padding: 16px; border-bottom: 1px solid rgba(255,255,255,.08); align-items: center; }
.input { flex: 1; background: rgba(18,15,12,.7); color: var(--text); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; outline: none; }
.button { background: linear-gradient(180deg, #f2b35f, #dd9440); color: #2a1e12; border: 0; border-radius: 14px; padding: 14px 18px; font-weight: 800; cursor: pointer; }
.button.secondary { background: #403228; color: var(--text); border: 1px solid var(--line); }
.stack { display: grid; gap: 16px; }
.sideSection { padding: 16px; }
.sectionTitle { font-size: 15px; font-weight: 800; margin-bottom: 12px; }
.list { display: grid; gap: 10px; }
.row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.badge { border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 700; background: rgba(126,195,180,.16); color: #bde6dc; border: 1px solid rgba(126,195,180,.35); }
.badge.warn { background: rgba(242,179,95,.12); color: #ffd293; border-color: rgba(242,179,95,.35); }
.badge.rest { background: rgba(143,100,66,.18); color: #e6c5a9; border-color: rgba(143,100,66,.35); }
.feedItem, .agentItem, .metric { background: rgba(20,17,14,.32); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 12px; }
.metricGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.metricValue { font-size: 22px; font-weight: 800; margin-top: 6px; }
.canvasWrap { padding: 12px; }
.canvasHint { padding: 0 16px 16px; color: var(--muted); font-size: 13px; }
.footerNote { margin-top: 12px; color: var(--muted); font-size: 12px; }
@media (max-width: 1100px) {
  .grid { grid-template-columns: 1fr; }
}
