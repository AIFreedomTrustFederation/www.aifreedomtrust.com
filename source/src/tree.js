/* The Tree of Emergence. Pale light rises from one root through the trunk and opens into
   seven colors along seven branches, lowest to highest: Ground at the base, Return at the crown.
   Six fruits hang between the branches, attached to the trunk and to no single movement. */
function leafLabel(s) { return s.t.indexOf(':') > 0 ? s.t.split(':')[0] : (s.short || s.t); }

function buildTree() {
  var S = new Scene({ fit: { w: 4.1, h: 6.1 }, center: [0, 1.25, 0], yaw: -.55, pitch: .1,
    bg: ['#030409', '#0a0b1e'], neb: ['#3b2f86', '#17485c', '#5a2452'], spin: .035, pitchLim: [-.35, .8] });
  var r = RNG(11), H = 2.72, i, j, k, u, s, pts;

  /* The green plane at the foot of the Tree: the living present, where every cycle begins and ends. */
  for (k = 1; k <= 5; k++) S.line(circle(0, 0, 0, k * .5, 'y', 64), C.green, .006, { a: k === 2 ? .22 : .12, t0: .02, t1: .22, closed: true, halo: false, tag: 'plane' });
  for (k = 0; k < 6; k++) S.line(circle(Math.cos(k / 6 * TAU) * .5, 0, Math.sin(k / 6 * TAU) * .5, .5, 'y', 48), C.green, .005, { a: .08, t0: .05, t1: .25, closed: true, halo: false, tag: 'plane' });

  var strands = [];
  for (s = 0; s < 9; s++) {
    pts = []; var a0 = s / 9 * TAU;
    for (i = 0; i <= 28; i++) {
      u = i / 28; var y = u * H, rad = .018 + .15 * Math.pow(1 - u, 1.25) + .17 * Math.pow(1 - u, 7), ang = a0 + u * 2.6 + Math.sin(u * 6 + s) * .12;
      pts.push([Math.cos(ang) * rad, y, Math.sin(ang) * rad]);
    }
    strands.push(pts);
    S.line(pts, mix(C.pearl, C.white, (s % 3) / 2), .015, { t0: .14, t1: .5, tag: 'core', sway: true, a: .72, halo: s % 3 === 0 });
  }

  for (i = 0; i < 7; i++) {
    var ang0 = i / 7 * TAU + .35, bend = (r() - .5) * .5, reach = 1.25 + r() * .45, depth = 1.0 + r() * .35;
    pts = [];
    for (j = 0; j <= 20; j++) {
      u = j / 20; var a = ang0 + bend * u + Math.sin(u * 5 + i) * .08, rad2 = .1 + u * reach;
      pts.push([Math.cos(a) * rad2, .12 - depth * Math.pow(u, 1.35) - .12 * Math.sin(u * Math.PI), Math.sin(a) * rad2]);
    }
    S.line(pts, mix(C.pearl, C.amber, .25), .018, { t0: 0, t1: .3, tag: 'core', a: .8 });
    for (k = 0; k < 3; k++) {
      var st = pts[8 + k * 4], q = [], a2 = ang0 + (r() - .5) * 1.6, dr = .25 + r() * .1;
      for (j = 0; j <= 8; j++) { u = j / 8; q.push([st[0] + Math.cos(a2) * u * .45, st[1] - u * dr - u * u * .15, st[2] + Math.sin(a2) * u * .45]); }
      S.line(q, mix(C.pearl, C.amber, .5), .008, { t0: .12, t1: .36, tag: 'core', a: .55, halo: false });
      S.dot(q[8][0], q[8][1], q[8][2], .05, C.pearl, { a: .6, t0: .36 });
    }
  }

  S.flows = []; S.tips = {}; var leafSpots = {};
  MOVEMENTS.forEach(function (m, i) {
    var col = m.color, y0 = 1.02 + i * .27, phi = i * 2.39996 + .4, el = (i === 6 ? 84 : 12 + i * 10.5) * Math.PI / 180, len = 1.78 - i * .125;
    var dx = Math.cos(el) * Math.cos(phi), dy = Math.sin(el), dz = Math.cos(el) * Math.sin(phi), limb = [], j, k, u;
    for (j = 0; j <= 22; j++) {
      u = j / 22; var lift = i === 6 ? 0 : len * .24 * u * u, wob = Math.sin(u * 7 + i * 2) * .03 * u;
      limb.push([.05 * dx + dx * len * u + wob * dz, y0 + dy * len * u + lift, .05 * dz + dz * len * u - wob * dx]);
    }
    var t0 = .36 + i * .045, t1 = Math.min(.94, t0 + .3);
    S.line(limb.slice(0, 9), mix(C.pearl, col, .38), .026, { t0: t0, t1: t0 + .12, tag: m.id, sway: true });
    S.line(limb.slice(8, 16), mix(C.pearl, col, .75), .021, { t0: t0 + .1, t1: t0 + .21, tag: m.id, sway: true });
    S.line(limb.slice(15), col, .016, { t0: t0 + .2, t1: t1, tag: m.id, sway: true });
    var tip = limb[22], spots = []; S.tips[m.id] = tip;
    for (k = 0; k < 7; k++) {
      var bu = .28 + k * .11, b0 = limb[Math.round(bu * 22)], side = k % 2 ? 1 : -1;
      var a = phi + side * (.9 + r() * .5), up = .25 + r() * .5, bl = (.34 + r() * .22) * (1 - bu * .35) + .12, q = [];
      for (j = 0; j <= 9; j++) { u = j / 9; q.push([b0[0] + Math.cos(a) * bl * u * Math.cos(up), b0[1] + Math.sin(up) * bl * u + .06 * u * u, b0[2] + Math.sin(a) * bl * u * Math.cos(up)]); }
      S.line(q, col, .009, { t0: t0 + .2 + bu * .08, t1: t1 + .03, tag: m.id, sway: true, a: .8 });
      var e = q[9]; if (k < 5) spots.push(e);
      for (var w = 0; w < 2; w++) {
        var a3 = a + (r() - .5) * 1.8, tl = .12 + r() * .14, lf = .3 + r() * .4, tw = [e];
        for (j = 1; j <= 4; j++) { u = j / 4; tw.push([e[0] + Math.cos(a3) * tl * u, e[1] + tl * u * lf, e[2] + Math.sin(a3) * tl * u]); }
        S.line(tw, col, .006, { t0: t1 - .02, t1: t1 + .05, tag: m.id, sway: true, a: .6, halo: false });
        for (j = 0; j < 4; j++) {
          var lp = tw[1 + j];
          S.dot(lp[0] + (r() - .5) * .1, lp[1] + (r() - .5) * .1, lp[2] + (r() - .5) * .1, .045 + r() * .06, mix(col, C.white, r() * .5),
            { t0: Math.min(.97, t1 + r() * .04), tag: m.id, a: .85, sway: true });
        }
      }
    }
    leafSpots[m.id] = spots;
    S.dot(tip[0], tip[1], tip[2], .3, col, { t0: t1, tag: m.id, a: .7, sway: true, tw: 0 });
    var sp = strands[i % 9], path = [];
    for (j = 0; j < sp.length && sp[j][1] < y0; j++) path.push(sp[j]);
    S.flows.push({ path: path.concat(limb), col: col, id: m.id });
    S.node({ id: m.id, kind: 'movement', x: tip[0], y: tip[1], z: tip[2], r: .085, color: col, label: m.name, pri: 3, t0: t1, phi: phi, sway: true });
  });

  S.flows.forEach(function (f, fi) {
    [0, .5].forEach(function (off) {
      var ph = fi * .137 + off;
      S.dot(0, 0, 0, .1, f.col, { t0: .98, tag: f.id, tw: 0, a: .9, dyn: function (d, t) {
        var uu = (t * .06 + ph) % 1, p = polyAt(f.path, uu);
        d.x = p[0]; d.y = p[1]; d.z = p[2]; d.a = Math.sin(uu * Math.PI) * .95;
      } });
    });
  });

  FRUITS.forEach(function (f, j) {
    var y = 1.18 + j * .27, phi = (j + .5) * 2.39996 + .4 + Math.PI, reach = .8 + (j % 2) * .14, pts = [], k, u;
    for (k = 0; k <= 14; k++) { u = k / 14; var rad = .06 + u * reach; pts.push([Math.cos(phi) * rad, y + Math.sin(u * Math.PI * .9) * .2 - u * u * .34, Math.sin(phi) * rad]); }
    S.line(pts, mix(C.pearl, C.amber, .6), .011, { t0: .62, t1: .86, tag: 'core', sway: true, a: .75 });
    var e = pts[14];
    S.dot(e[0], e[1] - .02, e[2], .34, C.amber, { t0: .88, a: .7, tw: 0, sway: true });
    S.node({ id: f.id, kind: 'fruit', x: e[0], y: e[1] - .02, z: e[2], r: .1, color: C.amber, label: f.name, num: f.num, pri: 2, t0: .88, phi: phi, sway: true });
  });

  S.dot(0, .07, 0, .42, C.white, { t0: 0, a: .9, tw: 0 });
  S.node({ id: 'seed', kind: 'seed', x: 0, y: .07, z: 0, r: .07, color: C.white, label: 'The seed', pri: 2, t0: .02 });
  S.node({ id: 'trunk', kind: 'trunk', x: 0, y: .74, z: 0, r: .065, color: C.pearl, label: 'The trunk', pri: 1, t0: .5 });
  S.node({ id: 'roots', kind: 'roots', x: 0, y: -.95, z: 0, r: .08, color: C.pearl, label: 'The roots', pri: 2, t0: .3 });
  var top = S.tips['return'];
  S.dot(top[0], top[1] + .05, top[2], .6, C.white, { t0: .97, a: .45, tw: 0, sway: true });

  MOVEMENTS.forEach(function (m) {
    var sp = leafSpots[m.id];
    m.stars.forEach(function (st, k) {
      var p = sp[k % sp.length];
      S.node({ id: m.id + ':' + st.id, kind: 'leaf', parent: m.id, star: st.id, x: p[0], y: p[1] + .04, z: p[2], r: .04,
        color: mix(m.color, C.white, .4), label: leafLabel(st), pri: 1, hidden: true, t0: .99, sway: true });
    });
  });

  /* Drifting dust, so the dark around the Tree has depth. */
  for (i = 0; i < 150; i++) {
    var d = S.dot((r() - .5) * 7, -1.5 + r() * 6, (r() - .5) * 7, .02 + r() * .03, r() < .3 ? C.pearl : '#cfd6ff', { a: .25 + r() * .4, env: true });
    d.ph = r() * TAU;
    d.dyn = function (d, t) { d.x = d.ox + Math.sin(t * .11 + d.ph) * .25; d.y = d.oy + Math.cos(t * .09 + d.ph * 1.7) * .2; };
  }
  return S;
}
