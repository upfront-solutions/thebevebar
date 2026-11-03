/* The BeveBar booking form. A few related questions per page, then an instant estimate.
   Works anywhere a <div data-book></div> is placed (homepage + Book Us page). */
(function () {
  var CONFIG = window.BEVE_CONFIG || {};
  var CITIES = window.BEVE_CITIES || {};
  var ANAHEIM = [33.8366, -117.9143];
  var ROAD = 1.15; // straight-line miles x 1.15 = typical driving miles in SoCal

  /* ---------- Pricing ---------- */
  var CUP = { '12oz': 5, '16oz': 7 };
  var MIN_CUPS = 50, CART_RENTAL = 500, HOURLY = 100, KEG = 50, JUG = 50, BUNDLE = 10, BASE_HOURS = 2;
  var PACKAGES = {
    package1: { name: 'Package One', cups: 75, price: { '12oz': 875, '16oz': 1025 }, perks: 'Free customized cup stickers · Self-serve' },
    package2: { name: 'Package Two', cups: 100, price: { '12oz': 1000, '16oz': 1200 }, perks: 'Free customized cup stickers · Free 2-hr barista' }
  };
  var CUSTOM = [
    { id: 'toppers', name: 'Edible Drink Toppers', note: '50 pieces', price: 34, from: false },
    { id: 'stirrers', name: 'Drink Stirrers', note: '25 pieces', price: 30, from: true },
    { id: 'sign', name: 'Vinyl Signage', note: '', price: 55, from: true },
    { id: 'wrap', name: 'Vinyl Wrap', note: '', price: 100, from: true },
    { id: 'garland', name: 'Balloon Garland', note: '', price: 250, from: true }
  ];
  var EVENT_TYPES = ['Wedding', 'Birthday Party', 'Corporate Event', 'Community/School Event', 'Holiday/Seasonal Celebration', 'Special Occasion', 'Other'];
  var SERVICES = ['Full Service (boba-rista on site)', 'Self-Serve Cart (DIY)', 'Cup Catering (drinks delivery only)', 'By the Gallon', 'Cart Rental Only (no drinks)'];
  var SPACES = ['Indoors', 'Outdoors', 'Both', "Haven't decided"];
  var HEARD = ['Instagram', 'Google Search', 'Word of Mouth', 'Event/Festival', 'Other'];
  var PAGES = ['Event', 'Location', 'Drinks', 'Add-ons', 'Contact', 'Estimate'];

  // Travel & Service Area Fee (Travel_Rates.pdf):
  //   0-10 mi free · $3/mi after the first 10 · 26+ mi adds a travel-time fee for the round trip
  //   ($50/hr, $75/hr for 41-60 mi) · 60+ mi custom quote.
  // Drive time is estimated at 1.5 min per mile, which matches the sheet's example (40 mi = about 1 hr).
  var MIN_PER_MILE = 1.5;
  function travel(mi) {
    if (mi == null) return null;
    if (mi <= 10) return { total: 0, mileage: 0, time: 0 };
    if (mi > 60) return { custom: true, total: -1 };
    var mileage = (mi - 10) * 3, time = 0, hrs = 0, rate = 0;
    if (mi > 25) {
      rate = mi > 40 ? 75 : 50;
      hrs = Math.round((2 * mi * MIN_PER_MILE / 60) * 4) / 4; // round trip, nearest 15 min
      time = Math.round(hrs * rate);
    }
    return { total: mileage + time, mileage: mileage, time: time, hrs: hrs, rate: rate };
  }
  function travelFee(mi) { var t = travel(mi); return t ? t.total : null; }
  function travelText(mi) {
    var t = travel(mi);
    if (!t) return '';
    if (t.custom) return 'custom travel quote (60+ mi)';
    if (t.total === 0) return 'complimentary travel';
    return money(t.total) + ' travel' + (t.time ? ' (mileage + drive time)' : '');
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function miFrom(lat, lon) {
    var R = 3958.8, r = Math.PI / 180;
    var dLat = (lat - ANAHEIM[0]) * r, dLon = (lon - ANAHEIM[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(ANAHEIM[0] * r) * Math.cos(lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)) * ROAD);
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function tomorrow() { var d = new Date(); d.setDate(d.getDate() + 1); return isoDay(d); }
  function prettyDate(iso) {
    if (!iso) return '';
    var p = iso.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  var TIMES = [];
  for (var m = 7 * 60; m <= 22 * 60; m += 30) TIMES.push(m);
  function clock(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), mm = min % 60, ap = h >= 12 ? 'PM' : 'AM';
    return ((h + 11) % 12 + 1) + ':' + pad(mm) + ' ' + ap;
  }
  function uid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function Booking(root) {
    var f = {
      leadId: uid(), eventType: '', eventDate: '', eventDateText: '', start: '', hours: 2, guests: '',
      address: '', lat: null, lon: null, miles: null, eventSpace: '',
      serviceType: '', cupSize: '', packageChoice: '', customCups: '',
      baristas: 0, kegSwaps: 0, jugs: 0, bundles: 0, customizations: [],
      name: '', email: '', phone: '', howHeard: '', notes: ''
    };
    var page = 0, dir = 1, sent = false;

    function guests() { return parseInt(f.guests, 10) || 0; }
    function minBaristas() { return guests() >= 100 ? 1 : 0; }

    function price() {
      var items = [], total = 0, size = f.cupSize || '12oz';
      function add(label, amt) { items.push([label, amt]); total += amt || 0; }
      var pkg = PACKAGES[f.packageChoice];
      if (pkg) add(pkg.name + ' (' + pkg.cups + ' cups, ' + size + ')', pkg.price[size]);
      else {
        add('Cart rental (2 hrs, setup, breakdown & delivery)', CART_RENTAL);
        var cups = Math.max(parseInt(f.customCups, 10) || MIN_CUPS, MIN_CUPS);
        add(cups + ' cups × ' + money(CUP[size]) + ' (' + size + ')', cups * CUP[size]);
      }
      var extra = f.hours - BASE_HOURS;
      if (extra > 0) add('Extra hours (' + extra + ' hr × ' + money(HOURLY) + ')', extra * HOURLY);
      if (f.baristas) {
        var free = f.packageChoice === 'package2' ? 2 : 0;
        var paid = Math.max(0, f.baristas * f.hours - free);
        add('Barista' + (f.baristas > 1 ? 's' : '') + ' (' + f.baristas + ' × ' + f.hours + ' hr' + (free ? ', 2 hrs included' : '') + ')', paid * HOURLY);
      }
      if (f.kegSwaps) add('Keg swaps (' + f.kegSwaps + ')', f.kegSwaps * KEG);
      if (f.jugs) add('ParTea Jug, Full Gallon (' + f.jugs + ')', f.jugs * JUG);
      if (f.bundles) add('ParTea Jug, Add On Bundle (' + f.bundles + ')', f.bundles * BUNDLE);
      f.customizations.forEach(function (id) {
        var c = CUSTOM.filter(function (x) { return x.id === id; })[0];
        if (c) add(c.name + (c.from ? ' (starting at)' : ''), c.price);
      });
      var tv = travel(f.miles);
      if (!tv) items.push(['Travel: we’ll confirm from your address', null]);
      else if (tv.custom) items.push(['Travel (60+ mi): custom quote', null]);
      else if (tv.total === 0) items.push(['Travel (~' + f.miles + ' mi, complimentary)', 0]);
      else {
        add('Mileage (~' + f.miles + ' mi, first 10 free, $3/mi)', tv.mileage);
        if (tv.time) add('Travel time (~' + tv.hrs + ' hr round trip × ' + money(tv.rate) + ')', tv.time);
      }
      return { items: items, total: total };
    }

    /* ---------- Google Sheet lead capture ---------- */
    function leadRow(status) {
      var pr = price();
      return {
        leadId: f.leadId, status: status, name: f.name, email: f.email, phone: f.phone,
        eventType: f.eventType, eventDate: f.eventDate, startTime: f.start === '' ? '' : clock(+f.start),
        endTime: f.start === '' ? '' : clock(+f.start + f.hours * 60), hours: f.hours, guests: f.guests,
        address: f.address, milesFromAnaheim: f.miles == null ? '' : f.miles, eventSpace: f.eventSpace,
        serviceType: f.serviceType, cupSize: f.cupSize,
        package: f.packageChoice === 'custom' ? 'Custom' : (PACKAGES[f.packageChoice] || {}).name || '',
        customCups: f.customCups, baristas: f.baristas, kegSwaps: f.kegSwaps, partea_jugs: f.jugs, addon_bundles: f.bundles,
        customizations: f.customizations.map(function (id) { return CUSTOM.filter(function (c) { return c.id === id; })[0].name; }).join(', '),
        howHeard: f.howHeard, notes: f.notes, estimateTotal: pr.total,
        breakdown: pr.items.map(function (x) { return x[0] + ': ' + (x[1] == null ? 'TBD' : money(x[1])); }).join(' | '),
        page: location.href
      };
    }
    function saveLead(status) {
      if (!CONFIG.sheetUrl) return;
      try {
        fetch(CONFIG.sheetUrl, {
          method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(leadRow(status))
        }).catch(function () {});
      } catch (e) {}
    }

    /* ---------- Building blocks ---------- */
    function field(label, inner, note) {
      if (note === true) note = 'optional';
      return '<div class="fld"><span class="lbl">' + label + (note ? ' <span class="opt">(' + note + ')</span>' : '') + '</span>' + inner + '</div>';
    }
    function input(key, type, ph, extra) {
      return '<input class="in" data-k="' + key + '" type="' + type + '" value="' + esc(f[key]) + '"' + (ph ? ' placeholder="' + ph + '"' : '') + (extra || '') + '>';
    }
    function chips(key, list) {
      return '<div class="chips" data-chips="' + key + '">' + list.map(function (v) {
        return '<button type="button" class="chip' + (f[key] === v ? ' on' : '') + '" data-v="' + esc(v) + '">' + v + '</button>';
      }).join('') + '</div>';
    }
    function counter(key, min, max, step, opts) {
      opts = opts || {};
      var v = f[key];
      return '<div class="count" data-count="' + key + '" data-min="' + min + '" data-max="' + max + '" data-step="' + step + '">' +
        '<button type="button" data-d="-1" aria-label="Less"' + ((+v || 0) <= min && v !== '' ? ' disabled' : '') + '>−</button>' +
        (opts.typable ? '<input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="' + esc(v) + '" placeholder="' + (opts.ph || '') + '" aria-label="' + (opts.label || key) + '">'
          : '<output>' + (opts.fmt ? opts.fmt(v) : v) + '</output>') +
        '<button type="button" data-d="1" aria-label="More"' + ((+v || 0) >= max ? ' disabled' : '') + '>+</button></div>';
    }
    function row(key, title, sub, min, max, note) {
      return '<div class="row"><div><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + (note ? '<span class="why">' + note + '</span>' : '') + '</div>' + counter(key, min, max, 1) + '</div>';
    }
    function baristaNote() {
      var notes = [];
      if (minBaristas()) notes.push('1 required: you entered ' + guests() + ' guests (100+ need a barista)');
      if (f.packageChoice === 'package2') notes.push('Package Two includes 2 free barista hours');
      return notes.join('<br>');
    }

    /* ---------- Pages ---------- */
    function pageHTML() {
      var h = '';
      var size = f.cupSize || '12oz';
      if (page === 0) {
        h += '<h3>Tell us about your event</h3>';
        h += '<div class="grid2">' +
          field('Event date', '<div class="datef"><input class="in" data-date type="text" inputmode="numeric" autocomplete="off" placeholder="MM/DD/YYYY" value="' + esc(f.eventDateText) + '">' +
            '<button type="button" class="datef__btn" aria-label="Open calendar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></button>' +
            '<div class="cal" hidden></div></div>') +
          field('Start time', '<select class="in" data-k="start"><option value="">Choose a time</option>' + TIMES.map(function (t) {
            return '<option value="' + t + '"' + (String(f.start) === String(t) ? ' selected' : '') + '>' + clock(t) + '</option>';
          }).join('') + '</select>') +
          field('Hours of service', counter('hours', 2, 10, 1, { fmt: function (v) { return v + ' hrs'; } }) +
            '<p class="hint" data-endtime>' + endHint() + '</p>') +
          field('Estimated guests', counter('guests', 1, 2000, 10, { typable: true, ph: 'e.g. 120', label: 'Estimated guests' })) +
          '</div>';
      } else if (page === 1) {
        h += '<h3>Where is it?</h3><p class="sub">We travel from Anaheim. Pick your venue and we’ll estimate the miles.</p>';
        h += field('Event type', chips('eventType', EVENT_TYPES), 'Select one');
        h += field('Venue address', '<input class="in" data-k="address" data-ac type="text" autocomplete="off" placeholder="Start typing an address or city" value="' + esc(f.address) + '"><div class="ac" hidden></div>' +
          '<div class="miles" data-miles>' + milesHTML() + '</div>');
        h += field('Indoor or outdoor?', chips('eventSpace', SPACES), 'Select one');
      } else if (page === 2) {
        h += '<h3>Your drinks</h3>';
        h += field('Type of service', '<select class="in" data-k="serviceType"><option value="">Choose one</option>' + SERVICES.map(function (v) {
          return '<option' + (f.serviceType === v ? ' selected' : '') + '>' + v + '</option>';
        }).join('') + '</select>', 'Select one');
        h += field('Cup size', '<div class="cards cards--2">' + ['12oz', '16oz'].map(function (v) {
          return '<button type="button" class="copt' + (f.cupSize === v ? ' on' : '') + '" data-pick="cupSize" data-v="' + v + '"><span><b>' + v + '</b></span><span class="tag">' + money(CUP[v]) + ' / cup</span></button>';
        }).join('') + '</div>', 'Select one');
        h += field('Package', '<div class="cards">' + ['package1', 'package2'].map(function (id) {
          var p = PACKAGES[id];
          return '<button type="button" class="copt' + (f.packageChoice === id ? ' on' : '') + '" data-pick="packageChoice" data-v="' + id + '"><span><b>' + p.name + '</b> · ' + p.cups + ' cups<small>' + p.perks + '</small></span><span class="tag">' + money(p.price[size]) + '</span></button>';
        }).join('') +
          '<button type="button" class="copt' + (f.packageChoice === 'custom' ? ' on' : '') + '" data-pick="packageChoice" data-v="custom"><span><b>Custom</b><small>' + money(CART_RENTAL) + ' cart rental + ' + money(CUP[size]) + '/cup · 50 cup minimum</small></span><span class="tag">from ' + money(CART_RENTAL + MIN_CUPS * CUP[size]) + '</span></button></div>' +
          (f.packageChoice === 'custom' ? '<div class="fld"><span class="lbl">How many cups? <span class="opt">(50 minimum)</span></span>' + counter('customCups', 50, 5000, 10, { typable: true, ph: 'Type or tap +', label: 'Number of cups' }) + '</div>' : ''), 'Select one');
      } else if (page === 3) {
        var mb = minBaristas();
        if (f.baristas < mb) f.baristas = mb;
        h += '<h3>Add-ons</h3><p class="sub">' + (mb ? 'Optional, except 1 barista for 100+ guests.' : 'All optional.') + '</p>';
        h += '<div class="fld">' +
          row('baristas', 'Barista', '$100/hr each for your ' + f.hours + ' hrs · up to 2', mb, 2, baristaNote()) +
          row('kegSwaps', 'Keg swap', '$50/keg · for 300+ cups', 0, 10) +
          row('jugs', 'ParTea Jug, Full Gallon', '$50 each', 0, 30) +
          row('bundles', 'ParTea Jug, Add On Bundle', '$10 each', 0, 30) + '</div>';
        h += field('Branding customizations', '<p class="hint" style="margin:0 0 8px">Customized cup stickers are free with Package One and Two.</p><div class="chips">' + CUSTOM.map(function (c) {
          var qty = c.note ? ' (' + c.note.replace(' pieces', '') + ')' : '';
          return '<button type="button" class="chip' + (f.customizations.indexOf(c.id) > -1 ? ' on' : '') + '" data-multi="' + c.id + '">' + c.name + qty + ' · ' + money(c.price) + (c.from ? '+' : '') + '</button>';
        }).join('') + '</div>', 'optional, select any');
      } else if (page === 4) {
        h += '<h3>Where should we send your estimate?</h3>';
        h += field('Name', input('name', 'text', 'Full name', ' autocomplete="name"'));
        h += '<div class="grid2">' +
          field('Email', input('email', 'email', 'you@email.com', ' autocomplete="email"')) +
          field('Phone', input('phone', 'tel', '(714) 555-0123', ' autocomplete="tel"')) + '</div>';
        h += field('How did you hear about us?', '<select class="in" data-k="howHeard"><option value="">Choose one</option>' + HEARD.map(function (v) {
          return '<option' + (f.howHeard === v ? ' selected' : '') + '>' + v + '</option>';
        }).join('') + '</select>');
        h += '<input type="text" class="hp" data-hp tabindex="-1" autocomplete="off" aria-hidden="true" placeholder="Leave this empty">';
        h += field('Anything else we should know?', '<textarea class="in" data-k="notes" placeholder="Theme, special requests, timing…">' + esc(f.notes) + '</textarea>', true);
      } else if (page === 5) {
        var pr = price();
        h += '<h3>Your estimate</h3>';
        h += '<div class="estimate">' + pr.items.map(function (it) {
          return '<div class="line"><span>' + esc(it[0]) + '</span><span>' + (it[1] === null ? 'TBD' : money(it[1])) + '</span></div>';
        }).join('') + '<div class="total"><span>Estimated total*</span><span>' + money(pr.total) + '</span></div></div>';
        h += '<p class="summary">' + esc(f.eventType) + ' · ' + esc(prettyDate(f.eventDate)) + ' · ' + esc(clock(+f.start)) + ' to ' + esc(clock(+f.start + f.hours * 60)) +
          ' · ' + esc(f.guests) + ' guests<br>' + esc(f.address) + '</p>';
        h += '<p class="fine">*This is an estimate. Final pricing is confirmed by our team. A 50% deposit is required to secure your booking. Cancellations made 7 days prior to the event receive a full refund.</p>';
      }
      return h;
    }

    function endHint() {
      var base = 'First 2 hours included · $100 per extra hour';
      if (f.start === '') return base;
      return 'Ends at ' + clock(+f.start + f.hours * 60) + ' · ' + base;
    }
    function milesHTML() {
      if (f.miles == null) return f.address ? '<span class="hint" style="margin:0">Pick a suggestion so we can estimate travel, or we’ll confirm it with you.</span>' : '';
      return '<span class="hand">about ' + f.miles + ' miles from Anaheim</span><span>· ' + travelText(f.miles) + '</span>';
    }

    function render() {
      var h = '<div class="book__steps">' + PAGES.map(function (_, k) { return '<i class="' + (k <= page ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="book__meta"><span>Step ' + (page + 1) + ' of ' + PAGES.length + '</span><span>' + PAGES[page] + '</span></div>' +
        '<div class="book__page' + (dir < 0 ? ' back' : '') + '">' + pageHTML() + '</div>' +
        '<div class="err" role="alert"></div>' +
        '<div class="book__nav"><button type="button" class="book__back"' + (page === 0 ? ' style="visibility:hidden"' : '') + '>← Back</button>' +
        '<button type="button" class="pill pill--solid book__next">' + (page === 4 ? 'See my estimate' : page === 5 ? 'Send my quote' : 'Next') + '</button></div>';
      root.innerHTML = h;
      wire();
    }

    /* ---------- Events ---------- */
    function all(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
    function wire() {
      all('[data-k]').forEach(function (el) {
        var k = el.dataset.k;
        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
          f[k] = el.value; el.classList.remove('bad'); root.querySelector('.err').textContent = '';
          if (k === 'start') { var e = root.querySelector('[data-endtime]'); if (e) e.textContent = endHint(); }
          if (k === 'address') { f.lat = f.lon = null; f.miles = null; suggest(el.value); updMiles(); }
        });
        if (el.tagName === 'INPUT' && !el.hasAttribute('data-ac')) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); next(); } });
      });
      all('[data-chips]').forEach(function (g) {
        g.addEventListener('click', function (e) {
          var b = e.target.closest('.chip'); if (!b) return;
          f[g.dataset.chips] = b.dataset.v;
          all('[data-chips="' + g.dataset.chips + '"] .chip').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
      });
      all('[data-pick]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.dataset.pick; f[k] = b.dataset.v;
          if (k === 'packageChoice' && b.dataset.v === 'package2' && f.baristas < 1) f.baristas = 1;
          if (k === 'cupSize' || (k === 'packageChoice' && (b.dataset.v === 'custom') !== !!root.querySelector('[data-count="customCups"]'))) return rerender();
          all('[data-pick="' + k + '"]').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
      });
      all('[data-multi]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.multi, at = f.customizations.indexOf(id);
          if (at > -1) f.customizations.splice(at, 1); else f.customizations.push(id);
          b.classList.toggle('on', at === -1);
        });
      });
      all('[data-count]').forEach(function (c) {
        var k = c.dataset.count, min = +c.dataset.min, max = +c.dataset.max, step = +c.dataset.step;
        var inp = c.querySelector('input'), out = c.querySelector('output');
        function set(v) {
          v = Math.max(min, Math.min(max, v));
          f[k] = v;
          if (inp) inp.value = v; if (out) out.textContent = k === 'hours' ? v + ' hrs' : v;
          c.querySelector('[data-d="-1"]').disabled = v <= min;
          c.querySelector('[data-d="1"]').disabled = v >= max;
          if (k === 'hours') { var e = root.querySelector('[data-endtime]'); if (e) e.textContent = endHint(); }
        }
        c.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          var cur = parseInt(f[k], 10);
          if (isNaN(cur)) cur = k === 'guests' ? 0 : min;
          var nv = cur + step * (+b.dataset.d);
          if (step > 1 && +b.dataset.d > 0 && cur % step) nv = Math.ceil(cur / step) * step;
          if (step > 1 && +b.dataset.d < 0 && cur % step) nv = Math.floor(cur / step) * step;
          set(nv);
        });
        if (inp) {
          inp.addEventListener('input', function () {
            var clean = inp.value.replace(/[^0-9]/g, '').slice(0, 5);
            if (clean !== inp.value) inp.value = clean;
            f[k] = clean;
            root.querySelector('.err').textContent = '';
          });
          inp.addEventListener('blur', function () { if (inp.value !== '') set(parseInt(inp.value, 10) || min); });
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); next(); } });
        }
      });
      var ac = root.querySelector('[data-ac]');
      if (ac) wireAutocomplete(ac);
      var dt = root.querySelector('[data-date]');
      if (dt) wireDate(dt);
      root.querySelector('.book__back').addEventListener('click', function () { if (page > 0) { dir = -1; page--; render(); scrollIntoView(); } });
      root.querySelector('.book__next').addEventListener('click', function () { page === 5 ? submit() : next(); });
    }
    function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
    function scrollIntoView() {
      var nav = document.querySelector('.nav');
      var target = (nav ? nav.offsetHeight : 0) + 12;
      var top = root.getBoundingClientRect().top;
      if (Math.abs(top - target) > 2) window.scrollTo({ top: window.scrollY + top - target, behavior: 'instant' });
      var h = root.querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }

    /* ---------- Date: type MM/DD/YYYY or pick from the calendar (future dates only) ---------- */
    var calMonth = null;
    function parseMDY(t) {
      var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t.trim());
      if (!m) return '';
      var d = new Date(+m[3], +m[1] - 1, +m[2]);
      if (d.getMonth() !== +m[1] - 1 || d.getDate() !== +m[2]) return '';
      return isoDay(d);
    }
    function toMDY(iso) { var p = iso.split('-'); return p[1] + '/' + p[2] + '/' + p[0]; }
    function wireDate(inp) {
      var wrap = inp.parentNode, cal = wrap.querySelector('.cal'), btn = wrap.querySelector('.datef__btn');
      function drawCal() {
        var first = calMonth, y = first.getFullYear(), mo = first.getMonth();
        var start = new Date(y, mo, 1 - first.getDay()), min = tomorrow();
        var now = new Date(), thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        var h = '<div class="cal__head"><button type="button" data-m="-1" aria-label="Previous month"' + (first <= thisMonth ? ' disabled' : '') + '>‹</button><span>' +
          first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '</span><button type="button" data-m="1" aria-label="Next month">›</button></div><div class="cal__grid">' +
          ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<i>' + d + '</i>'; }).join('');
        for (var i = 0; i < 42; i++) {
          var d = new Date(start); d.setDate(start.getDate() + i);
          var iso = isoDay(d), out = d.getMonth() !== mo, past = iso < min;
          h += '<button type="button" data-d="' + iso + '" class="' + (out ? 'out ' : '') + (iso === f.eventDate ? 'on' : '') + '"' + (past ? ' disabled' : '') + '>' + d.getDate() + '</button>';
        }
        cal.innerHTML = h + '</div>';
      }
      function open() {
        var base = f.eventDate && f.eventDate >= tomorrow() ? new Date(f.eventDate + 'T00:00') : new Date();
        calMonth = new Date(base.getFullYear(), base.getMonth(), 1);
        drawCal(); cal.hidden = false;
      }
      function close() { cal.hidden = true; }
      btn.addEventListener('click', function () { cal.hidden ? open() : close(); });
      cal.addEventListener('mousedown', function (e) { e.preventDefault(); });
      cal.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.m) { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + (+b.dataset.m), 1); return drawCal(); }
        f.eventDate = b.dataset.d; f.eventDateText = toMDY(f.eventDate); inp.value = f.eventDateText;
        inp.classList.remove('bad'); root.querySelector('.err').textContent = ''; close();
      });
      document.addEventListener('mousedown', function (e) { if (!wrap.contains(e.target)) close(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); if (e.key === 'Enter') { e.preventDefault(); close(); next(); } });
      inp.addEventListener('input', function () {
        var digits = inp.value.replace(/[^0-9]/g, '').slice(0, 8), t = digits;
        if (digits.length > 4) t = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
        else if (digits.length > 2) t = digits.slice(0, 2) + '/' + digits.slice(2);
        if (inp.value.length < f.eventDateText.length && /\/$/.test(f.eventDateText)) t = inp.value; // let backspace through
        inp.value = t; f.eventDateText = t; f.eventDate = parseMDY(t);
        inp.classList.remove('bad'); root.querySelector('.err').textContent = '';
        if (f.eventDate && !cal.hidden) { calMonth = new Date(f.eventDate.slice(0, 4), +f.eventDate.slice(5, 7) - 1, 1); drawCal(); }
      });
    }

    /* ---------- Address autocomplete + miles ---------- */
    var acTimer = null, acItems = [], acIndex = -1, acReq = 0;
    function updMiles() { var m = root.querySelector('[data-miles]'); if (m) m.innerHTML = milesHTML(); }
    function cityMatches(q) {
      q = q.toLowerCase().trim(); if (q.length < 2) return [];
      return Object.keys(CITIES).filter(function (c) { return c.toLowerCase().indexOf(q) === 0; })
        .concat(Object.keys(CITIES).filter(function (c) { var l = c.toLowerCase(); return l.indexOf(q) > 0; }))
        .slice(0, 5).map(function (c) { return { label: c + ', CA', sub: 'City', lat: CITIES[c][0], lon: CITIES[c][1] }; });
    }
    function cityInText(text) {
      var t = ' ' + text.toLowerCase().replace(/[^a-zñ ]/g, ' ') + ' ', best = null;
      Object.keys(CITIES).forEach(function (c) {
        if (t.indexOf(' ' + c.toLowerCase() + ' ') > -1 && (!best || c.length > best.length)) best = c;
      });
      return best;
    }
    function suggest(q) {
      clearTimeout(acTimer);
      if (q.trim().length < 3) return showAc([]);
      var mine = ++acReq;
      acTimer = setTimeout(function () {
        var local = cityMatches(q);
        if (!window.fetch || !window.AbortController) return showAc(local);
        var ctl = new AbortController(); var t = setTimeout(function () { ctl.abort(); }, 2500);
        fetch('https://photon.komoot.io/api/?limit=6&lang=en&lat=33.84&lon=-117.91&bbox=-119.6,32.5,-115.9,35.0&q=' + encodeURIComponent(q), { signal: ctl.signal })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            clearTimeout(t); if (mine !== acReq) return;
            var res = (j.features || []).filter(function (x) { return (x.properties.state || '') === 'California'; }).map(function (x) {
              var p = x.properties;
              var line1 = [p.housenumber, p.street].filter(Boolean).join(' ') || p.name || '';
              if (p.name && p.street && p.name !== p.street) line1 = p.name + (line1 && line1 !== p.name ? ', ' + line1 : '');
              var line2 = [p.city || p.district || p.county, p.postcode].filter(Boolean).join(', ');
              return { label: [line1, p.city].filter(Boolean).join(', '), sub: line2 + (line2 ? ', CA' : 'CA'), lat: x.geometry.coordinates[1], lon: x.geometry.coordinates[0] };
            });
            showAc(res.length ? res.slice(0, 5) : local);
          })
          .catch(function () { clearTimeout(t); if (mine === acReq) showAc(local); });
      }, 220);
    }
    function showAc(items) {
      var box = root.querySelector('.ac'); if (!box) return;
      acItems = items; acIndex = -1;
      if (!items.length) { box.hidden = true; box.innerHTML = ''; return; }
      box.innerHTML = items.map(function (it, k) { return '<button type="button" data-i="' + k + '">' + esc(it.label) + '<small>' + esc(it.sub) + '</small></button>'; }).join('');
      box.hidden = false;
    }
    function choose(it) {
      var inp = root.querySelector('[data-ac]');
      f.address = it.label + (it.sub && it.sub !== 'City' && it.label.indexOf(it.sub) === -1 ? ', ' + it.sub : '');
      f.lat = it.lat; f.lon = it.lon; f.miles = miFrom(it.lat, it.lon);
      if (inp) { inp.value = f.address; inp.classList.remove('bad'); }
      showAc([]); updMiles();
    }
    function wireAutocomplete(inp) {
      var box = root.querySelector('.ac');
      box.addEventListener('mousedown', function (e) { e.preventDefault(); });
      box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) choose(acItems[+b.dataset.i]); });
      inp.addEventListener('keydown', function (e) {
        if (box.hidden) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); acIndex = (acIndex + (e.key === 'ArrowDown' ? 1 : -1) + acItems.length) % acItems.length;
          Array.prototype.forEach.call(box.children, function (b, k) { b.classList.toggle('hi', k === acIndex); });
        } else if (e.key === 'Enter') { e.preventDefault(); choose(acItems[Math.max(0, acIndex)]); }
        else if (e.key === 'Escape') showAc([]);
      });
      inp.addEventListener('blur', function () { setTimeout(function () { showAc([]); fallbackMiles(); }, 120); });
    }
    function fallbackMiles() {
      if (f.miles != null || !f.address) return;
      var c = cityInText(f.address);
      if (c) { f.lat = CITIES[c][0]; f.lon = CITIES[c][1]; f.miles = miFrom(f.lat, f.lon); }
      updMiles();
    }

    /* ---------- Validation + navigation ---------- */
    function bad(msg, sel) {
      root.querySelector('.err').textContent = msg;
      if (sel) { var el = root.querySelector(sel); if (el) { el.classList.add('bad'); el.focus && el.focus(); } }
      return false;
    }
    function valid() {
      root.querySelector('.err').textContent = '';
      if (page === 0) {
        if (!f.eventDateText) return bad('Please choose your event date.', '[data-date]');
        if (!f.eventDate) return bad('Please enter the date as MM/DD/YYYY.', '[data-date]');
        if (f.eventDate < tomorrow()) return bad('Please choose a date in the future.', '[data-date]');
        if (f.start === '') return bad('Please choose a start time.', '[data-k="start"]');
        if (!(guests() > 0)) return bad('Please enter your estimated number of guests.', '[data-count="guests"] input');
      } else if (page === 1) {
        fallbackMiles();
        if (!f.eventType) return bad('Please choose an event type.');
        if (!f.address.trim()) return bad('Please enter the venue address.', '[data-k="address"]');
        if (!f.eventSpace) return bad('Please choose indoor or outdoor.');
      } else if (page === 2) {
        if (!f.serviceType) return bad('Please choose a type of service.');
        if (!f.cupSize) return bad('Please choose a cup size.');
        if (!f.packageChoice) return bad('Please choose a package or custom.');
        if (f.packageChoice === 'custom' && (parseInt(f.customCups, 10) || 0) < MIN_CUPS) return bad('Custom orders start at 50 cups.', '[data-count="customCups"] input');
      } else if (page === 4) {
        if (!f.name.trim()) return bad('Please enter your name.', '[data-k="name"]');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return bad('Please enter a valid email.', '[data-k="email"]');
        if (f.phone.replace(/\D/g, '').length < 10) return bad('Please enter a phone number.', '[data-k="phone"]');
        if (!f.howHeard) return bad('Please tell us how you heard about us.', '[data-k="howHeard"]');
      }
      return true;
    }
    function next() {
      if (!valid()) return;
      if (page === 4) saveLead('Viewed estimate');     // lead lands in the sheet before they send anything
      else if (page > 4) saveLead('Updated');
      dir = 1; page = Math.min(page + 1, 5); render(); scrollIntoView();
    }

    function done(note) {
      root.innerHTML = '<div class="book__steps">' + PAGES.map(function () { return '<i class="on"></i>'; }).join('') + '</div>' +
        '<div class="done"><p class="hand">thank you, ' + esc(f.name.split(' ')[0] || 'friend') + '!</p>' +
        '<h3>Your estimate is on its way.</h3><p class="sub">Don’t forget to check your spam folder! Our team will contact you to confirm!</p>' +
        (note ? '<p class="fine">' + note + '</p>' : '') + '</div>';
    }
    function submit() {
      if (sent) return;
      var btn = root.querySelector('.book__next'), err = root.querySelector('.err');
      btn.disabled = true; btn.textContent = 'Sending…';
      var pr = price(), row = leadRow('Quote sent');
      var hp = root.querySelector('[data-hp]');
      var payload = { website: hp ? hp.value : '', lead: row, priceBreakdown: pr.items.map(function (x) { return { label: x[0], amount: x[1] }; }), total: pr.total };
      var live = /thebevebar\.com$|vercel\.app$/.test(location.hostname);
      fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () { sent = true; saveLead('Quote sent'); done(); })
        .catch(function () {
          if (!live) { sent = true; return done('Preview only: no email was sent. Quotes email out once the site is live.'); }
          btn.disabled = false; btn.textContent = 'Send my quote';
          err.textContent = 'Something went wrong. Please try again or email thebevebar@gmail.com.';
        });
    }

    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (el) { Booking(el); });
})();
