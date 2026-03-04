(function () {
  'use strict';

  window.FIZoo = window.FIZoo || {};

  var allModels = [];
  var searchIndex = [];
  var activeFamily = 'all';
  var activeSubcategory = 'all';
  var activeSort = 'name';
  var searchQuery = '';
  var debounceTimer = null;
  var onUpdate = null;

  var FAMILY_ORDER = [
    'yield-curve', 'rate-dynamics', 'forward-rates', 'volatility',
    'credit-risk', 'mortgage', 'inflation'
  ];

  var FAMILY_LABELS = {
    'yield-curve':   'Yield Curve',
    'rate-dynamics': 'Rate Dynamics',
    'forward-rates': 'Forward Rates',
    'volatility':    'Volatility',
    'credit-risk':   'Credit Risk',
    'mortgage':      'Mortgage',
    'inflation':     'Inflation'
  };

  /* ── Build search index ── */
  function buildSearchIndex(models) {
    searchIndex = models.map(function (m) {
      var text = [
        m.id, m.name, m.short_description, m.family, m.subcategory,
        m.key_paper, m.complexity, m.key_insight
      ].concat(m.tags || []).concat(m.use_cases || []).concat(m.products || []);
      return text.join(' ').toLowerCase();
    });
  }

  /* ── Filter pipeline ── */
  function filterModels() {
    var result = allModels.slice();

    // Family filter
    if (activeFamily !== 'all') {
      result = result.filter(function (m) { return m.family === activeFamily; });
    }

    // Subcategory filter
    if (activeSubcategory !== 'all') {
      result = result.filter(function (m) { return m.subcategory === activeSubcategory; });
    }

    // Text search (AND logic)
    if (searchQuery) {
      var terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter(function (m, idx) {
        // Find original index for search index
        var origIdx = allModels.indexOf(m);
        var text = searchIndex[origIdx] || '';
        return terms.every(function (t) { return text.indexOf(t) >= 0; });
      });
    }

    // Sort
    result.sort(function (a, b) {
      switch (activeSort) {
        case 'year-asc':
          return (a.year_introduced || 0) - (b.year_introduced || 0);
        case 'year-desc':
          return (b.year_introduced || 0) - (a.year_introduced || 0);
        case 'complexity':
          var cl = { 'foundational': 1, 'intermediate': 2, 'advanced': 3 };
          return (cl[a.complexity] || 0) - (cl[b.complexity] || 0);
        case 'family':
          return FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family);
        default: // name
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return result;
  }

  /* ── Get subcategories for current family ── */
  function getSubcategories() {
    var cats = {};
    var source = activeFamily === 'all' ? allModels : allModels.filter(function (m) { return m.family === activeFamily; });

    source.forEach(function (m) {
      if (!cats[m.subcategory]) {
        cats[m.subcategory] = {
          id: m.subcategory,
          label: (FIZoo.gallery.SUBCAT_LABELS || {})[m.subcategory] || m.subcategory,
          color: FIZoo.gallery.getColor(m)
        };
      }
    });

    return Object.keys(cats).map(function (k) { return cats[k]; });
  }

  /* ── Render subcategory pills ── */
  function renderFilterPills(containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    var subcats = getSubcategories();
    var html = '<button class="subcat-pill' + (activeSubcategory === 'all' ? ' active' : '') + '" data-subcat="all">All</button>';

    subcats.forEach(function (sc) {
      var isActive = activeSubcategory === sc.id;
      var style = isActive ? 'border-color:' + sc.color + ';color:' + sc.color + ';background:rgba(255,255,255,.06)' : '';
      html += '<button class="subcat-pill' + (isActive ? ' active' : '') + '" data-subcat="' + sc.id + '" style="' + style + '">' + sc.label + '</button>';
    });

    container.innerHTML = html;

    // Bind clicks
    container.querySelectorAll('.subcat-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeSubcategory = this.getAttribute('data-subcat');
        if (onUpdate) onUpdate();
      });
    });
  }

  /* ── Bind family pills ── */
  function bindFamilyPills() {
    document.querySelectorAll('.family-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFamily = this.getAttribute('data-family');
        activeSubcategory = 'all';
        // Update active states
        document.querySelectorAll('.family-pill').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        if (onUpdate) onUpdate();
      });
    });
  }

  /* ── Bind search input ── */
  function bindSearchInput() {
    var input = document.querySelector('.search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var val = this.value;
      debounceTimer = setTimeout(function () {
        searchQuery = val;
        if (onUpdate) onUpdate();
      }, 200);
    });
  }

  /* ── Bind sort ── */
  function bindSort() {
    var sel = document.querySelector('.sort-select');
    if (!sel) return;
    sel.addEventListener('change', function () {
      activeSort = this.value;
      if (onUpdate) onUpdate();
    });
  }

  /* ── Update count display ── */
  function updateCount(count) {
    var el = document.querySelector('.results-count');
    if (el) el.innerHTML = '<strong>' + count + '</strong> model' + (count !== 1 ? 's' : '');
  }

  /* ── Init ── */
  function init(models, callback) {
    allModels = models;
    buildSearchIndex(models);
    onUpdate = callback;
  }

  window.FIZoo.search = {
    init: init,
    filterModels: filterModels,
    renderFilterPills: renderFilterPills,
    bindFamilyPills: bindFamilyPills,
    bindSearchInput: bindSearchInput,
    bindSort: bindSort,
    updateCount: updateCount,
    getActiveFamily: function () { return activeFamily; },
    getActiveSubcategory: function () { return activeSubcategory; }
  };
})();
