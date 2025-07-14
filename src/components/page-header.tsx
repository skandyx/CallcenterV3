'use client';

import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "./ui/button";
import { CalendarIcon, Monitor } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { StreamStatusIndicator } from "./stream-status-indicator";

interface PageHeaderProps {
    title: string;
    selectedDate?: Date;
    onDateChange?: (date: Date | undefined) => void;
}

export default function PageHeader({ title, selectedDate, onDateChange }: PageHeaderProps) {
    const handleDateChange = (date: Date | undefined) => {
        if (onDateChange) {
            onDateChange(date);
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-2">
                <StreamStatusIndicator />
                <h1 className="text-2xl font-bold">{title === 'Dashboard' ? 'Call Center Analytics' : title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
                {onDateChange && (
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
                                onSelect={handleDateChange}
                                initialFocus
                            />
                            <div className="p-2 border-t border-border">
                                <Button variant="link" size="sm" onClick={() => handleDateChange(undefined)}>Clear selection</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                <Button variant="outline" size="icon">
                    <Monitor className="h-4 w-4" />
                    <span className="sr-only">Wallboard</span>
                </Button>
                <SettingsDialog />
            </div>
        </header>
    );
}
