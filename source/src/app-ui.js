/* Three ways to explore, the Celestial Atlas, comfort settings, sound, and the arrival. */

/* ---------- modes ---------- */
function setMode(m, quiet, stay) {
  if (m === state.mode) return;
  var prev = state.mode, here = (prev === 'reflect' && !stay) ? reflectHere() : null;
  state.mode = m; app.dataset.mode = m;
  $$('.modes button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
  clearTimeout(J.timer); if (prev === 'journey') Voice.stop();
  $('#journey').hidden = m !== 'journey';
  updateMnav();
  $('#reflect').hidden = m !== 'reflect';
  if (m === 'reflect') {
    var target = state.star ? 'r-' + state.star
      : state.loc !== 'tree' ? 'r-' + state.loc
      : state.focus === 'trunk' ? 'r-trunk' : state.focus === 'seed' ? 'r-seed'
      : state.focus === 'roots' ? 'r-living-library' : (state.focus && WORLD[state.focus]) ? 'r-' + state.focus : null;
    closePanel(); buildReflect();
    var R = $('#reflect'), el = target && document.getElementById(target);
    R.scrollTop = 0; if (el) el.scrollIntoView();
    try { R.focus({ preventScroll: true }); } catch (e) {}
    Sound.hush(true);
  } else Sound.hush(false);
  if (prev === 'reflect' && !stay) {
    if (here && here !== state.loc) { if (here === 'tree') toTree(); else if (WORLD[here] && m === 'explore') travel(here); }
  }
  if (m === 'journey') startJourney();
  if (!quiet) announce(m === 'journey' ? 'Cinematic journey. A guided path around the Tree.' : m === 'reflect' ? 'Discovery and reflection. Everything as readable text.' : 'Free explorer.');
  dirty = true;
}

/* ---------- cinematic journey ---------- */
var J = { i: 0, playing: true, timer: null, gen: 0 };
function stopFor(id) { for (var i = 0; i < JOURNEY.length; i++) if (JOURNEY[i].node === id) return i; return -1; }
function startJourney() {
  var begin = function () { var i = state.focus ? stopFor(state.focus) : -1; showStop(i >= 0 ? i : 0); };
  closePanel();
  if (state.loc !== 'tree') { var from = state.loc; travelTree(function () { var i = stopFor(from); showStop(i >= 0 ? i : 0); }); }
  else begin();
}
function showStop(i) {
  J.i = clamp(i, 0, JOURNEY.length - 1);
  var s = JOURNEY[J.i], goBtn = $('#j-go'), target = s.go || (s.node && WORLD[s.node] ? s.node : null);
  $('#j-cap').textContent = s.cap;
  $('#j-count').textContent = (J.i + 1) + ' of ' + JOURNEY.length;
  if (target) { goBtn.hidden = false; goBtn.dataset.go = target; goBtn.textContent = s.goLabel || ('Enter ' + WORLD[s.node].name); } else goBtn.hidden = true;
  $('#j-prev').disabled = J.i === 0; $('#j-next').disabled = J.i === JOURNEY.length - 1;
  Voice.done = Voice.speak(s.cap);
  if (state.loc === 'tree') {
    if (s.node) focusTree(s.node, false);
    else { state.focus = null; refresh(); flyTo(scenes.tree.home, 1500); app.style.setProperty('--accent', C.pearl); }
  }
  journeySchedule();
}
function journeySchedule() {
  clearTimeout(J.timer); J.gen++;
  var gen = J.gen, auto = fullMotion(), pb = $('#j-play');
  if (!pb) return;
  pb.hidden = !auto;
  pb.textContent = J.playing ? 'Pause' : 'Play'; pb.setAttribute('aria-pressed', String(J.playing));
  if (state.mode !== 'journey' || !auto || !J.playing) return;
  var next = function () {
    if (gen !== J.gen || state.mode !== 'journey') return;
    if (J.i < JOURNEY.length - 1) showStop(J.i + 1); else { J.playing = false; journeySchedule(); }
  };
  if (Voice.on) Voice.done.then(function () { if (gen === J.gen) J.timer = setTimeout(next, 1600); });
  else J.timer = setTimeout(next, 9000);
}

/* ---------- discovery and reflection: the whole universe as readable text ---------- */
var reflectBuilt = false;
function rArticle(s, tag) {
  var h = '<article id="r-' + s.id + '"><' + tag + '>' + esc(s.t) + '</' + tag + '>';
  if (s.name) h += '<p class="look">' + esc(s.name) + '</p>';
  h += kindRow(s) + bodyHTML(s);
  if (s.w) h += '<p class="whole">' + esc(s.w) + '</p>';
  if (s.links && s.links.length) h += '<div class="r-links">' + s.links.map(function (l) { return '<button type="button" data-go="' + esc(l[0]) + '">' + esc(l[1]) + '</button>'; }).join('') + '</div>';
  h += srcLink(s) + '</article>';
  return h;
}
function rWorld(w) {
  var mv = w.type === 'movement';
  var h = '<section id="r-' + w.id + '" data-world="' + w.id + '" style="--wc:' + w.color + '"><h3>' + (mv ? w.n + '. ' : w.num ? w.num + '. ' : '') + esc(w.name) + '</h3>';
  h += '<p class="look">' + esc(w.look) + '.</p>' + (w.q ? '<p class="q">' + esc(w.q) + '</p>' : '') + '<p>' + esc(w.intro) + '</p>';
  h += '<p class="see"><button type="button" class="go" data-see="' + w.id + '">See ' + esc(w.name) + ' in the universe</button></p>';
  w.stars.forEach(function (s) { h += rArticle(s, 'h4'); });
  return h + '</section>';
}
function buildReflect() {
  if (reflectBuilt) return; reflectBuilt = true;
  var h = '<div class="r-wrap"><header id="reflect-top" data-world="tree"><h1>AI Freedom Trust Federation</h1>';
  h += '<p class="lede">A living federation for human freedom in the age of intelligence.</p>';
  h += '<p>One root. Many branches. Every fruit returns to its source. This page holds the whole Living Universe in words: every world, every discovery, and the ties between them.</p>';
  h += '<nav class="r-toc" aria-label="Contents"><button type="button" class="go" data-go="tree:trunk">The trunk</button>';
  WORLDS.forEach(function (w) { h += '<button type="button" class="go" data-go="' + w.id + '">' + esc(w.name) + '</button>'; });
  h += '<button type="button" class="go" data-go="seed">The seed</button></nav>';
  h += '<p class="fine">Everything here comes from the federation\'s published works. Each discovery carries a label that says what kind of statement it is. Symbolic pairings are labeled as metaphor, and nothing is presented as established science.</p></header>';
  h += '<section data-world="tree"><h2>The Tree of Emergence</h2><p>The Tree shows how ideas, systems, communities and responsibilities grow from common roots. Seven branches carry the seven movements. Six fruits open into worlds. The roots hold the written covenant.</p>';
  h += '<div id="r-trunk">' + rArticle({ id: 'trunk-a', t: TRUNK.t, k: TRUNK.k, b: TRUNK.b, w: TRUNK.w, links: TRUNK.links }, 'h3') + '</div></section>';
  h += '<h2>The seven movements</h2><p>A stewardship procedure for decisions, taken from the Scroll. Each movement is a branch, each has its color, and each asks one question.</p>';
  MOVEMENTS.forEach(function (w) { h += rWorld(w); });
  h += '<h2>The six fruits</h2><p>Six spheres surround the one root. Each fruit opens into a world.</p>';
  FRUITS.forEach(function (w) { h += rWorld(w); });
  h += '<h2>Inside the Scroll</h2>' + rWorld(WORLD['the-scroll']);
  h += '<section id="r-seed" data-world="tree"><h2>' + esc(SEED.t) + '</h2>';
  SEED.b.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
  SEED.invites.forEach(function (v) {
    h += '<h4>' + esc(v.t) + '</h4><p>' + esc(v.b) + '</p><p>' + (v.href ? '<a class="src" href="' + esc(v.href) + '" target="_blank" rel="noopener">' + esc(v.hrefLabel) + '</a>'
      : v.id === 'walk' ? '<button type="button" class="go" data-see="seed:walk">Begin the walk on the Tree</button>'
      : '<button type="button" class="go" data-go="' + v.act[0] + '">' + esc(v.act[1]) + '</button>') + '</p>';
  });
  h += '</section><section data-world="tree"><h2>How to read the labels</h2><dl class="defs">' + legendHTML() + '</dl></section></div>';
  $('#reflect').innerHTML = h;
}
function legendHTML() {
  return ['protocol', 'doctrine', 'metaphor', 'principle', 'philosophy', 'work', 'aspiration', 'published'].map(function (k) {
    return '<div><dt>' + esc(KINDS[k][0]) + '</dt><dd>' + esc(KINDS[k][1]) + '</dd></div>';
  }).join('');
}
function reflectGo(t) {
  if (t === 'atlas') return openAtlas();
  var p = t.split(':'), id = p[0] === 'tree' ? (p[1] === 'trunk' ? 'r-trunk' : 'reflect-top') : p[0] === 'seed' ? 'r-seed' : 'r-' + (p[1] || p[0]);
  var el = document.getElementById(id); if (!el) return;
  el.scrollIntoView({ behavior: state.set.motion === 'full' ? 'smooth' : 'auto' });
  var hd = el.querySelector('h1,h2,h3,h4') || el; hd.tabIndex = -1; try { hd.focus({ preventScroll: true }); } catch (e) {}
}
function reflectHere() {
  var R = $('#reflect'), best = null, top = R.getBoundingClientRect().top + 140;
  $$('[data-world]', R).forEach(function (s) { if (s.getBoundingClientRect().top <= top) best = s.dataset.world; });
  return best;
}

/* ---------- the Celestial Atlas ---------- */
var AP = { 'return': [550, 330], covenant: [735, 460], converge: [365, 565], differentiate: [745, 670], name: [355, 775], witness: [755, 880], ground: [345, 985],
  trunk: [550, 1075], seed: [550, 1170], 'living-library': [550, 1290], 'the-scroll': [550, 1410],
  'path-ahead': [985, 520], 'federation-structure': [115, 640], 'living-works': [985, 760], 'living-tree': [115, 880], vision: [985, 1000] };
var atlas = { built: false, x: 0, y: 0, k: 1, sel: null, pts: {}, pinch: null, moved: 0 };
function atlasEdges() {
  var E = {}, add = function (a, b) { if (a === b || !AP[a] || !AP[b]) return; var k = a < b ? a + '|' + b : b + '|' + a; E[k] = [a, b]; };
  var tgt = function (l) { return l === 'tree:trunk' ? 'trunk' : l.split(':')[0]; };
  MOVEMENTS.forEach(function (m, i) { if (i < 6) add(m.id, MOVEMENTS[i + 1].id); });
  WORLDS.forEach(function (w) { w.stars.forEach(function (s) { (s.links || []).forEach(function (l) { add(w.id, tgt(l[0])); }); }); });
  TRUNK.links.forEach(function (l) { add('trunk', tgt(l[0])); });
  SEED.invites.forEach(function (v) { if (v.act) add('seed', tgt(v.act[0])); });
  add('living-library', 'the-scroll'); add('seed', 'trunk'); add('seed', 'living-library');
  return Object.keys(E).map(function (k) { return E[k]; });
}
function aName(id) { return WORLD[id] ? WORLD[id].name : id === 'trunk' ? 'The trunk' : 'The seed'; }
function aColor(id) { var w = WORLD[id]; return w ? (w.type === 'movement' ? w.color : w.type === 'fruit' && id !== 'living-library' ? C.amber : C.pearl) : (id === 'seed' ? C.white : C.pearl); }
function buildAtlas() {
  if (atlas.built) return; atlas.built = true;
  var h = '<svg viewBox="0 240 1100 1220" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Map of the Living Universe"><g id="a-g">';
  h += '<path class="a-trunk" d="M550 1290 L550 330"/>';
  atlasEdges().forEach(function (e) {
    var a = AP[e[0]], b = AP[e[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    h += '<path class="a-edge" data-a="' + e[0] + '" data-b="' + e[1] + '" d="M' + a[0] + ' ' + a[1] + ' Q' + (mx - dy * .12).toFixed(0) + ' ' + (my + dx * .12).toFixed(0) + ' ' + b[0] + ' ' + b[1] + '"/>';
  });
  Object.keys(AP).forEach(function (id) {
    var p = AP[id], w = WORLD[id], col = aColor(id), n = w ? (w.n || w.num || '') : '', side = p[0] < 300 ? 'start' : p[0] > 800 ? 'end' : (p[0] === 550 ? 'beside' : 'middle');
    var lx = side === 'start' ? p[0] - 30 : side === 'end' ? p[0] + 30 : side === 'beside' ? p[0] + 44 : p[0], ly = side === 'beside' ? p[1] + 13 : p[1] + 68;
    h += '<g class="a-node" data-id="' + id + '" tabindex="0" role="button" aria-label="' + esc(aName(id)) + '" style="--c:' + col + '">';
    h += '<circle class="glow" cx="' + p[0] + '" cy="' + p[1] + '" r="52"/><circle class="you" cx="' + p[0] + '" cy="' + p[1] + '" r="40" fill="none"/><circle class="ring" cx="' + p[0] + '" cy="' + p[1] + '" r="26"/>';
    if (n) h += '<text class="n" x="' + p[0] + '" y="' + (p[1] + 8) + '" text-anchor="middle">' + n + '</text>';
    h += '<text x="' + lx + '" y="' + ly + '" text-anchor="' + (side === 'beside' ? 'start' : side) + '">' + esc(aName(id)) + '</text>';
    if (w) w.stars.forEach(function (s, i) { var a = i / w.stars.length * TAU - Math.PI / 2; h += '<circle class="a-dot" data-star="' + s.id + '" cx="' + (p[0] + Math.cos(a) * 40).toFixed(1) + '" cy="' + (p[1] + Math.sin(a) * 40).toFixed(1) + '" r="4.5"/>'; });
    h += '</g>';
  });
  h += '</g></svg>';
  $('#a-map').insertAdjacentHTML('afterbegin', h);
  var map = $('#a-map');
  $$('.a-node', map).forEach(function (g) {
    g.addEventListener('click', function () { if (atlas.moved < 8) atlasSelect(g.dataset.id); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); atlasSelect(g.dataset.id); } });
  });
  map.addEventListener('pointerdown', function (e) {
    if (e.target.closest('#a-zoom') || e.target.closest('#a-results')) return;
    atlas.pts[e.pointerId] = { x: e.clientX, y: e.clientY }; atlas.moved = 0;
    var ids = Object.keys(atlas.pts);
    if (ids.length === 2) { var a = atlas.pts[ids[0]], b = atlas.pts[ids[1]]; atlas.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: atlas.k }; }
  });
  map.addEventListener('pointermove', function (e) {
    var p = atlas.pts[e.pointerId]; if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    var ids = Object.keys(atlas.pts), u = atlasUnit();
    if (ids.length >= 2 && atlas.pinch) { var a = atlas.pts[ids[0]], b = atlas.pts[ids[1]]; atlasZoom(atlas.pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / atlas.pinch.d, true); atlas.moved = 99; return; }
    atlas.moved += Math.abs(dx) + Math.abs(dy);
    if (atlas.moved > 8) { atlas.x += dx * u; atlas.y += dy * u; atlasApply(); }
  });
  var end = function (e) { delete atlas.pts[e.pointerId]; if (Object.keys(atlas.pts).length < 2) atlas.pinch = null; };
  map.addEventListener('pointerup', end); map.addEventListener('pointercancel', end);
  map.addEventListener('wheel', function (e) { e.preventDefault(); atlasZoom(atlas.k * Math.exp(-e.deltaY * .0015), true); }, { passive: false });
}
function atlasUnit() { var r = $('#a-map').getBoundingClientRect(); return 1 / Math.min(r.width / 1100, r.height / 1220); }
function atlasApply() {
  var k = atlas.k, lim = 700 * k;
  atlas.x = clamp(atlas.x, -lim, lim); atlas.y = clamp(atlas.y, -lim * 1.3, lim * 1.3);
  $('#a-g').setAttribute('transform', 'translate(' + (550 + atlas.x).toFixed(1) + ' ' + (850 + atlas.y).toFixed(1) + ') scale(' + k.toFixed(3) + ') translate(-550 -850)');
  $('#a-map').classList.toggle('deep', k > 1.55);
}
function atlasZoom(k) { atlas.k = clamp(k, .8, 4.5); atlasApply(); }
function atlasMark() {
  var here = state.loc === 'tree' ? (state.focus === 'trunk' || state.focus === 'seed' ? state.focus : null) : state.loc, nW = 0;
  $$('#a-map .a-node').forEach(function (g) {
    var id = g.dataset.id, seen = !!state.visited[id]; if (seen && WORLD[id]) nW++;
    g.classList.toggle('seen', seen); g.classList.toggle('here', id === here);
  });
  $$('#a-map .a-dot').forEach(function (d) { d.classList.toggle('seen', !!state.found[d.dataset.star]); });
  $$('#a-map .a-edge').forEach(function (e) {
    e.classList.toggle('lit', !!state.visited[e.dataset.a] && !!state.visited[e.dataset.b]);
    e.classList.toggle('on', atlas.sel === e.dataset.a || atlas.sel === e.dataset.b);
  });
  $('#a-trail').textContent = nW ? 'Filled circles mark the ' + nW + ' of ' + WORLDS.length + ' worlds you have visited. A line brightens when you know both ends.'
    : 'Touch a place to see what it holds and how it ties to the rest.';
}
function atlasSelect(id) {
  atlas.sel = id; atlasMark();
  var w = WORLD[id], h, ties = [];
  $$('#a-map .a-edge.on').forEach(function (e) { var o = e.dataset.a === id ? e.dataset.b : e.dataset.a; if (ties.indexOf(o) < 0) ties.push(o); });
  $('#a-card').style.setProperty('--accent', aColor(id));
  if (w) {
    var c = w.stars.filter(function (s) { return state.found[s.id]; }).length;
    h = '<h3>' + esc(w.name) + '</h3><p>' + esc(w.intro) + '</p><p><button type="button" class="primary" data-go="' + id + '">' + (state.loc === id ? 'You are here' : 'Travel to ' + esc(w.name)) + '</button></p>';
    h += '<p class="fine">' + c + ' of ' + w.stars.length + ' opened.</p>' + starList(w, 'data-go');
  } else if (id === 'trunk') h = '<h3>' + esc(TRUNK.t) + '</h3><p>' + esc(TRUNK.b[0]) + '</p><p><button type="button" class="primary" data-go="tree:trunk">Go to the trunk</button></p>';
  else h = '<h3>' + esc(SEED.t) + '</h3><p>' + esc(SEED.b[0]) + '</p><p><button type="button" class="primary" data-go="seed">Go to the seed</button></p>';
  if (ties.length) h += '<h3 style="font:700 14px/1.3 var(--body);color:var(--dim);margin-top:16px">Tied to</h3><div class="next">' + ties.map(function (t) { return '<button type="button" class="go" data-atlas="' + t + '">' + esc(aName(t)) + '</button>'; }).join('') + '</div>';
  $('#a-card').innerHTML = h; $('#a-card').scrollTop = 0;
}
function openAtlas() {
  buildAtlas(); $('#atlas').hidden = false; atlas.open = true; $('#a-results').hidden = true; $('#a-search').value = '';
  atlas.x = atlas.y = 0; atlas.k = 1; atlasApply();
  atlasSelect(state.loc !== 'tree' ? state.loc : (state.focus && AP[state.focus === 'roots' ? 'living-library' : state.focus]) ? (state.focus === 'roots' ? 'living-library' : state.focus) : 'trunk');
  try { $('#a-close').focus(); } catch (e) {}
}
function closeAtlas() { var a = $('#atlas'); if (a && !a.hidden) { a.hidden = true; atlas.open = false; dirty = true; } }
function atlasSearch(q) {
  var box = $('#a-results'); q = q.trim().toLowerCase();
  if (q.length < 2) { box.hidden = true; return; }
  var out = [];
  WORLDS.forEach(function (w) {
    if ((w.name + ' ' + w.intro + ' ' + w.look).toLowerCase().indexOf(q) >= 0) out.push([w.id, w.name, w.look]);
    w.stars.forEach(function (s) {
      var hay = (s.t + ' ' + (s.name || '') + ' ' + (s.short || '') + ' ' + (s.b || []).join(' ') + ' ' + (s.list || []).join(' ') + ' ' + (s.status || '')).toLowerCase();
      if (hay.indexOf(q) >= 0) out.push([w.id + ':' + s.id, s.t, 'In ' + w.name]);
    });
  });
  if ((TRUNK.t + TRUNK.b.join(' ')).toLowerCase().indexOf(q) >= 0) out.push(['tree:trunk', TRUNK.t, 'On the Tree']);
  if ((SEED.t + SEED.invites.map(function (v) { return v.t + v.b; }).join(' ')).toLowerCase().indexOf(q) >= 0) out.push(['seed', SEED.t, 'On the Tree']);
  box.innerHTML = out.length ? out.slice(0, 30).map(function (o) { return '<button type="button" class="go" data-go="' + o[0] + '">' + esc(o[1]) + '<small>' + esc(o[2]) + '</small></button>'; }).join('')
    : '<p class="fine" style="margin:8px">Nothing in the universe matches that yet. Try a movement, a principle, or a work by name.</p>';
  box.hidden = false;
}

