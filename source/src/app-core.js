/* State, camera, input, travel between worlds, and the discovery panel. */
var $ = function (s, el) { return (el || document).querySelector(s); };
var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

var app, stage, cv, nodesEl, panel, panelBody, bloomEl, liveEl, hintEl;
var state = { mode: 'explore', loc: 'tree', star: null, focus: null, paused: false, arriving: true, panel: false,
  visited: {}, found: {}, seenArrival: false,
  set: { motion: 'full', intensity: 'balanced', sound: false, vol: .6, remember: false } };
var scenes = {}, cur = null, T = 0, lastT = 0, dirty = true, tween = null, idleAt = 0, busy = false, frameN = 0;
var drag = { on: false, moved: 0, pts: {} }, vel = { y: 0, p: 0 }, pinch = null, suppress = false;
var STORE = 'aiftf-living-universe';

function getScene(id) { if (!scenes[id]) scenes[id] = id === 'tree' ? buildTree() : buildWorld(id); return scenes[id]; }
function nodeById(S, id) { for (var i = 0; i < S.nodes.length; i++) if (S.nodes[i].id === id) return S.nodes[i]; return null; }
function now() { return performance.now(); }
function fullMotion() { return state.set.motion === 'full' && !state.paused; }

/* ---------- memory: nothing is written unless the visitor asks for it ---------- */
function save() {
  if (!state.set.remember) return;
  try { localStorage.setItem(STORE, JSON.stringify({ v: 1, visited: state.visited, found: state.found, set: state.set, seenArrival: state.seenArrival })); } catch (e) {}
}
function load() {
  try {
    var d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d && d.v === 1 && d.set && d.set.remember) {
      state.visited = d.visited || {}; state.found = d.found || {}; state.seenArrival = !!d.seenArrival;
      for (var k in d.set) if (k in state.set) state.set[k] = d.set[k];
      state.set.sound = false;
      return true;
    }
  } catch (e) {}
  return false;
}
function forget() {
  try { localStorage.removeItem(STORE); } catch (e) {}
  state.visited = {}; state.found = {}; state.seenArrival = false;
  refresh();
}

/* ---------- announcements ---------- */
function announce(msg) { liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = msg; }, 60); }
function toast(msg, ms) {
  hintEl.textContent = msg; hintEl.classList.add('on'); toast.at = now();
  clearTimeout(toast.t); toast.t = setTimeout(function () { hintEl.classList.remove('on'); }, ms || 2800);
}

/* ---------- canvas and comfort ---------- */
function resize() {
  sizeCanvas(cv, state.set.intensity === 'rich' ? 2 : state.set.intensity === 'balanced' ? 1.5 : 1);
  dirty = true;
}
function setIntensity(level, auto) {
  state.set.intensity = level; V.q = level === 'rich' ? 1 : level === 'balanced' ? .7 : .45;
  app.dataset.intensity = level;
  var el = document.getElementById('int-' + level); if (el) el.checked = true;
  resize(); if (!auto) save();
}
function setMotion(m) {
  state.set.motion = m; app.dataset.motion = m;
  var el = document.getElementById('motion-' + m); if (el) el.checked = true;
  if (m !== 'full') { vel.y = vel.p = 0; }
  dirty = true; save();
  if (typeof journeySchedule === 'function') journeySchedule();
}
var perfAcc = 0, perfN = 0, perfLocked = false;
function perf(dt) {
  if (perfLocked) return;
  perfAcc += dt; perfN++;
  if (perfN >= 80) {
    var avg = perfAcc / perfN; perfAcc = perfN = 0;
    if (avg > .036 && V.q > .5) setIntensity(V.q > .8 ? 'balanced' : 'light', true);
  }
}

