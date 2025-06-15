'use client';

import dynamic from 'next/dynamic';

// Dynamically import the PwaInstallButton component
const PwaInstallButton = dynamic(
  () => import('./pwa-install-button').then(mod => mod.PwaInstallButton),
  { ssr: false }
);

export function PwaInstallButtonWrapper() {
  return <PwaInstallButton />;
}
