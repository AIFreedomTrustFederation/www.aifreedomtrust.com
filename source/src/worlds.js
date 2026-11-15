/* Thirteen world environments. The seven movement worlds follow the visual directions for the
   red, orange, golden, green, blue, indigo and violet worlds. They are settings for the
   movements, not definitions of them. */
function layoutMovement(n) {
  return n >= 5
    ? [[0, .35, 0], [-.95, 1.3, -.3], [.95, 1.2, .2], [-.9, -.6, .25], [.9, -.7, -.2]]
    : [[0, .35, 0], [0, 1.5, -.2], [-.95, -.5, .2], [.95, -.5, -.1]];
}
var LAYOUT = {
  'vision': [[0, .3, 0], [-1.0, 1.1, .15], [0, 1.8, -.2], [1.0, 1.1, .1], [-1.15, -.5, .2], [-.42, -1.2, -.1], [.42, -1.2, .1], [1.15, -.5, -.2]],
  'living-tree': [[-1.0, 1.7, .1], [0, -1.8, 0], [0, -1.15, .2], [0, -.2, .1], [-.8, .5, .2], [.85, .8, -.2], [-.5, 1.15, -.2], [.55, 1.55, .15], [1.0, -.8, -.1]],
  'living-works': [[-.75, -1.1, .3], [.75, -.6, -.2], [-.75, -.1, .1], [.75, .4, .25], [-.75, .9, -.2], [.75, 1.4, .1], [-.75, 1.9, -.3]],
  'federation-structure': [[0, .3, 0], [-.85, 1.3, .2], [.85, 1.3, -.2], [-.85, -.7, -.2], [.85, -.7, .2]],
  'path-ahead': [[.35, 2.35, -2.6], [-.78, -1.8, .5], [.78, -1.25, .3], [-.78, -.7, .1], [.78, -.15, -.1], [-.78, .4, -.3], [.78, .95, -.5], [-.6, 1.5, -.7]],
  'living-library': [[0, -1.75, .2], [-.95, .55, .2], [.95, .55, -.2], [-.95, -.35, -.25], [.95, -.35, .25], [-.95, -1.2, .15], [.95, -1.2, -.15]],
  'the-scroll': [[0, .3, 0], [-.75, 1.0, .2], [.75, 1.0, -.2], [-.75, -.45, -.2], [.75, -.45, .2],
    [-1.15, 1.95, 0], [0, 2.3, -.2], [1.15, 1.95, 0], [-1.3, .3, .3], [1.3, .3, -.3], [-1.15, -1.35, 0], [0, -1.8, .2], [1.15, -1.35, 0]]
};
/* Which star each constellation line starts from. -1 means the environment draws the tie itself. */
var CONS = {
  'living-tree': [4, -1, 1, 2, 3, 4, 5, 6, 3],
  'living-works': [-1, -1, -1, -1, -1, -1, -1],
  'living-library': [-1, -1, -1, -1, -1, -1, -1],
  'path-ahead': [7, -1, -1, -1, -1, -1, -1, -1],
  'the-scroll': [-1, 0, 0, 0, 0, 1, 0, 2, 1, 2, 3, 3, 4]
};
var STARCOL = {
  'vision-redshift': C.red, 'vision-greenshift': C.green, 'vision-blueshift': C.blue, 'vision-violetshift': C.violet,
  'lt-roots': C.green, 'lt-trunk': C.gold, 'lt-branches': C.blue, 'lt-leaves': C.violet, 'lt-flowers': C.pearl, 'lt-fruits': C.orange
};

function motes(S, r, n, col, box, fn) {
  for (var i = 0; i < n; i++) {
    var d = S.dot((r() - .5) * box[0], box[3] + r() * box[1], (r() - .5) * box[2], .03 + r() * .045,
      typeof col === 'function' ? col(r()) : col, { env: true, a: .35 + r() * .5 });
    d.v = .05 + r() * .12; d.ph = r() * TAU; d.h = box[1]; d.y0 = box[3]; d.wd = box[0]; d.dyn = fn;
  }
}
function rise(d, t) { d.y = d.y0 + ((d.oy - d.y0) + t * d.v) % d.h; d.x = d.ox + Math.sin(t * .4 + d.ph) * .12; }
function drift(d, t) { d.x = d.ox + Math.sin(t * .23 + d.ph) * .18; d.y = d.oy + Math.cos(t * .19 + d.ph * 1.3) * .14; }
function stream(d, t) { d.x = ((d.ox + d.wd / 2 + t * d.v * 2.4) % d.wd) - d.wd / 2; d.y = d.oy + Math.sin(t * .6 + d.ph) * .1; }

