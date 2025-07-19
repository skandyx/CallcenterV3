

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type {
  CallData, AdvancedCallData, AgentStatusData, ProfileAvailabilityData
} from "@/types";
import StatCard from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Clock,
  Zap,
  Percent,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { CustomTreemapContent } from '@/components/custom-treemap-content';
import { Skeleton } from './ui/skeleton';
import WorldMapChart from './world-map-chart';

interface TreemapNode {
    name: string;
    size?: number;
    children?: TreemapNode[];
  }
  
export default function DashboardClient() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData[]>([]);
  const [profileAvailability, setProfileAvailability] = useState<ProfileAvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const [simplifiedCallsPage, setSimplifiedCallsPage] = useState(1);
  const [advancedCallsPage, setAdvancedCallsPage] = useState(1);
  const [profileAvailabilityPage, setProfileAvailabilityPage] = useState(1);
  const [agentStatusPage, setAgentStatusPage] = useState(1);
  const [statusAnalysisPage, setStatusAnalysisPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const fetchData = async (initialLoad = false) => {
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCalls(data.calls || []);
      setAdvancedCalls(data.advancedCalls || []);
      setAgentStatus(data.agentStatus || []);
      setProfileAvailability(data.profileAvailability || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (initialLoad) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchData(true); // Initial fetch with loading state
    const interval = setInterval(() => fetchData(false), 5000); // Subsequent fetches without loading state
    return () => clearInterval(interval);
  }, []);

  const filterByDate = (items: any[], dateKey: string) => {
    if (!selectedDate) return items;
    return items.filter(item => new Date(item[dateKey]).toDateString() === selectedDate.toDateString());
  }

  const isOutgoing = (call: CallData | AdvancedCallData) => call.status_detail === 'Outgoing';

  const filteredCalls = useMemo(() => filterByDate(calls, 'enter_datetime'), [calls, selectedDate]);
  const filteredAdvancedCalls = useMemo(() => filterByDate(advancedCalls, 'enter_datetime'), [advancedCalls, selectedDate]);
  const filteredAgentStatus = useMemo(() => filterByDate(agentStatus, 'date'), [agentStatus, selectedDate]);
  const filteredProfileAvailability = useMemo(() => filterByDate(profileAvailability, 'date'), [profileAvailability, selectedDate]);

  const totalCalls = filteredCalls.length;
  const answeredCalls = filteredCalls.filter((c) => c.status !== "Abandoned").length;
  const avgWaitTime = filteredCalls.reduce((acc, c) => acc + (c.time_in_queue_seconds || 0), 0) / totalCalls || 0;
  
  const serviceLevel10s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;

  const statusTreemapData = React.useMemo(() => {
    return Object.values(
      filteredCalls.reduce((acc, call) => {
        const detailStatus = call.status_detail || call.status || 'N/A';
        if (!acc[detailStatus]) {
          acc[detailStatus] = { name: detailStatus, size: 0 };
        }
        acc[detailStatus].size++;
        return acc;
      }, {} as Record<string, { name: string; size: number }>)
    );
  }, [filteredCalls]);

  const handleStatusClick = (statusName: string) => {
    setSelectedStatus(prev => (prev === statusName ? null : statusName));
    setStatusAnalysisPage(1);
  };

  const statusFilteredCalls = selectedStatus
    ? filteredCalls.filter(call => (call.status === selectedStatus || call.status_detail === selectedStatus))
    : filteredCalls;


  // Pagination Logic
  const paginate = (data: any[], page: number) => {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedSimplifiedCalls = paginate(filteredCalls, simplifiedCallsPage);
  const paginatedAdvancedCalls = paginate(filteredAdvancedCalls, advancedCallsPage);
  const paginatedProfileAvailability = paginate(filteredProfileAvailability, profileAvailabilityPage);
  const paginatedAgentStatus = paginate(filteredAgentStatus, agentStatusPage);
  const paginatedStatusAnalysisCalls = paginate(statusFilteredCalls, statusAnalysisPage);

  const renderPaginationControls = (dataLength: number, page: number, setPage: (page: number) => void) => {
      const totalPages = Math.ceil(dataLength / ITEMS_PER_PAGE);
      if (totalPages <= 1) return null;

      return (
          <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
              >
                  Précédent
              </Button>
              <span className="text-sm">
                  Page {page} sur {totalPages}
              </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
              >
                  Suivant
              </Button>
          </div>
      );
  };
  
  if (loading) {
      return (
          <div className="flex flex-col">
              <PageHeader title="Dashboard" />
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                  </div>
                  <Skeleton className="h-[600px]" />
              </main>
          </div>
      );
  }

  return (
    <div className="flex flex-col">
       <PageHeader title="Dashboard" selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Calls Today"
            value={totalCalls}
            icon={<Phone className="h-4 w-4 text-muted-foreground" />}
            description="All incoming call events"
            valueClassName="text-blue-600"
          />
          <StatCard
            title="Avg. Wait Time"
            value={`${avgWaitTime.toFixed(1)}s`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description="Average time in queue for all calls"
            valueClassName="text-blue-600"
          />
          <StatCard
            title="Service Level (<10s)"
            value={`${serviceLevel10s.toFixed(1)}%`}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
            description={`${filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Service Level (<30s)"
            value={`${serviceLevel30s.toFixed(1)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description={`${filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Answer Rate"
            value={`${answerRate.toFixed(1)}%`}
            icon={<Percent className="h-4 w-4 text-muted-foreground" />}
            description={`${answeredCalls}/${totalCalls} of calls answered`}
            valueClassName="text-blue-600"
          />
        </div>

        <Tabs defaultValue="simplified-calls">
            <TabsList className="grid w-full grid-cols-6 bg-muted">
                <TabsTrigger value="simplified-calls">Données d'appel simplifiées</TabsTrigger>
                <TabsTrigger value="advanced-calls">Données d'appel avancées</TabsTrigger>
                <TabsTrigger value="profile-availability">Disponibilité des profils</TabsTrigger>
                <TabsTrigger value="agent-connections">État des files et des agents</TabsTrigger>
                <TabsTrigger value="status-analysis">Analyse par statut</TabsTrigger>
                <TabsTrigger value="call-distribution">Call Distribution</TabsTrigger>
            </TabsList>
            <TabsContent value="simplified-calls">
                <Card>
                    <CardHeader>
                        <CardTitle>Données d'appel simplifiées</CardTitle>
                        <CardDescription>Une ligne pour chaque appel. Recommandé pour Power BI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Caller</TableHead>
                                <TableHead>Queue</TableHead>
                                <TableHead>Wait Time</TableHead>
                                <TableHead>Talk Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Status Detail</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSimplifiedCalls.map((call) => {
                                const callDate = new Date(call.enter_datetime);
                                return (
                                <TableRow key={call.call_id}>
                                    <TableCell>{callDate.toLocaleDateString()}</TableCell>
                                    <TableCell>{callDate.toLocaleTimeString([], timeFormat)}</TableCell>
                                    <TableCell>{call.calling_number}</TableCell>
                                    <TableCell>{call.queue_name}</TableCell>
                                    <TableCell>{call.time_in_queue_seconds || 0}s</TableCell>
                                    <TableCell>{call.talk_time_seconds || 0}s</TableCell>
                                    <TableCell>
                                        <Badge variant={call.status === 'Abandoned' ? 'destructive' : 'outline'} className="capitalize">
                                            {call.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{call.status_detail}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                        </Table>
                         {renderPaginationControls(filteredCalls.length, simplifiedCallsPage, setSimplifiedCallsPage)}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="advanced-calls">
                 <Card>
                    <CardHeader>
                        <CardTitle>Données d'appel avancées</CardTitle>
                        <CardDescription>Plus précis que « Données d'appel simplifiées ». Chaque appel peut être détaillé sur plusieurs lignes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Call ID</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Caller Number</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Status Detail</TableHead>
                                <TableHead>Processing Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAdvancedCalls.map((call, index) => (
                                <TableRow key={`${call.call_id}-${index}`}>
                                    <TableCell>{new Date(call.enter_datetime).toLocaleString([], { ...timeFormat, day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                                    <TableCell>{call.call_id}</TableCell>
                                    <TableCell>{call.agent || 'N/A'}</TableCell>
                                    <TableCell>{call.calling_number}</TableCell>
                                    <TableCell>{call.status}</TableCell>
                                    <TableCell>{call.status_detail}</TableCell>
                                    <TableCell>{call.processing_time_seconds ? `${call.processing_time_seconds}s` : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                         {renderPaginationControls(filteredAdvancedCalls.length, advancedCallsPage, setAdvancedCallsPage)}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="profile-availability">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilité des profils</CardTitle>
                  <CardDescription>
                    Les données indiquant le temps passé par chaque utilisateur dans chaque profil. Une ligne pour chaque heure, utilisateur et profil.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hour</TableHead>
                        <TableHead>Available (min)</TableHead>
                        <TableHead>Lunch (min)</TableHead>
                        <TableHead>Meeting (min)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProfileAvailability.map((profile, index) => (
                        <TableRow key={`${profile.user_id}-${profile.hour}-${index}`}>
                          <TableCell>{profile.user}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>{profile.hour}:00</TableCell>
                          <TableCell>{profile.Available}</TableCell>
                          <TableCell>{profile.Lunch}</TableCell>
                          <TableCell>{profile.Meeting}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                   {renderPaginationControls(filteredProfileAvailability.length, profileAvailabilityPage, setProfileAvailabilityPage)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="agent-connections">
              <Card>
                <CardHeader>
                  <CardTitle>État des files et des agents</CardTitle>
                  <CardDescription>
                    Données indiquant le temps passé par chaque agent en état connecté, déconnecté ou inactif/en veille par file d'attente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>File d'attente</TableHead>
                        <TableHead>Connecté (min)</TableHead>
                        <TableHead>En pause (min)</TableHead>
                        <TableHead>Déconnecté (min)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAgentStatus.map((status, index) => (
                        <TableRow key={`${status.user_id}-${status.queue_id}-${index}`}>
                          <TableCell>{status.user}</TableCell>
                          <TableCell>{status.email}</TableCell>
                          <TableCell>{status.queuename}</TableCell>
                          <TableCell>{status.loggedIn}</TableCell>
                          <TableCell>{status.idle}</TableCell>
                          <TableCell>{status.loggedOut}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPaginationControls(filteredAgentStatus.length, agentStatusPage, setAgentStatusPage)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="status-analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse par statut</CardTitle>
                  <CardDescription>
                    Cliquez sur un statut dans le graphique pour filtrer le journal des appels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <Treemap
                              data={statusTreemapData}
                              dataKey="size"
                              type="squarify"
                              stroke="hsl(var(--card))"
                              fill="hsl(var(--primary))"
                              content={<CustomTreemapContent />}
                              onClick={(data) => handleStatusClick(data.name)}
                          />
                      </ResponsiveContainer>
                    </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Journal des appels {selectedStatus && ` - ${selectedStatus}`}
                    </h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Direction</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Caller</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedStatusAnalysisCalls.map((call) => {
                            const callDate = new Date(call.enter_datetime);
                            const outgoing = isOutgoing(call);
                            return (
                              <TableRow key={call.call_id}>
                                <TableCell>
                                  {outgoing ? (
                                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                                  )}
                                </TableCell>
                                <TableCell>{callDate.toLocaleDateString()}</TableCell>
                                <TableCell>{call.calling_number}</TableCell>
                                <TableCell>
                                  <Badge variant={call.status === 'Abandoned' ? 'destructive' : 'outline'} className="capitalize">
                                    {call.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPaginationControls(statusFilteredCalls.length, statusAnalysisPage, setStatusAnalysisPage)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="call-distribution">
                <WorldMapChart data={filteredCalls} />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
