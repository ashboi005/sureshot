'use client';

import dynamic from 'next/dynamic';

// Dynamically import the InstallAppCard component
const InstallAppCard = dynamic(
  () => import('./install-app-card').then(mod => mod.InstallAppCard),
  { ssr: false }
);

interface InstallAppCardWrapperProps {
  className?: string;
}

export function InstallAppCardWrapper({ className = "" }: InstallAppCardWrapperProps) {
  return <InstallAppCard className={className} />;
}
