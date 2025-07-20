

"use client";

import { useState, useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CallData } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Input } from "./ui/input";

const ROWS_PER_PAGE = 10;

// Helper function to generate a color palette
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff7300'
];

// Custom content renderer for the Treemap
const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, rank, name, size }: any) => {
  if (width < 20 || height < 20) {
    return null;
  }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      {width > 50 && height > 35 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 5}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            style={{ pointerEvents: 'none' }}
          >
            {name}
          </text>
          <text
             x={x + width / 2}
             y={y + height / 2 + 15}
             textAnchor="middle"
             fill="#fff"
             fontSize={12}
             fontWeight="bold"
             style={{ pointerEvents: 'none' }}
           >
            {size}
          </text>
        </>
      )}
    </g>
  );
};


export default function StatusAnalysisChart({ data }: { data: CallData[] }) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [textFilter, setTextFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const chartData = useMemo(() => {
    // If no status is selected, show breakdown by status_detail
    if (!selectedStatus) {
      const statusCounts: { [key: string]: number } = {};
      data.forEach((call) => {
        const detail = call.status_detail || "N/A";
        statusCounts[detail] = (statusCounts[detail] || 0) + 1;
      });
      return Object.entries(statusCounts)
        .map(([name, count]) => ({ name, size: count }))
        .sort((a, b) => b.size - a.size);
    }

    // If a status is selected, show breakdown by agent for that status
    const agentCounts: { [key: string]: number } = {};
    data
      .filter(call => (call.status_detail || "N/A") === selectedStatus)
      .forEach(call => {
        const agent = call.agent || "-";
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      });
    return Object.entries(agentCounts)
      .map(([name, count]) => ({ name, size: count, isAgent: true }))
      .sort((a, b) => b.size - a.size);

  }, [data, selectedStatus]);


  const filteredCalls = useMemo(() => {
    const lowercasedFilter = textFilter.toLowerCase();
    return data.filter(call => {
        const statusMatch = selectedStatus ? (call.status_detail || "N/A") === selectedStatus : true;
        const agentMatch = selectedAgent ? (call.agent || "-") === selectedAgent : true;
        const textSearchMatch = !lowercasedFilter || Object.values(call).some(val => 
            String(val).toLowerCase().includes(lowercasedFilter)
        );
        return statusMatch && agentMatch && textSearchMatch;
    });
  }, [data, selectedStatus, selectedAgent, textFilter]);

  const totalPages = Math.ceil(filteredCalls.length / ROWS_PER_PAGE);
  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );


  const handleTreemapClick = (item: any) => {
    if (item && item.name) {
      if (item.isAgent) {
        // If we're in agent view, clicking an agent sets the agent filter
        setSelectedAgent(prev => prev === item.name ? null : item.name);
      } else {
        // If we're in status view, clicking a status drills down
        setSelectedStatus(item.name);
        setSelectedAgent(null); // Reset agent filter when status changes
      }
    }
    setCurrentPage(1); // Reset page on filter change
  };
  
  const getStatusVariant = (
    status: CallData["status"]
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Abandoned": return "destructive";
      case "Redirected": return "secondary";
      case "Direct call": return "outline";
      default: return "secondary";
    }
  };

  const clearFilters = () => {
    setSelectedStatus(null);
    setSelectedAgent(null);
    setCurrentPage(1);
  };
  
  const goBackToStatusView = () => {
      setSelectedStatus(null);
      setSelectedAgent(null);
      setCurrentPage(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Status Breakdown</CardTitle>
        <CardDescription>
          {selectedStatus 
           ? `Distribution for status: ${selectedStatus}. Click on an agent to filter the list.`
           : "Distribution of detailed call outcomes. Click on a square to drill down."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          {selectedStatus && (
              <Button variant="ghost" size="sm" onClick={goBackToStatusView} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all statuses
              </Button>
          )}
          <div className="w-full h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={chartData}
                  dataKey="size"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="hsl(var(--primary))"
                  content={<CustomizedContent />}
                  onClick={handleTreemapClick}
                  isAnimationActive={false}
                >
                    <RechartsTooltip formatter={(value, name) => [value, 'Total Calls']} />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No data to display for this selection.</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h4 className="text-lg font-semibold">
              Call Log
              {selectedStatus && ` (Filtered by: ${selectedStatus}`}
              {selectedAgent && ` & ${selectedAgent}`}
              {selectedStatus && `)`}
            </h4>
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Filter calls..."
                    value={textFilter}
                    onChange={(e) => {
                        setTextFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="max-w-xs"
                />
                {(selectedStatus || selectedAgent) && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
            </div>
          </div>
          <div className="border rounded-lg">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Caller</TableHead>
                        <TableHead>IVR</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>Callee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {paginatedCalls.length > 0 ? paginatedCalls.map((call, index) => {
                       const isOutgoing = call.status_detail?.toLowerCase().includes("outgoing");
                       const callerDisplay = isOutgoing ? call.agent : call.calling_number;
                       const calleeDisplay = isOutgoing ? call.calling_number : call.agent;

                       return (
                       <TableRow key={`${call.call_id}-${index}`}>
                           <TableCell>{new Date(call.enter_datetime).toLocaleDateString()}</TableCell>
                           <TableCell>{new Date(call.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {isOutgoing ? (
                                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{call.status_detail}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span>{callerDisplay}</span>
                              </div>
                           </TableCell>
                           <TableCell>{call.status === 'IVR' ? 'IVR' : '-'}</TableCell>
                           <TableCell>{call.queue_name || "-"}</TableCell>
                           <TableCell>{calleeDisplay || "-"}</TableCell>
                           <TableCell><Badge variant={getStatusVariant(call.status)}>{call.status_detail}</Badge></TableCell>
                           <TableCell>{call.processing_time_seconds ?? 0}s</TableCell>
                       </TableRow>
                   )}) : (
                     <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No calls found for this filter combination.
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
        </div>
      </CardContent>
    </Card>
  );
}
