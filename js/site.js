/* The BeveBar: nav drawer + homepage hero.
   The hero holds still while you scroll through five moments:
     0  full-screen photo, cart, no words
     1  photo fades to white, "tea, matcha, or coffee" note
     2  cart rises, toppings note (nav logo appears as the canopy slides under the menu bar)
     3  "your logo here" on the cart, "Add a custom logo" note under it (cups slide down to make room)
     4  "we're mobile!" note, cream band comes up underneath
   Then the page scrolls normally, and the three cups lock under the menu bar.
   Cart and note coordinates are PSD artboard pixels (artboard = 700 wide). */
(function () {
  /* ---------- Menu drawer ---------- */
  var drawer = document.querySelector('.drawer');
  var openBtn = document.querySelector('.nav__menu');
  var closeBtn = document.querySelector('.drawer__close');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- Instagram (Behold JSON feed) ---------- */
  var ig = document.querySelector('[data-ig]');
  var feed = (window.BEVE_CONFIG || {}).instagramFeed;
  if (ig && feed && window.fetch) {
    fetch(feed).then(function (r) { return r.json(); }).then(function (data) {
      var posts = (data.posts || []).slice(0, 6);
      if (!posts.length) return;
      ig.innerHTML = posts.map(function (p) {
        var src = (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) || p.thumbnailUrl || p.mediaUrl;
        var alt = (p.altText || p.prunedCaption || 'Instagram post from @thebevebar').slice(0, 120).replace(/"/g, '&quot;');
        return '<a href="' + p.permalink + '" target="_blank" rel="noopener"><img src="' + src + '" alt="' + alt + '" loading="lazy"></a>';
      }).join('');
      ig.classList.add('is-live');
    }).catch(function () { /* keep the placeholder squares */ });
  }

  /* ---------- Hero ---------- */
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var stage = hero.querySelector('.hero__stage');
  var bg = hero.querySelector('.hero__bg');
  var layer = hero.querySelector('.hero__layer');
  var cart = hero.querySelector('.hero__cart');
  var band = hero.querySelector('.band');
  var drinks = hero.querySelector('.hero__drinks');
  var bar = document.querySelector('.drinkbar');
  var nav = document.querySelector('.nav');
  var navLogo = document.querySelector('.nav__logo');
  var bodyLogo = cart.querySelector('[data-el="body-logo"]');
  var yourLogo = cart.querySelector('[data-el="your-logo"]');
  var notes = [1, 2, 3, 4].map(function (k) {
    return [cart.querySelector('[data-note="' + k + '"]'), cart.querySelector('[data-arrow="' + k + '"]')];
  });

  var NOTE_SIZE = 19;                              // artboard px
  var CART_Y = [124, 124, -26, -205, -469];        // cart top in each moment (artboards 1-4)
  var CART_H = 845;
  var SLOT = 125;                                  // room opened under the cart for notes 3 and 4

  var stableVH = 0, lastVW = 0;
  var phone = true, s = 0.5, vw = 0, vh = 0, navH = 0;
  var oxSide = 0, oxCenter = 0, deskFade = 1;
  var SEGS = [0.45, 1, 1, 1];        // the first moment is quicker: photo fades and the first note arrives sooner
  var HOLD = [0.08, 0.4, 0.4, 0.4];  // share of each stretch spent holding still before moving on
  var cartTop0 = 0, seg = 300, D = 1200, Ts = [0, 0, 0, 0, 0], cupsH = 0, bandH = 0, gapCB = 0, gapB = 0, gap0 = 0;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { t = clamp01(t); return t * t * (3 - 2 * t); }

  function place(el) {
    var x = +el.dataset.x, y = +el.dataset.y, w = +el.dataset.w || 0, size = +el.dataset.size || NOTE_SIZE;
    if (el.classList.contains('note') || el.classList.contains('cart-text')) {
      el.style.fontSize = (size * s) + 'px';
      var cx = el.classList.contains('note--left') ? x : x + w / 2;
      el.style.left = (cx * s) + 'px';
      el.style.top = (y * s - size * s * 0.3) + 'px';
    } else {
      el.style.left = (x * s) + 'px';
      el.style.top = (y * s) + 'px';
      if (w) el.style.width = (w * s) + 'px';
    }
  }

  function layout() {
    vw = document.documentElement.clientWidth;
    // Use a screen height that stays put: on phones the keyboard and the address bar change
    // innerHeight constantly, and re-measuring then would shift the whole page.
    if (!stableVH || vw !== lastVW) stableVH = window.innerHeight;
    lastVW = vw;
    vh = stableVH;
    navH = nav.offsetHeight;
    phone = vw < 760 || vw / 700 <= (vh / 1111) * 1.15;
    hero.classList.toggle('is-phone', phone);
    hero.classList.toggle('is-desk', !phone);
    var ox;
    if (phone) {
      s = vw / 700;
      ox = -37 * s;                       // the mockup: cart bleeds off the right edge
      cartTop0 = 124 * s;
      if (drinks.parentNode !== layer) layer.insertBefore(drinks, band);
    } else {
      var cupD = Math.min(150, (vh - navH - 300) / 3);
      var leftCol = Math.max(200, cupD * 1.25 + 72);
      var avail = vw - leftCol - 48;
      s = Math.min(vh / 720, 1.3, avail / 799);
      ox = leftCol + (avail - 799 * s) / 2 - 89 * s;
      oxCenter = (vw - 799 * s) / 2 - 89 * s;   // where the cart glides to once the teas move up top
      cartTop0 = navH + 24;
      if (drinks.parentNode !== stage) stage.appendChild(drinks);
      drinks.style.width = leftCol + 'px';
      drinks.style.setProperty('--cup', cupD + 'px');
      drinks.style.setProperty('--label', '17px');
    }
    oxSide = ox;
    if (phone) oxCenter = ox;
    cart.style.left = ox + 'px';
    cart.style.top = cartTop0 + 'px';
    cart.style.width = (975 * s) + 'px';
    cart.style.height = (CART_H * s) + 'px';
    Array.prototype.forEach.call(cart.querySelectorAll('[data-x]'), place);

    if (phone) {
      drinks.style.width = '';
      drinks.style.setProperty('--cup', Math.max(46, 100 * s) + 'px');
      drinks.style.setProperty('--label', Math.max(12, 22 * s) + 'px');
      cupsH = drinks.offsetHeight;
      gapCB = 14 * s + 16;                // breathing room above the cups
    } else {
      cupsH = 0; gapCB = 0;
      drinks.style.top = (navH + Math.max(20, (vh - navH - drinks.offsetHeight) / 2)) + 'px';
    }
    bandH = band.offsetHeight;
    gapB = phone ? 22 * s + 16 : 40 * s;  // and below them, before the cream band
    // where the band would sit at the start; keep it below the fold so the first screen is all photo + cart
    var underCart0 = cartTop0 + CART_H * s + gapCB + cupsH;
    gap0 = gapB;                           // the band sits right under the teas from the start

    var bandTopEnd = cartTop0 + CART_H * s + gapCB + SLOT * s + cupsH + gapB;
    var Lend = bandTopEnd + bandH;
    var T4 = Math.max((CART_Y[0] - CART_Y[4]) * s, Lend - vh);
    Ts = CART_Y.map(function (y) { return (CART_Y[0] - y) * s; });
    Ts[4] = T4;
    var Hs = Lend - T4;                    // how much of the stage shows when the hero lets go
    stage.style.height = Hs + 'px';
    // phone: the photo stops right under the cart, so the teas sit on white
    bg.style.height = (phone ? cartTop0 + (CART_H + 4) * s : vh) + 'px';
    seg = Math.max(300, vh * (phone ? 0.5 : 0.45));
    D = seg * (SEGS[0] + SEGS[1] + SEGS[2] + SEGS[3] + 0.4);
    hero.style.height = (Hs + D) + 'px';
    hero.style.setProperty('--bob', Math.max(3, 6 * s) + 'px');
    update();
  }

  // scroll position -> moment 0..4, holding still for a while at each one
  function stageAt(y) {
    if (y <= 0) return 0;
    var start = 0;
    for (var k = 0; k < 4; k++) {
      var len = SEGS[k] * seg;
      if (y < start + len) {
        var t = (y - start) / len, h = HOLD[k];
        return k + ease((t - h) / (0.85 - h));
      }
      start += len;
    }
    return 4;
  }
  function lerpTs(f) {
    var i = Math.min(3, Math.floor(f)), t = f - i;
    return Ts[i] + (Ts[i + 1] - Ts[i]) * t;
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = -hero.getBoundingClientRect().top;
    var f = stageAt(y);
    var T = lerpTs(f);
    layer.style.transform = 'translate3d(0,' + (-T) + 'px,0)';

    // what's under the cart: room for notes 3-4, then the cups, then the band
    var slot = ease((f - 2.4) / 0.5) * SLOT * s;
    var under = cartTop0 + CART_H * s + gapCB + slot;
    if (phone) drinks.style.top = under + 'px';
    var g = gap0 + (gapB - gap0) * ease((f - 0.5) / 1.2);
    band.style.top = (under + cupsH + g) + 'px';

    bg.style.opacity = 1 - ease(f / 0.7);

    // desktop: as "Add a custom logo" arrives, the teas move up into the top bar and the cart glides to center
    if (!phone) {
      var c = ease((f - 2.3) / 0.55);
      cart.style.left = (oxSide + (oxCenter - oxSide) * c) + 'px';
      deskFade = 1 - ease((f - 2.2) / 0.35);
      drinks.style.opacity = deskFade;
      drinks.style.transform = 'translateY(' + (-(1 - deskFade) * 40) + 'px)';
    }
    notes.forEach(function (pair, i) {
      var o = clamp01(1 - Math.abs(f - (i + 1)) / 0.4);
      pair[0].style.opacity = o; pair[1].style.opacity = o;
    });
    var m = clamp01(1 - Math.abs(f - 3) / 0.5);
    yourLogo.style.opacity = m;
    bodyLogo.style.opacity = 1 - m;
    if (navLogo) navLogo.style.opacity = clamp01((f - 1.35) / 0.4);

    // once the cups reach the menu bar, they lock underneath it
    if (bar) {
      var on = phone ? drinks.getBoundingClientRect().top < navH + 2 : f >= 2.35 || hero.getBoundingClientRect().bottom < navH + 40;
      bar.classList.toggle('on', on);
      drinks.style.visibility = on && (phone || deskFade < 0.05) ? 'hidden' : '';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener('scroll', onScroll, { passive: true });
  // only re-measure when the width changes (rotating the phone, resizing a desktop window)
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches; // mouse = desktop
  window.addEventListener('resize', function () {
    if (document.documentElement.clientWidth !== lastVW) return layout();
    if (finePointer && window.innerHeight !== stableVH) { stableVH = 0; layout(); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