/* ---------- sound: generated on the device, never started without a tap ---------- */
var TONES = { tree: 130.81, ground: 130.81, witness: 146.83, name: 164.81, differentiate: 174.61, converge: 196, covenant: 220, 'return': 246.94,
  vision: 196, 'living-tree': 174.61, 'living-works': 164.81, 'federation-structure': 146.83, 'path-ahead': 220, 'living-library': 110, 'the-scroll': 123.47 };
var Sound = { ctx: null, master: null, voices: [], on: false, hushed: false, root: 130.81,
  start: function () {
    try {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
        var c = this.ctx = new AC(), lp = c.createBiquadFilter(), self = this;
        this.master = c.createGain(); this.master.gain.value = 0;
        lp.type = 'lowpass'; lp.frequency.value = 900; this.master.connect(lp); lp.connect(c.destination);
        [[.5, .22, 'sine'], [1, .5, 'sine'], [1.5, .2, 'sine'], [2.005, .1, 'triangle']].forEach(function (v) {
          var o = c.createOscillator(), g = c.createGain(); o.type = v[2]; o.frequency.value = self.root * v[0]; g.gain.value = v[1];
          o.connect(g); g.connect(self.master); o.start(); self.voices.push({ o: o, r: v[0] });
        });
        var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = .07; lg.gain.value = 260; l.connect(lg); lg.connect(lp.frequency); l.start();
      }
      this.ctx.resume(); this.on = true; this.setWorld(state.loc); this.level();
      return true;
    } catch (e) { return false; }
  },
  stop: function () { this.on = false; this.level(); },
  level: function () { if (this.ctx) this.master.gain.setTargetAtTime(this.on && !this.hushed ? state.set.vol * .16 : 0, this.ctx.currentTime, .6); },
  hush: function (h) { this.hushed = h; this.level(); },
  setWorld: function (id) {
    this.root = TONES[id] || TONES.tree;
    if (!this.ctx) return; var t = this.ctx.currentTime, r = this.root;
    this.voices.forEach(function (v) { v.o.frequency.setTargetAtTime(r * v.r, t, 1.1); });
  },
  chime: function () {
    if (!this.on || !this.ctx || this.hushed) return;
    try {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = 'sine'; o.frequency.value = this.root * 4; g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(state.set.vol * .07, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 1.5);
    } catch (e) {}
  }
};
function setSound(on) {
  if (on && !Sound.start()) { on = false; toast('Sound is not available in this browser.'); }
  if (!on) Sound.stop();
  state.set.sound = on;
  $('#btn-sound').setAttribute('aria-pressed', String(on)); $('#pref-sound').checked = on;
}