/* ---------- camera ---------- */
function flyTo(b, dur, done) {
  var c = cur.cam, a = copy(c), k;
  b = copy(b); for (k in a) if (!(k in b)) b[k] = a[k];
  var d = b.yaw - a.yaw; d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI; b.yaw = a.yaw + d;
  if (cur.yawLim) b.yaw = clamp(b.yaw, cur.yawLim[0], cur.yawLim[1]);
  b.zoom = clamp(b.zoom, cur.zoomLim[0], cur.zoomLim[1]);
  if (state.set.motion === 'still' || state.paused) { cur.cam = b; tween = null; dirty = true; if (done) done(); return; }
  tween = { a: a, b: b, t0: now(), dur: (dur || 900) * (state.set.motion === 'gentle' ? .55 : 1), done: done || null };
}
function stepCamera(dt) {
  var c = cur.cam, k;
  if (tween) {
    var u = (now() - tween.t0) / tween.dur; if (u > 1) u = 1;
    var e = ease(u);
    for (k in tween.b) c[k] = lerp(tween.a[k], tween.b[k], e);
    if (u >= 1) { var cb = tween.done; tween = null; if (cb) cb(); }
    return;
  }
  if (!drag.on) {
    if (Math.abs(vel.y) + Math.abs(vel.p) > .0002) {
      c.yaw += vel.y; c.pitch = clamp(c.pitch + vel.p, cur.pitchLim[0], cur.pitchLim[1]);
      vel.y *= .92; vel.p *= .92;
    }
    if (fullMotion() && !arrival.on && !state.panel && state.mode === 'explore' && now() - idleAt > 5000) {
      if (cur.spin) c.yaw += cur.spin * dt;
      else c.yaw += (Math.sin(T * .1) * .2 - c.yaw) * Math.min(1, dt * .2);
    }
  }
  if (cur.yawLim) c.yaw = clamp(c.yaw, cur.yawLim[0], cur.yawLim[1]);
}
function zoomBy(f) { var c = cur.cam; if (tween && !tween.done) tween = null; c.zoom = clamp(c.zoom * f, cur.zoomLim[0], cur.zoomLim[1]); idleAt = now(); dirty = true; }
function fitView() { idleAt = now(); if (state.loc === 'tree' && !state.panel) { state.focus = null; refresh(); } flyTo(cur.home, 900); }
function offsets() {
  var wide = V.W >= 900;
  if (state.mode === 'journey') return [0, wide ? -V.H * .05 : -V.H * .1];
  if (!state.panel) return [0, 0];
  return wide ? [-209, 0] : [0, -V.H * .2];
}

/* ---------- the frame ---------- */
function frame(ts) {
  requestAnimationFrame(frame);
  var dt = Math.min(.05, (ts - lastT) / 1000 || 0); lastT = ts;
  if (state.mode === 'reflect' || document.hidden || !cur || atlas.open) return;
  var o = offsets(), moving = Math.abs(o[0] - V.ox) + Math.abs(o[1] - V.oy) > .5;
  var still = state.set.motion === 'still' || state.paused;
  var active = !!tween || drag.on || moving || Math.abs(vel.y) + Math.abs(vel.p) > .0002 || arrival.on;
  if (still && !active && !dirty) return;
  if (!still || arrival.on) T += dt;
  if (arrival.on) stepArrival(dt);
  stepCamera(dt);
  if (still) { V.ox = o[0]; V.oy = o[1]; }
  else { var kk = Math.min(1, dt * 6); V.ox += (o[0] - V.ox) * kk; V.oy += (o[1] - V.oy) * kk; }
  render(cur, T, arrival.on ? smooth(0, 2.4, arrival.t) : 1);
  placeNodes();
  if (!still && !arrival.on && !busy) perf(dt);
  dirty = false;
}

