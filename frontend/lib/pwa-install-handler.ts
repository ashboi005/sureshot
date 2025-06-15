'use client';

// This script needs to be loaded early to capture the beforeinstallprompt event

if (typeof window !== 'undefined') {
  // Store if the app is already installed
  const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
  
  // Set a flag that can be checked by other components
  (window as any).isPWAInstalled = isPWAInstalled;
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    (window as any).deferredPrompt = e;
    console.log('PWA install prompt available');
  });
  
  // Listen for the appinstalled event
  window.addEventListener('appinstalled', (e) => {
    console.log('PWA was installed');
    // Clear the deferredPrompt so we know installation has happened
    (window as any).deferredPrompt = null;
    (window as any).isPWAInstalled = true;
  });
  
  // Check if display-mode changes (e.g., if user installs the PWA)
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) {
      console.log('App is now running as standalone (installed)');
      (window as any).isPWAInstalled = true;
    }
  });
}
