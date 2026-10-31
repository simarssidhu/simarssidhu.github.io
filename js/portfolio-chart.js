/**
 * PortfolioChart - Wealthsimple-inspired Interactive Chart Engine
 * Supports:
 * - Dynamic Y-axis (never starts at $0; dynamically scaled to visible data)
 * - Dual Mode: Absolute Value ($) vs Normalized Percentage (%)
 * - Multi-user rendering: Alex (Blue), Chris (Red), Simarjot (Purple)
 * - Desktop hover crosshair with instantaneous inspection
 * - Mobile single-finger touch & drag scrub
 * - Mobile two-finger touch: Wealthsimple range profit & percentage calculation
 * - Desktop Shift+Drag range inspection
 */

class PortfolioChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = Object.assign({
      mode: 'value', // 'value' | 'percent'
      activeUsers: ['alex', 'chris', 'simarjot'],
      usersConfig: {},
      onScrub: null,
      onScrubEnd: null,
      onRangeScrub: null
    }, options);

    this.data = []; // Current filtered timeline data
    this.width = 0;
    this.height = 0;
    this.padding = { top: 24, right: 16, bottom: 28, left: 16 };

    this.isScrubbing = false;
    this.isRangeScrubbing = false;
    this.scrubIndex = null;
    this.rangeStartIndex = null;
    this.rangeEndIndex = null;

    this.initSVG();
    this.bindEvents();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  initSVG() {
    this.container.innerHTML = `
      <div class="ws-chart-wrapper" style="position: relative; width: 100%; height: 100%; user-select: none; touch-action: none;">
        <svg class="ws-chart-svg" width="100%" height="100%" style="overflow: visible; display: block;">
          <defs>
            <!-- Linear Gradients for users -->
            <linearGradient id="grad-alex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-chris" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-simarjot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#a855f7" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
            </linearGradient>
            <!-- Subtle Glow Filter -->
            <filter id="ws-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Horizontal Grid Lines -->
          <g class="ws-grid-group"></g>

          <!-- Range Highlight Area (2-finger scrub) -->
          <rect class="ws-range-rect" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.15)" stroke-dasharray="4 4" style="display: none;" />

          <!-- Filled Area Paths -->
          <g class="ws-areas-group"></g>

          <!-- Stroke Lines -->
          <g class="ws-lines-group"></g>

          <!-- Crosshair and Scrubber Elements -->
          <g class="ws-scrubber-group" style="display: none; pointer-events: none;">
            <!-- Range line 1 (left) -->
            <line class="ws-range-line-start" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.5" stroke-dasharray="3 3" style="display: none;" />
            <!-- Range line 2 (right) -->
            <line class="ws-range-line-end" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.5" stroke-dasharray="3 3" style="display: none;" />

            <!-- Single crosshair line -->
            <line class="ws-scrub-line" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" stroke-dasharray="2 2" />

            <!-- Active User Indicator Dots -->
            <g class="ws-scrub-dots"></g>
          </g>
        </svg>

        <!-- Dynamic Axis Tooltip / Min-Max Labels -->
        <div class="ws-axis-labels" style="position: absolute; right: 12px; top: 8px; pointer-events: none; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-align: right; font-family: monospace;"></div>
      </div>
    `;

    this.svg = this.container.querySelector('.ws-chart-svg');
    this.gridGroup = this.container.querySelector('.ws-grid-group');
    this.areasGroup = this.container.querySelector('.ws-areas-group');
    this.linesGroup = this.container.querySelector('.ws-lines-group');
    this.scrubberGroup = this.container.querySelector('.ws-scrubber-group');
    this.scrubLine = this.container.querySelector('.ws-scrub-line');
    this.scrubDots = this.container.querySelector('.ws-scrub-dots');
    this.rangeRect = this.container.querySelector('.ws-range-rect');
    this.rangeLineStart = this.container.querySelector('.ws-range-line-start');
    this.rangeLineEnd = this.container.querySelector('.ws-range-line-end');
    this.axisLabelsContainer = this.container.querySelector('.ws-axis-labels');
  }

  handleResize() {
    this.updateDimensions();
    this.render();
  }

  updateDimensions() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 600;
    this.height = rect.height || 340;
    this.plotWidth = this.width - this.padding.left - this.padding.right;
    this.plotHeight = this.height - this.padding.top - this.padding.bottom;
  }

  setData(data, options = {}) {
    this.data = data || [];
    if (options.mode !== undefined) this.options.mode = options.mode;
    if (options.activeUsers !== undefined) this.options.activeUsers = options.activeUsers;
    if (options.usersConfig !== undefined) this.options.usersConfig = options.usersConfig;

    this.updateDimensions();
    this.render();
  }

  setMode(mode) {
    this.options.mode = mode;
    this.render();
  }

  setActiveUsers(activeUsers) {
    this.options.activeUsers = activeUsers;
    this.render();
  }

  /**
   * Calculates bounds and coordinate mapping.
   * In percentage mode, values are normalized to 0.00% at index 0.
   */
  computeMetrics() {
    if (!this.data || this.data.length === 0) return null;

    const activeUsers = this.options.activeUsers;
    const isPercent = this.options.mode === 'percent';
    const firstPoint = this.data[0];

    // Compute user-specific starting values for normalization
    const baseValues = {};
    activeUsers.forEach(u => {
      baseValues[u] = firstPoint[u] || 1;
    });

    let minVal = Infinity;
    let maxVal = -Infinity;

    // Check values across active users
    this.data.forEach(point => {
      if (activeUsers.length === 0) return;

      activeUsers.forEach(u => {
        let rawVal = point[u];
        if (rawVal === undefined || rawVal === null) return;
        let v = isPercent ? ((rawVal - baseValues[u]) / baseValues[u]) * 100 : rawVal;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      });
    });

    // Guard against zero / flat range
    if (!isFinite(minVal) || !isFinite(maxVal) || minVal === maxVal) {
      minVal = minVal ? minVal * 0.95 : 0;
      maxVal = maxVal ? maxVal * 1.05 : 100;
    }

    // Dynamic padding (6% - 10% breathing room, never clamp down to 0)
    const range = maxVal - minVal;
    const paddingVal = range * 0.08;
    const yMin = minVal - paddingVal;
    const yMax = maxVal + paddingVal;

    return {
      minVal,
      maxVal,
      yMin,
      yMax,
      baseValues,
      isPercent
    };
  }

  getX(index) {
    if (this.data.length <= 1) return this.padding.left;
    return this.padding.left + (index / (this.data.length - 1)) * this.plotWidth;
  }

  getY(val, metrics) {
    const { yMin, yMax } = metrics;
    const norm = (val - yMin) / (yMax - yMin);
    // Invert SVG Y-axis
    return this.padding.top + (1 - norm) * this.plotHeight;
  }

  /**
   * Catmull-Rom to Cubic Bézier spline path generator for smooth organic curves
   */
  createSmoothPath(points) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    const tension = 0.22;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i != points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  render() {
    this.updateDimensions();
    if (!this.data || this.data.length === 0) {
      this.linesGroup.innerHTML = '';
      this.areasGroup.innerHTML = '';
      this.gridGroup.innerHTML = '';
      return;
    }

    const metrics = this.computeMetrics();
    if (!metrics) return;

    this.renderGrid(metrics);

    const activeUsers = this.options.activeUsers;
    const usersConfig = this.options.usersConfig;
    const isPercent = metrics.isPercent;

    let linesHTML = '';
    let areasHTML = '';

    // If only one user active, draw subtle gradient area under that curve
    const shouldDrawArea = activeUsers.length === 1;

    activeUsers.forEach(u => {
      const uConf = usersConfig[u] || { color: '#3b82f6', name: u };
      const points = [];

      for (let i = 0; i < this.data.length; i++) {
        const rawVal = this.data[i][u];
        if (rawVal === undefined || rawVal === null) continue;
        const v = isPercent ? ((rawVal - metrics.baseValues[u]) / metrics.baseValues[u]) * 100 : rawVal;
        points.push({
          x: this.getX(i),
          y: this.getY(v, metrics),
          val: v,
          rawVal: rawVal
        });
      }

      if (points.length < 2) return;

      const pathD = this.createSmoothPath(points);

      // Area fill
      if (shouldDrawArea) {
        const bottomY = this.padding.top + this.plotHeight;
        const firstX = points[0].x;
        const lastX = points[points.length - 1].x;
        const areaD = `${pathD} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
        areasHTML += `<path d="${areaD}" fill="url(#grad-${u})" style="transition: opacity 0.3s ease;" />`;
      }

      // Line stroke
      const strokeWidth = activeUsers.length === 1 ? 2.5 : 2.0;
      linesHTML += `
        <path d="${pathD}" 
              fill="none" 
              stroke="${uConf.color}" 
              stroke-width="${strokeWidth}" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              filter="url(#ws-glow)"
              class="ws-chart-line ws-line-${u}"
              style="transition: stroke 0.3s ease;" />
      `;
    });

    this.areasGroup.innerHTML = areasHTML;
    this.linesGroup.innerHTML = linesHTML;

    // Render axis labels in top-right
    this.renderAxisLabels(metrics);
  }

  renderGrid(metrics) {
    const { yMin, yMax, isPercent } = metrics;
    let gridHTML = '';
    const steps = 4;

    for (let i = 0; i <= steps; i++) {
      const val = yMin + ((yMax - yMin) * i) / steps;
      const y = this.getY(val, metrics);
      gridHTML += `
        <line x1="${this.padding.left}" y1="${y.toFixed(1)}" 
              x2="${this.width - this.padding.right}" y2="${y.toFixed(1)}" 
              stroke="rgba(255, 255, 255, 0.05)" 
              stroke-width="1" />
      `;
    }
    this.gridGroup.innerHTML = gridHTML;
  }

  renderAxisLabels(metrics) {
    const { minVal, maxVal, isPercent } = metrics;
    const format = (v) => {
      if (isPercent) return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
      return '$' + Math.round(v).toLocaleString('en-US');
    };
    this.axisLabelsContainer.innerHTML = `
      <div style="opacity: 0.6;">MAX: ${format(maxVal)}</div>
      <div style="opacity: 0.6; margin-top: 4px;">MIN: ${format(minVal)}</div>
    `;
  }

  bindEvents() {
    const el = this.container;

    // Desktop Mouse Events
    el.addEventListener('mousemove', (e) => this.onMouseMove(e));
    el.addEventListener('mouseleave', () => this.onMouseLeave());
    el.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // Touch Events (1 finger scrub & 2 finger range profit)
    el.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    el.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    el.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    el.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
  }

  getIndexFromX(clientX) {
    const rect = this.container.getBoundingClientRect();
    const relX = clientX - rect.left - this.padding.left;
    const pct = Math.max(0, Math.min(1, relX / this.plotWidth));
    const index = Math.round(pct * (this.data.length - 1));
    return Math.max(0, Math.min(this.data.length - 1, index));
  }

  onMouseMove(e) {
    if (!this.data || this.data.length === 0) return;

    const idx = this.getIndexFromX(e.clientX);

    // Desktop range drag (Shift key held or dragging)
    if (this.isMouseDragging && e.shiftKey) {
      this.isRangeScrubbing = true;
      this.rangeEndIndex = idx;
      this.updateRangeScrubber();
      return;
    }

    this.isRangeScrubbing = false;
    this.isScrubbing = true;
    this.scrubIndex = idx;
    this.updateSingleScrubber(idx);
  }

  onMouseDown(e) {
    if (e.shiftKey) {
      this.isMouseDragging = true;
      this.rangeStartIndex = this.getIndexFromX(e.clientX);
      this.rangeEndIndex = this.rangeStartIndex;
    }
  }

  onMouseUp(e) {
    if (this.isMouseDragging) {
      this.isMouseDragging = false;
    }
  }

  onMouseLeave() {
    this.isScrubbing = false;
    this.isRangeScrubbing = false;
    this.scrubberGroup.style.display = 'none';
    this.rangeRect.style.display = 'none';

    if (this.options.onScrubEnd) {
      this.options.onScrubEnd();
    }
  }

  onTouchStart(e) {
    if (!this.data || this.data.length === 0) return;
    e.preventDefault();

    if (e.touches.length === 2) {
      // Wealthsimple Signature: 2-Finger Range Scrub
      this.isRangeScrubbing = true;
      this.isScrubbing = false;
      const idx1 = this.getIndexFromX(e.touches[0].clientX);
      const idx2 = this.getIndexFromX(e.touches[1].clientX);
      this.rangeStartIndex = Math.min(idx1, idx2);
      this.rangeEndIndex = Math.max(idx1, idx2);
      this.updateRangeScrubber();
    } else if (e.touches.length === 1) {
      // 1-Finger Scrub
      this.isRangeScrubbing = false;
      this.isScrubbing = true;
      const idx = this.getIndexFromX(e.touches[0].clientX);
      this.scrubIndex = idx;
      this.updateSingleScrubber(idx);
    }
  }

  onTouchMove(e) {
    if (!this.data || this.data.length === 0) return;
    e.preventDefault();

    if (e.touches.length === 2) {
      this.isRangeScrubbing = true;
      this.isScrubbing = false;
      const idx1 = this.getIndexFromX(e.touches[0].clientX);
      const idx2 = this.getIndexFromX(e.touches[1].clientX);
      this.rangeStartIndex = Math.min(idx1, idx2);
      this.rangeEndIndex = Math.max(idx1, idx2);
      this.updateRangeScrubber();
    } else if (e.touches.length === 1 && !this.isRangeScrubbing) {
      this.isScrubbing = true;
      const idx = this.getIndexFromX(e.touches[0].clientX);
      this.scrubIndex = idx;
      this.updateSingleScrubber(idx);
    }
  }

  onTouchEnd(e) {
    if (e.touches.length === 0) {
      this.onMouseLeave();
    } else if (e.touches.length === 1 && this.isRangeScrubbing) {
      // Transition back from 2-finger to 1-finger
      this.isRangeScrubbing = false;
      this.rangeRect.style.display = 'none';
      this.rangeLineStart.style.display = 'none';
      this.rangeLineEnd.style.display = 'none';

      const idx = this.getIndexFromX(e.touches[0].clientX);
      this.scrubIndex = idx;
      this.updateSingleScrubber(idx);
    }
  }

  updateSingleScrubber(index) {
    const metrics = this.computeMetrics();
    if (!metrics) return;

    this.scrubberGroup.style.display = 'block';
    this.rangeRect.style.display = 'none';
    this.rangeLineStart.style.display = 'none';
    this.rangeLineEnd.style.display = 'none';
    this.scrubLine.style.display = 'block';

    const x = this.getX(index);
    const topY = this.padding.top;
    const bottomY = this.padding.top + this.plotHeight;

    this.scrubLine.setAttribute('x1', x);
    this.scrubLine.setAttribute('y1', topY);
    this.scrubLine.setAttribute('x2', x);
    this.scrubLine.setAttribute('y2', bottomY);

    // Indicator dots for each active user
    let dotsHTML = '';
    const point = this.data[index];
    const activeUsers = this.options.activeUsers;
    const usersConfig = this.options.usersConfig;

    activeUsers.forEach(u => {
      const uConf = usersConfig[u] || { color: '#3b82f6' };
      const rawVal = point[u];
      if (rawVal === undefined || rawVal === null) return;
      const v = metrics.isPercent ? ((rawVal - metrics.baseValues[u]) / metrics.baseValues[u]) * 100 : rawVal;
      const y = this.getY(v, metrics);

      dotsHTML += `
        <!-- Outer Halo -->
        <circle cx="${x}" cy="${y}" r="6.5" fill="${uConf.color}" fill-opacity="0.25" />
        <!-- White Ring -->
        <circle cx="${x}" cy="${y}" r="4" fill="#121215" stroke="${uConf.color}" stroke-width="2.5" />
      `;
    });

    this.scrubDots.innerHTML = dotsHTML;

    // Trigger external callback
    if (this.options.onScrub) {
      this.options.onScrub(point, index, this.data);
    }
  }

  updateRangeScrubber() {
    const metrics = this.computeMetrics();
    if (!metrics) return;

    const startIdx = Math.min(this.rangeStartIndex, this.rangeEndIndex);
    const endIdx = Math.max(this.rangeStartIndex, this.rangeEndIndex);

    const x1 = this.getX(startIdx);
    const x2 = this.getX(endIdx);
    const topY = this.padding.top;
    const bottomY = this.padding.top + this.plotHeight;

    this.scrubberGroup.style.display = 'block';
    this.scrubLine.style.display = 'none';
    this.scrubDots.innerHTML = '';

    // Range Highlight Box
    this.rangeRect.style.display = 'block';
    this.rangeRect.setAttribute('x', x1);
    this.rangeRect.setAttribute('y', topY);
    this.rangeRect.setAttribute('width', Math.max(2, x2 - x1));
    this.rangeRect.setAttribute('height', this.plotHeight);

    // Two boundary lines
    this.rangeLineStart.style.display = 'block';
    this.rangeLineStart.setAttribute('x1', x1);
    this.rangeLineStart.setAttribute('y1', topY);
    this.rangeLineStart.setAttribute('x2', x1);
    this.rangeLineStart.setAttribute('y2', bottomY);

    this.rangeLineEnd.style.display = 'block';
    this.rangeLineEnd.setAttribute('x1', x2);
    this.rangeLineEnd.setAttribute('y1', topY);
    this.rangeLineEnd.setAttribute('x2', x2);
    this.rangeLineEnd.setAttribute('y2', bottomY);

    const pStart = this.data[startIdx];
    const pEnd = this.data[endIdx];

    if (this.options.onRangeScrub) {
      this.options.onRangeScrub(pStart, pEnd, startIdx, endIdx, this.data);
    }
  }
}

window.PortfolioChart = PortfolioChart;
