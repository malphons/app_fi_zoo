(function () {
  'use strict';

  window.FIZoo = window.FIZoo || {};

  /* ── Theme Toggle ── */
  function initTheme() {
    var saved = localStorage.getItem('fizoo_theme');
    var theme;

    if (saved) {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    } else {
      theme = 'dark';
    }

    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('fizoo_theme', next);
        updateThemeIcon(next);
      });
    }
  }

  function updateThemeIcon(theme) {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 01-1.64-10.75 4.5 4.5 0 006.39 6.39A5.48 5.48 0 018 13.5z"/></svg>'
      : '<svg viewBox="0 0 16 16"><path d="M8 12a4 4 0 100-8 4 4 0 000 8zm0-1.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 12a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 12z"/></svg>';
  }

  /* ── View Toggle ── */
  function initViewToggle() {
    var saved = localStorage.getItem('fizoo_view');
    var viewMode = saved || 'grid';

    var gridBtn = document.querySelector('.view-btn-grid');
    var groupBtn = document.querySelector('.view-btn-grouped');

    function setView(mode) {
      viewMode = mode;
      localStorage.setItem('fizoo_view', mode);
      if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
      if (groupBtn) groupBtn.classList.toggle('active', mode === 'grouped');
      refreshGallery();
    }

    if (gridBtn) {
      gridBtn.classList.toggle('active', viewMode === 'grid');
      gridBtn.addEventListener('click', function () { setView('grid'); });
    }
    if (groupBtn) {
      groupBtn.classList.toggle('active', viewMode === 'grouped');
      groupBtn.addEventListener('click', function () { setView('grouped'); });
    }

    return function () { return viewMode; };
  }

  /* ── Refresh ── */
  var getViewMode;

  function refreshGallery() {
    var filtered = FIZoo.search.filterModels();
    FIZoo.search.updateCount(filtered.length);
    FIZoo.search.renderFilterPills('.subcategory-pills');

    var mode = getViewMode ? getViewMode() : 'grid';
    if (mode === 'grouped') {
      FIZoo.gallery.renderGroupedCards(filtered);
    } else {
      FIZoo.gallery.renderCards(filtered);
    }
  }

  /* ── Boot ── */
  function boot() {
    initTheme();
    FIZoo.gallery.init();

    // Show loading skeletons
    FIZoo.gallery.renderSkeletons(8);

    // Load data
    FIZoo.registry.loadRegistry().then(function (models) {
      // Initialize search
      FIZoo.search.init(models, refreshGallery);

      // Bind UI
      FIZoo.search.bindFamilyPills();
      FIZoo.search.bindSearchInput();
      FIZoo.search.bindSort();

      // View toggle
      getViewMode = initViewToggle();

      // First render
      refreshGallery();

      // Lazy-load live thumbnails
      FIZoo.gallery.loadThumbnails(models);
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
