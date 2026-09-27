"use client";

import { useState, useEffect } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import styles from "./home.module.css";

export default function VpnWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkVpn() {
      try {
        const start = performance.now();
        const res = await fetch("/robots.txt", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (cancelled) return;
        const elapsed = performance.now() - start;

        const entries = performance.getEntriesByName(window.location.origin + "/robots.txt") as PerformanceResourceTiming[];
        const timing = entries[entries.length - 1];
        const duration = timing ? timing.duration : elapsed;

        if (duration > 600) {
          setShow(true);
        }
      } catch {
        // Network error — don't show VPN warning
      }
    }

    const timer = setTimeout(checkVpn, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={styles.vpnBanner} role="alert">
      <IconAlertTriangle size={20} aria-hidden="true" />
      <span>برای دریافت خدمات بهتر، لطفاً فیلترشکن خود را خاموش کنید.</span>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="بستن"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
