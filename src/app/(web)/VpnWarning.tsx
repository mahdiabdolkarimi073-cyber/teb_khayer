"use client";

import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import styles from "./home.module.css";

type NetworkStatus = {
  isOutsideIran: boolean;
};

const CHECK_INTERVAL = 5 * 60 * 1000;

export default function VpnWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkNetworkStatus() {
      if (!navigator.onLine) return;

      try {
        const response = await fetch("/api/network-status", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) return;

        const status = (await response.json()) as NetworkStatus;
        if (!cancelled) setShow(status.isOutsideIran);
      } catch {
        if (!cancelled) setShow(false);
      }
    }

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkNetworkStatus();
    };

    void checkNetworkStatus();
    const interval = window.setInterval(checkNetworkStatus, CHECK_INTERVAL);
    window.addEventListener("online", checkNetworkStatus);
    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("online", checkNetworkStatus);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={styles.vpnBanner} role="alert">
      <img
        className={styles.vpnImage}
        src="/IMG_20260926_221538.jpg"
        alt="برای دریافت خدمات بهتر، لطفاً فیلترشکن خود را خاموش کنید"
      />
      <button type="button" onClick={() => setShow(false)} aria-label="بستن">
        <IconX size={14} />
      </button>
    </div>
  );
}
