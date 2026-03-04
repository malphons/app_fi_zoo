(function () {
  'use strict';

  window.FIZoo = window.FIZoo || {};

  var CACHE_KEY = 'fizoo_data';
  var CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /* ── Session cache helpers ── */
  function getSessionCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsed.data;
    } catch (e) { return null; }
  }

  function setSessionCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) { /* quota exceeded – ignore */ }
  }

  /* ── Load fallback data ── */
  function loadFallback() {
    return fetch('data/fallback-cache.json')
      .then(function (r) { return r.json(); })
      .catch(function () { return []; });
  }

  /* ── Main loader ── */
  function loadRegistry() {
    var cached = getSessionCache();
    if (cached) return Promise.resolve(cached);

    return fetch('data/registry.json')
      .then(function (r) { return r.json(); })
      .then(function (reg) {
        var basePattern = reg.base_url_pattern;
        var user = reg.github_user;
        var spokes = reg.spokes.filter(function (s) { return s.enabled; });

        // Build spoke URLs
        var spokeMap = {};
        spokes.forEach(function (s) {
          var baseUrl = basePattern
            .replace('{github_user}', user)
            .replace('{repo_name}', s.repo_name);
          spokeMap[s.id] = {
            baseUrl: baseUrl,
            repoUrl: 'https://github.com/' + user + '/' + s.repo_name,
            spoke: s
          };
        });

        // Try fetching manifests from each unique repo
        var repos = {};
        spokes.forEach(function (s) {
          if (!repos[s.repo_name]) repos[s.repo_name] = spokeMap[s.id];
        });

        var fetches = Object.keys(repos).map(function (repoName) {
          var info = repos[repoName];
          return fetch(info.baseUrl + '/manifest.json')
            .then(function (r) {
              if (!r.ok) throw new Error('404');
              return r.json();
            })
            .then(function (manifest) {
              return (manifest.models || []).map(function (m) {
                m._repo_url = info.repoUrl;
                m._base_url = info.baseUrl;
                m._model_page_url = info.baseUrl + '/models/' + m.id + '/';
                return m;
              });
            })
            .catch(function () { return []; });
        });

        return Promise.all(fetches).then(function (results) {
          var liveModels = [];
          results.forEach(function (arr) {
            liveModels = liveModels.concat(arr);
          });
          return { liveModels: liveModels, spokeMap: spokeMap };
        });
      })
      .then(function (result) {
        // Load fallback and merge
        return loadFallback().then(function (fallback) {
          var liveIds = {};
          result.liveModels.forEach(function (m) { liveIds[m.id] = true; });

          // Fill gaps from fallback
          var merged = result.liveModels.slice();
          fallback.forEach(function (fb) {
            if (!liveIds[fb.id]) {
              // Find spoke info
              var spokeId = fb.family === 'yield-curve' ? 'yc-' + fb.subcategory
                : fb.family === 'rate-dynamics' ? 'rd-' + fb.subcategory
                : fb.family === 'forward-rates' ? 'fr-' + fb.subcategory
                : fb.family === 'volatility' ? 'vol-' + fb.subcategory
                : fb.family === 'credit-risk' ? 'cr-' + fb.subcategory
                : fb.family === 'mortgage' ? 'mtg-' + fb.subcategory
                : 'inf-' + fb.subcategory;

              var info = result.spokeMap[spokeId];
              if (info) {
                fb._repo_url = info.repoUrl;
                fb._base_url = info.baseUrl;
                fb._model_page_url = info.baseUrl + '/models/' + fb.id + '/';
              }
              merged.push(fb);
            }
          });

          setSessionCache(merged);
          return merged;
        });
      })
      .catch(function () {
        // Total fallback
        return loadFallback();
      });
  }

  /* ── Lazy thumbnail loader ── */
  function fetchThumbnail(model) {
    if (!model._base_url) return Promise.resolve(null);
    var url = model._base_url + '/models/' + model.id + '/thumbnail.svg';
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('404');
        return r.text();
      })
      .catch(function () { return null; });
  }

  window.FIZoo.registry = {
    loadRegistry: loadRegistry,
    fetchThumbnail: fetchThumbnail
  };
})();
