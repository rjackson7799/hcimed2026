import { useEffect, useState } from "react";

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

const STORAGE_KEY = "hci_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function readFromStorage(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

function writeToStorage(params: UtmParams): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // sessionStorage can throw in private mode — silently ignore
  }
}

function readFromUrl(): UtmParams | null {
  if (typeof window === "undefined") return null;
  const search = new URLSearchParams(window.location.search);
  const captured: UtmParams = {};
  let any = false;
  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) {
      const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof UtmParams;
      captured[camel] = value;
      any = true;
    }
  }
  return any ? captured : null;
}

/**
 * Captures UTM params from the URL on first load and persists them in
 * sessionStorage so they survive client-side navigation. Subsequent calls
 * return the persisted value.
 */
export function useUtmCapture(): UtmParams | null {
  const [utm, setUtm] = useState<UtmParams | null>(() => {
    return readFromUrl() ?? readFromStorage();
  });

  useEffect(() => {
    const fromUrl = readFromUrl();
    if (fromUrl) {
      writeToStorage(fromUrl);
      setUtm(fromUrl);
      return;
    }
    if (!utm) {
      const fromStorage = readFromStorage();
      if (fromStorage) setUtm(fromStorage);
    }
  }, []);

  return utm;
}
