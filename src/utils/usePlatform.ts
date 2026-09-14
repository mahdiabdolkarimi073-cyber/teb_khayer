"use client";

import {useEffect, useState} from "react";

export type Platform = "ios" | "android" | "web";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("web");

  useEffect(() => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      setPlatform("ios");
    } else if (/Android/.test(userAgent)) {
      setPlatform("android");
    }
  }, []);

  return platform;
}
