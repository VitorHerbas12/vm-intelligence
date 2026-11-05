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

const dashboardState = {
  ninjaProgress: 0
};

const ninjaBar = document.querySelector('#ninjaProgressBar');
if (ninjaBar) {
  const progress = Math.max(0, Math.min(100, dashboardState.ninjaProgress));
  ninjaBar.style.width = `${progress}%`;
}

// A camada de dados real será conectada por endpoint seguro.
// Não colocar credenciais ou dados financeiros privados neste repositório público.