/* ---------- comfort sheet ---------- */
function openPrefs() { $('#prefs').hidden = false; try { $('#prefs-close').focus(); } catch (e) {} }
function closePrefs() { $('#prefs').hidden = true; try { $('#btn-menu').focus(); } catch (e) {} }
function setPaused(p) {
  state.paused = p; $('#btn-pause').setAttribute('aria-pressed', String(p));
  $('#btn-pause').setAttribute('aria-label', p ? 'Resume motion' : 'Pause all motion');
  if (p) { tween = null; vel.y = vel.p = 0; } dirty = true; journeySchedule();
  toast(p ? 'Motion paused. The view holds still until you resume.' : 'Motion resumed.');
}

/* ---------- first-visit nudge ---------- */
function setNudge() { state.nudge = true; var n = nodeById(scenes.tree, 'ground'); if (n && n.el) n.el.classList.add('nudge'); }
function clearNudge() { if (!state.nudge) return; state.nudge = false; $$('.node.nudge').forEach(function (b) { b.classList.remove('nudge'); }); }

/* ---------- progress ---------- */
function updateCount() {
  var n = WORLDS.filter(function (w) { return state.visited[w.id]; }).length, d = WORLDS.filter(function (w) { return worldDone(w.id); }).length, el = $('#count');
  if (!el) return;
  el.hidden = n === 0;
  el.textContent = 'Visited ' + n + ' of ' + WORLDS.length + ' worlds' + (d ? ', ' + d + ' fully lit' : '');
}

