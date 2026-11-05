const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${entry.target.id}`
      );
    });
  });
}, {
  rootMargin: '-28% 0px -62% 0px',
  threshold: 0
});

sections.forEach(section => observer.observe(section));

const themeToggle = document.querySelector('#themeToggle');
const savedTheme = localStorage.getItem('vm-intelligence-theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem(
    'vm-intelligence-theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
});

const brl = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(Number(value || 0));

const usd = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD'
}).format(Number(value || 0));

const pct = value => `${Number(value || 0).toFixed(1).replace('.', ',')}%`;

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function renderDashboard(data) {
  const financial = data.financial || {};
  const ninja = data.ninja || {};
  const freelance = data.freelance || {};
  const productivity = data.produtividade || {};
  const actions = data.action_center || {};
  const debts = data.dividas || {};

  setText('[data-metric="saldo"]', brl(financial.saldo_brl));
  setText('[data-metric="receita"]', brl(financial.receita_mes_brl));
  setText('[data-metric="despesas"]', brl(financial.despesas_mes_brl));
  setText('[data-metric="cambio"]', `R$ ${Number(financial.cambio_usd_brl || 0).toFixed(2).replace('.', ',')}`);
  setText('[data-metric="taxa"]', `US$ ${Number(financial.taxa_freelance_usd_h || 0).toFixed(2).replace('.', ',')}`);

  setText('[data-metric="ninjaTitle"]', actions.meta?.titulo || 'Kawasaki Ninja 500 SE');
  setText('[data-metric="ninjaAcumulado"]', brl(ninja.acumulado_brl));
  setText('[data-metric="ninjaMeta"]', brl(ninja.meta_total_brl));
  setText('[data-metric="ninjaRestante"]', brl(ninja.restante_brl));
  setText('[data-metric="ninjaProgresso"]', pct(ninja.progresso_pct));

  const ninjaBar = document.querySelector('#ninjaProgressBar');
  if (ninjaBar) {
    ninjaBar.style.width = `${Math.max(0, Math.min(100, Number(ninja.progresso_pct || 0)))}%`;
  }

  const funnelRows = document.querySelectorAll('.funnel-row strong');
  const funnelValues = [
    freelance.propostas,
    freelance.entrevistas,
    freelance.contratos,
    freelance.connects
  ];
  funnelRows.forEach((el, i) => {
    if (funnelValues[i] !== undefined) el.textContent = funnelValues[i];
  });

  const statValues = [
    productivity.tarefas_a_fazer,
    productivity.tarefas_em_andamento,
    productivity.tarefas_em_revisao,
    productivity.tarefas_concluidas
  ];
  document.querySelectorAll('.stat-list strong').forEach((el, i) => {
    if (statValues[i] !== undefined) el.textContent = statValues[i];
  });

  const ring = document.querySelector('.study-ring');
  const studyProgress = Math.max(0, Math.min(100, Number(productivity.estudo_progresso_pct || 0)));
  if (ring) {
    ring.style.background = `conic-gradient(var(--green) ${studyProgress}%, #e4ebe6 ${studyProgress}% 100%)`;
  }
  setText('.study-ring span', pct(studyProgress));
  setText('.study-progress strong', `${Number(productivity.estudo_realizado_h || 0).toFixed(1).replace('.', ',')}h realizadas`);
  setText('.study-progress p', `Primeiro foco sugerido: ${productivity.foco_estudo || '—'}.`);

  const cards = document.querySelectorAll('.action-card');
  const actionItems = [
    actions.proxima_tarefa,
    actions.oportunidade,
    actions.estudo,
    actions.meta
  ];

  cards.forEach((card, i) => {
    const item = actionItems[i];
    if (!item) return;
    const title = card.querySelector('h3');
    const detail = card.querySelector('p');
    if (title) title.textContent = item.titulo || '—';
    if (detail) detail.textContent = item.detalhe || '';
  });

  const priorityBanners = document.querySelectorAll('.priority-banner');
  const mainPriority = priorityBanners[0]?.querySelector('strong');
  if (mainPriority) mainPriority.textContent = actions.prioridade || 'Sistema atualizado.';

  setText('[data-metric="dividasTotal"]', brl(debts.total_aberto_brl));
  setText('[data-metric="dividasParcela"]', brl(debts.parcela_mensal_brl));
  setText('[data-metric="dividasAtivas"]', String(Number(debts.ativas || 0)));
  setText('[data-metric="dividasVencimento"]', debts.proximo_vencimento || '—');
  setText('[data-metric="dividasPrioridade"]', debts.prioridade_quitacao || 'Nenhuma dívida cadastrada');
  setText('[data-metric="dividasRecomendacao"]', debts.recomendacao || 'Cadastre suas dívidas para ativar as recomendações.');

  document.documentElement.dataset.dataStatus = 'loaded';
}

async function loadDashboard() {
  try {
    const response = await fetch(`data/dashboard.json?v=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error('VM Intelligence: falha ao carregar dados do dashboard.', error);
    document.documentElement.dataset.dataStatus = 'error';
  }
}

loadDashboard();
