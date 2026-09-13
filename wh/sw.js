const CACHE = "ffd-wh-2026-09-13.4";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Never cache API calls (different origin / dynamic).
  if (url.hostname.includes("supabase.co")) return;
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request)),
  );
});

// ---- push (ported from the wholesale app) -----------------------------------
const API = "https://febchdwrgrwlfwisnnzi.supabase.co/functions/v1/api";

// The message arrives whether or not the app is open — that is the entire point.
// A note is a nudge to go and look, never the record itself.
self.addEventListener("push", (e) => {
  let n = { title: "FitFuel Delivery", body: "Something needs you.", url: "./" };
  try { if (e.data) n = { ...n, ...e.data.json() }; } catch { /* keep the default */ }

  e.waitUntil(self.registration.showNotification(n.title, {
    body: n.body,
    icon: "/icon-512.png",
    badge: "/icon-512.png",
    // Same tag replaces an earlier unread note instead of stacking five of them.
    tag: n.tag || "ffd",
    renotify: true,
    data: { url: n.url || "./" },
  }));
});

// Tapping it should land in the app that is already open, not a second copy.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL(e.notification.data?.url || "./", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.startsWith(target) && "focus" in w) return w.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});

// A browser may retire a push subscription and issue a replacement at any time.
// It fires this event once; if nobody listens, the server keeps pushing at the
// dead endpoint, prunes it, and that person silently stops being told anything —
// while their app still says notifications are on.
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil((async () => {
    try {
      const old = e.oldSubscription?.endpoint;
      let sub = e.newSubscription;
      if (!sub) {
        // Some browsers hand over the old subscription only and expect the app
        // to ask for a new one with the same key.
        const key = e.oldSubscription?.options?.applicationServerKey;
        if (!key) return;
        sub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true, applicationServerKey: key,
        });
      }
      if (!sub || !old) return;
      await fetch(API + "/push/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldEndpoint: old, subscription: sub.toJSON() }),
      });
    } catch { /* the app re-registers on next open as the backstop */ }
  })());
});
