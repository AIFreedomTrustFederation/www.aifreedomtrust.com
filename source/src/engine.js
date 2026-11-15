/* A small projection engine: glowing lines and points in three dimensions, drawn on a 2D canvas.
   Chosen over a 3D library so the universe runs on ordinary phones and has nothing to fail to load. */
var TAU = Math.PI * 2;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function RNG(seed) {
  var a = seed >>> 0;
  return function () {
    a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rgbOf(c) {
  if (c.charAt(0) === '#') { var n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  var m = c.match(/\d+/g); return [+m[0], +m[1], +m[2]];
}
/* Blends are quantized to eighths so the sprite cache stays small. */
function mix(c1, c2, t) {
  t = Math.round(clamp(t, 0, 1) * 8) / 8;
  var a = rgbOf(c1), b = rgbOf(c2);
  return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')';
}
function dist2(a, b) { var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2]; return x * x + y * y + z * z; }
function circle(cx, cy, cz, r, axis, n, ph) {
  var pts = [], i, a, c, s; ph = ph || 0;
  for (i = 0; i < n; i++) {
    a = i / n * TAU + ph; c = Math.cos(a) * r; s = Math.sin(a) * r;
    pts.push(axis === 'y' ? [cx + c, cy, cz + s] : axis === 'z' ? [cx + c, cy + s, cz] : [cx, cy + c, cz + s]);
  }
  return pts;
}
function polyAt(path, u) {
  var f = clamp(u, 0, 1) * (path.length - 1), i = Math.floor(f), k = f - i;
  if (i >= path.length - 1) return path[path.length - 1];
  var a = path[i], b = path[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

var SPR = {};
function sprite(color) {
  var s = SPR[color]; if (s) return s;
  var c = document.createElement('canvas'); c.width = c.height = 64;
  var g = c.getContext('2d'), k = rgbOf(color), q = k[0] + ',' + k[1] + ',' + k[2];
  var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(.1, 'rgba(' + q + ',.95)');
  gr.addColorStop(.36, 'rgba(' + q + ',.3)');
  gr.addColorStop(1, 'rgba(' + q + ',0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (SPR[color] = c);
}
function haze(color) {
  var key = 'h' + color, s = SPR[key]; if (s) return s;
  var c = document.createElement('canvas'); c.width = c.height = 128;
  var g = c.getContext('2d'), k = rgbOf(color), q = k[0] + ',' + k[1] + ',' + k[2];
  var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(' + q + ',.5)');
  gr.addColorStop(.5, 'rgba(' + q + ',.16)');
  gr.addColorStop(1, 'rgba(' + q + ',0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return (SPR[key] = c);
}

function Scene(o) {
  o = o || {};
  this.lines = []; this.dots = []; this.nodes = [];
  this.bg = o.bg || ['#030409', '#090a1c'];
  this.neb = o.neb || ['#3b2f86', '#17485c', '#5a2452'];
  this.sky = o.sky == null ? 1 : o.sky;
  this.fit = o.fit || { w: 3.6, h: 4.6 };
  this.center = o.center || [0, .25, 0];
  this.home = { yaw: o.yaw || 0, pitch: o.pitch == null ? .08 : o.pitch, zoom: 1, tx: this.center[0], ty: this.center[1], tz: this.center[2] };
  this.cam = { yaw: this.home.yaw, pitch: this.home.pitch, zoom: 1, tx: this.center[0], ty: this.center[1], tz: this.center[2] };
  this.pitchLim = o.pitchLim || [-.4, .75];
  this.zoomLim = o.zoomLim || [.55, 3.6];
  this.yawLim = o.yawLim || null;
  this.spin = o.spin || 0;
  this.grow = 1; this.lit = 1; this.hi = null; this.found = {}; this.overlay = null;
}
Scene.prototype.line = function (pts, color, w, o) {
  o = o || {};
  var n = pts.length, p = new Float32Array(n * 3), i;
  for (i = 0; i < n; i++) { p[i * 3] = pts[i][0]; p[i * 3 + 1] = pts[i][1]; p[i * 3 + 2] = pts[i][2]; }
  var L = { p: p, n: n, color: color, w: w, a: o.a == null ? 1 : o.a, t0: o.t0 || 0, t1: o.t1 == null ? 1 : Math.min(1, o.t1),
    dyn: o.dyn || null, env: !!o.env, sway: !!o.sway, tag: o.tag || null, star: o.star || null,
    halo: o.halo !== false, closed: !!o.closed };
  if (L.t1 <= L.t0) L.t1 = L.t0 + .01;
  this.lines.push(L); return L;
};
Scene.prototype.dot = function (x, y, z, s, color, o) {
  o = o || {};
  var d = { x: x, y: y, z: z, ox: x, oy: y, oz: z, s: s, color: color, a: o.a == null ? 1 : o.a,
    tw: o.tw == null ? (x * 12.9898 + y * 78.233 + z * 37.719) % TAU + 7 : o.tw,
    t0: o.t0 || 0, dyn: o.dyn || null, env: !!o.env, tag: o.tag || null, sway: !!o.sway };
  this.dots.push(d); return d;
};
Scene.prototype.node = function (n) {
  n.ph = this.nodes.length * 1.7; n.pri = n.pri || 1;
  this.nodes.push(n); return n;
};

var V = { W: 0, H: 0, dpr: 1, F: 1, cx: 0, cy: 0, ox: 0, oy: 0, q: 1, ctx: null, cv: null,
  cyw: 1, syw: 0, cp: 1, sp: 0, dist: 10, tx: 0, ty: 0, tz: 0 };
var px = 0, py = 0, ps = 0, pz = 0;
function proj(x, y, z) {
  var dx = x - V.tx, dy = y - V.ty, dz = z - V.tz;
  /* z points toward the viewer; a positive pitch looks down from above. */
  var x1 = dx * V.cyw + dz * V.syw, z1 = dz * V.cyw - dx * V.syw;
  var y2 = dy * V.cp - z1 * V.sp, z2 = dy * V.sp + z1 * V.cp;
  var zc = V.dist - z2;
  if (zc < .2) return false;
  ps = V.F / zc; px = V.cx + x1 * ps; py = V.cy - y2 * ps; pz = zc;
  return true;
}
function setView(scene) {
  var c = scene.cam;
  V.cyw = Math.cos(c.yaw); V.syw = Math.sin(c.yaw); V.cp = Math.cos(c.pitch); V.sp = Math.sin(c.pitch);
  V.tx = c.tx; V.ty = c.ty; V.tz = c.tz;
  V.dist = V.F * Math.max(scene.fit.w / (V.W * .92), scene.fit.h / (V.H * .78)) / c.zoom;
  V.cx = V.W / 2 + V.ox; V.cy = V.H / 2 + V.oy;
}
function sizeCanvas(cv, cap) {
  var r = cv.getBoundingClientRect();
  V.cv = cv; V.W = Math.max(1, r.width); V.H = Math.max(1, r.height);
  V.dpr = Math.min(window.devicePixelRatio || 1, cap);
  cv.width = Math.round(V.W * V.dpr); cv.height = Math.round(V.H * V.dpr);
  V.ctx = cv.getContext('2d');
  V.F = 2.2 * Math.min(V.W, V.H);
}

var STARS = null, NEBS = null;
function initSky() {
  var r = RNG(99), i, u, th, s, x, y, z, ct = Math.cos(1.05), st = Math.sin(1.05), y2;
  STARS = [];
  for (i = 0; i < 2600; i++) {
    u = (i % 5 < 2) ? (r() + r() + r() - 1.5) * .28 : r() * 2 - 1;
    th = r() * TAU; s = Math.sqrt(Math.max(0, 1 - u * u));
    x = s * Math.cos(th); y = u; z = s * Math.sin(th);
    y2 = y * ct - z * st; z = y * st + z * ct; y = y2;
    STARS.push({ x: x, y: y, z: z, m: Math.pow(r(), 3.2) * 1.7 + .32, c: r() < .1 ? '#ffe2a8' : (r() < .22 ? '#bcd6ff' : '#ffffff'), tw: r() * TAU });
  }
  NEBS = [];
  for (i = 0; i < 8; i++) {
    th = i / 8 * TAU + r(); u = (r() - .5) * .5; s = Math.sqrt(1 - u * u);
    x = s * Math.cos(th); y = u; z = s * Math.sin(th);
    y2 = y * ct - z * st; z = y * st + z * ct; y = y2;
    NEBS.push({ x: x, y: y, z: z, size: .55 + r() * .6, k: i % 3 });
  }
}
function drawSky(scene, t, alpha) {
  var ctx = V.ctx, Fs = .58 * Math.max(V.W, V.H), i, s, x1, z1, y2, z2, sx, sy, a, sz;
  var a0 = alpha * scene.sky; if (a0 <= .01) return;
  var n = V.q > .8 ? STARS.length : V.q > .5 ? 1500 : 800;
  if (V.q > .5) {
    for (i = 0; i < NEBS.length; i++) {
      s = NEBS[i];
      x1 = s.x * V.cyw + s.z * V.syw; z1 = s.z * V.cyw - s.x * V.syw;
      y2 = s.y * V.cp - z1 * V.sp; z2 = -(s.y * V.sp + z1 * V.cp);
      if (z2 < .15) continue;
      sx = V.W / 2 + x1 / z2 * Fs; sy = V.H / 2 - y2 / z2 * Fs; sz = s.size * Fs;
      if (sx < -sz || sx > V.W + sz || sy < -sz || sy > V.H + sz) continue;
      ctx.globalAlpha = Math.min(1, .5 * a0);
      ctx.drawImage(haze(scene.neb[s.k]), sx - sz, sy - sz, sz * 2, sz * 2);
    }
  }
  for (i = 0; i < n; i++) {
    s = STARS[i];
    x1 = s.x * V.cyw + s.z * V.syw; z1 = s.z * V.cyw - s.x * V.syw;
    y2 = s.y * V.cp - z1 * V.sp; z2 = -(s.y * V.sp + z1 * V.cp);
    if (z2 < .1) continue;
    sx = V.W / 2 + x1 / z2 * Fs; sy = V.H / 2 - y2 / z2 * Fs;
    if (sx < 0 || sx > V.W || sy < 0 || sy > V.H) continue;
    a = Math.min(1, (.3 + s.m * .42) * a0 * (.8 + .2 * Math.sin(t * .9 + s.tw)));
    ctx.globalAlpha = a;
    if (s.m > 1.45 && V.q > .5) { sz = s.m * 3.4; ctx.drawImage(sprite(s.c), sx - sz, sy - sz, sz * 2, sz * 2); }
    else { ctx.fillStyle = s.c; ctx.fillRect(sx, sy, s.m, s.m); }
  }
}

function render(scene, t, skyAlpha) {
  var ctx = V.ctx, W = V.W, H = V.H;
  setView(scene);
  ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, scene.bg[0]); g.addColorStop(1, scene.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  drawSky(scene, t, skyAlpha == null ? 1 : skyAlpha);

  var lit = scene.lit, hi = scene.hi, grow = scene.grow, halo = V.q > .5;
  var i, j, L, p, n, gf, a, w, fm, mf, fr, first, sw, sc, x, y, z;
  for (i = 0; i < scene.lines.length; i++) {
    L = scene.lines[i];
    gf = grow >= 1 ? 1 : clamp((grow - L.t0) / (L.t1 - L.t0), 0, 1);
    if (gf <= 0) continue;
    if (L.dyn) L.dyn(t, L.p, L);
    a = L.a * (L.env ? lit : 1);
    if (hi) a *= (L.tag === hi) ? 1.25 : (L.tag === 'core' ? .8 : .28);
    if (L.star) a *= scene.found[L.star] ? 1.15 : .32;
    if (a <= .004) continue;
    p = L.p; n = L.n; fm = (n - 1) * gf; mf = Math.floor(fm); fr = fm - mf;
    ctx.beginPath(); first = true; sw = 0; sc = 0;
    for (j = 0; j <= mf; j++) {
      x = p[j * 3]; y = p[j * 3 + 1]; z = p[j * 3 + 2];
      if (L.sway) x += Math.sin(t * .5 + y * 1.1) * .012 * y;
      if (!proj(x, y, z)) { first = true; continue; }
      if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      sw += ps; sc++;
    }
    if (fr > .001 && mf < n - 1 && !first) {
      x = lerp(p[mf * 3], p[mf * 3 + 3], fr); y = lerp(p[mf * 3 + 1], p[mf * 3 + 4], fr); z = lerp(p[mf * 3 + 2], p[mf * 3 + 5], fr);
      if (L.sway) x += Math.sin(t * .5 + y * 1.1) * .012 * y;
      if (proj(x, y, z)) ctx.lineTo(px, py);
    }
    if (!sc) continue;
    if (L.closed && gf >= 1 && sc === n) ctx.closePath();
    w = Math.max(.6, L.w * (sw / sc));
    ctx.strokeStyle = L.color;
    if (halo && L.halo) { ctx.globalAlpha = Math.min(1, a * .15); ctx.lineWidth = w * 4.2; ctx.stroke(); }
    ctx.globalAlpha = Math.min(1, a); ctx.lineWidth = w; ctx.stroke();
  }

  var d, r, thin = V.q <= .5, dl = scene.dots;
  for (i = 0; i < dl.length; i++) {
    d = dl[i];
    if (thin && d.env && (i & 1)) continue;
    if (grow < 1 && grow < d.t0) continue;
    if (d.dyn) d.dyn(d, t);
    a = d.a * (d.env ? lit : 1);
    if (hi && d.tag) a *= d.tag === hi ? 1.2 : .28;
    if (d.tw) a *= .74 + .26 * Math.sin(t * 1.3 + d.tw);
    if (a <= .01) continue;
    x = d.x; if (d.sway) x += Math.sin(t * .5 + d.y * 1.1) * .012 * d.y;
    if (!proj(x, d.y, d.z)) continue;
    r = d.s * ps; if (grow < 1) r *= smooth(d.t0, d.t0 + .06, grow);
    if (px < -r || px > W + r || py < -r || py > H + r) continue;
    ctx.globalAlpha = Math.min(1, a);
    if (r < 1.2) { ctx.fillStyle = d.color; ctx.fillRect(px - .65, py - .65, 1.3, 1.3); }
    else ctx.drawImage(sprite(d.color), px - r, py - r, r * 2, r * 2);
  }

  if (scene.overlay) scene.overlay(ctx, t);

  var nd, R, ap, pu;
  for (i = 0; i < scene.nodes.length; i++) {
    nd = scene.nodes[i];
    if (nd.hidden) { nd._on = false; continue; }
    ap = grow >= 1 ? 1 : smooth(nd.t0 || .9, (nd.t0 || .9) + .06, grow);
    x = nd.x; if (nd.sway) x += Math.sin(t * .5 + nd.y * 1.1) * .012 * nd.y;
    if (ap <= 0 || !proj(x, nd.y, nd.z)) { nd._on = false; continue; }
    nd._x = px; nd._y = py; nd._z = pz;
    nd._on = px > -20 && px < W + 20 && py > -20 && py < H + 20;
    if (!nd._on) continue;
    R = Math.max(5.5, nd.r * ps) * ap; pu = 1 + .07 * Math.sin(t * 1.5 + nd.ph);
    a = (hi && nd.kind !== 'leaf' && nd.id !== hi) ? .3 : 1;
    ctx.globalAlpha = a * ap;
    ctx.drawImage(sprite(nd.color), px - R * 3.3 * pu, py - R * 3.3 * pu, R * 6.6 * pu, R * 6.6 * pu);
    ctx.strokeStyle = nd.color; ctx.lineWidth = 1.2;
    ctx.globalAlpha = .9 * a * ap; ctx.beginPath(); ctx.arc(px, py, R * 1.25, 0, TAU); ctx.stroke();
    if (nd.seen) { ctx.globalAlpha = (nd.done ? .95 : .45) * a; ctx.lineWidth = nd.done ? 2.4 : 1.2; ctx.beginPath(); ctx.arc(px, py, R * 1.75, 0, TAU); ctx.stroke(); ctx.lineWidth = 1.2; }
    if (nd.sel) { ctx.globalAlpha = .55 + .35 * Math.sin(t * 2.2); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(px, py, R * 2.2 + 2, 0, TAU); ctx.stroke(); }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
