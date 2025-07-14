'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "./ui/button";
import { CalendarIcon, Monitor, Settings } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface PageHeaderProps {
    title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-2xl font-bold">{title === 'Dashboard' ? 'Call Center Analytics' : title}</h1>
            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <Label htmlFor="live-switch" className="text-sm font-medium">Live</Label>
                    <Switch id="live-switch" defaultChecked />
                </div>
                 <div className="flex items-center gap-2">
                    <Label htmlFor="ia-switch" className="text-sm font-medium">IA</Label>
                    <Switch id="ia-switch" defaultChecked />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Pick a date
                    </span>
                </Button>
                <Button variant="outline" size="icon">
                    <Monitor className="h-4 w-4" />
                    <span className="sr-only">Wallboard</span>
                </Button>
                <SettingsDialog />
            </div>
        </header>
    );
}