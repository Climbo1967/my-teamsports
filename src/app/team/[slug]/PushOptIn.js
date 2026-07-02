"use client";

import { useEffect, useState } from "react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushOptIn({ slug, teamName }) {
  const [state, setState] = useState("hidden"); // hidden|idle|working|done|denied|need-install|error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!supported || !VAPID) return; // stay hidden where unsupported
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub ? "done" : "idle");
      } catch {
        if (!cancelled) setState("idle");
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("working");
    setMsg("");
    try {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
      if (isIOS && !standalone) { setState("need-install"); return; }

      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not turn on alerts.");
      }
      setState("done");
    } catch (e) {
      setState("error");
      setMsg(e?.message || "Something went wrong.");
    }
  }

  async function disable() {
    setState("working");
    setMsg("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const endpoint = sub?.endpoint;
      if (sub) await sub.unsubscribe();
      if (endpoint) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, endpoint }),
        }).catch(() => {});
      }
      setState("idle");
    } catch (e) {
      setState("error");
      setMsg(e?.message || "Something went wrong.");
    }
  }

  if (state === "hidden") return null;

  return (
    <div className="flex flex-col items-center gap-1.5 my-4">
      {state === "done" ? (
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-green-400 font-medium">🔔 Alerts on for {teamName} on this device</p>
          <button onClick={disable} className="text-xs text-slate-400 underline hover:text-slate-200 transition-colors">
            Turn off alerts
          </button>
        </div>
      ) : state === "need-install" ? (
        <p className="text-xs text-slate-400 max-w-xs text-center">
          📱 On iPhone, tap <strong>Share → Add to Home Screen</strong>, open the app from your home screen, then turn on alerts.
        </p>
      ) : state === "denied" ? (
        <p className="text-xs text-slate-500 max-w-xs text-center">
          Notifications are blocked in your browser settings. Re-enable them there to get alerts.
        </p>
      ) : (
        <button
          onClick={enable}
          disabled={state === "working"}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-white/15 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          🔔 {state === "working" ? "Working…" : "Get game alerts"}
        </button>
      )}
      {state === "error" && <p className="text-xs text-red-400">{msg}</p>}
      {state === "idle" && <p className="text-[11px] text-slate-500">Free · announcements &amp; game updates on your phone</p>}
    </div>
  );
}
