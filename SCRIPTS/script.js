document.addEventListener('DOMContentLoaded', () => {
  const home = document.querySelector('.home');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const closeMenuBtn = document.getElementById('close-menu') || document.querySelector('.close-menu');
  const navBackdrop = document.getElementById('nav-backdrop');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const topicLinks = document.querySelectorAll('a[data-topic]');
  const searchInput = document.getElementById('topic-search');
  const clearSearchBtn = document.querySelector('.clear-search');
  const searchResults = document.getElementById('search-results');

  if (!home) {
    console.error('G\'IA: no se encontró .home');
    return;
  }

  // Catálogo de temas para búsqueda (label + categoría)
  const topics = Array.from(topicLinks).map((link) => ({
    id: link.dataset.topic,
    label: link.textContent.trim(),
    cat: link.dataset.cat || 'html',
    el: link,
  }));

  /* ---------- Cargar template ---------- */
  function showTopic(topicId) {
    const template = document.getElementById(`tpl-${topicId}`);
    if (!template) {
      console.warn(`No existe el template: tpl-${topicId}`);
      return;
    }

    home.innerHTML = '';
    const content = template.content.cloneNode(true);
    home.appendChild(content);
    home.scrollLeft = 0;

    topicLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.topic === topicId);
    });

    closeMobileMenu();
    closeAllSubmenus();
    hideSearchResults();
  }

  /* ---------- Menú hamburguesa ---------- */
  const navHomeParent = mainNav?.parentElement || null;

  function openMobileMenu() {
    if (!mainNav) return;
    // Mover al body para que position:fixed sea respecto al viewport en iOS
    if (mainNav.parentElement !== document.body) {
      document.body.appendChild(mainNav);
    }
    if (navBackdrop && navBackdrop.parentElement !== document.body) {
      document.body.appendChild(navBackdrop);
    }
    mainNav.classList.add('is-open');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
    if (navBackdrop) {
      navBackdrop.hidden = false;
      navBackdrop.setAttribute('aria-hidden', 'false');
      void navBackdrop.offsetWidth;
      navBackdrop.classList.add('is-visible');
    }
  }

  function closeMobileMenu() {
    if (!mainNav) return;
    mainNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
    if (navBackdrop) {
      navBackdrop.classList.remove('is-visible');
      navBackdrop.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => {
        if (!mainNav.classList.contains('is-open')) {
          navBackdrop.hidden = true;
          // Devolver nav al header (desktop / siguiente apertura)
          if (navHomeParent && mainNav.parentElement === document.body) {
            navHomeParent.appendChild(mainNav);
          }
        }
      }, 280);
    } else if (navHomeParent && mainNav.parentElement === document.body) {
      navHomeParent.appendChild(mainNav);
    }
  }

  menuToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    if (open) closeMobileMenu();
    else openMobileMenu();
  });

  closeMenuBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMobileMenu();
  });

  navBackdrop?.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav?.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  /* ---------- Categorías (dropdown / accordion) ---------- */
  function closeAllSubmenus(except = null) {
    document.querySelectorAll('.nav-category').forEach((cat) => {
      if (except && cat === except) return;
      cat.classList.remove('is-open');
      const btn = cat.querySelector('.category-btn');
      const sub = cat.querySelector('.submenu');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (sub) sub.hidden = true;
    });
  }

  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.nav-category');
      const submenu = parent.querySelector('.submenu');
      const isOpen = parent.classList.contains('is-open');

      closeAllSubmenus();

      if (!isOpen) {
        parent.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        submenu.hidden = false;
      }
    });
  });

  // Cerrar dropdowns al hacer clic fuera (desktop)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.main-nav') && !e.target.closest('.menu-toggle')) {
      closeAllSubmenus();
    }
  });

  /* ---------- Clicks en temas ---------- */
  topicLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showTopic(link.dataset.topic);
    });
  });

  /* ---------- Búsqueda ---------- */
  function hideSearchResults() {
    searchResults.hidden = true;
    searchResults.innerHTML = '';
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      hideSearchResults();
      clearSearchBtn.hidden = true;
      return;
    }

    clearSearchBtn.hidden = false;

    const matches = topics.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.cat.toLowerCase().includes(q)
    );

    searchResults.innerHTML = '';
    searchResults.hidden = false;

    if (matches.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'Sin resultados';
      searchResults.appendChild(empty);
      return;
    }

    matches.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result';
      btn.setAttribute('role', 'option');
      btn.innerHTML = `<span>${t.label}</span><small>${t.cat}</small>`;
      btn.addEventListener('click', () => {
        searchInput.value = t.label;
        clearSearchBtn.hidden = false;
        showTopic(t.id);
      });
      searchResults.appendChild(btn);
    });
  }

  searchInput?.addEventListener('input', () => {
    renderSearchResults(searchInput.value);
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      hideSearchResults();
      clearSearchBtn.hidden = true;
      searchInput.blur();
    }
    if (e.key === 'Enter') {
      const first = searchResults.querySelector('.search-result');
      if (first) first.click();
    }
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    hideSearchResults();
    clearSearchBtn.hidden = true;
    searchInput.focus();
  });

  // Cerrar resultados al clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      hideSearchResults();
    }
  });

  /* ---------- Inicio: primer tema CSS (border) o el primero disponible ---------- */
  const defaultTopic =
    topics.find((t) => t.id === 'display-grid') ||
    topics.find((t) => t.id === 'html') ||
    topics[0];

  if (defaultTopic) {
    showTopic(defaultTopic.id);
  }
});


/*
const toggleBtn = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const eyeIcon = document.querySelector('.eye-icon');
const eyeOffIcon = document.querySelector('.eye-off-icon');

toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    passwordInput.type = isPassword ? 'text' : 'password';
    
    // Cambiar iconos
    eyeIcon.style.display = isPassword ? 'none' : 'block';
    eyeOffIcon.style.display = isPassword ? 'block' : 'none';

    // Accesibilidad
    toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
}); 
*/