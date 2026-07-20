"use client";

import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** True when Turnstile is configured for this deployment. */
export const captchaEnabled = !!SITE_KEY;

// How many times we quietly re-run the challenge before showing the user
// anything. Cloudflare errors are usually transient (network/VPN blips), so a
// silent retry clears most of them without the user ever noticing.
const MAX_AUTO_RETRIES = 2;
const RETRY_DELAY_MS = 2500;

let scriptPromise = null;
function loadScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { scriptPromise = null; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Cloudflare Turnstile widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, so auth keeps working
 * in environments without CAPTCHA configured.
 *
 * On a challenge error the widget quietly retries a couple of times, and only
 * if it still can't verify does it surface a friendly banner with a "Try
 * again" button — so a transient Cloudflare hiccup can never leave the submit
 * button disabled with no way forward (which is what used to strand users).
 *
 * Props:
 *  - onToken(token|null): called with a fresh token, or null when it expires/errors.
 *  - resetSignal: bump this number to force a fresh challenge (tokens are single-use).
 */
export default function Turnstile({ onToken, resetSignal = 0 }) {
  const boxRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const retriesRef = useRef(0);
  const retryTimerRef = useRef(null);
  // false = healthy; 'verify' = challenge keeps failing; 'script' = api.js never loaded.
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;

    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    loadScript().then(() => {
      if (cancelled || !boxRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token) => {
          // Success: clear any error state and reset the retry budget.
          retriesRef.current = 0;
          clearRetryTimer();
          setFailure(false);
          onTokenRef.current?.(token);
        },
        "expired-callback": () => onTokenRef.current?.(null),
        "error-callback": () => {
          onTokenRef.current?.(null);
          if (cancelled) return true;
          if (retriesRef.current < MAX_AUTO_RETRIES) {
            // Quietly retry before bothering the user.
            retriesRef.current += 1;
            clearRetryTimer();
            retryTimerRef.current = setTimeout(() => {
              retryTimerRef.current = null;
              if (cancelled || widgetIdRef.current === null || !window.turnstile) return;
              try { window.turnstile.reset(widgetIdRef.current); } catch {}
            }, RETRY_DELAY_MS);
          } else {
            // Out of quiet retries — show the recoverable banner.
            setFailure("verify");
          }
          return true; // tell Turnstile we handled the error
        },
      });
    }).catch(() => {
      // api.js was blocked or failed to load (ad blocker / privacy extension /
      // network). Surface a distinct banner whose recovery is a hard reload.
      if (!cancelled) setFailure("script");
    });

    return () => {
      cancelled = true;
      clearRetryTimer();
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile) {
      onTokenRef.current?.(null);
      try { window.turnstile.reset(widgetIdRef.current); } catch {}
    }
  }, [resetSignal]);

  // Manual "Try again" for the recoverable (challenge) failure: reset the retry
  // budget, clear the banner, and re-run the challenge.
  const handleRetry = () => {
    retriesRef.current = 0;
    setFailure(false);
    onTokenRef.current?.(null);
    if (widgetIdRef.current !== null && window.turnstile) {
      try { window.turnstile.reset(widgetIdRef.current); } catch {}
    } else {
      window.location.reload();
    }
  };

  if (!SITE_KEY) return null;

  return (
    <div>
      <div ref={boxRef} className="flex justify-center" />
      {failure && (
        <div
          role="alert"
          className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-sm text-amber-200"
        >
          {failure === "script" ? (
            <>
              {"The security check couldn’t load — usually an ad blocker or privacy extension is blocking it. It’s not your password. "}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="underline font-semibold text-amber-100 hover:text-white"
              >
                Reload the page
              </button>
              {" (or allow challenges.cloudflare.com), then try again."}
            </>
          ) : (
            <>
              {"The quick security check couldn’t verify your browser. This is usually a temporary network, VPN, or privacy-extension hiccup — it’s not your password. "}
              <button
                type="button"
                onClick={handleRetry}
                className="underline font-semibold text-amber-100 hover:text-white"
              >
                Try again
              </button>
              {" — or refresh the page if it keeps happening."}
            </>
          )}
        </div>
      )}
    </div>
  );
}
