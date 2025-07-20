

"use client";

import { useState, useMemo } from "react";
import type { CallData } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpCircle, Link, Circle } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ROWS_PER_PAGE = 10;

export default function CallLog({ data }: { data: CallData[] }) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(b.enter_datetime).getTime() - new Date(a.enter_datetime).getTime());
    
    const lowercasedFilter = filter.toLowerCase();

    return sortedData
      .filter((call) =>
        statusFilter === "all" ? true : call.status.trim().toLowerCase() === statusFilter.trim().toLowerCase()
      )
      .filter(
        (call) => {
          if (!filter) return true;
          // Check all relevant fields for a match
          return Object.values(call).some(value => 
            value && value.toString().toLowerCase().includes(lowercasedFilter)
          );
        }
      );
  }, [data, filter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const getStatusVariant = (
    status: CallData["status"]
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed":
        return "default";
      case "Abandoned":
        return "destructive";
      case "Redirected":
        return "secondary";
      case "Direct call":
        return "outline";
      default:
        return "secondary";
    }
  };
  
  const getDirectionIcon = (statusDetail: string | undefined) => {
    const detail = statusDetail?.toLowerCase() || '';
    if (detail.includes("incoming")) {
      return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
    }
    if (detail.includes("outgoing")) {
      return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
    }
    return <Circle className="h-2 w-2 text-muted-foreground fill-current" />; // Default neutral icon
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Log</CardTitle>
        <CardDescription>
          Vue détaillée des appels individuels pour la journée en cours.
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
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Abandoned">Abandoned</SelectItem>
              <SelectItem value="Redirected">Redirected</SelectItem>
              <SelectItem value="Direct call">Direct Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Callee</TableHead>
                <TableHead>Wait</TableHead>
                <TableHead>Talk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Call ID</TableHead>
                <TableHead>Parent Call ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((call, index) => {
                  const isOutgoing = call.status_detail?.toLowerCase().includes("outgoing");
                  const callerDisplay = isOutgoing ? call.agent : call.calling_number;
                  const agentDisplay = isOutgoing ? call.calling_number : call.agent;

                  return (
                  <TableRow key={`${call.call_id}-${index}`}>
                     <TableCell>
                      <div>{new Date(call.enter_datetime).toLocaleDateString('fr-FR')}</div>
                      <div className="text-xs text-muted-foreground">{new Date(call.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {getDirectionIcon(call.status_detail)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{call.status_detail || 'No detail available'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                         <div className="font-semibold">{callerDisplay}</div>
                      </div>
                    </TableCell>
                    <TableCell>{call.queue_name || "-"}</TableCell>
                    <TableCell>{agentDisplay || "N/A"}</TableCell>
                    <TableCell>{call.time_in_queue_seconds || 0}s</TableCell>
                    <TableCell>{call.processing_time_seconds || 0}s</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                        <div>{call.call_id}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                        {call.parent_call_id ? (
                            <div className="flex items-center gap-1">
                                <Link className="h-3 w-3"/>
                                <span>{call.parent_call_id}</span>
                            </div>
                        ) : '-'}
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
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
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
