(function () {
  'use strict';

  window.FIZoo = window.FIZoo || {};

  /* ── Color maps ── */
  var SUBCAT_COLORS = {
    'yc-construction': '#58a6ff',
    'yc-parametric':   '#79c0ff',
    'rd-equilibrium':  '#f0883e',
    'rd-calibrated':   '#d29922',
    'fr-general':      '#a371f7',
    'fr-market':       '#bc8cff',
    'vol-lognormal':   '#f85149',
    'vol-stochastic':  '#ff7b72',
    'cr-structural':   '#3fb950',
    'cr-reduced':      '#56d364',
    'mtg-prepayment':  '#d2a8ff',
    'mtg-spread':      '#e2cbff',
    'inf-nominal':     '#e3b341',
    'inf-market':      '#f0d060'
  };

  var FAMILY_LABELS = {
    'yield-curve':   'Yield Curve',
    'rate-dynamics': 'Rate Dynamics',
    'forward-rates': 'Forward Rates',
    'volatility':    'Volatility',
    'credit-risk':   'Credit Risk',
    'mortgage':      'Mortgage',
    'inflation':     'Inflation'
  };

  var FAMILY_ABBREV = {
    'yield-curve':   'YC',
    'rate-dynamics': 'RD',
    'forward-rates': 'FR',
    'volatility':    'VOL',
    'credit-risk':   'CR',
    'mortgage':      'MTG',
    'inflation':     'INF'
  };

  var FAMILY_BADGE_CLASS = {
    'yield-curve':   'badge-yc',
    'rate-dynamics': 'badge-rd',
    'forward-rates': 'badge-fr',
    'volatility':    'badge-vol',
    'credit-risk':   'badge-cr',
    'mortgage':      'badge-mtg',
    'inflation':     'badge-inf'
  };

  var SUBCAT_LABELS = {
    'construction': 'Construction',
    'parametric':   'Parametric',
    'equilibrium':  'Equilibrium',
    'calibrated':   'Calibrated',
    'general':      'General',
    'market':       'Market',
    'lognormal':    'Log-Normal',
    'stochastic':   'Stochastic Vol',
    'structural':   'Structural',
    'reduced':      'Reduced Form',
    'prepayment':   'Prepayment',
    'spread':       'Spread',
    'nominal':      'Nominal-Real',
    'market':       'Market-Implied'
  };

  var FAMILY_ORDER = [
    'yield-curve', 'rate-dynamics', 'forward-rates', 'volatility',
    'credit-risk', 'mortgage', 'inflation'
  ];

  var grid = null;
  var groupedContainer = null;

  function init() {
    grid = document.querySelector('.zoo-grid');
    groupedContainer = document.querySelector('.zoo-grouped');
  }

  /* ── Get color for model ── */
  function getColor(model) {
    var prefix = model.family === 'yield-curve' ? 'yc'
      : model.family === 'rate-dynamics' ? 'rd'
      : model.family === 'forward-rates' ? 'fr'
      : model.family === 'volatility' ? 'vol'
      : model.family === 'credit-risk' ? 'cr'
      : model.family === 'mortgage' ? 'mtg'
      : 'inf';
    return SUBCAT_COLORS[prefix + '-' + model.subcategory] || '#8b949e';
  }

  /* ── SVG Thumbnail Generators ── */

  function generateYieldCurveSVG(color) {
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Maturity</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Yield</text>'
      // Yield curve
      + '<path d="M50 130 Q100 100 140 80 Q180 60 220 50 Q260 44 280 42" stroke="' + color + '" stroke-width="2.5" fill="none" class="fi-line" stroke-dasharray="4,4"/>'
      // Data points
      + '<circle cx="50" cy="130" r="4" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="100" cy="105" r="4" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="140" cy="80" r="4" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="180" cy="62" r="4" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="220" cy="50" r="4" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="280" cy="42" r="4" fill="' + color + '" class="fi-node"/>'
      // Grid
      + '<line x1="40" y1="50" x2="290" y2="50" stroke="#30363d" stroke-width="0.3" stroke-dasharray="4,4"/>'
      + '<line x1="40" y1="100" x2="290" y2="100" stroke="#30363d" stroke-width="0.3" stroke-dasharray="4,4"/>'
      + '</svg>';
  }

  function generateRateDynamicsSVG(color) {
    // Mean-reverting paths
    var paths = '';
    var seed = [0, 1, 2];
    seed.forEach(function (s, i) {
      var d = 'M40 90';
      var y = 90;
      var mean = 90;
      for (var x = 60; x <= 280; x += 10) {
        var shock = Math.sin(x * 0.1 + s * 2.1) * 25 + Math.cos(x * 0.07 + s) * 15;
        y = y + (mean - y) * 0.15 + shock * 0.3;
        y = Math.max(30, Math.min(150, y));
        d += ' L' + x + ' ' + Math.round(y);
      }
      var opacity = i === 0 ? '0.9' : '0.4';
      paths += '<path d="' + d + '" stroke="' + color + '" stroke-width="' + (i === 0 ? 2 : 1.2) + '" fill="none" opacity="' + opacity + '" class="fi-line"/>';
    });

    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      // Mean level
      + '<line x1="40" y1="90" x2="290" y2="90" stroke="' + color + '" stroke-width="1" stroke-dasharray="6,4" opacity="0.3"/>'
      + '<text x="293" y="93" fill="' + color + '" font-size="9" opacity="0.5">b</text>'
      + paths
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Time</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Rate</text>'
      + '</svg>';
  }

  function generateForwardRateSVG(color) {
    // Forward rate surface (multiple curves)
    var curves = '';
    for (var c = 0; c < 4; c++) {
      var d = 'M50 ' + (120 - c * 15);
      for (var x = 60; x <= 270; x += 10) {
        var y = (120 - c * 15) - Math.sin((x - 50) * 0.025 + c * 0.3) * (30 + c * 5) + Math.cos(x * 0.015) * 10;
        d += ' L' + x + ' ' + Math.round(y);
      }
      curves += '<path d="' + d + '" stroke="' + color + '" stroke-width="1.5" fill="none" opacity="' + (0.3 + c * 0.2) + '" class="fi-line"/>';
    }

    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      + curves
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Tenor</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">f(t,T)</text>'
      + '</svg>';
  }

  function generateVolSmileSVG(color) {
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      // Smile curve
      + '<path d="M60 60 Q100 100 160 110 Q220 100 280 55" stroke="' + color + '" stroke-width="2.5" fill="none" class="fi-line"/>'
      // Shaded area
      + '<path d="M60 60 Q100 100 160 110 Q220 100 280 55 L280 150 L60 150 Z" fill="' + color + '" opacity="0.08" class="fi-area"/>'
      // ATM line
      + '<line x1="160" y1="110" x2="160" y2="150" stroke="' + color + '" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>'
      + '<text x="160" y="164" text-anchor="middle" fill="' + color + '" font-size="9" opacity="0.6">ATM</text>'
      // Points
      + '<circle cx="80" cy="76" r="3" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="120" cy="100" r="3" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="160" cy="110" r="3" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="200" cy="100" r="3" fill="' + color + '" class="fi-node"/>'
      + '<circle cx="250" cy="70" r="3" fill="' + color + '" class="fi-node"/>'
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Strike</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Impl. Vol</text>'
      + '</svg>';
  }

  function generateCreditSVG(color) {
    // Default barrier
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      // Default barrier
      + '<line x1="40" y1="120" x2="290" y2="120" stroke="#f85149" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>'
      + '<text x="293" y="123" fill="#f85149" font-size="9" opacity="0.7">D</text>'
      // Asset path above barrier
      + '<path d="M50 70 L70 65 L90 75 L110 60 L130 55 L150 65 L170 50 L190 55 L210 45 L230 50 L250 40 L270 45" stroke="' + color + '" stroke-width="2" fill="none" class="fi-line"/>'
      // Asset path hitting barrier
      + '<path d="M50 80 L70 85 L90 90 L110 95 L130 100 L150 105 L170 110 L190 115 L210 118 L220 120" stroke="' + color + '" stroke-width="1.5" fill="none" opacity="0.4" stroke-dasharray="3,3"/>'
      + '<circle cx="220" cy="120" r="5" fill="#f85149" opacity="0.7" class="fi-node"/>'
      + '<text x="220" y="136" text-anchor="middle" fill="#f85149" font-size="8" opacity="0.7">Default</text>'
      // Distance to default arrow
      + '<line x1="270" y1="45" x2="270" y2="120" stroke="' + color + '" stroke-width="1" opacity="0.4"/>'
      + '<text x="278" y="83" fill="' + color + '" font-size="8" opacity="0.5">DD</text>'
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Time</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Assets</text>'
      + '</svg>';
  }

  function generateMortgageSVG(color) {
    // Cash flow waterfall
    var bars = '';
    var heights = [100, 95, 88, 80, 72, 63, 55, 48, 40, 33, 27, 22];
    var prepayHeights = [5, 10, 15, 18, 20, 22, 20, 18, 15, 12, 8, 5];
    heights.forEach(function (h, i) {
      var x = 55 + i * 20;
      bars += '<rect x="' + x + '" y="' + (150 - h) + '" width="14" height="' + h + '" fill="' + color + '" opacity="0.5" rx="1" class="fi-area"/>';
      bars += '<rect x="' + x + '" y="' + (150 - h - prepayHeights[i]) + '" width="14" height="' + prepayHeights[i] + '" fill="#f85149" opacity="0.35" rx="1"/>';
    });

    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      + bars
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Period</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Cash Flow</text>'
      // Legend
      + '<rect x="200" y="25" width="8" height="8" fill="' + color + '" opacity="0.5" rx="1"/>'
      + '<text x="212" y="33" fill="#656d76" font-size="8">Scheduled</text>'
      + '<rect x="200" y="38" width="8" height="8" fill="#f85149" opacity="0.35" rx="1"/>'
      + '<text x="212" y="46" fill="#656d76" font-size="8">Prepay</text>'
      + '</svg>';
  }

  function generateInflationSVG(color) {
    // Two curves: nominal and real
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">'
      + '<rect width="320" height="180" fill="none"/>'
      + '<line x1="40" y1="150" x2="290" y2="150" stroke="#30363d" stroke-width="1"/>'
      + '<line x1="40" y1="20" x2="40" y2="150" stroke="#30363d" stroke-width="1"/>'
      // Nominal curve (higher)
      + '<path d="M50 95 Q100 80 140 70 Q180 60 220 55 Q260 52 280 50" stroke="' + color + '" stroke-width="2" fill="none" class="fi-line"/>'
      // Real curve (lower)
      + '<path d="M50 120 Q100 112 140 105 Q180 98 220 95 Q260 93 280 92" stroke="#58a6ff" stroke-width="2" fill="none" class="fi-line" stroke-dasharray="6,3"/>'
      // Breakeven area between
      + '<path d="M50 95 Q100 80 140 70 Q180 60 220 55 Q260 52 280 50 L280 92 Q260 93 220 95 Q180 98 140 105 Q100 112 50 120 Z" fill="' + color + '" opacity="0.1" class="fi-area"/>'
      // Labels
      + '<text x="282" y="48" fill="' + color + '" font-size="9">Nominal</text>'
      + '<text x="282" y="90" fill="#58a6ff" font-size="9">Real</text>'
      + '<text x="170" y="82" fill="' + color + '" font-size="8" opacity="0.6">BEI</text>'
      + '<text x="160" y="170" text-anchor="middle" fill="#656d76" font-size="10">Maturity</text>'
      + '<text x="15" y="85" text-anchor="middle" fill="#656d76" font-size="10" transform="rotate(-90,15,85)">Yield</text>'
      + '</svg>';
  }

  var SVG_GENERATORS = {
    'yield-curve':   generateYieldCurveSVG,
    'rate-dynamics': generateRateDynamicsSVG,
    'forward-rates': generateForwardRateSVG,
    'volatility':    generateVolSmileSVG,
    'credit-risk':   generateCreditSVG,
    'mortgage':      generateMortgageSVG,
    'inflation':     generateInflationSVG
  };

  /* ── Create a single card ── */
  function createCard(model) {
    var el = document.createElement('a');
    var color = getColor(model);
    var hasPage = model._model_page_url && !model._coming_soon;

    el.href = hasPage ? model._model_page_url : (model._repo_url || '#');
    if (hasPage || model._repo_url) el.target = '_blank';
    el.rel = 'noopener';
    el.className = 'zoo-card' + (model._coming_soon ? ' card-coming-soon' : '');

    // Thumbnail
    var generator = SVG_GENERATORS[model.family];
    var thumbSvg = generator ? generator(color) : '';

    // Complexity
    var compLevels = { 'foundational': 1, 'intermediate': 2, 'advanced': 3 };
    var compVal = compLevels[model.complexity] || 1;
    var dots = '';
    for (var d = 1; d <= 3; d++) {
      dots += '<span class="complexity-dot' + (d <= compVal ? ' active' : '') + '" style="' + (d <= compVal ? 'background:' + color : '') + '"></span>';
    }

    // Tags (show max 3)
    var tags = (model.tags || []).slice(0, 3).map(function (t) {
      return '<span class="tag">' + t + '</span>';
    }).join('');

    // Family abbreviation and badge class
    var familyAbbrev = FAMILY_ABBREV[model.family] || 'FI';
    var badgeClass = FAMILY_BADGE_CLASS[model.family] || '';

    el.innerHTML = ''
      + '<div class="card-thumb" id="thumb-' + model.id + '">' + thumbSvg + '</div>'
      + '<div class="card-body">'
      + '  <div class="card-title">' + model.name + '</div>'
      + '  <div class="card-year">' + (model.year_introduced || '') + (model.key_paper ? ' &middot; ' + model.key_paper : '') + '</div>'
      + '  <div class="card-desc">' + (model.short_description || '') + '</div>'
      + (model.key_insight ? '<div class="card-insight">&ldquo;' + model.key_insight + '&rdquo;</div>' : '')
      + (model.formula ? '<div class="card-formula">' + model.formula + '</div>' : '')
      + '</div>'
      + '<div class="card-meta">'
      + '  <span class="badge ' + badgeClass + '">' + familyAbbrev + '</span>'
      + '  <span class="badge-sub" style="border-color:' + color + ';color:' + color + '">' + (SUBCAT_LABELS[model.subcategory] || model.subcategory) + '</span>'
      + '  <div class="complexity" title="' + (model.complexity || '') + '">' + dots + '<span class="complexity-label">' + (model.complexity || '') + '</span></div>'
      + '  <div class="card-tags">' + tags + '</div>'
      + '</div>'
      + (model._coming_soon ? '<div class="coming-soon-overlay">Coming Soon</div>' : '');

    return el;
  }

  /* ── Render flat grid ── */
  function renderCards(models) {
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.display = '';

    if (models.length === 0) {
      grid.innerHTML = '<div class="no-results"><div class="icon">?</div><p>No models found matching your criteria.</p></div>';
      return;
    }

    var frag = document.createDocumentFragment();
    models.forEach(function (m) { frag.appendChild(createCard(m)); });
    grid.appendChild(frag);
  }

  /* ── Render grouped view ── */
  function renderGroupedCards(models) {
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.display = 'block';

    if (models.length === 0) {
      grid.innerHTML = '<div class="no-results"><div class="icon">?</div><p>No models found matching your criteria.</p></div>';
      return;
    }

    // Group by family, then subcategory
    var groups = {};
    models.forEach(function (m) {
      var key = m.family + '|' + m.subcategory;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    // Sort keys by family order
    var sortedKeys = Object.keys(groups).sort(function (a, b) {
      var fa = FAMILY_ORDER.indexOf(a.split('|')[0]);
      var fb = FAMILY_ORDER.indexOf(b.split('|')[0]);
      return fa - fb;
    });

    var frag = document.createDocumentFragment();
    var lastFamily = '';

    sortedKeys.forEach(function (key) {
      var parts = key.split('|');
      var family = parts[0];
      var subcat = parts[1];
      var items = groups[key];
      var color = getColor(items[0]);

      // Family header
      if (family !== lastFamily) {
        var h2 = document.createElement('h2');
        h2.className = 'family-header';
        h2.style.color = color;
        h2.textContent = FAMILY_LABELS[family] || family;
        frag.appendChild(h2);
        lastFamily = family;
      }

      // Subcategory header
      var h3 = document.createElement('h3');
      h3.className = 'subcategory-header';
      h3.innerHTML = '<span class="dot" style="background:' + color + '"></span>'
        + (SUBCAT_LABELS[subcat] || subcat)
        + ' <span class="subcategory-count">(' + items.length + ')</span>';
      frag.appendChild(h3);

      // Subgrid
      var subgrid = document.createElement('div');
      subgrid.className = 'zoo-subgrid';
      items.forEach(function (m) { subgrid.appendChild(createCard(m)); });
      frag.appendChild(subgrid);
    });

    grid.appendChild(frag);
  }

  /* ── Skeleton loading ── */
  function renderSkeletons(count) {
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.display = '';
    for (var i = 0; i < (count || 8); i++) {
      var sk = document.createElement('div');
      sk.className = 'skeleton-card';
      sk.innerHTML = '<div class="skeleton-thumb"></div>'
        + '<div class="skeleton-line" style="width:70%"></div>'
        + '<div class="skeleton-line short"></div>'
        + '<div class="skeleton-line" style="margin-bottom:16px"></div>';
      grid.appendChild(sk);
    }
  }

  /* ── Lazy-load thumbnails from spoke repos ── */
  function loadThumbnails(models) {
    models.forEach(function (m) {
      FIZoo.registry.fetchThumbnail(m).then(function (svg) {
        if (!svg) return;
        var el = document.getElementById('thumb-' + m.id);
        if (el) el.innerHTML = svg;
      });
    });
  }

  window.FIZoo.gallery = {
    init: init,
    renderCards: renderCards,
    renderGroupedCards: renderGroupedCards,
    renderSkeletons: renderSkeletons,
    loadThumbnails: loadThumbnails,
    getColor: getColor,
    SUBCAT_COLORS: SUBCAT_COLORS,
    FAMILY_LABELS: FAMILY_LABELS,
    SUBCAT_LABELS: SUBCAT_LABELS
  };
})();
