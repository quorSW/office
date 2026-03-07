const workers = [
  { id: 1, name: 'Ванюша', role: 'Director', shirt: '#7bb8ff', energy: 92, speech: 'Планирую', status: 'work' },
  { id: 2, name: 'Тёма', role: 'Strategist', shirt: '#ff9fc8', energy: 87, speech: 'Собираю', status: 'work' },
  { id: 3, name: 'Пушкин', role: 'Architect', shirt: '#ffd56c', energy: 81, speech: 'Схема', status: 'work' },
  { id: 4, name: 'Люми', role: 'Developer', shirt: '#83dc96', energy: 90, speech: 'Пишу', status: 'work' },
  { id: 5, name: 'Глин', role: 'Reviewer', shirt: '#ffa45b', energy: 78, speech: 'Ревью', status: 'work' },
  { id: 6, name: 'Стройно', role: 'QA', shirt: '#9dafff', energy: 76, speech: 'Проверяю', status: 'work' },
  { id: 7, name: 'Мира', role: 'Docs', shirt: '#7ae0db', energy: 86, speech: 'README', status: 'work' },
  { id: 8, name: 'Коди', role: 'Enablement', shirt: '#d9a6ff', energy: 84, speech: 'Улучшаю', status: 'work' },
];

const tasks = [
  { title: 'Собрать mini app', owner: 'Director', stage: 'в работе' },
  { title: 'Переупаковать UI', owner: 'Developer', stage: 'в очереди' },
  { title: 'Проверить flow задач', owner: 'QA', stage: 'готовится' }
];

const logs = [];
const officeGrid = document.getElementById('officeGrid');
const teamList = document.getElementById('teamList');
const taskList = document.getElementById('taskList');
const logList = document.getElementById('logList');
const template = document.getElementById('deskTemplate');

const deskNodes = [];

function addLog(text) {
  const now = new Date();
  logs.unshift({
    text,
    time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  });
  logs.splice(10);
  renderLogs();
}

function renderOffice() {
  officeGrid.innerHTML = '';
  deskNodes.length = 0;

  workers.forEach((worker, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.workerId = worker.id;
    node.querySelector('.name-tag').textContent = worker.name;
    node.querySelector('.speech').textContent = worker.speech;

    const workerEl = node.querySelector('.worker');
    workerEl.style.setProperty('--shirt', worker.shirt);
    workerEl.dataset.state = worker.status;

    officeGrid.appendChild(node);
    deskNodes.push({ worker, node, workerEl, speech: node.querySelector('.speech') });
  });
}

function renderTeam() {
  teamList.innerHTML = workers.map((w) => `
    <div class="team-card">
      <div class="team-top">
        <strong>${w.name}</strong>
        <span class="badge ${w.status}">${statusText(w.status)}</span>
      </div>
      <div class="team-role">${w.role}</div>
      <div class="team-energy">Энергия: ${w.energy}%</div>
    </div>
  `).join('');

  document.getElementById('statWorking').textContent = workers.filter(w => w.status === 'work').length;
  document.getElementById('statCoffee').textContent = workers.filter(w => w.status === 'coffee').length;
  document.getElementById('statRest').textContent = workers.filter(w => w.status === 'rest').length;
  document.getElementById('statTasks').textContent = tasks.length;
}

function renderTasks() {
  taskList.innerHTML = tasks.map((t) => `
    <div class="task-card">
      <strong>${t.title}</strong>
      <div class="task-role">${t.owner}</div>
      <div class="task-role">Статус: ${t.stage}</div>
    </div>
  `).join('');
}

function renderLogs() {
  logList.innerHTML = logs.map((l) => `
    <div class="log-card">
      <div>${l.text}</div>
      <div class="log-time">${l.time}</div>
    </div>
  `).join('');
}

function statusText(status) {
  if (status === 'coffee') return 'кофе';
  if (status === 'rest') return 'отдых';
  return 'работает';
}

function setWorkerState(workerId, state, speech) {
  const entry = deskNodes.find(d => d.worker.id === workerId);
  const worker = workers.find(w => w.id === workerId);
  if (!entry || !worker) return;
  worker.status = state;
  if (speech) worker.speech = speech;
  entry.workerEl.dataset.state = state;
  entry.speech.textContent = worker.speech;
  renderTeam();
}