var ENV = {
  ground: function (S, r) {
    S.bg = ['#090205', '#220709']; S.neb = ['#5a1220', '#40100c', '#6a2a14']; S.sky = .22;
    var i, j, u, pts, a, R, x, z;
    for (i = 0; i < 7; i++) {
      var y = -2.0 + i * .16; R = 3.9 - i * .42; pts = [];
      for (j = 0; j < 56; j++) { u = j / 56 * TAU; var rr = R * (1 + .07 * Math.sin(u * 3 + i) + .04 * Math.sin(u * 7 + i * 2)); pts.push([Math.cos(u) * rr, y + .05 * Math.sin(u * 5 + i), Math.sin(u) * rr]); }
      S.line(pts, '#b8402f', .012, { a: .34, env: true, closed: true, halo: false });
    }
    for (i = 0; i < 18; i++) {
      a = r() * TAU; R = .5 + Math.sqrt(r()) * 2.9; x = Math.cos(a) * R; z = Math.sin(a) * R; var l = 1.2 + r() * 2.4, wx = r() * TAU; pts = [];
      for (j = 0; j <= 14; j++) { u = j / 14; pts.push([x + Math.sin(u * 4 + wx) * .12 * u, 3.2 - u * l, z + Math.cos(u * 3.3 + wx) * .12 * u]); }
      S.line(pts, mix('#ff7a4a', '#ffc08a', r()), .014, { a: .55, env: true });
      S.dot(pts[14][0], pts[14][1], pts[14][2], .09, '#ffb07a', { env: true, a: .7 });
    }
    for (i = 0; i < 20; i++) {
      a = r() * TAU; R = 1.3 + r() * 2.2; x = Math.cos(a) * R; z = Math.sin(a) * R;
      var h = .45 + r() * 1.0, wd = .07 + r() * .08, lx = (r() - .5) * .5, lz = (r() - .5) * .5, by = -1.95;
      var top = [x + lx * h, by + h, z + lz * h], bot = [x, by, z], mid = [], col = mix(C.red, '#ff2d7a', r());
      for (j = 0; j < 4; j++) { var q = j / 4 * TAU + a; mid.push([x + lx * h * .35 + Math.cos(q) * wd, by + h * .35, z + lz * h * .35 + Math.sin(q) * wd]); }
      for (j = 0; j < 4; j++) S.line([bot, mid[j], top], col, .008, { a: .7, env: true, halo: false });
      S.line(mid, col, .007, { a: .6, env: true, halo: false, closed: true });
      S.dot(top[0], top[1], top[2], .14, col, { env: true, a: .8 });
    }
    motes(S, r, 110, function (q) { return mix('#ff5a3a', '#ffc27a', q); }, [6, 5, 6, -2], rise);
  },

  witness: function (S, r) {
    S.bg = ['#080405', '#2e1305']; S.neb = ['#7a3a0c', '#5a1e10', '#8a5a14']; S.sky = .6;
    var i, j;
    S.dot(0, -.9, -7, 4.6, '#ff9a3d', { env: true, a: .5, tw: 0 });
    for (i = 0; i < 20; i++) (function (k) {
      var z = -4.2 + k * .36, n = 44, pts = [];
      for (var j = 0; j < n; j++) pts.push([-3.6 + j * (7.2 / (n - 1)), -1.5, z]);
      S.line(pts, mix('#ff7a1e', '#ffd69a', k / 20), .012, { a: .3 + .3 * (k / 20), env: true, halo: k % 2 === 0,
        dyn: function (t, p) { for (var j = 0; j < n; j++) { var x = p[j * 3]; p[j * 3 + 1] = -1.5 + .15 * Math.sin(x * 1.25 + t * .55 + k * .7) + .07 * Math.sin(x * 2.9 - t * .8 + k * 1.9); } } });
    })(i);
    for (i = 0; i < 5; i++) {
      var a = i / 5 * TAU + .6, R = 1.9 + r() * 1.2, x = Math.cos(a) * R, z = Math.sin(a) * R - .6, y = -.2 + r() * 1.9, rad = .3 + r() * .4;
      for (j = 0; j < 4; j++) S.line(circle(x, y - j * .09, z, rad * (1 - j * .24), 'y', 28), mix('#ffb463', '#ffe2b0', j / 4), .009, { a: .6 - j * .1, env: true, closed: true, halo: j === 0 });
      for (j = 0; j < 3; j++) { var fx = x + (r() - .5) * rad, fz = z + (r() - .5) * rad; S.line([[fx, y - .3, fz], [fx + .03, y - .6 - r() * .5, fz]], '#ffc98a', .006, { a: .4, env: true, halo: false }); }
      S.dot(x, y + .05, z, .3, '#ffc98a', { env: true, a: .45 });
    }
    motes(S, r, 120, function (q) { return mix('#ff8a2a', '#ffe0b0', q); }, [7.2, 3.6, 6, -1.4], stream);
  },

  name: function (S, r) {
    S.bg = ['#080602', '#30210a']; S.neb = ['#7a5a0c', '#5a3a08', '#8a6a1c']; S.sky = .45;
    var sx = 0, sy = 1.5, sz = -6, i, k, gy = -1.8;
    S.dot(sx, sy, sz, 3.8, '#ffe6a0', { env: true, a: .75, tw: 0 });
    S.dot(sx, sy, sz, 1.5, '#fff6dc', { env: true, a: .9, tw: 0 });
    [1.0, 1.35, 1.8, 2.45].forEach(function (R, k) { S.line(circle(sx, sy, sz, R, 'z', 72), mix(C.gold, C.white, .25), .012, { a: .6 - k * .1, env: true, closed: true }); });
    for (k = 0; k < 2; k++) S.line(circle(sx, sy, sz, 2.45, 'z', 3, k * Math.PI / 3 + Math.PI / 2), C.gold, .009, { a: .45, env: true, closed: true, halo: false });
    S.line(circle(sx, sy, sz, 3.1, 'z', 12), C.gold, .008, { a: .35, env: true, closed: true, halo: false });
    for (i = 0; i < 36; i++) (function (a0, long) {
      S.line([[0, 0, 0], [0, 0, 0]], '#ffe9a8', .008, { a: long ? .5 : .3, env: true, halo: false,
        dyn: function (t, p) { var a = a0 + t * .02, r0 = 3.25, r1 = long ? 4.6 : 3.8; p[0] = sx + Math.cos(a) * r0; p[1] = sy + Math.sin(a) * r0; p[2] = sz; p[3] = sx + Math.cos(a) * r1; p[4] = sy + Math.sin(a) * r1; p[5] = sz; } });
    })(i / 36 * TAU, i % 3 === 0);
    for (i = -6; i <= 6; i++) S.line([[i * .12, gy, sz], [i * 1.1, gy, 3.5]], C.gold, .01, { a: i === 0 ? .6 : .32, env: true, halo: i === 0 });
    for (i = 0; i < 8; i++) { var z = 3 - i * i * .16 - i * .2, f = (z - sz) / (3.5 - sz), half = 6 * (.12 + .98 * f); S.line([[-half, gy, z], [half, gy, z]], C.gold, .007, { a: .22, env: true, halo: false }); }
    motes(S, r, 90, function (q) { return mix(C.gold, C.white, q); }, [6, 5, 6, -1.8], drift);
  },

  differentiate: function (S, r) {
    S.bg = ['#020807', '#06261e']; S.neb = ['#0c5a44', '#0a3a4a', '#1c6a3c']; S.sky = .5;
    var gy = -1.9, P = [], i, j, k, u, pts, a, R;
    for (i = 0; i < 70; i++) { a = r() * TAU; R = Math.sqrt(r()) * 3.8; P.push([Math.cos(a) * R, gy + (r() - .5) * .06, Math.sin(a) * R]); }
    P.forEach(function (p, i) {
      var best = [];
      for (var j = 0; j < P.length; j++) if (j !== i) best.push([dist2(p, P[j]), j]);
      best.sort(function (a, b) { return a[0] - b[0]; });
      for (var k = 0; k < 2; k++) {
        var q = P[best[k][1]];
        if (best[k][1] > i || k === 0) S.line([p, [(p[0] + q[0]) / 2 + (r() - .5) * .1, gy, (p[2] + q[2]) / 2 + (r() - .5) * .1], q], '#39ffb0', .007, { a: .4, env: true, halo: false });
      }
      S.dot(p[0], p[1], p[2], .06, '#7dffc8', { env: true, a: .6 });
    });
    for (i = 0; i < 11; i++) {
      a = i / 11 * TAU + r() * .3; R = 1.9 + r() * 1.7; var x = Math.cos(a) * R, z = Math.sin(a) * R, h = 2.2 + r() * 1.6, wx = r() * TAU; pts = [];
      for (j = 0; j <= 12; j++) { u = j / 12; pts.push([x + Math.sin(u * 3 + wx) * .08, gy + u * h, z + Math.cos(u * 2.5 + wx) * .08]); }
      S.line(pts, '#2fbf8a', .03, { a: .5, env: true });
      for (k = 0; k < 3; k++) { var ra = a + k * 2.1; S.line([[x, gy + .25, z], [x + Math.cos(ra) * .3, gy, z + Math.sin(ra) * .3]], '#2fbf8a', .014, { a: .4, env: true, halo: false }); }
      var tx = pts[12][0], ty = pts[12][1], tz = pts[12][2];
      for (k = 0; k < 26; k++) { var q = r() * TAU, e = (r() - .5) * 1.4, rr = .25 + r() * .6; S.dot(tx + Math.cos(q) * Math.cos(e) * rr, ty + Math.sin(e) * rr * .7, tz + Math.sin(q) * Math.cos(e) * rr, .05 + r() * .08, mix(C.green, '#c8ffe4', r()), { env: true, a: .7 }); }
      for (k = 0; k < 3; k++) { var q2 = r() * TAU; S.line([[tx, ty - .2, tz], [tx + Math.cos(q2) * .5, ty + .15 + r() * .3, tz + Math.sin(q2) * .5]], '#2fbf8a', .01, { a: .4, env: true, halo: false }); }
    }
    for (k = 0; k < 3; k++) { pts = []; for (j = 0; j <= 40; j++) { u = j / 40; pts.push([-3.8 + u * 7.6, gy + .02, Math.sin(u * 5) * .7 + (k - 1) * .09 + .9]); } S.line(pts, '#8fffdc', .012, { a: .5, env: true }); }
    motes(S, r, 110, function (q) { return mix('#eaffb0', '#9fffd0', q); }, [6.5, 5, 6.5, -1.9], rise);
  },

  converge: function (S, r) {
    S.bg = ['#02040b', '#081c42']; S.neb = ['#0c2a7a', '#103a6a', '#2a1c7a']; S.sky = .7;
    var gy = -1.7, i, j;
    for (i = 0; i < 9; i++) (function (k) {
      var n = 56;
      S.line(circle(0, gy, 0, 1, 'y', n), '#7cc6ff', .012, { a: .5, env: true, closed: true, halo: k % 3 === 0,
        dyn: function (t, p, L) { var ph = (k / 9 + t * .035) % 1, R = 4.2 * (1 - ph) + .12; for (var j = 0; j < n; j++) { var a = j / n * TAU; p[j * 3] = Math.cos(a) * R; p[j * 3 + 2] = Math.sin(a) * R; } L.a = .6 * Math.sin(ph * Math.PI); } });
    })(i);
    for (i = 0; i < 9; i++) {
      var a = i / 9 * TAU + .2, R = 2.4 + r() * 1.0, x = Math.cos(a) * R, z = Math.sin(a) * R, h = 1.2 + r() * 2.2, wd = .14 + r() * .1, col = mix(C.blue, '#cfeaff', r());
      var bot = circle(x, gy, z, wd, 'y', 6, a), top = circle(x, gy + h, z, wd, 'y', 6, a), apex = [x, gy + h + wd * 1.8, z];
      S.line(bot, col, .007, { a: .5, env: true, closed: true, halo: false });
      S.line(top, col, .007, { a: .6, env: true, closed: true, halo: false });
      for (j = 0; j < 6; j++) S.line([bot[j], top[j], apex], col, .008, { a: .6, env: true, halo: j % 3 === 0 });
      S.dot(apex[0], apex[1], apex[2], .16, col, { env: true, a: .8 });
    }
    for (i = 0; i < 7; i++) (function (k) {
      var n = 40, x0 = (k - 3) * .75;
      S.line(circle(0, 0, 0, 1, 'y', n), '#a6d6ff', .009, { a: .4, env: true, halo: false,
        dyn: function (t, p) { for (var j = 0; j < n; j++) { var y = -1.6 + j * (5 / (n - 1)); p[j * 3] = x0 + .2 * Math.sin(y * 2.6 + k) * Math.sin(t * .7 + k * .9); p[j * 3 + 1] = y; p[j * 3 + 2] = -3.2; } } });
    })(i);
    motes(S, r, 80, function (q) { return mix(C.blue, C.white, q); }, [6, 5, 6, -1.7], drift);
  },

  covenant: function (S, r) {
    S.bg = ['#030311', '#100c3c']; S.neb = ['#2a1c8a', '#3a2a9a', '#1c2a6a']; S.sky = 1.25;
    var i;
    for (i = 0; i < 6; i++) (function (k) {
      var n = 72, R = 2.2 + k * .2, tilt = .3 + k * .5, sp = .03 + k * .012, col = mix(C.indigo, '#d6d3ff', k / 6);
      var L = S.line(circle(0, 0, 0, R, 'y', n), col, .011, { a: .5, env: true, closed: true, halo: k % 2 === 0,
        dyn: function (t, p) {
          var az = t * sp + k, ct = Math.cos(tilt), st = Math.sin(tilt), ca = Math.cos(az), sa = Math.sin(az);
          for (var j = 0; j < n; j++) { var a = j / n * TAU, x = Math.cos(a) * R, z = Math.sin(a) * R, z1 = z * ct; p[j * 3] = x * ca - z1 * sa; p[j * 3 + 1] = -z * st + .3; p[j * 3 + 2] = x * sa + z1 * ca; }
        } });
      S.dot(0, 0, 0, .16, '#e6e4ff', { env: true, a: .9, tw: 0, dyn: function (d, t) {
        var f = ((t * .012 * (k + 1) + k * .17) % 1) * n, j = Math.floor(f), fr = f - j, j2 = (j + 1) % n, p = L.p;
        d.x = lerp(p[j * 3], p[j2 * 3], fr); d.y = lerp(p[j * 3 + 1], p[j2 * 3 + 1], fr); d.z = lerp(p[j * 3 + 2], p[j2 * 3 + 2], fr);
      } });
    })(i);
    [[-2.6, 2.6, -5], [2.9, 1.2, -6], [-1.2, -1.9, -6.5]].forEach(function (g, gi) {
      var tilt = .5 + gi * .6;
      for (var i = 0; i < 150; i++) {
        var arm = i % 2, rr = Math.pow(r(), .7) * 1.1, a = arm * Math.PI + rr * 4.5 + (r() - .5) * .5, x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = (r() - .5) * .06;
        S.dot(g[0] + x, g[1] + y * Math.cos(tilt) + z * Math.sin(tilt), g[2] + z * Math.cos(tilt), .045 + r() * .06, ['#c9c5ff', '#9fd4ff', '#ffdcf4'][gi], { env: true, a: .7 });
      }
      S.dot(g[0], g[1], g[2], .7, '#ffffff', { env: true, a: .35, tw: 0 });
    });
    motes(S, r, 60, function (q) { return mix(C.indigo, C.white, q); }, [6, 5, 6, -2], drift);
  },

  'return': function (S, r) {
    S.bg = ['#070312', '#200e40']; S.neb = ['#4a1c8a', '#6a2a8a', '#2a1c6a']; S.sky = .9;
    var mx = 0, my = .4, mz = -2.6, cs = [[0, 0]], a, k;
    for (k = 0; k < 6; k++) { a = k / 6 * TAU; cs.push([Math.cos(a) * .62, Math.sin(a) * .62]); }
    for (k = 0; k < 6; k++) { a = k / 6 * TAU + Math.PI / 6; cs.push([Math.cos(a) * 1.074, Math.sin(a) * 1.074]); }
    for (k = 0; k < 6; k++) { a = k / 6 * TAU; cs.push([Math.cos(a) * 1.24, Math.sin(a) * 1.24]); }
    cs.forEach(function (c, ci) {
      var n = 40;
      S.line(circle(0, 0, 0, .62, 'z', n), mix(C.violet, C.white, ci === 0 ? .6 : .2), .009, { a: ci < 7 ? .6 : .38, env: true, closed: true, halo: ci < 7,
        dyn: function (t, p) {
          var rot = t * .012, cx = mx + c[0] * Math.cos(rot) - c[1] * Math.sin(rot), cy = my + c[0] * Math.sin(rot) + c[1] * Math.cos(rot);
          for (var j = 0; j < n; j++) { var q = j / n * TAU; p[j * 3] = cx + Math.cos(q) * .62; p[j * 3 + 1] = cy + Math.sin(q) * .62; p[j * 3 + 2] = mz; }
        } });
    });
    S.line(circle(mx, my, mz, 1.86, 'z', 80), C.violet, .012, { a: .55, env: true, closed: true });
    S.line(circle(mx, my, mz, 2.0, 'z', 80), '#e6ccff', .007, { a: .4, env: true, closed: true, halo: false });
    MOVEMENTS.forEach(function (m, k) {
      var a0 = k / 7 * TAU + .3, pts = [], n = 44, i;
      for (i = 0; i <= n; i++) { var u = i / n, rad = 3.6 * Math.pow(1 - u, 1.15), an = a0 + u * 2.0; pts.push([mx + Math.cos(an) * rad, my + Math.sin(an) * rad * .85, 2.2 + (mz - 2.2) * u]); }
      S.line(pts.slice(0, 34), m.color, .017, { a: .75, env: true });
      S.line(pts.slice(33), mix(m.color, C.white, .75), .014, { a: .8, env: true });
      [0, 1 / 3, 2 / 3].forEach(function (off) {
        var ph = off + k * .09;
        S.dot(0, 0, 0, .13, m.color, { env: true, a: .9, tw: 0, dyn: function (d, t) { var u = (t * .05 + ph) % 1, p = polyAt(pts, u); d.x = p[0]; d.y = p[1]; d.z = p[2]; d.a = Math.sin(u * Math.PI); } });
      });
    });
    S.dot(mx, my, mz, 1.9, C.white, { env: true, a: .85, tw: 0 });
    S.dot(mx, my, mz, .7, '#ffffff', { a: .9, tw: 0 });
    motes(S, r, 70, function (q) { return mix(C.violet, C.white, q); }, [6, 5, 5, -2], drift);
  },

  vision: function (S, r) {
    S.bg = ['#05040d', '#1b0d24']; S.neb = ['#5a1c3a', '#2a1c6a', '#1c4a4a']; S.sky = 1;
    var gy = -1.75, i;
    S.dot(0, -1.4, -7, 4.4, '#ff8a6a', { env: true, a: .35, tw: 0 });
    S.line(circle(0, gy, 0, 1.25, 'y', 72), C.green, .014, { a: .7, env: true, closed: true });
    S.line(circle(0, gy, 0, 1.33, 'y', 72), C.green, .006, { a: .4, env: true, closed: true, halo: false });
    for (i = 0; i < 5; i++) (function (k) {
      var n = 64;
      S.line(circle(0, gy, 0, 1, 'y', n), C.red, .011, { a: .5, env: true, closed: true, halo: k % 2 === 0,
        dyn: function (t, p, L) { var ph = (k / 5 + t * .04) % 1, R = 1.45 + ph * 3.2; for (var j = 0; j < n; j++) { var a = j / n * TAU; p[j * 3] = Math.cos(a) * R; p[j * 3 + 2] = Math.sin(a) * R; } L.a = .6 * (1 - ph) * smooth(0, .15, ph); } });
      S.line(circle(0, gy, 0, 1, 'y', n), C.blue, .011, { a: .5, env: true, closed: true, halo: k % 2 === 0,
        dyn: function (t, p, L) { var ph = (k / 5 + t * .04) % 1, R = 1.15 * (1 - ph) + .04; for (var j = 0; j < n; j++) { var a = j / n * TAU; p[j * 3] = Math.cos(a) * R; p[j * 3 + 2] = Math.sin(a) * R; } L.a = .6 * Math.sin(ph * Math.PI); } });
    })(i);
    S.line(circle(0, .3, -.3, 2.95, 'z', 96), C.violet, .012, { a: .45, env: true, closed: true });
    S.line(circle(0, .3, -.3, 3.1, 'z', 96), C.violet, .006, { a: .25, env: true, closed: true, halo: false });
    motes(S, r, 70, function (q) { return mix(C.pearl, C.white, q); }, [6, 5, 6, -1.8], drift);
  },

  livingTree: function (S, r) {
    S.bg = ['#03060a', '#0b1e18']; S.neb = ['#0c4a3a', '#1c2a6a', '#3a2a0c']; S.sky = .8;
    var gy = -.62, i, j, k, u, pts, a;
    for (k = 1; k <= 3; k++) S.line(circle(0, gy, 0, k * .7, 'y', 60), C.green, .007, { a: .2, env: true, closed: true, halo: false });
    for (i = 0; i < 6; i++) {
      a = i / 6 * TAU + .4; pts = [];
      for (j = 0; j <= 14; j++) { u = j / 14; pts.push([Math.cos(a + u * .4) * (.06 + u * 1.15), gy - Math.pow(u, 1.3) * 1.05, Math.sin(a + u * .4) * (.06 + u * 1.15)]); }
      S.line(pts, C.green, .016, { a: .6, env: true });
    }
    for (i = 0; i < 5; i++) {
      pts = []; a = i / 5 * TAU;
      for (j = 0; j <= 12; j++) { u = j / 12; var rad = .12 * (1 - .5 * u) + .02; pts.push([Math.cos(a + u * 2) * rad, gy + u * 1.0, Math.sin(a + u * 2) * rad]); }
      S.line(pts, C.gold, .018, { a: .7, env: true });
    }
    for (i = 0; i < 5; i++) {
      a = i / 5 * TAU + .7; var el = .5 + r() * .5, len = 1.0 + r() * .3; pts = [];
      for (j = 0; j <= 14; j++) { u = j / 14; pts.push([Math.cos(a) * Math.cos(el) * len * u, gy + 1.0 + Math.sin(el) * len * u + .15 * u * u, Math.sin(a) * Math.cos(el) * len * u]); }
      S.line(pts, C.blue, .014, { a: .7, env: true });
      var e = pts[14];
      for (k = 0; k < 14; k++) S.dot(e[0] + (r() - .5) * .5, e[1] + (r() - .5) * .4, e[2] + (r() - .5) * .5, .05 + r() * .05, C.violet, { env: true, a: .75 });
      for (k = 0; k < 3; k++) S.dot(e[0] + (r() - .5) * .4, e[1] + .1 + r() * .2, e[2] + (r() - .5) * .4, .11, C.pearl, { env: true, a: .9 });
      S.dot(e[0] + .08, e[1] - .2, e[2], .2, C.orange, { env: true, a: .85, tw: 0 });
    }
    motes(S, r, 70, function (q) { return mix(C.green, C.white, q); }, [6, 5, 6, -2], drift);
  },

  livingWorks: function (S, r, w, pos) {
    S.bg = ['#04060a', '#131f14']; S.neb = ['#1c4a2a', '#3a3a0c', '#0c3a4a']; S.sky = .8;
    var gy = -2.0, k, j, u;
    for (k = 1; k <= 4; k++) S.line(circle(0, gy, 0, k * .8, 'y', 60), '#9fe0b0', .007, { a: .2, env: true, closed: true, halo: false });
    pos.forEach(function (p, i) {
      var pts = [], bx = p[0] * .45, bz = p[2] + .3;
      for (j = 0; j <= 16; j++) { u = j / 16; pts.push([lerp(bx, p[0], u * u) + Math.sin(u * 5 + i) * .05 * (1 - u), lerp(gy, p[1] - .1, u), lerp(bz, p[2], u)]); }
      S.line(pts, '#9fe0b0', .014, { a: .7, env: true, star: w.stars[i].id });
      for (k = 0; k < 3; k++) { var q = pts[4 + k * 4], sd = k % 2 ? 1 : -1; S.line([q, [q[0] + sd * .22, q[1] + .12, q[2] + .08]], '#c8f5c0', .009, { a: .55, env: true, halo: false, star: w.stars[i].id }); S.dot(q[0] + sd * .22, q[1] + .12, q[2] + .08, .07, '#c8f5c0', { env: true, a: .7 }); }
    });
    motes(S, r, 90, function (q) { return mix(C.amber, C.white, q); }, [6, 5, 6, -2], drift);
  },

  structure: function (S, r, w, pos) {
    S.bg = ['#04050c', '#14172e']; S.neb = ['#2a2a6a', '#1c3a5a', '#4a2a4a']; S.sky = 1;
    var i;
    for (i = 1; i <= 4; i++) (function (c, ci) {
      [0, 1, 2].forEach(function (s) {
        var n = 46;
        S.line(circle(0, 0, 0, 1, 'y', n), mix(C.pearl, C.white, s / 2), .011, { a: .5, env: true, halo: s === 0,
          dyn: function (t, p) { for (var j = 0; j < n; j++) { var y = -2.7 + j * (5.8 / (n - 1)), ang = y * 1.5 + ci * 1.3 + t * .35 + s * 2.094, rad = .17 + .05 * Math.sin(y * 1.2 + ci); p[j * 3] = c[0] + Math.cos(ang) * rad; p[j * 3 + 1] = y; p[j * 3 + 2] = c[2] + Math.sin(ang) * rad; } } });
      });
      [0, .25, .5, .75].forEach(function (off) {
        S.dot(0, 0, 0, .1, C.white, { env: true, a: .8, tw: 0, dyn: function (d, t) { var u = (t * .06 + off + ci * .11) % 1, y = -2.7 + u * 5.8, ang = y * 1.5 + ci * 1.3 + t * .35; d.x = c[0] + Math.cos(ang) * .17; d.y = y; d.z = c[2] + Math.sin(ang) * .17; d.a = Math.sin(u * Math.PI) * .8; } });
      });
    })(pos[i], i);
    S.line(circle(0, .3, 0, 1.28, 'z', 72), C.pearl, .007, { a: .25, env: true, closed: true, halo: false });
    motes(S, r, 70, function (q) { return mix(C.pearl, '#cfd6ff', q); }, [6, 5, 6, -2], drift);
  },

  path: function (S, r, w, pos) {
    S.bg = ['#03040a', '#0d1836']; S.neb = ['#1c2a7a', '#2a1c5a', '#0c3a5a']; S.sky = 1.1;
    var hz = [pos[0][0], pos[0][1] - .25, pos[0][2] - 1.5], i, path = [];
    S.dot(hz[0], hz[1], hz[2], 3.6, '#bcd6ff', { env: true, a: .5, tw: 0 });
    S.dot(hz[0], hz[1], hz[2], 1.2, C.white, { env: true, a: .7, tw: 0 });
    for (i = -5; i <= 5; i++) if (i) S.line([[i * 1.3, -1.9, 3], [hz[0] + i * .05, hz[1], hz[2]]], '#9fc4ff', .008, { a: .25, env: true, halo: false });
    for (i = 1; i <= 7; i++) path.push([pos[i][0], pos[i][1] - .28, pos[i][2]]);
    path.push(hz);
    S.line(path, C.pearl, .016, { a: .6, env: true });
    for (i = 1; i <= 7; i++) {
      S.line(circle(pos[i][0], pos[i][1] - .28, pos[i][2], .26, 'y', 32), C.pearl, .009, { a: .6, env: true, closed: true, star: w.stars[i].id });
      S.line(circle(pos[i][0], pos[i][1] - .28, pos[i][2], .38, 'y', 32), C.pearl, .005, { a: .25, env: true, closed: true, halo: false });
    }
    motes(S, r, 80, function (q) { return mix('#9fc4ff', C.white, q); }, [6, 5, 8, -2], drift);
  },

  roots: function (S, r, w, pos) {
    S.bg = ['#060403', '#1e1608']; S.neb = ['#4a3a0c', '#3a2408', '#5a4a1c']; S.sky = .12;
    var i, j, k, u, pts;
    S.dot(0, 3.2, 0, 2.6, C.pearl, { env: true, a: .45, tw: 0 });
    for (i = 0; i < 6; i++) { pts = []; var y = -2.3 + i * .95; for (j = 0; j <= 36; j++) { u = j / 36; pts.push([-3.8 + u * 7.6, y + .09 * Math.sin(u * 9 + i * 2) + .05 * Math.sin(u * 23 + i), -1.4 + .5 * Math.sin(u * 3 + i)]); } S.line(pts, '#8a6a3a', .008, { a: .22, env: true, halo: false }); }
    pos.forEach(function (p, i) {
      pts = [];
      for (j = 0; j <= 22; j++) { u = j / 22; pts.push([lerp(0, p[0], Math.pow(u, .8)) + Math.sin(u * 5 + i * 1.7) * .1 * Math.sin(u * Math.PI), lerp(3.1, p[1] + .12, Math.pow(u, 1.15)), lerp(0, p[2], u) + Math.cos(u * 4 + i) * .08 * Math.sin(u * Math.PI)]); }
      S.line(pts, mix(C.pearl, C.amber, .3), .02, { a: .75, env: true, star: w.stars[i].id });
      for (k = 0; k < 3; k++) {
        var st = pts[9 + k * 4], q = [], a = r() * TAU, l = .3 + r() * .3;
        for (j = 0; j <= 6; j++) { u = j / 6; q.push([st[0] + Math.cos(a) * l * u, st[1] - .2 * u - .1 * u * u, st[2] + Math.sin(a) * l * u]); }
        S.line(q, mix(C.pearl, C.amber, .55), .008, { a: .5, env: true, halo: false });
        S.dot(q[6][0], q[6][1], q[6][2], .06, C.pearl, { env: true, a: .6 });
      }
    });
    for (i = 0; i < 9; i++) {
      var a2 = r() * TAU, R = 1.6 + r() * 1.8; pts = [];
      for (j = 0; j <= 16; j++) { u = j / 16; pts.push([Math.cos(a2) * R * Math.pow(u, .8), 3.1 - u * (3.2 + r() * .1 + i * .2), Math.sin(a2) * R * Math.pow(u, .8) - .8]); }
      S.line(pts, mix(C.pearl, C.amber, .6), .009, { a: .35, env: true, halo: false });
    }
    motes(S, r, 90, function (q) { return mix(C.amber, C.pearl, q); }, [6, 5, 5, -2.2], drift);
  },

  scroll: function (S, r) {
    S.bg = ['#04040b', '#121022']; S.neb = ['#3a1c5a', '#1c3a5a', '#5a3a1c']; S.sky = .9;
    var tc = [0, .3, -2.3], R = 2.3, rr = 1.05, i, j;
    for (i = 0; i < 18; i++) {
      var phi = i / 18 * TAU, cph = Math.cos(phi), sph = Math.sin(phi), out = [], inn = [], th, d;
      for (j = 0; j <= 12; j++) {
        th = -Math.PI / 2 + j / 12 * Math.PI; d = R + rr * Math.cos(th); out.push([tc[0] + d * cph, tc[1] + rr * Math.sin(th), tc[2] + d * sph]);
        th = Math.PI / 2 + j / 12 * Math.PI; d = R + rr * Math.cos(th); inn.push([tc[0] + d * cph, tc[1] + rr * Math.sin(th), tc[2] + d * sph]);
      }
      S.line(out, mix(C.red, C.gold, (i % 6) / 5), .008, { a: .4, env: true, halo: i % 3 === 0 });
      S.line(inn, mix(C.blue, C.violet, (i % 6) / 5), .008, { a: .4, env: true, halo: i % 3 === 0 });
    }
    [R - rr, R, R + rr].forEach(function (R2, k) { S.line(circle(tc[0], tc[1], tc[2], R2, 'y', 80), C.green, .012, { a: k === 1 ? .35 : .6, env: true, closed: true }); });
    for (i = 0; i < 54; i++) (function (phi, th0) {
      S.dot(0, 0, 0, .1, C.orange, { env: true, a: .85, tw: 0, dyn: function (d, t) {
        var th = th0 + t * .22, dd = R + rr * Math.cos(th);
        d.x = tc[0] + dd * Math.cos(phi); d.y = tc[1] + rr * Math.sin(th); d.z = tc[2] + dd * Math.sin(phi);
        d.color = Math.cos(th) > 0 ? C.orange : C.blue;
      } });
    })(r() * TAU, r() * TAU);
    motes(S, r, 60, function (q) { return mix(C.pearl, C.white, q); }, [6, 5, 5, -2], drift);
  }
};

