
"use client";

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CallData } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const countryPrefixes: { [key: string]: { code: string, name: string } } = {
  '1': { code: 'CAN', name: 'Canada' },
  '33': { code: 'FRA', name: 'France' },
  '32': { code: 'BEL', name: 'Belgium' },
  '49': { code: 'DEU', name: 'Germany' },
  '44': { code: 'GBR', name: 'United Kingdom' },
  '34': { code: 'ESP', name: 'Spain' },
  '39': { code: 'ITA', name: 'Italy' },
  '41': { code: 'CHE', name: 'Switzerland' },
  '212': { code: 'MAR', name: 'Morocco' },
  '213': { code: 'DZA', name: 'Algeria' },
  '216': { code: 'TUN', name: 'Tunisia' },
  '221': { code: 'SEN', name: 'Senegal' },
  '86': { code: 'CHN', name: 'China' },
};

const getCountryInfoFromNumber = (phoneNumber: string): { code: string, name: string } | null => {
  const cleanNumber = phoneNumber.replace(/^(00|\+)/, '').replace(/[^0-9]/g, '');
  for (let i = 3; i > 0; i--) {
    const prefix = cleanNumber.substring(0, i);
    if (countryPrefixes[prefix]) {
      return countryPrefixes[prefix];
    }
  }
  return null;
};

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff7300'
];

const CustomizedTreemapContent = ({ root, depth, x, y, width, height, index, name, size }: any) => {
  if (width < 20 || height < 20) {
    return null;
  }
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        style={{ fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
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


const WorldMapChart = ({ data }: { data: CallData[] }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const treemapData = useMemo(() => {
    // If no country is selected, show breakdown by country
    if (!selectedCountryCode) {
        const counts: { [key: string]: { name: string, code: string, size: number } } = {};
        data.forEach(call => {
            const countryInfo = getCountryInfoFromNumber(call.calling_number);
            const code = countryInfo?.code || 'unknown';
            const name = countryInfo?.name || 'Unknown';
            if (!counts[code]) {
                counts[code] = { name, code, size: 0 };
            }
            counts[code].size += 1;
        });
        return Object.values(counts)
            .filter(c => c.size > 0)
            .sort((a, b) => b.size - a.size);
    }
    
    // If a country is selected, show breakdown by agent for that country
    const agentCounts: { [key: string]: number } = {};
    data
      .filter(call => {
          const countryInfo = getCountryInfoFromNumber(call.calling_number);
          const countryCode = countryInfo?.code || 'unknown';
          return countryCode === selectedCountryCode;
      })
      .forEach(call => {
        const agent = call.agent || "Unassigned";
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      });

    return Object.entries(agentCounts)
      .map(([name, count]) => ({ name, size: count, isAgent: true }))
      .sort((a, b) => b.size - a.size);

  }, [data, selectedCountryCode]);

  const selectedCountryName = useMemo(() => {
    if (!selectedCountryCode) return null;
    const countryData = treemapData.find(item => !item.isAgent && item.code === selectedCountryCode);
    if(countryData) return countryData.name;
    const countryEntry = Object.values(countryPrefixes).find(c => c.code === selectedCountryCode);
    return countryEntry ? countryEntry.name : 'Unknown';
  }, [selectedCountryCode, treemapData]);

  
  const filteredCalls = useMemo(() => {
    return data.filter(call => {
        const countryInfo = getCountryInfoFromNumber(call.calling_number);
        const countryCode = countryInfo?.code || 'unknown';
        const countryMatch = selectedCountryCode ? countryCode === selectedCountryCode : true;
        const agentMatch = selectedAgent ? (call.agent || "Unassigned") === selectedAgent : true;
        return countryMatch && agentMatch;
    });
  }, [data, selectedCountryCode, selectedAgent]);

  const handleTreemapClick = (item: any) => {
    if (item && item.name) {
      if (item.isAgent) {
        setSelectedAgent(prev => prev === item.name ? null : item.name);
      } else {
        setSelectedCountryCode(item.code);
        setSelectedAgent(null); 
      }
    }
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
    setSelectedCountryCode(null);
    setSelectedAgent(null);
  };
  
  const goBackToCountryView = () => {
      setSelectedCountryCode(null);
      setSelectedAgent(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          {selectedCountryCode
            ? `Distribution for country: ${selectedCountryName}. Click an agent to drill down.`
            : "Geographic call distribution. Click a country to see agent breakdown."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          {selectedCountryCode && (
              <Button variant="ghost" size="sm" onClick={goBackToCountryView} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all countries
              </Button>
          )}
          <div className="w-full h-[300px]">
            {treemapData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  nameKey="name"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="hsl(var(--primary))"
                  content={<CustomizedTreemapContent />}
                  onClick={handleTreemapClick}
                  isAnimationActive={false}
                >
                    <RechartsTooltip formatter={(value, name, props) => [
                      value,
                      props.payload?.isAgent ? 'Total Calls for Agent' : 'Total Calls from Country'
                    ]}/>
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
           <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
             <h4 className="text-lg font-semibold">
               Call Log
               {selectedCountryCode && ` (Filtered by: ${selectedCountryName}`}
               {selectedAgent && ` & ${selectedAgent}`}
               {selectedCountryCode && `)`}
             </h4>
             {(selectedCountryCode || selectedAgent) && (
               <Button variant="ghost" onClick={clearFilters}>
                 Clear filters
               </Button>
             )}
           </div>
           <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                 <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                     <TableRow>
                         <TableHead>Time</TableHead>
                         <TableHead>Caller Number</TableHead>
                         <TableHead>Agent</TableHead>
                         <TableHead>Queue</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Status Detail</TableHead>
                         <TableHead>Duration</TableHead>
                     </TableRow>
                 </TableHeader>
                 <TableBody>
                    {filteredCalls.length > 0 ? filteredCalls.sort((a, b) => new Date(b.enter_datetime).getTime() - new Date(a.enter_datetime).getTime()).map((call, index) => (
                        <TableRow key={`${call.call_id}-${index}`}>
                            <TableCell>{new Date(call.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {call.status_detail?.toLowerCase().includes("incoming") && (
                                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                      )}
                                      {call.status_detail?.toLowerCase().includes("outgoing") && (
                                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{call.status_detail}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span>{call.calling_number}</span>
                              </div>
                            </TableCell>
                            <TableCell>{call.agent || "N/A"}</TableCell>
                            <TableCell>{call.queue_name || "Direct call"}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(call.status)}>{call.status}</Badge></TableCell>
                            <TableCell>{call.status_detail}</TableCell>
                            <TableCell>{call.processing_time_seconds ?? 0}s</TableCell>
                        </TableRow>
                    )) : (
                      <TableRow>
                         <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                             No calls found for this filter combination.
                         </TableCell>
                      </TableRow>
                    )}
                 </TableBody>
              </Table>
           </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMapChart;
