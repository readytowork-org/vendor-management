// Host context. Null outside Power Apps, e.g. npm run dev.

import { useEffect, useState } from "react";
import { getContext } from "@microsoft/power-apps/app";
import type { IContext } from "@microsoft/power-apps/app";

export interface PowerAppsContextInfo {
  context: IContext | null;
  loading: boolean;
  /** Should match environmentId in power.config.json. */
  environmentId: string | null;
  /** Dataverse org URL. null when no Dataverse is linked. */
  dataverseOrgUrl: string | null;
  userName: string | null;
  /** Two characters for the avatar. */
  userInitials: string | null;
}

/** "山田 太郎" gives 山田; "Taro Yamada" gives TY. */
function toInitials(fullName: string | undefined): string | null {
  const name = (fullName ?? "").trim();
  if (!name) return null;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2);
}

export function usePowerAppsContext(): PowerAppsContextInfo {
  const [context, setContext] = useState<IContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeout = globalThis.setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    getContext()
      .then((ctx) => {
        if (!cancelled) {
          setContext(ctx);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        // Expected outside the host; the UI falls back.
        console.info("[COSTDB] No Power Apps host context:", err);
        if (!cancelled) setLoading(false);
      })
      .finally(() => {
        globalThis.clearTimeout(timeout);
      });

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeout);
    };
  }, []);

  return {
    context,
    loading,
    environmentId: context?.app.environmentId ?? null,
    dataverseOrgUrl: context?.app.dataverseOrgUrl ?? null,
    userName: context?.user.fullName ?? null,
    userInitials: toInitials(context?.user.fullName),
  };
}