/* ---------- walking the cycle from world to world ---------- */
function updateMnav() {
  var w = WORLD[state.loc], nav = $('#mnav');
  if (!nav) return;
  if (!w || w.type !== 'movement' || state.mode !== 'explore') { nav.hidden = true; return; }
  var pv = MOVEMENTS[(w.n + 5) % 7], nx = MOVEMENTS[w.n % 7];
  nav.hidden = false;
  $('#m-prev').dataset.go = pv.id; $('#m-prev').innerHTML = '<span aria-hidden="true">&lsaquo;</span> ' + esc(pv.name);
  $('#m-prev').setAttribute('aria-label', 'Previous movement: ' + pv.name);
  $('#m-next').dataset.go = nx.id; $('#m-next').innerHTML = esc(nx.name) + ' <span aria-hidden="true">&rsaquo;</span>';
  $('#m-next').setAttribute('aria-label', 'Next movement: ' + nx.name + (w.n === 7 ? ', the cycle begins again' : ''));
  $('#m-pos').textContent = w.n + ' of 7';
}

/* ---------- narration: the Claude voice where offered, the browser's voice otherwise ---------- */
var DL = null;
var Voice = { t: null, on: false, done: Promise.resolve(),
  show: function () { var b = $('#j-voice'); if (b) b.hidden = false; },
  init: function () {
    var self = this, fallback = function () { if (window.speechSynthesis && window.SpeechSynthesisUtterance) self.show(); };
    try {
      if (window.claude && window.claude.use) {
        window.claude.use('tts').then(function (t) { if (t) { self.t = t; self.show(); } else fallback(); }, fallback);
        window.claude.use('downloads').then(function (d) { DL = d || null; }, function () {});
      } else fallback();
    } catch (e) { fallback(); }
  },
  speak: function (text) {
    var self = this;
    return new Promise(function (res) {
      if (!self.on) return res();
      if (self.t) {
        self.t.speak(text, { voice: 'airy', rate: .95, language: 'en' }).then(res, function (e) {
          if (e && (e.code === 'not_granted' || e.code === 'unavailable')) { self.t = null; self.setOn(false); toast('Narration is not available here.'); }
          res();
        });
        return;
      }
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text); u.rate = .95; u.lang = 'en';
        u.onend = u.onerror = function () { res(); };
        speechSynthesis.speak(u);
      } catch (e) { res(); }
    });
  },
  stop: function () { try { if (this.t) this.t.stop(); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} },
  setOn: function (on) {
    this.on = on; var b = $('#j-voice');
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Stop narration' : 'Narrate';
    if (!on) this.stop();
  }
};
function saveWalk() {
  var d = new Date(), txt = 'My walk through the seven movements\n' + d.toDateString() + '\n\n';
  MOVEMENTS.forEach(function (m, j) { txt += m.n + '. ' + m.name + '\n' + m.q + '\n' + (walk.notes[j] || '(nothing written)') + '\n\n'; });
  txt += 'From the Living Universe of the AI Freedom Trust Federation.\nA reflection, not legal, medical or financial advice.\n';
  if (!DL) { toast('Saving files is not available here. Use Copy instead.'); return; }
  DL.save({ filename: 'my-seven-movements.txt', data: txt }).then(function () { toast('Saved your notes.'); }, function (e) {
    var c = e && e.code;
    toast(c === 'declined' ? 'Not saved. Your notes are still here.' : c === 'rate_limited' ? 'A save is already waiting for your answer.' : 'Saving is not available here. Use Copy instead.');
  });
}

