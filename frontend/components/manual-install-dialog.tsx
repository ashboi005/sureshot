'use client';

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManualInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualInstallDialog({ isOpen, onClose }: ManualInstallDialogProps) {
  // Detect platform
  const [platform, setPlatform] = useState(() => {
    if (typeof window !== 'undefined') {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return 'ios';
      if (/Android/.test(navigator.userAgent)) return 'android';
      return 'desktop';
    }
    return 'desktop';
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install VaxTrack App</DialogTitle>
          <DialogDescription>
            Follow these steps to install the app on your device
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={platform} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ios" className="space-y-4">
            <div className="rounded-lg border p-4 mt-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li>Tap the <strong>Share</strong> icon (📤) at the bottom of your browser</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>Tap <strong>Add</strong> in the top right corner</li>
              </ol>
              <div className="flex justify-center mt-4">
                <div className="relative h-40 w-64">
                  <Image 
                    src="/download.jpeg"
                    alt="iOS Installation"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="android" className="space-y-4">
            <div className="rounded-lg border p-4 mt-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li>Tap the <strong>Menu</strong> icon (⋮) in the top right of Chrome</li>
                <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                <li>Follow the on-screen instructions to complete installation</li>
              </ol>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Note: If you don't see the install option, the app might not be installable on your device or browser.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="desktop" className="space-y-4">
            <div className="rounded-lg border p-4 mt-4">
              <ol className="list-decimal pl-5 space-y-3">
                <li>Look for the <strong>Install</strong> icon (➕) in your browser's address bar</li>
                <li>Click on it and follow the prompts to install</li>
                <li>After installation, the app will open in its own window</li>
              </ol>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Note: If you don't see an install icon, try Chrome, Edge, or another Chromium-based browser.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
