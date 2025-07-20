
"use client";

import { useState, useMemo, Fragment } from "react";
import type { AdvancedCallData } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, Link } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const ROWS_PER_PAGE = 20;

interface AdvancedCallLogProps {
  data: AdvancedCallData[];
}

type GroupedCall = AdvancedCallData[];

export default function AdvancedCallLog({ data }: AdvancedCallLogProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const callGroups = new Map<string, AdvancedCallData[]>();
    
    // Pass 1: Group all calls by their ultimate parent ID
    data.forEach(call => {
        const parentId = call.parent_call_id || call.call_id;
        if (!callGroups.has(parentId)) {
            callGroups.set(parentId, []);
        }
        callGroups.get(parentId)!.push(call);
    });

    const finalGroups: GroupedCall[] = [];

    // Pass 2: Process groups
    callGroups.forEach((group) => {
        // Sort all calls within the group chronologically (ascending)
        group.sort((a,b) => new Date(a.enter_datetime).getTime() - new Date(b.enter_datetime).getTime());
        finalGroups.push(group);
    });

    // Sort all the groups based on their root call's datetime, descending (most recent first)
    return finalGroups.sort((groupA, groupB) => {
        const timeA = new Date(groupA[0].enter_datetime).getTime();
        const timeB = new Date(groupB[0].enter_datetime).getTime();
        return timeB - timeA;
    });

  }, [data]);

  const filteredAndPaginatedData = useMemo(() => {
     const lowercasedFilter = filter.toLowerCase();
     const filteredGroups = groupedData.filter(group => 
        group.some(call => 
            Object.values(call).some(val => 
                String(val).toLowerCase().includes(lowercasedFilter)
            )
        )
     );

     return filteredGroups.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
     );
  }, [groupedData, filter, currentPage]);
  
  const totalPages = Math.ceil(
      groupedData.filter(group => 
        group.some(call => 
            Object.values(call).some(val => 
                String(val).toLowerCase().includes(filter.toLowerCase())
            )
        )
     ).length / ROWS_PER_PAGE
  );


  const getStatusVariant = (status: AdvancedCallData["status"]): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Abandoned": return "destructive";
      case "Redirected": return "secondary";
      case "Direct call": return "outline";
      // "IVR" is no longer treated as a primary status here
      default: return "secondary";
    }
  };

  if (!data) {
      return (
          <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
          </Card>
      )
  }
  
  const renderCallRow = (item: AdvancedCallData, isChild: boolean) => {
    const isActualTransfer = item.status_detail.toLowerCase().includes('transfer');
    const isOutgoing = item.status_detail?.toLowerCase().includes("outgoing");

    const callerDisplay = isOutgoing ? item.agent : item.calling_number;
    const agentDisplay = isOutgoing ? item.calling_number : item.agent;

    return (
       <TableRow 
            key={item.call_id}
            className={cn(!isChild && "bg-muted/50")}
       >
          <TableCell className="align-top whitespace-nowrap">
            <div className="flex items-start">
              {isChild && (
                <div className="relative w-8 h-full mr-2 self-stretch">
                    <div className="absolute left-3 w-px h-full bg-border"></div>
                    <div className="absolute top-4 w-4 h-px bg-border"></div>
                </div>
              )}
               <div className={cn("flex-1", isChild && "pl-0")}>
                  <div>{new Date(item.enter_datetime).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                  <div className="text-muted-foreground text-xs">{new Date(item.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
               </div>
            </div>
          </TableCell>
          <TableCell className="font-medium align-top">
            <div className="flex items-center gap-2">
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                      <>
                        {item.status_detail?.toLowerCase().includes("incoming") && (
                            <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        )}
                        {item.status_detail?.toLowerCase().includes("outgoing") && (
                            <ArrowUpCircle className="h-4 w-4 text-red-500" />
                        )}
                        {item.parent_call_id && isActualTransfer && (
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{item.status_detail}</p>
                    </TooltipContent>
                </Tooltip>
               </TooltipProvider>
              <span>{callerDisplay}</span>
            </div>
          </TableCell>
          <TableCell className="align-top">{item.status === 'IVR' ? 'IVR' : '-'}</TableCell>
          <TableCell className="align-top">{item.queue_name || "N/A"}</TableCell>
          <TableCell className="align-top">{agentDisplay || "N/A"}</TableCell>
          <TableCell className="align-top">
            {item.status !== 'IVR' && <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>}
             {item.status === 'IVR' && "-"}
          </TableCell>
          <TableCell className="align-top">{item.status_detail}</TableCell>
          <TableCell className="align-top">{item.processing_time_seconds ?? 0}s</TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground align-top">
            {item.call_id}
          </TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground align-top">
              {item.parent_call_id ? (
                  <div className="flex items-center gap-1">
                      <Link className="h-3 w-3"/>
                      <span>{item.parent_call_id}</span>
                  </div>
              ) : '-'}
          </TableCell>
        </TableRow>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Call Log</CardTitle>
        <CardDescription>
          Journaux d'événements détaillés pour chaque appel, y compris les transferts et les tentatives. Idéal pour une analyse forensique.
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter across all columns..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>IVR</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Callee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Detail</TableHead>
                  <TableHead>Talk Time</TableHead>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Parent Call ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndPaginatedData.length > 0 ? (
                    filteredAndPaginatedData.map(group => (
                        <Fragment key={group[0].parent_call_id || group[0].call_id}>
                            {group.map((call, index) => renderCallRow(call, index > 0))}
                        </Fragment>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No advanced call data received for the selected date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end pt-4 space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