/* ---------- the arrival ---------- */
var arrival = { on: false, t: 0, net: null, cap: -1 };
var CAPS = [[2.4, 'A living federation for human freedom in the age of intelligence.'], [7.6, 'One root.'], [9.7, 'One root. Many branches.'], [11.8, 'One root. Many branches. Every fruit returns to its source.']];
function buildNet() {
  var r = RNG(5), P = [], E = [], i, j;
  for (i = 0; i < 84; i++) { var u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u), R = .5 + Math.pow(r(), .6) * 3.0; P.push([s * Math.cos(th) * R, .07 + u * R * .8, s * Math.sin(th) * R]); }
  P.forEach(function (p, i) {
    var best = [];
    for (j = 0; j < P.length; j++) if (j !== i) best.push([dist2(p, P[j]), j]);
    best.sort(function (a, b) { return a[0] - b[0]; });
    for (j = 0; j < 2; j++) E.push([i, best[j][1], Math.sqrt(Math.min(dist2(p, [0, .07, 0]), dist2(P[best[j][1]], [0, .07, 0])))]);
  });
  arrival.net = { P: P, E: E };
}
function drawArrival(ctx) {
  var t = arrival.t, N = arrival.net, i, a, k, x0, y0, md = Math.min(V.W, V.H);
  if (!proj(0, .07, 0)) return; x0 = px; y0 = py;
  ctx.strokeStyle = C.pearl; ctx.lineWidth = 1.2;
  for (i = 0; i < 6; i++) {
    k = (t - .9 - i * .55) / 4.2; if (k <= 0 || k >= 1) continue;
    ctx.globalAlpha = Math.sin(k * Math.PI) * .5; ctx.beginPath(); ctx.arc(x0, y0, k * md * .62, 0, TAU); ctx.stroke();
  }
  a = smooth(1.6, 3, t) * (1 - smooth(5.6, 7.2, t));
  if (a > .01) {
    var rr = md * .085 * (1 + smooth(1.6, 7, t) * .5); ctx.globalAlpha = a * .5;
    ctx.beginPath(); ctx.arc(x0, y0, rr, 0, TAU); ctx.stroke();
    for (i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x0 + Math.cos(i / 6 * TAU + t * .05) * rr, y0 + Math.sin(i / 6 * TAU + t * .05) * rr, rr, 0, TAU); ctx.stroke(); }
  }
  if (t > 2.4 && t < 8.2) {
    var g = ease(smooth(5.6, 7.5, t)), fade = 1 - smooth(7.3, 8.1, t), S2 = [], p;
    for (i = 0; i < N.P.length; i++) {
      p = N.P[i];
      if (proj(lerp(p[0], 0, g), lerp(p[1], .07, g), lerp(p[2], 0, g))) S2.push([px, py, ps]); else S2.push(null);
    }
    ctx.lineWidth = 1;
    for (i = 0; i < N.E.length; i++) {
      var e = N.E[i], A = S2[e[0]], B = S2[e[1]]; if (!A || !B) continue;
      a = smooth(2.5 + e[2] * .85, 3.1 + e[2] * .85, t) * fade; if (a <= .01) continue;
      ctx.globalAlpha = a * .5; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    }
    for (i = 0; i < S2.length; i++) {
      if (!S2[i]) continue; a = smooth(2.4, 4.5, t) * fade * (1 - g * .93); var sz = Math.max(3, S2[i][2] * .07);
      ctx.globalAlpha = a; ctx.drawImage(sprite(i % 5 === 0 ? C.pearl : '#cfd6ff'), S2[i][0] - sz, S2[i][1] - sz, sz * 2, sz * 2);
    }
  }
  a = smooth(6.6, 7.6, t) * (1 - smooth(8.2, 10.5, t));
  if (a > .01) { var fs = md * .28 * a; ctx.globalAlpha = a; ctx.drawImage(sprite(C.white), x0 - fs, y0 - fs, fs * 2, fs * 2); }
}
function startArrival() {
  var S = scenes.tree;
  arrival.on = true; arrival.t = 0; arrival.cap = -1; state.arriving = true; app.classList.add('arriving');
  $('#arrival').hidden = false; $('#a-invite').hidden = true; $('#a-enter').hidden = true; $('#a-cap').hidden = false; $('#a-cap').textContent = '';
  $('#a-skip').hidden = false; $('#a-quiet').hidden = false;
  if (state.loc !== 'tree') setScene('tree');
  cur = S; S.grow = 0; S.hi = null; S.cam = { yaw: -1.2, pitch: .16, zoom: 1.15, tx: 0, ty: .07, tz: 0 };
  if (!arrival.net) buildNet();
  S.overlay = drawArrival;
}
function stepArrival(dt) {
  var a = arrival, S = scenes.tree, c = S.cam; a.t += dt * 1.5; var t = a.t;
  S.grow = clamp((t - 7.2) / 6.2, 0, .999);
  var k1 = smooth(0, 7.2, t), k2 = smooth(7.4, 13.6, t);
  c.yaw = -1.2 + t * .046; c.zoom = lerp(lerp(1.15, 2.3, k1), 1, k2); c.ty = lerp(.07, 1.25, k2); c.pitch = lerp(.16, .1, k2);
  for (var i = CAPS.length - 1; i > a.cap; i--) if (t >= CAPS[i][0]) { a.cap = i; $('#a-cap').textContent = CAPS[i][1]; break; }
  if (t > 14) endArrival();
}
function endArrival() {
  var S = scenes.tree;
  arrival.on = false; S.grow = 1; S.overlay = null;
  $('#a-cap').hidden = true; $('#a-invite').hidden = false; $('#a-enter').hidden = false; $('#a-skip').hidden = true;
  try { $('#a-enter').focus({ preventScroll: true }); } catch (e) {}
}
function enterUniverse(quiet) {
  var S = scenes.tree;
  arrival.on = false; S.grow = 1; S.overlay = null; state.arriving = false; state.seenArrival = true;
  app.classList.remove('arriving'); $('#arrival').hidden = true;
  if (quiet) setMotion('gentle');
  if (state.loc === 'tree') { cur = S; var from = copy(S.cam); S.cam = from; flyTo(S.home, 1400); }
  idleAt = now(); measureLabels(); crumbs(); save(); dirty = true;
  if (state.loc === 'tree') {
    var fresh = !WORLDS.some(function (w) { return state.visited[w.id]; });
    if (fresh) { setNudge(); toast('Touch a branch to begin. The pulsing light is Ground, the first movement. Drag to turn the Tree.', 10000); }
    else toast('Drag to turn the Tree. Pinch or scroll to come closer.', 6000);
  }
  try { stage.focus({ preventScroll: true }); } catch (e) {}
}