/* ---------- nodes: every interactive point is a real button ---------- */
function nodeAria(n) {
  if (n.kind === 'movement') { var m = WORLD[n.id]; return m.name + ', movement ' + m.n + ' of 7. ' + m.q; }
  if (n.kind === 'fruit') return n.label + ', fruit ' + n.num + ' of VI';
  if (n.id === 'roots') return 'The roots: the Living Library';
  if (n.id === 'trunk') return "The trunk: ALO'ha";
  if (n.id === 'seed') return 'The seed: where you come in';
  return n.label;
}
function syncNodes() {
  nodesEl.textContent = '';
  cur.nodes.forEach(function (n) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'node k-' + n.kind + ' off';
    b.innerHTML = (n.num ? '<span class="num" aria-hidden="true">' + n.num + '</span>' : '') + '<span class="lab">' + esc(n.label) + '</span>';
    b.setAttribute('aria-label', nodeAria(n));
    b.addEventListener('click', function () { onNode(n); });
    nodesEl.appendChild(b);
    n.el = b; n._shown = false; n._lh = undefined;
    if (state.nudge && state.loc === 'tree' && n.id === 'ground') b.classList.add('nudge');
  });
  measureLabels();
}
function measureLabels() {
  if (!cur) return;
  cur.nodes.forEach(function (n) {
    if (!n.el) return;
    var was = n.el.classList.contains('off'); n.el.classList.remove('off');
    var l = n.el.querySelector('.lab'); n.lw = l.offsetWidth || 90; n.lh = l.offsetHeight || 18;
    if (was) n.el.classList.add('off');
  });
}
function placeNodes() {
  var list = cur.nodes, i, n, on;
  for (i = 0; i < list.length; i++) {
    n = list[i]; if (!n.el) continue;
    on = !!n._on && !n.hidden;
    if (on !== n._shown) { n.el.classList.toggle('off', !on); n._shown = on; }
    if (on) n.el.style.transform = 'translate3d(' + n._x.toFixed(1) + 'px,' + n._y.toFixed(1) + 'px,0)';
  }
  if ((frameN++ % 6) === 0) declutter();
}
function declutter() {
  var list = cur.nodes.filter(function (n) { return n._shown; }), placed = [], i;
  list.sort(function (a, b) { return ((b.sel ? 9 : 0) + b.pri) - ((a.sel ? 9 : 0) + a.pri) || a._z - b._z; });
  placed.push([0, 0, V.W, 66, 9], [0, V.H - 62, V.W, V.H, 9]);
  list.forEach(function (n) { placed.push([n._x - 13, n._y - 13, n._x + 13, n._y + 13, n.pri]); });
  list.forEach(function (n) {
    var w = n.lw || 90, h = n.lh || 18, x0 = n._x - w / 2 - 3, x1 = n._x + w / 2 + 3, y0 = n._y + 15, y1 = n._y + 18 + h, hit = false, p;
    if (n.dimLab) hit = true;
    else if (!n.sel) for (i = 0; i < placed.length; i++) { p = placed[i]; if (p[4] < n.pri) continue; if (x0 < p[2] && x1 > p[0] && y0 < p[3] && y1 > p[1]) { hit = true; break; } }
    if (!hit) placed.push([x0, y0, x1, y1, 9]);
    if (n._lh !== hit) { n.el.classList.toggle('hide-lab', hit); n._lh = hit; }
    n.el.style.zIndex = String(Math.max(1, 3000 - Math.round(n._z * 100)));
  });
}

