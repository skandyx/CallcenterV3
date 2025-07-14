'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "./ui/button";
import { CalendarIcon, Monitor, Settings } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

interface PageHeaderProps {
    title: string;
    selectedDate: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
}

export default function PageHeader({ title, selectedDate, onDateChange }: PageHeaderProps) {
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={onDateChange}
                            initialFocus
                        />
                         <div className="p-2 border-t border-border">
                            <Button variant="link" size="sm" onClick={() => onDateChange(undefined)}>Clear selection</Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon">
                    <Monitor className="h-4 w-4" />
                    <span className="sr-only">Wallboard</span>
                </Button>
                <SettingsDialog />
            </div>
        </header>
    );
}