/* ---------- start ---------- */
function hashWorld() { try { var h = decodeURIComponent(location.hash.slice(1)); return (WORLD[h] || h === 'reflect') ? h : null; } catch (e) { return null; } }
function boot(snap) {
  app = $('#app'); stage = $('#stage'); cv = $('#sky'); nodesEl = $('#nodes'); panel = $('#panel'); panelBody = $('#panel-body');
  bloomEl = $('#bloom'); liveEl = $('#live'); hintEl = $('#hint');
  var startHash = hashWorld(), remembered = load();
  var reduce = false, small = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  try { small = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4; } catch (e) {}
  if (!remembered) { state.set.motion = reduce ? 'still' : 'full'; state.set.intensity = small ? 'balanced' : 'rich'; }
  else perfLocked = true;
  initSky();
  setIntensity(state.set.intensity, true); setMotion(state.set.motion);
  scenes.tree = buildTree(); booting = true; setScene('tree'); booting = false;
  $('#legend').innerHTML = legendHTML();
  $('#pref-vol').value = state.set.vol; $('#pref-remember').checked = state.set.remember;

  wireStage(); wirePanel();
  window.addEventListener('resize', function () { resize(); measureLabels(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measureLabels(); dirty = true; });
  $$('.modes button').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  $('#btn-tree').addEventListener('click', back);
  $('#btn-atlas').addEventListener('click', openAtlas);
  $('#btn-export').addEventListener('click', function () {
    // Private, explicit export; no remote service.
    var record = { format: 'aift-living-universe-journey', version: 1,
      exportedAt: new Date().toISOString(),
      visited: JSON.parse(JSON.stringify(state.visited)),
      found: JSON.parse(JSON.stringify(state.found)) };
    var blob = new Blob([JSON.stringify(record, null, 2) + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'living-universe-journey.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    announce('Your journey export has been prepared. It stays on your device.');
  });
  $('#btn-import').addEventListener('click', function () { $('#journey-file').click(); });
  $('#journey-file').addEventListener('change', function () {
    var input = this, file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast('That journey file is too large.'); input.value = ''; return; }
    var reader = new FileReader();
    reader.onerror = function () { toast('Unable to read that journey file.'); input.value = ''; };
    reader.onload = function () {
      try {
        var d = JSON.parse(String(reader.result));
        if (!d || d.format !== 'aift-living-universe-journey' || d.version !== 1 ||
            !d.visited || !d.found || Array.isArray(d.visited) || Array.isArray(d.found) ||
            typeof d.visited !== 'object' || typeof d.found !== 'object') throw Error('format');
        var visited = Object.create(null), found = Object.create(null), count = 0;
        Object.keys(d.visited).forEach(function (id) {
          if (Object.prototype.hasOwnProperty.call(WORLD, id) && d.visited[id] === true) {
            visited[id] = true; count++;
          }
        });
        Object.keys(d.found).forEach(function (id) {
          if (Object.prototype.hasOwnProperty.call(STAR, id) && d.found[id] === true) {
            found[id] = true; count++;
          }
        });
        if (!window.confirm('Restore ' + count + ' saved discoveries and visits? This will replace your current journey progress.')) return;
        state.visited = visited; state.found = found;
        save(); refresh(); dirty = true;
        announce('Your saved journey has been restored.'); toast('Journey restored.');
      } catch (e) { toast('This is not a valid Living Universe journey export.'); }
      finally { input.value = ''; }
    };
    reader.readAsText(file);
  });
  $('#a-close').addEventListener('click', function () { closeAtlas(); try { $('#btn-atlas').focus(); } catch (e) {} });
  $('#a-search').addEventListener('input', function () { atlasSearch(this.value); });
  $('#atlas').addEventListener('click', function (e) { var b = e.target.closest('[data-atlas]'); if (b) atlasSelect(b.dataset.atlas); });
  $('#az-in').addEventListener('click', function () { atlasZoom(atlas.k * 1.35); });
  $('#az-out').addEventListener('click', function () { atlasZoom(atlas.k / 1.35); });
  $('#az-fit').addEventListener('click', function () { atlas.x = atlas.y = 0; atlasZoom(1); });
  $('#z-in').addEventListener('click', function () { zoomBy(1.3); });
  $('#z-out').addEventListener('click', function () { zoomBy(1 / 1.3); });
  $('#z-fit').addEventListener('click', fitView);
  $('#btn-sound').addEventListener('click', function () { setSound(!state.set.sound); });
  $('#btn-pause').addEventListener('click', function () { setPaused(!state.paused); });
  $('#btn-menu').addEventListener('click', openPrefs);
  $('#prefs-close').addEventListener('click', closePrefs);
  $('#prefs').addEventListener('click', function (e) { if (e.target === this) closePrefs(); });
  $$('input[name="motion"]').forEach(function (r) { r.addEventListener('change', function () { setMotion(r.value); }); });
  $$('input[name="intensity"]').forEach(function (r) { r.addEventListener('change', function () { perfLocked = true; setIntensity(r.value); }); });
  $('#pref-sound').addEventListener('change', function () { setSound(this.checked); });
  $('#pref-vol').addEventListener('input', function () { state.set.vol = +this.value; Sound.level(); save(); });
  $('#pref-remember').addEventListener('change', function () {
    state.set.remember = this.checked;
    if (this.checked) { save(); toast('Your journey will be remembered on this device.'); }
    else { try { localStorage.removeItem(STORE); } catch (e) {} toast('Nothing is stored. Your journey lasts until you close this page.'); }
  });
  $('#pref-forget').addEventListener('click', function () { forget(); if (atlas.built) atlasMark(); toast('Your journey has been forgotten.'); });
  $('#pref-replay').addEventListener('click', function () {
    closePrefs(); closePanel(); if (state.mode !== 'explore') setMode('explore', true, true);
    var play = function () { state.focus = null; refresh(); if (state.set.motion === 'still') setMotion('full'); if (state.paused) setPaused(false); startArrival(); };
    if (state.loc !== 'tree') { setScene('tree'); }
    play();
  });
  $('#j-prev').addEventListener('click', function () { showStop(J.i - 1); });
  $('#j-next').addEventListener('click', function () { showStop(J.i + 1); });
  $('#j-play').addEventListener('click', function () { J.playing = !J.playing; journeySchedule(); });
  $('#j-voice').addEventListener('click', function () {
    Voice.setOn(!Voice.on);
    if (Voice.on) Voice.done = Voice.speak(JOURNEY[J.i].cap);
    journeySchedule();
  });
  Voice.init();
  $('#a-enter').addEventListener('click', function () { enterUniverse(false); });
  $('#a-skip').addEventListener('click', function () { enterUniverse(false); });
  $('#a-quiet').addEventListener('click', function () { enterUniverse(true); });
  $('#skiplink').addEventListener('click', function (e) { e.preventDefault(); if (state.arriving) enterUniverse(false); setMode('reflect'); });
  // Keep keyboard focus inside whichever modal is open.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var modal = !$('#prefs').hidden ? $('#prefs') : (!$('#atlas').hidden ? $('#atlas') : null);
    if (!modal) return;
    var items = $$( 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (el) { return !el.hidden && el.getClientRects().length > 0; });
    if (!items.length) { e.preventDefault(); modal.focus(); return; }
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#prefs').hidden) closePrefs(); else if (!$('#atlas').hidden) { closeAtlas(); $('#btn-atlas').focus(); }
    else if (state.arriving) enterUniverse(false); else if (state.mode === 'reflect') setMode('explore'); else if (state.panel) { keepNote(); closePanel(); } else back();
  });
  window.addEventListener('hashchange', function () {
    var h = hashWorld(); if (!h || state.arriving || busy) return;
    if (h === 'reflect') { setMode('reflect'); return; }
    if (h !== state.loc) { if (state.mode === 'reflect') reflectGo(h); else go(h); }
  });
  document.addEventListener('visibilitychange', function () { if (Sound.ctx) { if (document.hidden) Sound.ctx.suspend(); else if (Sound.on) Sound.ctx.resume(); } lastT = now(); });

  var start = (snap && WORLD[snap.loc]) ? snap.loc : startHash;
  if (start === 'reflect') { enterUniverse(false); hintEl.classList.remove('on'); setMode('reflect', true); }
  else if (start && WORLD[start]) { setScene(start); enterUniverse(false); hintEl.classList.remove('on'); showWorld(start); }
  else if (reduce || state.set.motion === 'still' || (remembered && state.seenArrival) || (snap && snap.loc)) enterUniverse(false);
  else startArrival();
  requestAnimationFrame(frame);
}
try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(function () { return { loc: state.loc }; }); } catch (e) {}
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot); else boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
