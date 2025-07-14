'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const streamEndpoints = [
    { name: "Basic Call Data", path: "/api/stream" },
    { name: "Advanced Call Data", path: "/api/stream/advanced-calls" },
    { name: "Agent Status", path: "/api/stream/agent-status" },
    { name: "Profile Availability", path: "/api/stream/profile-availability" },
];

export function SettingsDialog() {
  const [baseUrl, setBaseUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // This ensures window is defined, preventing SSR issues.
    setBaseUrl(window.location.origin);
  }, []);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The URL has been copied to your clipboard.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Data Stream Configuration</DialogTitle>
          <DialogDescription>
            Configure your PBX system to send POST requests to these endpoints.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            {streamEndpoints.map(endpoint => {
                const fullUrl = `${baseUrl}${endpoint.path}`;
                return (
                    <div key={endpoint.path} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={endpoint.path} className="text-right">
                           {endpoint.name}
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id={endpoint.path}
                                value={fullUrl}
                                readOnly
                                className="pr-10"
                            />
                             <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => handleCopy(fullUrl)}
                            >
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy URL</span>
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
