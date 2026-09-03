"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}

// Cloudflare official test sitekey (always passes successfully) as default fallback if env var is unset
const DEFAULT_SITE_KEY = "1x00000000000000000000AA";

export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_SITE_KEY;

  useEffect(() => {
    // Check if script already injected
    const SCRIPT_ID = "cf-turnstile-script";
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkLoaded = () => {
      if (window.turnstile) {
        setIsLoaded(true);
      } else {
        setTimeout(checkLoaded, 100);
      }
    };

    checkLoaded();
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;

    // If widget was already rendered, remove old one
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore cleanup error
      }
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": () => {
          onError?.();
        },
      });
    } catch (err) {
      console.error("[Turnstile] Render error:", err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, [isLoaded, siteKey, onVerify, onExpire, onError]);

  return (
    <div className={`turnstile-container flex flex-col gap-1.5 ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center" />
      <span className="font-mono text-[10px] text-muted tracking-wider">
        Protected by Cloudflare Turnstile &middot; I&apos;m not a robot
      </span>
    </div>
  );
}
