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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Copy, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

const streamEndpoints = [
    { name: "Basic Call Data", path: "/api/stream" },
    { name: "Advanced Call Data", path: "/api/stream/advanced-calls" },
    { name: "Agent Status", path: "/api/stream/agent-status" },
    { name: "Profile Availability", path: "/api/stream/profile-availability" },
];

export function SettingsDialog() {
  const [baseUrl, setBaseUrl] = useState("");
  const { toast } = useToast();
  const [isDataStreaming, setIsDataStreaming] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The URL has been copied to your clipboard.",
    });
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    try {
        const response = await fetch('/api/data/delete', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to delete data');
        }
        toast({
            title: "Success!",
            description: "All application data has been deleted.",
        });
        // Optionally, refresh the page or state
        window.location.reload();
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete data. Please try again.",
        });
    } finally {
        setIsDeleting(false);
        setIsAlertOpen(false);
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage application settings and configurations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
              <div className="space-y-4">
                  <h3 className="text-lg font-medium">Toggles</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="data-streaming" className="text-base">Data Streaming</Label>
                              <p className="text-sm text-muted-foreground">
                                  Enable or disable real-time data streaming.
                              </p>
                          </div>
                          <Switch
                              id="data-streaming"
                              checked={isDataStreaming}
                              onCheckedChange={setIsDataStreaming}
                          />
                      </div>
                       <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                              <Label htmlFor="ai-analysis" className="text-base">AI Analysis</Label>
                              <p className="text-sm text-muted-foreground">
                                  Enable or disable GenAI-powered analysis features.
                              </p>
                          </div>
                          <Switch
                              id="ai-analysis"
                              checked={isAiEnabled}
                              onCheckedChange={setIsAiEnabled}
                          />
                      </div>
                  </div>
              </div>

              <Separator />

              <div>
                  <h3 className="text-lg font-medium mb-1">Data Stream Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                      Configure your PBX system to send POST requests to these endpoints.
                  </p>
                  <div className="space-y-4">
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
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                 <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="delete-data" className="text-base text-destructive">Delete All Data</Label>
                        <p className="text-sm text-muted-foreground">
                            This will permanently delete all call and agent data. This action cannot be undone.
                        </p>
                    </div>
                    <Button
                        id="delete-data"
                        variant="destructive"
                        onClick={() => setIsAlertOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Data
                    </Button>
                </div>
              </div>
          </div>

        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all application data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteData}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete all data"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
