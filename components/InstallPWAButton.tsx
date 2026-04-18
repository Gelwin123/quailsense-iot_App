// components/InstallPWAButton.tsx
"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    const appInstalled = () => {
      setInstalled(true);
      setShowButton(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", appInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log(
      choiceResult.outcome === "accepted" ? "PWA installed" : "PWA install dismissed"
    );
    setDeferredPrompt(null);
    setShowButton(false);
    setInstalled(true);
  };

  if (!showButton || installed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
      <button
        onClick={handleInstallClick}
        className="px-5 py-3 bg-green-600 text-white font-semibold rounded-full shadow-2xl hover:bg-green-700 transition-transform transform hover:scale-105"
      >
        Install QuailSense App
      </button>
    </div>
  );
}