/* ---------- what is lit, what has been seen ---------- */
function refresh() {
  if (!cur) return;
  var id = state.loc;
  if (id === 'tree') {
    var hiId = (state.focus && WORLD[state.focus] && WORLD[state.focus].type === 'movement') ? state.focus : null;
    cur.nodes.forEach(function (n) {
      if (n.kind === 'leaf') { n.seen = !!state.found[n.star]; n.hidden = state.focus !== n.parent; n.sel = state.star === n.star; }
      else {
        var wid = n.id === 'roots' ? 'living-library' : n.id;
        n.seen = !!state.visited[wid]; n.done = worldDone(wid); n.sel = state.focus === n.id && !state.star;
        n.dimLab = !!hiId && n.id !== hiId;
      }
    });
    cur.hi = hiId;
  } else {
    var w = WORLD[id], c = 0;
    w.stars.forEach(function (s) { if (state.found[s.id]) c++; });
    cur.found = state.found; cur.lit = .55 + .45 * (c / w.stars.length);
    cur.nodes.forEach(function (n) { n.seen = !!state.found[n.star]; n.sel = state.star === n.star; });
  }
  dirty = true;
}
function worldDone(id) { var w = WORLD[id]; return !!w && w.stars.every(function (s) { return state.found[s.id]; }); }
function setScene(id) {
  cur = getScene(id); state.loc = id; state.star = null; tween = null; vel.y = vel.p = 0;
  var w = WORLD[id];
  if (w) state.visited[id] = 1;
  app.dataset.loc = id; app.dataset.kind = w ? w.type : 'tree';
  app.style.setProperty('--accent', w ? w.color : C.pearl);
  stage.setAttribute('aria-label', (w ? w.name : 'The Tree of Emergence') + '. Every point of light is a button. Arrow keys turn the view, plus and minus move closer or farther.');
  syncNodes(); refresh(); crumbs(); Sound.setWorld(id); setHash(id); save(); updateCount(); updateMnav();
  var bt = $('#btn-tree'); bt.hidden = id === 'tree'; bt.textContent = w && w.parent ? 'Back' : 'Tree';
  bt.setAttribute('aria-label', w && w.parent ? 'Back to ' + WORLD[w.parent].name : 'Return to the Tree');
}
var booting = false;
function setHash(id) {
  if (booting) return;
  try { if (location.hash.slice(1) !== id && !(id === 'tree' && !location.hash)) location.hash = id; } catch (e) {}
}
function crumbs() {
  var id = state.loc, w = WORLD[id], sep = '<span aria-hidden="true">/</span>', h;
  h = id === 'tree' ? '<span aria-current="page">Tree of Emergence</span>' : '<button type="button" data-go="tree" aria-label="Tree of Emergence">Tree</button>';
  if (w) {
    if (w.parent) h += sep + '<button type="button" data-go="' + w.parent + '">' + esc(WORLD[w.parent].name) + '</button>';
    h += sep + '<button type="button" aria-current="page" data-go="' + id + '">' + esc(w.name) + '</button>';
  }
  $('#crumbs').innerHTML = h;
}

