/* 心境实验室 · 互动星空（纯装饰，不收集任何数据）
   - 星星分三层景深，缓慢漂浮
   - 手指/鼠标移动：星空视差 + 附近星星轻轻让开、连成星座线
   - 点一下：散开一小簇会上浮的星光
   - 偶尔有流星划过，星云缓慢流动 */
(function () {
  var c = document.getElementById('stars');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, stars = [], sparks = [], meteors = [];
  var ptr = { x: -9999, y: -9999, tx: 0.5, ty: 0.5, sx: 0.5, sy: 0.5, active: false, last: 0 };
  // 流动的极光配色：每团光会在几种颜色之间缓慢渐变
  var PALETTES = {
    aurora: { base: [10, 14, 30], cols: [[70, 90, 200], [30, 150, 150], [175, 85, 150], [215, 170, 110], [100, 70, 190]] },
    dawn:   { base: [20, 12, 26], cols: [[200, 100, 140], [230, 150, 120], [140, 100, 200], [240, 190, 150], [170, 80, 130]] },
    deep:   { base: [5, 16, 26], cols: [[30, 110, 170], [20, 160, 160], [60, 80, 180], [120, 190, 200], [40, 130, 120]] }
  };
  var PAL = PALETTES.aurora;
  function applyPalette() { PAL = PALETTES[document.documentElement.getAttribute('data-theme')] || PALETTES.aurora; if (typeof buildCity === 'function' && W) buildCity(); }
  applyPalette();
  if (window.MutationObserver) new MutationObserver(applyPalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var BLOBS = [
    { x: 0.2, y: 0.15, ax: 0.22, ay: 0.12, fx: 0.000050, fy: 0.000070, r: 0.62, ci: 0 },
    { x: 0.8, y: 0.3, ax: 0.18, ay: 0.16, fx: 0.000040, fy: 0.000060, r: 0.55, ci: 1 },
    { x: 0.5, y: 0.85, ax: 0.25, ay: 0.10, fx: 0.000035, fy: 0.000055, r: 0.70, ci: 2 },
    { x: 0.15, y: 0.65, ax: 0.15, ay: 0.15, fx: 0.000060, fy: 0.000045, r: 0.45, ci: 3 },
    { x: 0.75, y: 0.75, ax: 0.15, ay: 0.12, fx: 0.000055, fy: 0.000040, r: 0.45, ci: 4 }
  ];
  var off = document.createElement('canvas'), octx = off.getContext('2d'), OS = 6; // 低分辨率绘制 = 天然柔焦
  var glowX = 0.5, glowY = 0.4;
  function mix(c1, c2, k) { return [c1[0] + (c2[0] - c1[0]) * k, c1[1] + (c2[1] - c1[1]) * k, c1[2] + (c2[2] - c1[2]) * k]; }
  function colAt(i, t) {
    var n = PAL.cols.length, ph = t * 0.000045 + i * 1.3, k = ph - Math.floor(ph), base = Math.floor(ph);
    k = k * k * (3 - 2 * k);
    return mix(PAL.cols[(i + base) % n], PAL.cols[(i + base + 1) % n], k);
  }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }
  function drawAurora(t, px, py) {
    var w = off.width, h = off.height, m = Math.max(w, h);
    octx.globalCompositeOperation = 'source-over';
    octx.fillStyle = rgba(PAL.base, 1); octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < BLOBS.length; i++) {
      var bl = BLOBS[i];
      var x = (bl.x + bl.ax * Math.sin(t * bl.fx + i * 2.1) - px * 0.05) * w;
      var y = (bl.y + bl.ay * Math.cos(t * bl.fy + i * 1.7) - py * 0.05) * h;
      var c = colAt(bl.ci, t), a = 0.25 + 0.07 * Math.sin(t * 0.0003 + i);
      var g = octx.createRadialGradient(x, y, 0, x, y, bl.r * m);
      g.addColorStop(0, rgba(c, a)); g.addColorStop(0.55, rgba(c, a * 0.35)); g.addColorStop(1, rgba(c, 0));
      octx.fillStyle = g; octx.fillRect(0, 0, w, h);
    }
    // 极光丝带
    for (var r = 0; r < 2; r++) {
      var yb = h * (0.28 + r * 0.34), amp = h * 0.07, c1 = colAt(r + 1, t + 9000), c2 = colAt(r + 3, t + 4000);
      var lg = octx.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, rgba(c1, 0)); lg.addColorStop(0.35, rgba(c1, 0.13)); lg.addColorStop(0.7, rgba(c2, 0.12)); lg.addColorStop(1, rgba(c2, 0));
      octx.strokeStyle = lg; octx.lineWidth = h * 0.10; octx.lineCap = 'round';
      octx.beginPath();
      for (var xs = -10; xs <= w + 10; xs += 4) {
        var yy = yb + amp * Math.sin(xs / w * 5.5 + t * 0.00022 * (r ? -1 : 1) + r * 2) + amp * 0.5 * Math.sin(xs / w * 11 + t * 0.0004);
        if (xs === -10) octx.moveTo(xs, yy); else octx.lineTo(xs, yy);
      }
      octx.stroke();
    }
    // 跟随手指的一团暖光
    glowX += ((ptr.active ? ptr.x / W : 0.5 + 0.3 * Math.sin(t * 0.00009)) - glowX) * 0.035;
    glowY += ((ptr.active ? ptr.y / H : 0.35 + 0.2 * Math.cos(t * 0.00007)) - glowY) * 0.035;
    var gc = colAt(3, t + 2000), gg = octx.createRadialGradient(glowX * w, glowY * h, 0, glowX * w, glowY * h, m * 0.35);
    gg.addColorStop(0, rgba(gc, ptr.active ? 0.32 : 0.16)); gg.addColorStop(1, rgba(gc, 0));
    octx.fillStyle = gg; octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, H);
  }
  var COLORS = ['#ffffff', '#f6e7c8', '#e6ebf2', '#dfe8f5'];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ---------- 🌃 城市夜空 ----------
  PALETTES.night = { base: [8, 12, 32], cols: [[60, 80, 170], [90, 70, 160], [40, 90, 150], [70, 60, 140], [50, 70, 160]] };
  applyPalette();
  PALETTES.rose = { base: [90, 70, 120], cols: [[235, 170, 200], [200, 160, 230], [250, 200, 190], [180, 170, 235], [245, 185, 210]] };
  var SKIES = {
    night: { stops: ['#060a1c', '#0d1433', '#1b1a45', '#3a2848', '#5a3a3e'], glows: [[0.25, [230, 140, 70], 0.30], [0.65, [210, 110, 120], 0.22], [0.9, [240, 170, 90], 0.20]], cloud: 0.14,
             far: 'rgba(22,22,52,0.85)', b1: '#0b0e22', b2: '#05060f', win: ['#f3c27a', '#cfe0ff'], fog: '240,160,90' },
    // 粉色星辰：更亮、低饱和的暮光粉紫，减轻压抑感
    rose:  { stops: ['#45436a', '#6e6688', '#9a849f', '#bf9dab', '#d9b3ae'], glows: [[0.25, [255, 205, 190], 0.20], [0.65, [250, 190, 205], 0.18], [0.9, [255, 215, 195], 0.16]], cloud: 0.15,
             far: 'rgba(95,80,120,0.5)', b1: '#57496f', b2: '#3d3452', win: ['#ffe2b8', '#ffd3e0'], fog: '255,200,190' }
  };
  // 浅粉色：更亮、更轻的粉紫黄昏
  // 浅粉色：更亮、更轻的粉色黄昏
  PALETTES.blush = { base: [150, 100, 140], cols: [[255, 195, 215], [240, 190, 230], [255, 215, 205], [230, 190, 225], [255, 200, 220]] };
  SKIES.blush = { stops: ['#a983ad', '#c495b7', '#dcaabf', '#ebbcc6', '#f3cfcc'], glows: [[0.25, [255, 225, 215], 0.12], [0.65, [255, 205, 220], 0.11], [0.9, [255, 230, 215], 0.1]], cloud: 0.12,
                  far: 'rgba(170,120,160,0.45)', b1: '#a7809f', b2: '#8a6688', win: ['#fff0d6', '#ffe6ef'], fog: '255,215,220' };
  // 晴空：开阔、明亮、低饱和的蓝绿晨空，不放城市
  PALETTES.serene = { base: [90, 130, 175], cols: [[200, 225, 255], [185, 235, 225], [255, 230, 210], [210, 220, 255], [190, 230, 240]] };
  SKIES.serene = { stops: ['#5a82b5', '#759fc6', '#8db6cb', '#a7c6cb', '#c8cfc6'], glows: [[0.3, [255, 225, 200], 0.12], [0.7, [210, 240, 235], 0.1], [0.5, [255, 235, 215], 0.09]], cloud: 0.16, city: false,
                   far: 'rgba(0,0,0,0)', b1: '#000', b2: '#000', win: ['#fff', '#fff'], fog: '255,235,215' };
  function skyCfg() { return SKIES[document.documentElement.getAttribute('data-theme')] || null; }
  function isNight() { return !!skyCfg(); }
  var city = [];
  function buildCity() {
    city = [];
    var x = -10, maxH = Math.min(H * (document.documentElement.getAttribute('data-theme') === 'rose' || document.documentElement.getAttribute('data-theme') === 'blush' ? 0.11 : 0.16), 140);
    while (x < W + 10) {
      var w = rnd(22, 58), h = rnd(maxH * 0.3, maxH) * (Math.random() < 0.15 ? 1.25 : 1);
      var b = { x: x, w: w, h: h, ant: Math.random() < 0.18, win: [] };
      for (var wy = 10; wy < h - 6; wy += 9) for (var wx = 5; wx < w - 5; wx += 8) {
        if (Math.random() < 0.28) b.win.push([wx, wy, Math.random() < 0.85 ? 0 : 1, rnd(0, 6.28), rnd(0.2, 1.2)]);
      }
      city.push(b); x += w + rnd(0, 6);
    }
  }
  function drawNightSky(t, px, py) {
    var w = off.width, h = off.height, m = Math.max(w, h);
    var g = octx.createLinearGradient(0, 0, 0, h);
    var SK = skyCfg(); g.addColorStop(0, SK.stops[0]); g.addColorStop(0.45, SK.stops[1]); g.addColorStop(0.75, SK.stops[2]); g.addColorStop(0.92, SK.stops[3]); g.addColorStop(1, SK.stops[4]);
    octx.globalCompositeOperation = 'source-over'; octx.fillStyle = g; octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'lighter';
    // 地平线上城市的暖光，缓慢呼吸
    var br = 0.85 + 0.15 * Math.sin(t * 0.0004);
    var glows = SK.glows;
    for (var i = 0; i < glows.length; i++) {
      var gx = (glows[i][0] + 0.05 * Math.sin(t * 0.00005 + i * 2) - px * 0.03) * w, gy = h * 1.02;
      var rg = octx.createRadialGradient(gx, gy, 0, gx, gy, m * 0.55);
      rg.addColorStop(0, rgba(glows[i][1], glows[i][2] * br)); rg.addColorStop(1, rgba(glows[i][1], 0));
      octx.fillStyle = rg; octx.fillRect(0, 0, w, h);
    }
    // 高空淡淡的蓝紫云气
    for (var k = 0; k < 3; k++) {
      var bl = BLOBS[k], x = (bl.x + bl.ax * Math.sin(t * bl.fx + k * 2.1) - px * 0.05) * w, y = (0.15 + 0.1 * Math.cos(t * bl.fy + k)) * h - py * 0.05 * h;
      var c = colAt(k, t), cg = octx.createRadialGradient(x, y, 0, x, y, m * 0.5);
      cg.addColorStop(0, rgba(c, SK.cloud)); cg.addColorStop(1, rgba(c, 0));
      octx.fillStyle = cg; octx.fillRect(0, 0, w, h);
    }
    // 跟随手指的光
    glowX += ((ptr.active ? ptr.x / W : 0.5 + 0.3 * Math.sin(t * 0.00009)) - glowX) * 0.035;
    glowY += ((ptr.active ? ptr.y / H : 0.35 + 0.2 * Math.cos(t * 0.00007)) - glowY) * 0.035;
    var fg = octx.createRadialGradient(glowX * w, glowY * h, 0, glowX * w, glowY * h, m * 0.3);
    fg.addColorStop(0, rgba([120, 140, 230], ptr.active ? 0.22 : 0.08)); fg.addColorStop(1, 'rgba(0,0,0,0)');
    octx.fillStyle = fg; octx.fillRect(0, 0, w, h);
    octx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, H);
  }
  function drawCity(t, px) {
    var shift = -px * 14;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // 远景一层更淡的楼
    var SK = skyCfg(); ctx.fillStyle = SK.far;
    for (var i = 0; i < city.length; i += 2) {
      var b = city[i]; ctx.fillRect(b.x + shift * 0.5 + 14, H - b.h * 1.15, b.w * 1.1, b.h * 1.15);
    }
    for (var j = 0; j < city.length; j++) {
      var c = city[j], x0 = c.x + shift, y0 = H - c.h;
      var g = ctx.createLinearGradient(0, y0, 0, H);
      g.addColorStop(0, SK.b1); g.addColorStop(1, SK.b2);
      ctx.fillStyle = g; ctx.fillRect(x0, y0, c.w, c.h);
      if (c.ant) {
        ctx.fillRect(x0 + c.w / 2 - 0.75, y0 - 16, 1.5, 16);
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 600 + j);
        ctx.fillStyle = '#ff6b5e'; ctx.beginPath(); ctx.arc(x0 + c.w / 2, y0 - 17, 1.6, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (var k = 0; k < c.win.length; k++) {
        var wd = c.win[k], a = still ? 0.8 : 0.55 + 0.35 * Math.sin(t / 1000 * wd[4] + wd[3]);
        ctx.globalAlpha = a;
        ctx.fillStyle = wd[2] ? SK.win[1] : SK.win[0];
        ctx.fillRect(x0 + wd[0], y0 + wd[1], 3, 4);
      }
      ctx.globalAlpha = 1;
    }
    // 楼底的暖色雾
    var fog = ctx.createLinearGradient(0, H - 60, 0, H);
    fog.addColorStop(0, 'rgba(' + SK.fog + ',0)'); fog.addColorStop(1, 'rgba(' + SK.fog + ',0.14)');
    ctx.fillStyle = fog; ctx.fillRect(0, H - 60, W, 60);
  }

  // ---------- 画廊风：米白底 + 柔和灰绿/淡黄/杏色渐变，不闪烁 ----------
  function isGallery() { return document.documentElement.getAttribute('data-theme') === 'gallery'; }
  var GAL = [[0.15, 0.2, [196, 208, 186], 0.55], [0.55, 0.35, [228, 228, 178], 0.45], [0.9, 0.6, [240, 210, 190], 0.45], [0.3, 0.9, [210, 218, 200], 0.4]];
  function drawGallery(t, px, py) {
    var w = off.width, h = off.height, m = Math.max(w, h);
    octx.globalCompositeOperation = 'source-over';
    octx.fillStyle = '#f4f4ef'; octx.fillRect(0, 0, w, h);
    for (var i = 0; i < GAL.length; i++) {
      var g0 = GAL[i];
      var x = (g0[0] + 0.05 * Math.sin(t * 0.00003 + i * 2) - px * 0.02) * w;
      var y = (g0[1] + 0.04 * Math.cos(t * 0.000025 + i * 1.5) - py * 0.02) * h;
      var g = octx.createRadialGradient(x, y, 0, x, y, m * 0.6);
      g.addColorStop(0, rgba(g0[2], g0[3])); g.addColorStop(1, rgba(g0[2], 0));
      octx.fillStyle = g; octx.fillRect(0, 0, w, h);
    }
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, H);
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    off.width = Math.max(40, Math.round(W / OS)); off.height = Math.max(40, Math.round(H / OS));
    var n = Math.min(420, Math.round(W * H / 2400));
    buildCity();
    stars = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random(); // 0 远 → 1 近
      stars.push({
        x: Math.random() * W, y: Math.random() * H, z: z,
        r: 0.3 + z * z * 1.3, a: 0.25 + z * 0.65,
        vx: rnd(-1, 1) * (2 + z * 6), vy: rnd(-1, 1) * (2 + z * 6) - (1 + z * 3),
        tw: rnd(0.5, 2), ph: rnd(0, 6.28), col: COLORS[(Math.random() * COLORS.length) | 0],
        ox: 0, oy: 0
      });
    }
  }

  var ripples = [];
  function burst(x, y) {
    if (isGallery()) { ripples.push({ x: x, y: y, life: 0 }); if (ripples.length > 6) ripples.shift(); return; }
    for (var i = 0; i < 18; i++) {
      var ang = rnd(0, 6.28), sp = rnd(20, 90);
      sparks.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 20,
        life: 0, max: rnd(1.4, 2.6), r: rnd(0.8, 2.2), col: COLORS[(Math.random() * COLORS.length) | 0] });
    }
    if (sparks.length > 240) sparks.splice(0, sparks.length - 240);
  }

  function meteor() {
    var fromLeft = Math.random() < 0.5;
    meteors.push({ x: fromLeft ? rnd(-50, W * 0.4) : rnd(W * 0.6, W + 50), y: rnd(-40, H * 0.3),
      vx: (fromLeft ? 1 : -1) * rnd(380, 560), vy: rnd(160, 260), life: 0, max: rnd(0.9, 1.4) });
  }

  function onMove(e) {
    var p = e.touches ? e.touches[0] : e;
    if (!p) return;
    ptr.x = p.clientX; ptr.y = p.clientY; ptr.tx = ptr.x / W; ptr.ty = ptr.y / H;
    ptr.active = true; ptr.last = performance.now();
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('pointerdown', function (e) { onMove(e); if (!still) burst(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('resize', resize);

  var prev = 0, nextMeteor = 3000;
  function frame(t) {
    var dt = Math.min(0.05, (t - prev) / 1000 || 0.016); prev = t;
    if (ptr.active && t - ptr.last > 2500) ptr.active = false;
    // 视差跟随（缓动）
    var tx = ptr.active ? ptr.tx : 0.5 + 0.08 * Math.sin(t / 7000);
    var ty = ptr.active ? ptr.ty : 0.5 + 0.06 * Math.cos(t / 9000);
    ptr.sx += (tx - ptr.sx) * 0.04; ptr.sy += (ty - ptr.sy) * 0.04;
    var px = (ptr.sx - 0.5), py = (ptr.sy - 0.5);


    // 极光底色
    var GM = isGallery();
    if (GM) drawGallery(still ? 0 : t, px, py); else if (isNight()) drawNightSky(still ? 0 : t, px, py); else drawAurora(still ? 0 : t, px, py);
    ctx.globalCompositeOperation = GM ? 'source-over' : 'lighter';

    // 星星
    var near = [];
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!still) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < -10) s.x += W + 20; else if (s.x > W + 10) s.x -= W + 20;
        if (s.y < -10) s.y += H + 20; else if (s.y > H + 10) s.y -= H + 20;
      }
      var dx = s.x - px * 60 * s.z, dy = s.y - py * 60 * s.z;
      // 靠近手指时轻轻让开
      var fx = 0, fy = 0, glow = 0;
      if (ptr.active) {
        var ex = dx - ptr.x, ey = dy - ptr.y, d2 = ex * ex + ey * ey, R = 130;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 1, f = (1 - d / R);
          fx = ex / d * f * 26 * (0.4 + s.z); fy = ey / d * f * 26 * (0.4 + s.z); glow = f;
          if (s.z > 0.35 && near.length < 7) near.push([dx + s.ox, dy + s.oy, f]);
        }
      }
      s.ox += (fx - s.ox) * 0.08; s.oy += (fy - s.oy) * 0.08;
      var X = dx + s.ox, Y = dy + s.oy;
      var tw = (still || GM) ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.tw + s.ph);
      var A = Math.min(1, s.a * tw + glow * 0.5);
      if (GM) { A = (0.08 + s.z * 0.12) + glow * 0.18; }
      ctx.globalAlpha = A; ctx.fillStyle = GM ? '#9aa88c' : s.col;
      ctx.beginPath(); ctx.arc(X, Y, s.r * (1 + glow * 0.6), 0, 6.283); ctx.fill();
      if (!GM && (s.r > 1.1 || glow > 0.3)) {
        ctx.globalAlpha = A * 0.18; ctx.beginPath(); ctx.arc(X, Y, s.r * 4.5, 0, 6.283); ctx.fill();
      }
    }

    // 星座线：手指附近的星星互相连起来
    if (near.length > 1) {
      ctx.lineWidth = 0.7;
      for (var a1 = 0; a1 < near.length; a1++) {
        for (var b1 = a1 + 1; b1 < near.length; b1++) {
          var p1 = near[a1], p2 = near[b1], ddx = p1[0] - p2[0], ddy = p1[1] - p2[1];
          if (ddx * ddx + ddy * ddy > 140 * 140) continue;
          ctx.globalAlpha = Math.min(p1[2], p2[2]) * (GM ? 0.35 : 0.7);
          ctx.strokeStyle = GM ? '#a9b59c' : '#efe0c0';
          ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
      }
    }

    // 点击散开的星光（向上飘）
    for (var j = sparks.length - 1; j >= 0; j--) {
      var sp = sparks[j];
      sp.life += dt; if (sp.life > sp.max) { sparks.splice(j, 1); continue; }
      sp.vx *= 0.96; sp.vy = sp.vy * 0.96 - 14 * dt;
      sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      var k2 = 1 - sp.life / sp.max;
      ctx.globalAlpha = GM ? k2 * 0.35 : k2; ctx.fillStyle = GM ? '#7d8873' : sp.col;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, 6.283); ctx.fill();
      if (!GM) ctx.globalAlpha = k2 * 0.2; else ctx.globalAlpha = 0; ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * 4, 0, 6.283); ctx.fill();
    }

    // 画廊风：点击泛起水波纹 + 一点柔光
    for (var r0 = ripples.length - 1; r0 >= 0; r0--) {
      var rp = ripples[r0];
      rp.life += dt; if (rp.life > 1.6) { ripples.splice(r0, 1); continue; }
      var e0 = rp.life / 1.6, ease = 1 - Math.pow(1 - e0, 3);
      var bloom = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, 70);
      bloom.addColorStop(0, 'rgba(255,255,250,' + (0.55 * (1 - e0)) + ')'); bloom.addColorStop(1, 'rgba(255,255,250,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(rp.x, rp.y, 70, 0, 6.283); ctx.fill();
      for (var rr = 0; rr < 2; rr++) {
        var e1 = Math.max(0, (rp.life - rr * 0.22) / 1.4); if (e1 <= 0 || e1 >= 1) continue;
        var es = 1 - Math.pow(1 - e1, 3);
        ctx.globalAlpha = (1 - e1) * (rr ? 0.3 : 0.45);
        ctx.strokeStyle = '#8f9d82'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, 8 + es * (rr ? 60 : 85), 0, 6.283); ctx.stroke();
      }
    }

    // 流星
    if (!still && !GM && t > nextMeteor) { meteor(); nextMeteor = t + rnd(5000, 11000); }
    for (var q = meteors.length - 1; q >= 0; q--) {
      var mt = meteors[q];
      mt.life += dt; if (mt.life > mt.max) { meteors.splice(q, 1); continue; }
      mt.x += mt.vx * dt; mt.y += mt.vy * dt;
      var fade = Math.sin(Math.PI * mt.life / mt.max);
      var len = 0.22, gx = mt.x - mt.vx * len, gy = mt.y - mt.vy * len;
      var lg = ctx.createLinearGradient(mt.x, mt.y, gx, gy);
      lg.addColorStop(0, 'rgba(255,248,230,' + 0.9 * fade + ')');
      lg.addColorStop(1, 'rgba(255,248,230,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = lg; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(gx, gy); ctx.stroke();
    }

    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (isNight() && skyCfg().city !== false) drawCity(still ? 0 : t, px);
    if (!still) requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();

/* 每次换页：内容从下方带模糊浮起 */
(function () {
  var m = document.getElementById('main');
  if (!m || !window.MutationObserver) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function rise() { m.classList.remove('rise'); void m.offsetWidth; m.classList.add('rise'); }
  new MutationObserver(rise).observe(m, { childList: true });
  rise();
})();
