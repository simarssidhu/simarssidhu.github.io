/**
 * PortfolioApp - Wealthsimple-inspired Portfolio Viewer Controller
 * Features:
 * - Theme toggle (Dark / Light mode)
 * - Separate per-user display (Alex, Chris, Simarjot rendered individually, never summed together!)
 * - Dual display mode: Absolute ($) vs Normalized (%)
 * - Scrubbing inspection (1-finger drag & mouse hover)
 * - 2-finger touch range return calculation
 */

(function () {
  'use strict';

  const AppState = {
    theme: localStorage.getItem('theme') || 'dark',
    timeframe: '1M', // '1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'
    mode: 'value', // 'value' | 'percent'
    activeUsers: ['alex', 'chris', 'simarjot'],
    rawHistory: [],
    filteredHistory: [],
    usersConfig: {},
    chart: null,
    isScrubbing: false,
    isRangeScrubbing: false
  };

  // DOM Elements
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    heroUsersList: document.getElementById('heroUsersList'),
    heroDate: document.getElementById('heroDate'),
    currencyPill: document.getElementById('currencyPill'),
    rangeBanner: document.getElementById('rangeBanner'),
    rangeUsersGrid: document.getElementById('rangeUsersGrid'),
    rangeDates: document.getElementById('rangeDates'),
    timeframeBar: document.getElementById('timeframeBar'),
    modeValueBtn: document.getElementById('modeValueBtn'),
    modePercentBtn: document.getElementById('modePercentBtn'),
    userCards: document.querySelectorAll('.ws-user-card'),
    holdingsList: document.getElementById('holdingsList'),
    holdingsTitle: document.getElementById('holdingsTitle'),
    settingsModal: document.getElementById('settingsModal'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    syncBadge: document.getElementById('syncBadge'),
    sheetUrlInput: document.getElementById('sheetUrlInput'),
    sheetApiKeyInput: document.getElementById('sheetApiKeyInput'),
    testSheetBtn: document.getElementById('testSheetBtn'),
    syncStatusText: document.getElementById('syncStatusText')
  };

  function init() {
    if (!window.PORTFOLIO_DATA) {
      console.error('PORTFOLIO_DATA not found');
      return;
    }

    AppState.rawHistory = window.PORTFOLIO_DATA.history || [];
    AppState.usersConfig = window.PORTFOLIO_DATA.users || {};

    applyTheme(AppState.theme);
    initChart();
    bindUIEvents();
    updateUserCards();
    updateUserCardsData();
    setTimeframe('1M');

    // Check for saved Google Apps Script URL & API Key
    const savedUrl = localStorage.getItem('ws_apps_script_url');
    const savedKey = localStorage.getItem('ws_apps_script_key');
    if (savedKey && elements.sheetApiKeyInput) {
      elements.sheetApiKeyInput.value = savedKey;
    }
    if (savedUrl && elements.sheetUrlInput) {
      elements.sheetUrlInput.value = savedUrl;
      fetchRemotePortfolioData(savedUrl, false);
    }

    // Auto-refresh every 2 minutes if connected
    setInterval(() => {
      const activeUrl = localStorage.getItem('ws_apps_script_url');
      if (activeUrl) {
        fetchRemotePortfolioData(activeUrl, true);
      }
    }, 120000);
  }

  function applyTheme(theme) {
    AppState.theme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.innerHTML = theme === 'light' ? '🌙' : '☀️';
      elements.themeToggleBtn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  function toggleTheme() {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    if (AppState.chart) {
      AppState.chart.render();
    }
  }

  function initChart() {
    AppState.chart = new PortfolioChart('#chartContainer', {
      mode: AppState.mode,
      activeUsers: AppState.activeUsers,
      usersConfig: AppState.usersConfig,
      onScrub: handleChartScrub,
      onScrubEnd: handleChartScrubEnd,
      onRangeScrub: handleChartRangeScrub
    });
  }

  function bindUIEvents() {
    // Theme Toggle
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Timeframe Buttons
    elements.timeframeBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.ws-tf-btn');
      if (!btn) return;
      const tf = btn.dataset.timeframe;
      setTimeframe(tf);
    });

    // Mode Buttons
    elements.modeValueBtn.addEventListener('click', () => setMode('value'));
    elements.modePercentBtn.addEventListener('click', () => setMode('percent'));

    // User Cards Toggles
    elements.userCards.forEach(card => {
      card.addEventListener('click', () => {
        const userId = card.dataset.user;
        toggleUser(userId);
      });
    });

    // Settings Modal
    elements.openSettingsBtn.addEventListener('click', () => {
      elements.settingsModal.classList.add('open');
    });
    elements.closeSettingsBtn.addEventListener('click', () => {
      elements.settingsModal.classList.remove('open');
    });
    elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === elements.settingsModal) {
        elements.settingsModal.classList.remove('open');
      }
    });

    // Google Sheet Test / Connect Button
    elements.testSheetBtn.addEventListener('click', handleGoogleSheetConnect);
  }

  function setMode(mode) {
    if (AppState.mode === mode) return;
    AppState.mode = mode;

    if (mode === 'value') {
      elements.modeValueBtn.classList.add('active');
      elements.modePercentBtn.classList.remove('active');
      elements.currencyPill.textContent = 'CAD';
    } else {
      elements.modePercentBtn.classList.add('active');
      elements.modeValueBtn.classList.remove('active');
      elements.currencyPill.textContent = '% RETURN';
    }

    AppState.chart.setMode(mode);
    updateHeroMetrics();
  }

  function toggleUser(userId) {
    const idx = AppState.activeUsers.indexOf(userId);
    if (idx > -1) {
      // Prevent unchecking all users
      if (AppState.activeUsers.length === 1) return;
      AppState.activeUsers.splice(idx, 1);
    } else {
      AppState.activeUsers.push(userId);
    }

    updateUserCards();
    AppState.chart.setActiveUsers(AppState.activeUsers);
    updateHeroMetrics();
    renderHoldings();
  }

  function updateUserCards() {
    elements.userCards.forEach(card => {
      const userId = card.dataset.user;
      const isActive = AppState.activeUsers.includes(userId);
      if (isActive) {
        card.classList.add('active');
        card.classList.remove('inactive');
      } else {
        card.classList.remove('active');
        card.classList.add('inactive');
      }
    });
  }

  function setTimeframe(tf) {
    AppState.timeframe = tf;

    elements.timeframeBar.querySelectorAll('.ws-tf-btn').forEach(btn => {
      if (btn.dataset.timeframe === tf) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    filterDataByTimeframe(tf);
    AppState.chart.setData(AppState.filteredHistory, {
      mode: AppState.mode,
      activeUsers: AppState.activeUsers,
      usersConfig: AppState.usersConfig
    });

    updateHeroMetrics();
    renderHoldings();
  }

  function filterDataByTimeframe(tf) {
    const all = AppState.rawHistory;
    if (all.length === 0) {
      AppState.filteredHistory = [];
      return;
    }

    const lastPoint = all[all.length - 1];
    const lastDate = new Date(lastPoint.date.replace(' ', 'T'));

    let cutoffDate = new Date(lastDate);

    switch (tf) {
      case '1D':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case '1W':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        cutoffDate = new Date('2000-01-01');
        break;
    }

    let filtered = all.filter(p => {
      const d = new Date(p.date.replace(' ', 'T'));
      return d >= cutoffDate;
    });

    if (filtered.length < 2) {
      filtered = all.slice(-Math.min(10, all.length));
    }

    AppState.filteredHistory = filtered;
  }

  /**
   * Separate Per-User Hero Display:
   * Displays each selected user's metric separately (never summed together into a total!)
   */
  function updateHeroMetrics(point = null, isScrub = false) {
    if (AppState.filteredHistory.length === 0) return;

    const data = AppState.filteredHistory;
    const startPoint = data[0];
    const targetPoint = point || data[data.length - 1];
    const isPercentMode = AppState.mode === 'percent';

    let html = '';

    AppState.activeUsers.forEach(u => {
      const uConf = AppState.usersConfig[u] || { name: u, color: '#3b82f6' };
      const startVal = startPoint[u] || 0;
      const currVal = targetPoint[u] || 0;
      const delta = currVal - startVal;
      const returnPct = startVal > 0 ? (delta / startVal) * 100 : 0;

      const isPos = delta >= 0;
      const sign = isPos ? '+' : '-';
      const colorStyle = isPos ? 'color: var(--color-green);' : 'color: var(--color-red);';

      if (isPercentMode) {
        // Percentage Mode: Big percentage return, subtitle dollar change
        html += `
          <div class="ws-hero-user-item">
            <div class="ws-hero-user-left">
              <span class="ws-hero-user-dot" style="background-color: ${uConf.color};"></span>
              <span class="ws-hero-user-name">${uConf.name}</span>
            </div>
            <div class="ws-hero-user-right">
              <div class="ws-hero-user-val" style="${colorStyle}">${sign}${Math.abs(returnPct).toFixed(2)}%</div>
              <div class="ws-hero-user-change" style="${colorStyle}">
                ${sign}${formatCurrency(Math.abs(delta))}
              </div>
            </div>
          </div>
        `;
      } else {
        // Absolute ($) Mode: Big dollar amount, subtitle return %
        html += `
          <div class="ws-hero-user-item">
            <div class="ws-hero-user-left">
              <span class="ws-hero-user-dot" style="background-color: ${uConf.color};"></span>
              <span class="ws-hero-user-name">${uConf.name}</span>
            </div>
            <div class="ws-hero-user-right">
              <div class="ws-hero-user-val">${formatCurrency(currVal)}</div>
              <div class="ws-hero-user-change" style="${colorStyle}">
                ${sign}${formatCurrency(Math.abs(delta))} (${sign}${Math.abs(returnPct).toFixed(2)}%)
              </div>
            </div>
          </div>
        `;
      }
    });

    elements.heroUsersList.innerHTML = html;
    elements.heroDate.textContent = formatDateLabel(targetPoint.date, isScrub);
    elements.rangeBanner.classList.remove('active');
  }

  function handleChartScrub(point, index) {
    AppState.isScrubbing = true;
    updateHeroMetrics(point, true);
  }

  function handleChartScrubEnd() {
    AppState.isScrubbing = false;
    AppState.isRangeScrubbing = false;
    updateHeroMetrics();
  }

  /**
   * Wealthsimple Signature: Range profit calculation between two touch points for EACH user separately
   */
  function handleChartRangeScrub(pStart, pEnd, idxStart, idxEnd) {
    AppState.isRangeScrubbing = true;

    elements.rangeBanner.classList.add('active');
    elements.rangeDates.textContent = `${formatShortDate(pStart.date)} → ${formatShortDate(pEnd.date)}`;

    let html = '';

    AppState.activeUsers.forEach(u => {
      const uConf = AppState.usersConfig[u] || { name: u, color: '#3b82f6' };
      const valStart = pStart[u] || 0;
      const valEnd = pEnd[u] || 0;
      const rangeDelta = valEnd - valStart;
      const rangePct = valStart > 0 ? (rangeDelta / valStart) * 100 : 0;

      const isPos = rangeDelta >= 0;
      const sign = isPos ? '+' : '-';
      const colorStyle = isPos ? 'color: var(--color-green);' : 'color: var(--color-red);';

      html += `
        <div class="ws-range-user-row">
          <span style="color: ${uConf.color};">${uConf.name}</span>
          <span style="${colorStyle}">${sign}${formatCurrency(Math.abs(rangeDelta))} (${sign}${Math.abs(rangePct).toFixed(2)}%)</span>
        </div>
      `;
    });

    elements.rangeUsersGrid.innerHTML = html;
    elements.heroDate.textContent = `Range inspection between ${formatDateLabel(pStart.date)} and ${formatDateLabel(pEnd.date)}`;
  }

  function renderHoldings() {
    if (!elements.holdingsList) return;

    let combinedHoldings = [];
    AppState.activeUsers.forEach(userId => {
      const uConf = AppState.usersConfig[userId];
      if (uConf && uConf.holdings) {
        uConf.holdings.forEach(h => {
          combinedHoldings.push({
            ...h,
            user: uConf.name,
            userColor: uConf.color
          });
        });
      }
    });

    combinedHoldings.sort((a, b) => b.currentValue - a.currentValue);

    if (AppState.activeUsers.length === 1) {
      const u = AppState.usersConfig[AppState.activeUsers[0]];
      elements.holdingsTitle.textContent = `${u.name}'s Top Holdings`;
    } else {
      elements.holdingsTitle.textContent = `Top Holdings (Active Users)`;
    }

    let html = '';
    const displayList = combinedHoldings.slice(0, 8);

    displayList.forEach(item => {
      const isPos = item.profit >= 0;
      const retSign = isPos ? '+' : '';
      const retColor = isPos ? 'var(--color-green)' : 'var(--color-red)';

      html += `
        <div class="ws-holding-row">
          <div class="ws-holding-left">
            <div class="ws-holding-badge" style="border-color: ${item.userColor}40; color: ${item.userColor};">
              ${item.ticker.slice(0, 4)}
            </div>
            <div class="ws-holding-info">
              <div class="ws-holding-ticker">
                ${item.ticker}
                <span class="ws-account-tag">${item.account || 'TFSA'}</span>
              </div>
              <div class="ws-holding-shares">
                ${item.shares.toLocaleString()} shares • ${item.user}
              </div>
            </div>
          </div>
          <div class="ws-holding-right">
            <div class="ws-holding-val">${formatCurrency(item.currentValue)}</div>
            <div class="ws-holding-return" style="color: ${retColor};">
              ${retSign}${item.returnPct.toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    });

    elements.holdingsList.innerHTML = html;
  }

  function updateUserCardsData() {
    if (!elements.userCards) return;
    elements.userCards.forEach(card => {
      const userId = card.dataset.user;
      const uConf = AppState.usersConfig[userId];
      if (!uConf) return;

      const valEl = card.querySelector('.ws-user-val');
      const changeEl = card.querySelector('.ws-user-change');

      if (valEl && uConf.currentValue !== undefined) {
        valEl.textContent = formatCompactCurrency(uConf.currentValue);
      }

      if (changeEl && uConf.totalReturnPct !== undefined) {
        const isPos = uConf.totalReturnPct >= 0;
        const sign = isPos ? '+' : '';
        changeEl.textContent = `${sign}${uConf.totalReturnPct.toFixed(2)}% 1y`;
        changeEl.style.color = isPos ? 'var(--color-green)' : 'var(--color-red)';
      }
    });
  }

  function formatCompactCurrency(num) {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return '$' + (num / 1000).toFixed(1) + 'K';
    }
    return '$' + Math.round(num).toLocaleString('en-US');
  }

  function fetchRemotePortfolioData(url, isBackground = false) {
    if (!url) return;

    if (!isBackground && elements.syncStatusText) {
      elements.syncStatusText.textContent = 'Syncing live portfolio data...';
      elements.syncStatusText.style.color = 'var(--text-secondary)';
    }

    // Attach API key if present
    const apiKey = (elements.sheetApiKeyInput ? elements.sheetApiKeyInput.value.trim() : '') || localStorage.getItem('ws_apps_script_key') || '';
    let finalUrl = url;
    if (apiKey && !finalUrl.includes('key=')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(apiKey);
    }

    fetch(finalUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: Failed to reach Google endpoint`);
        }
        return res.json();
      })
      .then(data => {
        if (data.status === 'error') {
          throw new Error(data.message || 'Error reported by Google Apps Script');
        }

        if (data.users && data.history) {
          // Merge incoming remote data
          AppState.rawHistory = data.history;
          AppState.usersConfig = data.users;

          // Re-render components with live data
          setTimeframe(AppState.timeframe);
          updateUserCardsData();
          renderHoldings();

          localStorage.setItem('ws_apps_script_url', url);
          if (apiKey) localStorage.setItem('ws_apps_script_key', apiKey);

          if (elements.syncStatusText) {
            elements.syncStatusText.textContent = `Connected! Synced ${data.history.length} hourly points.`;
            elements.syncStatusText.style.color = 'var(--color-green)';
          }

          if (elements.syncBadge) {
            elements.syncBadge.title = `Live Synced with Google Sheets (${data.history.length} hourly points)`;
            const dot = elements.syncBadge.querySelector('.ws-pulse-dot');
            if (dot) dot.classList.remove('fallback');
          }
        } else {
          throw new Error('Unexpected JSON structure. Expected { users, history }');
        }
      })
      .catch(err => {
        console.warn('Live sync fallback:', err);
        if (!isBackground && elements.syncStatusText) {
          elements.syncStatusText.textContent = err.message || 'Unable to sync live. Using local dataset.';
          elements.syncStatusText.style.color = '#f59e0b';
        }
      });
  }

  function handleGoogleSheetConnect() {
    const url = elements.sheetUrlInput.value.trim();
    if (!url) {
      elements.syncStatusText.textContent = 'Please enter a valid Google Apps Script Web App URL.';
      elements.syncStatusText.style.color = 'var(--color-red)';
      return;
    }

    const key = elements.sheetApiKeyInput ? elements.sheetApiKeyInput.value.trim() : '';
    if (key) {
      localStorage.setItem('ws_apps_script_key', key);
    }

    fetchRemotePortfolioData(url, false);
  }

  // Formatters
  function formatCurrency(val) {
    return '$' + Math.round(val).toLocaleString('en-US');
  }

  function formatDateLabel(dateStr, isScrub = false) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;

    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return d.toLocaleString('en-US', options) + ' ET';
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
