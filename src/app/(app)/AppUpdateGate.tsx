"use client";

import {useEffect, useRef} from "react";
import {modals} from "@mantine/modals";
import {usePlatform} from "@/utils/usePlatform";
import {appVersionConfig} from "@/config/app-version";
import {ForceUpdateModal} from "@/components/ForceUpdateModal";

function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export default function AppUpdateGate() {
  const platform = usePlatform();
  const opened = useRef(false);

  useEffect(() => {
    if (platform !== "android" || opened.current) return;
    opened.current = true;

    fetch("/api/app/version", {cache: "no-store"})
      .then((response) => {
        if (!response.ok) throw new Error("version-check-failed");
        return response.json();
      })
      .then((version: typeof appVersionConfig) => {
        const updateRequired = version.forceUpdate && compareVersions(version.latestVersion, appVersionConfig.currentVersion) > 0;
        const minimumRequired = compareVersions(version.minRequiredVersion, appVersionConfig.currentVersion) > 0;
        if (!updateRequired && !minimumRequired) return;

        modals.open({
          modalId: "mandatory-app-update",
          title: "به‌روزرسانی ضروری",
          centered: true,
          withCloseButton: false,
          closeOnClickOutside: false,
          closeOnEscape: false,
          children: <ForceUpdateModal updateUrl={version.updateUrl} releaseNotes={version.releaseNotes}/>,
        });
      })
      .catch(() => {
        opened.current = false;
      });
  }, [platform]);

  return null;
}
