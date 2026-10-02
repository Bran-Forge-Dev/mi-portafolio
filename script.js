// Tema claro/oscuro (la clase 'dark' la aplica un script inline en <head> para evitar flash)
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function syncThemeIcon() {
    themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
}
syncThemeIcon();

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncThemeIcon();
});

// Menú móvil
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
    menuBtn.classList.toggle('menu-open');
});

// Cerrar menú al dar click en link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('show');
        menuBtn.classList.remove('menu-open');
    });
});

// Filtros de proyectos
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        projectCards.forEach(card => {
            const tags = card.dataset.tags.split(',');
            if (filter === 'all' || tags.includes(filter)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Activar 'Todos' al inicio
document.querySelector('.filter-btn[data-filter="all"]').click();

// Animaciones de aparición al hacer scroll
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealEls = document.querySelectorAll(
        '.sobre-mi, .edu-card, .section-header, .filter-buttons, .project-card, .tech-card, .game-card, .minijuegos-cta'
    );
    revealEls.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 5) * 60}ms`;
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
}