function animateCoffeeBreak(workerId) {
  const entry = deskNodes.find(d => d.worker.id === workerId);
  if (!entry) return;
  const wrap = entry.node.querySelector('.worker-wrap');
  const worker = workers.find(w => w.id === workerId);
  const originalLeft = 44;
  const originalTop = 76;

  setWorkerState(workerId, 'walk', 'Иду');
  wrap.style.left = '94px';
  wrap.style.top = '54px';

  setTimeout(() => {
    setWorkerState(workerId, 'coffee', 'Кофе');
    wrap.style.left = '112px';
    wrap.style.top = '34px';
    addLog(`${worker.name} ушёл за кофе.`);
  }, 1400);

  setTimeout(() => {
    setWorkerState(workerId, 'walk', 'Назад');
    wrap.style.left = `${originalLeft}px`;
    wrap.style.top = `${originalTop}px`;
  }, 4200);

  setTimeout(() => {
    setWorkerState(workerId, 'work', 'Работаю');
    addLog(`${worker.name} вернулся к столу.`);
  }, 5600);
}

function animateRest(workerId) {
  const entry = deskNodes.find(d => d.worker.id === workerId);
  if (!entry) return;
  const wrap = entry.node.querySelector('.worker-wrap');
  setWorkerState(workerId, 'rest', 'Отдых');
  wrap.style.top = '82px';
  setTimeout(() => {
    wrap.style.top = '76px';
    setWorkerState(workerId, 'work', 'В деле');
  }, 3500);
}

function officePulse() {
  const coffeeCandidates = workers.filter(w => w.status === 'work');
  if (coffeeCandidates.length) {
    const chosen = coffeeCandidates[Math.floor(Math.random() * coffeeCandidates.length)];
    animateCoffeeBreak(chosen.id);
  }

  const restCandidates = workers.filter(w => w.status === 'work' && w.id !== 1);
  if (restCandidates.length) {
    const chosenRest = restCandidates[Math.floor(Math.random() * restCandidates.length)];
    setTimeout(() => animateRest(chosenRest.id), 1200);
  }

  const working = workers.filter(w => w.status === 'work');
  if (working.length) {
    const chosenWork = working[Math.floor(Math.random() * working.length)];
    chosenWork.energy = Math.max(60, chosenWork.energy - 2);
    chosenWork.speech = ['Пишу', 'Проверяю', 'Планирую', 'Собираю', 'Готовлю'][Math.floor(Math.random() * 5)];
    const entry = deskNodes.find(d => d.worker.id === chosenWork.id);
    if (entry) entry.speech.textContent = chosenWork.speech;
    addLog(`${chosenWork.name} работает над задачей.`);
  }

  if (tasks.length) {
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    task.stage = ['в работе', 'на ревью', 'почти готово'][Math.floor(Math.random() * 3)];
    renderTasks();
  }

  renderTeam();
}

function createTask() {
  const titles = [
    'Пересобрать дизайн mini app',
    'Настроить офисный сценарий',
    'Обновить экран задач',
    'Добавить уютный свет',
    'Проверить flow команды'
  ];
  const owners = ['Director', 'Developer', 'QA', 'Docs', 'Strategist'];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const owner = owners[Math.floor(Math.random() * owners.length)];
  tasks.unshift({ title, owner, stage: 'в очереди' });
  if (tasks.length > 6) tasks.pop();
  renderTasks();
  addLog(`Поставлена новая задача: ${title}.`);
}

document.getElementById('newTaskBtn').addEventListener('click', createTask);
document.getElementById('addQuickTask').addEventListener('click', createTask);
document.getElementById('pulseBtn').addEventListener('click', officePulse);

renderOffice();
renderTeam();
renderTasks();
addLog('Офис открылся. Команда расселась по местам.');
addLog('Тёплый свет включён. День начинается спокойно.');

setInterval(() => {
  const active = workers.filter(w => w.status === 'work');
  if (active.length) {
    const who = active[Math.floor(Math.random() * active.length)];
    who.energy = Math.max(55, who.energy - 1);
    renderTeam();
  }
}, 7000);