function buildWorld(id) {
  var w = WORLD[id];
  var S = new Scene({ fit: { w: 3.5, h: 4.7 }, center: [0, .25, 0], yaw: 0, pitch: .06, yawLim: [-1.15, 1.15] });
  var r = RNG(hashStr(id)), pos = LAYOUT[id] || layoutMovement(w.stars.length), cons = CONS[id];
  if (id === 'path-ahead') { S.fit = { w: 3.3, h: 4.4 }; S.center = [0, .1, 0]; S.home.ty = S.cam.ty = .1; S.home.pitch = S.cam.pitch = .12; }
  if (id === 'the-scroll') { S.fit = { w: 3.9, h: 5.1 }; }
  ENV[w.env](S, r, w, pos);
  w.stars.forEach(function (s, i) {
    var p = pos[i], from = cons ? cons[i] : (i ? 0 : -1), col = STARCOL[s.id] || (w.type === 'movement' ? (i ? mix(w.color, C.white, .3) : w.color) : (i ? C.pearl : w.color));
    if (from >= 0) S.line([pos[from], p], col, .008, { a: .6, star: s.id, halo: false });
    S.node({ id: s.id, kind: 'star', star: s.id, x: p[0], y: p[1], z: p[2], r: i === 0 ? .1 : .075, color: col,
      label: s.step ? s.step + '. ' + s.t : (s.short || s.t), pri: i === 0 ? 3 : 2 });
  });
  return S;
}
