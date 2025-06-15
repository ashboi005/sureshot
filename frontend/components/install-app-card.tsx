'use client';

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { ManualInstallDialog } from "./manual-install-dialog";

interface InstallCardProps {
  className?: string;
}

export function InstallAppCard({ className = "" }: InstallCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);

  // Only display on non-installed experiences and devices that can install PWAs
  const [showInstallCard, setShowInstallCard] = useState(true);

  // Check if we're in a browser environment and if it's already installed as PWA
  const isStandalone = typeof window !== 'undefined' && (
    (window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true) ||
    (window as any).isPWAInstalled === true
  );

  if (dismissed || !showInstallCard || isStandalone) {
    return null;
  }
  return (
    <>
      <ManualInstallDialog 
        isOpen={showManualDialog} 
        onClose={() => setShowManualDialog(false)} 
      />
      
      <Card className={`${className} relative overflow-hidden border-primary/20`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 h-8 w-8 rounded-full"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

      <CardHeader>
        <CardTitle>Download Our App</CardTitle>
        <CardDescription>
          Get quick access to vaccination information anytime, even offline
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium">App Benefits:</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>Works offline</li>
            <li>Faster access</li>
            <li>Push notifications</li>
            <li>No app store required</li>
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <Image 
              src="/icons/icon.png"
              alt="App Icon"
              fill
              className="rounded-xl object-contain"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="grid w-full gap-2">
          <Button className="w-full" onClick={() => {
            const installPromptEvent = (window as any).deferredPrompt;
            if (installPromptEvent) {
              // Show the prompt
              installPromptEvent.prompt();
              // Wait for the user to respond to the prompt
              installPromptEvent.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                  setShowInstallCard(false);
                } else {
                  console.log('User dismissed the install prompt');
                }
                (window as any).deferredPrompt = null;
              });
            } else {
              // Show our visual manual installation dialog
              setShowManualDialog(true);
            }
          }}>
            <Download className="mr-2 h-4 w-4" /> Install App
          </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
