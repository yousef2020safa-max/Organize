// Keeps Organize working offline and shows the daily reminder. Bump CACHE when the app shell changes.
var CACHE = 'organize-v4';
// Written by the page on every change: how many tasks are open and which one is on top.
var STATE_CACHE = 'organize-state';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE && k !== STATE_CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  // Pages: try the network so updates show up, fall back to the cached copy offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./', copy); }); }
        return res;
      }).catch(function () { return caches.match('./'); })
    );
    return;
  }

  // Everything else: serve from cache right away and refresh it in the background.
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res.ok || res.type === 'opaque') { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysToJan1() {
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((new Date(now.getFullYear() + 1, 0, 1).getTime() - today) / 86400000);
}

// GitHub only sends a ping at 6 pm. The words come from the list on this phone.
function buildReminder(event) {
  var fallback = { title: 'Don\u2019t forget your list', body: 'Open Organize and do the one on top.' };
  try {
    var data = event.data && event.data.json();
    if (data && data.title) fallback = { title: data.title, body: data.body || '' };
  } catch (err) {}

  return caches.open(STATE_CACHE)
    .then(function (c) { return c.match('state.json'); })
    .then(function (res) { return res ? res.json() : null; })
    .then(function (state) {
      if (!state) return fallback;
      // If the app hasn't been opened today, yesterday's checks don't count.
      var fresh = state.date === todayKey();
      var prayers = fresh ? (state.prayer || 0) : 0;
      var dailyLeft = (state.daily || [])
        .filter(function (d) { return !fresh || !d.done; })
        .map(function (d) { return d.id === 'prayer' ? 'prayer (' + prayers + '/5)' : d.id; });
      var open = state.open || 0;
      var total = open + dailyLeft.length;
      var days = daysToJan1();
      var countdown = days + (days === 1 ? ' day' : ' days') + ' left until Jan 1.';
      try {
        if (self.navigator.setAppBadge) {
          if (total) self.navigator.setAppBadge(total); else self.navigator.clearAppBadge();
        }
      } catch (err) {}
      if (!total) return { title: 'All done today', body: 'Nothing left. ' + countdown };
      var parts = [];
      if (dailyLeft.length) parts.push('Left today: ' + dailyLeft.join(', ') + '.');
      if (open) parts.push('Next up: ' + state.next + '.');
      parts.push(countdown);
      return { title: 'Don\u2019t forget: ' + total + ' to do', body: parts.join(' ') };
    })
    .catch(function () { return fallback; });
}

self.addEventListener('push', function (e) {
  e.waitUntil(buildReminder(e).then(function (n) {
    return self.registration.showNotification(n.title, {
      body: n.body,
      tag: 'organize-daily',
      icon: 'icons/icon-192.png',
      data: { url: './' }
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      return self.clients.openWindow('./');
    })
  );
});
