"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  swRegistered: boolean;
  installApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  showBanner: boolean;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isOffline: false,
  swRegistered: false,
  installApp: async () => {},
  dismissInstallPrompt: () => {},
  showBanner: false,
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check if installed in standalone mode
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setIsInstalled(isStandalone);

      // Register Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
            setSwRegistered(true);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      }

      // Listen for PWA installation prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(promptEvent);
        setIsInstallable(true);
        
        // Show banner if user hasn't dismissed it in this session
        const dismissed = sessionStorage.getItem("pwa_install_dismissed");
        if (!dismissed) {
          setShowBanner(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
        console.log("[PWA] App installed successfully!");
      });

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert("Aplikasi DAPAJO CAMPUS sudah terpasang atau browser Anda dapat menginstall langsung melalui menu opsi (Tambah ke Layar Utama).");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted installation prompt");
        setShowBanner(false);
      } else {
        console.log("[PWA] User dismissed installation prompt");
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error("[PWA] Error prompting install:", err);
    }
  };

  const dismissInstallPrompt = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_install_dismissed", "true");
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOffline,
        swRegistered,
        installApp,
        dismissInstallPrompt,
        showBanner,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export const usePWA = () => useContext(PWAContext);