/* ---------- the panel ---------- */
function openPanel(html) {
  panelBody.innerHTML = html; panel.hidden = false; state.panel = true; app.classList.add('has-panel');
  panelBody.scrollTop = 0;
  var h = $('h2', panelBody); if (h) { h.tabIndex = -1; try { h.focus({ preventScroll: true }); } catch (e) {} }
  dirty = true;
}
function closePanel() {
  if (!state.panel && !state.star) return;
  panel.hidden = true; state.panel = false; app.classList.remove('has-panel');
  state.star = null; refresh();
}
function kindRow(s) {
  var K = KINDS[s.k]; if (!K) return '';
  return '<p class="kind"><span class="chip">' + esc(K[0]) + '</span>' + (s.status ? '<span class="status">' + esc(s.status) + '</span>' : '') + '<span class="gloss">' + esc(K[1]) + '</span></p>';
}
function bodyHTML(s) {
  var h = '';
  if (s.list) h += '<dl class="defs">' + s.list.map(function (d) { return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd></div>'; }).join('') + '</dl>';
  (s.b || []).forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
  return h;
}
function linkBtns(links) {
  if (!links || !links.length) return '';
  return '<h3>Where next</h3><div class="next">' + links.map(function (l) { return '<button type="button" class="go" data-go="' + esc(l[0]) + '">' + esc(l[1]) + '</button>'; }).join('') + '</div>';
}
function srcLink(s) {
  return s.src ? '<p><a class="src" href="' + esc(s.src[1]) + '" target="_blank" rel="noopener">' + esc(s.src[0]) + '</a> <span class="ext">Opens the original.</span></p>' : '';
}
function starList(w, attr) {
  return '<ul class="stars">' + w.stars.map(function (s) {
    var v = attr === 'data-go' ? w.id + ':' + s.id : s.id;
    return '<li><button type="button" class="go' + (state.found[s.id] ? ' seen' : '') + '" ' + attr + '="' + v + '"><span>' + esc(s.t) + '</span><small>' + esc(KINDS[s.k][0]) + '</small></button></li>';
  }).join('') + '</ul>';
}
function showStarPanel(s) {
  var w = WORLD[s.world], h = '<h2>' + esc(s.t) + '</h2>';
  if (s.name) h += '<p class="look">' + esc(s.name) + '</p>';
  h += kindRow(s) + bodyHTML(s);
  if (s.w) h += '<p class="whole">' + esc(s.w) + '</p>';
  h += linkBtns(s.links) + srcLink(s);
  if (w) {
    var i = w.stars.indexOf(s), n = w.stars.length;
    if (state.loc === 'tree') h += '<p style="margin-top:16px"><button type="button" class="primary" data-go="' + w.id + ':' + s.id + '">Enter ' + esc(w.name) + '</button></p>';
    h += '<div class="pager"><button type="button" class="go" data-star="' + w.stars[(i + n - 1) % n].id + '">Previous</button><span>' + (i + 1) + ' of ' + n + ' in ' + esc(w.name) + '</span><button type="button" class="go" data-star="' + w.stars[(i + 1) % n].id + '">Next</button></div>';
  }
  openPanel(h);
}
function showPreview(id) {
  var w = WORLD[id], mv = w.type === 'movement';
  var h = '<h2>' + esc(w.name) + '</h2><p class="look">' + esc(w.look) + (mv ? '. Movement ' + w.n + ' of 7.' : '.') + '</p>';
  if (w.q) h += '<p class="q">' + esc(w.q) + '</p>';
  h += '<p>' + esc(w.intro) + '</p><p><button type="button" class="primary" data-go="' + id + '">' + (id === 'living-library' ? 'Descend to the roots' : 'Enter ' + esc(w.name)) + '</button></p>';
  h += '<h3>' + (mv ? 'On this branch' : 'Inside') + '</h3>' + starList(w, mv ? 'data-star' : 'data-go');
  openPanel(h);
}
function showWorld(id) {
  var w = WORLD[id], c = w.stars.filter(function (s) { return state.found[s.id]; }).length;
  var h = '<h2>' + esc(w.name) + '</h2><p class="look">' + esc(w.look) + '.</p>';
  if (w.q) h += '<p class="q">' + esc(w.q) + '</p>';
  h += '<p>' + esc(w.intro) + '</p><p class="hint">' + (c === w.stars.length ? 'You have opened every star here, and this world is fully lit.' : 'Touch a star to open it. You have opened ' + c + ' of ' + w.stars.length + ' here, and the world brightens with each one.') + '</p>' + starList(w, 'data-star');
  if (w.type === 'movement') { var nx = MOVEMENTS[w.n % 7]; h += '<h3>The cycle continues</h3><div class="next"><button type="button" class="go" data-go="' + nx.id + '">' + esc(nx.name) + '</button></div>'; }
  openPanel(h);
}
function showSeed() {
  var h = '<h2>' + esc(SEED.t) + '</h2>';
  SEED.b.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
  SEED.invites.forEach(function (v) {
    h += '<div class="invite"><h3>' + esc(v.t) + '</h3><p>' + esc(v.b) + '</p><p>' +
      (v.href ? '<a class="src" href="' + esc(v.href) + '" target="_blank" rel="noopener">' + esc(v.hrefLabel) + '</a>'
        : '<button type="button" class="go" data-go="' + v.act[0] + '">' + esc(v.act[1]) + '</button>') + '</p></div>';
  });
  openPanel(h);
}

/* A reflective walk through the seven movements. Notes stay in this page's memory only. */
var walk = { i: 0, notes: ['', '', '', '', '', '', ''] };
function showWalk(i) {
  walk.i = i;
  var h, m, k;
  if (i >= 7) {
    h = '<h2>Your walk, returned</h2><p>Seven movements, one cycle. The Scroll ends every cycle the same way: with truth, repair and renewed relationship.</p><div class="walk"><ol>';
    MOVEMENTS.forEach(function (mm, j) { h += '<li><strong>' + esc(mm.name) + '.</strong> ' + (walk.notes[j] ? esc(walk.notes[j]) : '<span class="fine">Nothing written.</span>') + '</li>'; });
    h += '</ol></div><div class="next">' + (DL ? '<button type="button" class="go" id="walk-save">Save my notes as a file</button>' : '') + '<button type="button" class="go" id="walk-copy">Copy my notes</button><button type="button" class="go" data-walk="0">Walk again</button><button type="button" class="go" data-go="the-scroll:sc-movements">Read the procedure in the Scroll</button></div><p class="fine" style="margin-top:12px">These notes exist only on this screen. Close the page and they are gone. They are a reflection, not legal, medical or financial advice.</p>';
    state.focus = null; refresh(); flyTo(cur.home, 1200);
    openPanel(h); return;
  }
  m = MOVEMENTS[i];
  h = '<h2>' + esc(m.name) + '</h2><div class="steps" aria-hidden="true">';
  for (k = 0; k < 7; k++) h += '<i style="background:' + (k <= i ? MOVEMENTS[k].color : '') + '"></i>';
  h += '</div><p class="look">Movement ' + (i + 1) + ' of 7 on your walk.</p><p>' + esc(m.stars[0].b[0]) + '</p><p class="q">' + esc(m.q) + '</p>';
  h += '<div class="walk"><label for="walk-note">Your note for ' + esc(m.name) + ' (optional)</label><textarea id="walk-note">' + esc(walk.notes[i]) + '</textarea></div>';
  h += '<p class="fine">Ask the question as reflection, never as scoring or rank.</p><div class="pager">' +
    (i > 0 ? '<button type="button" class="go" data-walk="' + (i - 1) + '">Back</button>' : '<span></span>') +
    '<button type="button" class="primary" data-walk="' + (i + 1) + '">' + (i === 6 ? 'Complete the cycle' : 'Next: ' + esc(MOVEMENTS[i + 1].name)) + '</button></div>';
  focusTree(m.id, false);
  app.style.setProperty('--accent', m.color);
  openPanel(h);
}
function keepNote() { var t = document.getElementById('walk-note'); if (t && walk.i < 7) walk.notes[walk.i] = t.value.slice(0, 2000); }

/* ---------- the Tree ---------- */
function focusTree(id, withPanel) {
  var S = scenes.tree, n = nodeById(S, id), v; if (!n) return;
  state.focus = id; state.star = null; refresh(); idleAt = now();
  if (n.kind === 'movement') v = { tx: n.x * .62, ty: n.y - .12, tz: n.z * .62, zoom: 2.0, yaw: n.phi - 1.0, pitch: .12 };
  else if (n.kind === 'fruit') v = { tx: n.x * .8, ty: n.y + .05, tz: n.z * .8, zoom: 2.4, yaw: n.phi - 1.0, pitch: .1 };
  else if (id === 'roots') v = { tx: 0, ty: -.55, tz: 0, zoom: 1.9, pitch: -.1 };
  else if (id === 'trunk') v = { tx: 0, ty: .9, tz: 0, zoom: 2.1, pitch: .08 };
  else v = { tx: 0, ty: .25, tz: 0, zoom: 2.4, pitch: .2 };
  flyTo(v, 1100);
  app.style.setProperty('--accent', n.color);
  if (!withPanel) return;
  if (n.kind === 'movement' || n.kind === 'fruit') showPreview(id);
  else if (id === 'roots') showPreview('living-library');
  else if (id === 'trunk') { state.visited.trunk = 1; save(); showStarPanel(TRUNK); }
  else { state.visited.seed = 1; save(); showSeed(); }
}
function onNode(n) {
  idleAt = now(); clearNudge();
  if (state.mode === 'journey') setMode('explore', true);
  if (state.loc === 'tree' && n.kind !== 'leaf') focusTree(n.id, true);
  else openStar(n.star);
}
function openStar(id) {
  var s = STAR[id]; if (!s) return;
  var wasDone = worldDone(s.world);
  state.star = id; state.found[id] = 1; save(); refresh(); idleAt = now();
  if (!wasDone && worldDone(s.world)) setTimeout(function () { toast('You have opened everything in ' + WORLD[s.world].name + '. Its light is now full.', 4200); Sound.chime(); }, 1000);
  var n = nodeById(cur, state.loc === 'tree' ? s.world + ':' + id : id);
  if (state.loc === 'tree') {
    if (state.focus !== s.world) { state.focus = s.world; refresh(); }
    if (n) flyTo({ tx: n.x * .8, ty: n.y, tz: n.z * .8, zoom: 2.7 }, 800);
  } else if (n) flyTo({ tx: n.x * .55, ty: lerp(cur.center[1], n.y, .6), tz: n.z * .55, zoom: 1.5 }, 800);
  Sound.chime();
  showStarPanel(s);
  announce(s.t);
}

/* ---------- travel ---------- */
function transition(color, origin, swap, after) {
  var m = state.paused ? 'still' : state.set.motion;
  bloomEl.style.setProperty('--bc', color);
  bloomEl.style.setProperty('--bx', origin[0].toFixed(0) + 'px'); bloomEl.style.setProperty('--by', origin[1].toFixed(0) + 'px');
  busy = true;
  if (m !== 'full') {
    bloomEl.className = 'fade on';
    setTimeout(function () { swap(); bloomEl.className = 'fade'; busy = false; after(); dirty = true; }, m === 'still' ? 30 : 170);
    return;
  }
  bloomEl.className = 'grow on';
  setTimeout(function () {
    swap(); bloomEl.className = 'grow out'; after(); dirty = true;
    setTimeout(function () { bloomEl.className = ''; busy = false; }, 950);
  }, 770);
}
function travel(id, star) {
  if (busy) return;
  var w = WORLD[id]; if (!w) return;
  var from = state.loc, n = nodeById(cur, (from === 'tree' && id === 'living-library' && state.focus === 'roots') ? 'roots' : id), origin = [V.cx, V.cy];
  if (n && n._on) { origin = [n._x, n._y]; if (fullMotion()) flyTo({ tx: n.x, ty: n.y, tz: n.z, zoom: 3.4 }, 740); }
  if (WORLD[from]) toast('From ' + WORLD[from].name + ' to ' + w.name);
  transition(w.color, origin, function () {
    closePanel(); state.focus = null; setScene(id);
    cur.cam = copy(cur.home); cur.cam.zoom = .62;
  }, function () {
    flyTo({ zoom: 1 }, 1300);
    if (star) setTimeout(function () { if (state.loc === id) openStar(star); }, fullMotion() ? 800 : 0); else showWorld(id);
    announce('You have arrived in ' + w.name + '. ' + w.intro);
  });
}
function travelTree(cb) {
  if (busy) return;
  var from = state.loc, n = null;
  transition(C.pearl, [V.cx, V.cy], function () {
    closePanel(); setScene('tree');
    n = nodeById(cur, from);
    cur.cam = copy(cur.home);
    if (n) { cur.cam.tx = n.x; cur.cam.ty = n.y; cur.cam.tz = n.z; cur.cam.zoom = 2.9; cur.cam.yaw = n.phi - 1.0; }
    state.focus = n ? from : null; refresh();
  }, function () {
    flyTo(cur.home, 1400);
    announce('You are back at the Tree of Emergence.');
    if (cb) cb();
  });
}
function toTree(cb) { if (state.loc === 'tree') { if (cb) cb(); } else travelTree(cb); }
function back() {
  var w = WORLD[state.loc];
  if (w && w.parent) travel(w.parent);
  else if (w) travelTree();
  else if (state.panel || state.focus) { closePanel(); state.focus = null; refresh(); flyTo(cur.home, 900); app.style.setProperty('--accent', C.pearl); }
}
function go(t) {
  if (!t) return;
  if (state.mode === 'reflect') return reflectGo(t);
  if (state.mode === 'journey') setMode('explore', true);
  if (t === 'atlas') return openAtlas();
  var parts = t.split(':'), w = parts[0], s = parts[1];
  if (w === 'tree') {
    toTree(function () {
      if (s === 'trunk') focusTree('trunk', true);
      else { closePanel(); state.focus = null; refresh(); flyTo(cur.home, 1000); app.style.setProperty('--accent', C.pearl); }
    });
    return;
  }
  if (w === 'seed') { toTree(function () { if (s === 'walk') showWalk(0); else focusTree('seed', true); }); return; }
  if (!WORLD[w]) return;
  if (state.loc === w) { if (s) openStar(s); else { state.star = null; refresh(); flyTo(cur.home, 800); showWorld(w); } return; }
  travel(w, s);
}

/* ---------- input ---------- */
function wireStage() {
  stage.addEventListener('pointerdown', function (e) {
    if (state.arriving) return;
    idleAt = now(); hintEl.classList.remove('on');
    drag.pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(drag.pts);
    if (ids.length === 1) { drag.on = true; drag.moved = 0; vel.y = vel.p = 0; }
    if (ids.length === 2) { var a = drag.pts[ids[0]], b = drag.pts[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: cur.cam.zoom }; }
  });
  stage.addEventListener('pointermove', function (e) {
    var p = drag.pts[e.pointerId]; if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    var ids = Object.keys(drag.pts);
    if (ids.length >= 2 && pinch) {
      var a = drag.pts[ids[0]], b = drag.pts[ids[1]];
      if (tween && !tween.done) tween = null;
      if (!tween) cur.cam.zoom = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, cur.zoomLim[0], cur.zoomLim[1]);
      drag.moved = 99; dirty = true; return;
    }
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 8) {
      if (tween && !tween.done) tween = null;
      if (!tween) {
        cur.cam.yaw += dx * .0065; cur.cam.pitch = clamp(cur.cam.pitch + dy * .0045, cur.pitchLim[0], cur.pitchLim[1]);
        if (state.set.motion === 'full') { vel.y = dx * .0065; vel.p = dy * .0045; }
      }
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      dirty = true; idleAt = now();
    }
  });
  var end = function (e) {
    if (!drag.pts[e.pointerId]) return;
    delete drag.pts[e.pointerId];
    var left = Object.keys(drag.pts).length;
    if (left < 2) pinch = null;
    if (left === 0) {
      drag.on = false;
      if (drag.moved > 8) { suppress = true; setTimeout(function () { suppress = false; }, 80); }
    }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('click', function (e) { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
  stage.addEventListener('wheel', function (e) { if (state.arriving) return; e.preventDefault(); zoomBy(Math.exp(-e.deltaY * .0012)); }, { passive: false });
  stage.addEventListener('keydown', function (e) {
    if (state.arriving) return;
    var c = cur.cam, k = e.key;
    if (k === 'ArrowLeft') c.yaw -= .14; else if (k === 'ArrowRight') c.yaw += .14;
    else if (k === 'ArrowUp') c.pitch = clamp(c.pitch + .08, cur.pitchLim[0], cur.pitchLim[1]);
    else if (k === 'ArrowDown') c.pitch = clamp(c.pitch - .08, cur.pitchLim[0], cur.pitchLim[1]);
    else if (k === '+' || k === '=') zoomBy(1.2); else if (k === '-' || k === '_') zoomBy(1 / 1.2);
    else if (k === '0') fitView(); else return;
    e.preventDefault(); if (tween && !tween.done) tween = null; idleAt = now(); dirty = true;
  });
}
function wirePanel() {
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    var el;
    if ((el = t.closest('[data-walk]'))) { keepNote(); showWalk(+el.dataset.walk); return; }
    if ((el = t.closest('#walk-save'))) { saveWalk(); return; }
    if ((el = t.closest('#walk-copy'))) {
      var txt = MOVEMENTS.map(function (m, j) { return m.name + ': ' + (walk.notes[j] || ''); }).join('\n');
      try { navigator.clipboard.writeText(txt).then(function () { toast('Copied your notes'); }, function () { toast('Copying is not available here. Select the text to copy it.'); }); }
      catch (err) { toast('Copying is not available here. Select the text to copy it.'); }
      return;
    }
    if ((el = t.closest('[data-see]'))) { var tg = el.dataset.see; setMode('explore', true, true); go(tg); return; }
    if ((el = t.closest('[data-star]'))) {
      if (state.mode === 'reflect') return;
      openStar(el.dataset.star); return;
    }
    if ((el = t.closest('[data-go]'))) { keepNote(); closeAtlas(); go(el.dataset.go); return; }
  });
  document.addEventListener('pointerdown', function () { if (hintEl.classList.contains('on') && now() - (toast.at || 0) > 700) hintEl.classList.remove('on'); }, true);
  $('#panel-close').addEventListener('click', function () {
    keepNote(); closePanel();
    if (state.loc === 'tree') app.style.setProperty('--accent', C.pearl);
    stage.focus({ preventScroll: true });
  });
}
