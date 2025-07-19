

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Clock,
  Zap,
  Percent,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { CustomTreemapContent } from '@/components/custom-treemap-content';


const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData[]>([]);
  const [profileAvailability, setProfileAvailability] = useState<ProfileAvailabilityData[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [simplifiedCallsFilter, setSimplifiedCallsFilter] = useState('');
  const [simplifiedCallsStatusFilter, setSimplifiedCallsStatusFilter] = useState('all');
  const [advancedCallsFilter, setAdvancedCallsFilter] = useState('');
  const [profileAvailabilityFilter, setProfileAvailabilityFilter] = useState('');
  const [agentConnectionsFilter, setAgentConnectionsFilter] = useState('');
  const [statusTreemapFilter, setStatusTreemapFilter] = useState<string | null>(null);

  // Pagination states
  const [simplifiedCallsPage, setSimplifiedCallsPage] = useState(1);
  const [advancedCallsPage, setAdvancedCallsPage] = useState(1);
  const [profileAvailabilityPage, setProfileAvailabilityPage] = useState(1);
  const [agentConnectionsPage, setAgentConnectionsPage] = useState(1);
  const [statusFilteredCallsPage, setStatusFilteredCallsPage] = useState(1);
  const [distributionFilteredCallsPage, setDistributionFilteredCallsPage] = useState(1);

  // State for hierarchical treemap
  const [treemapBreadcrumbs, setTreemapBreadcrumbs] = useState<string[]>(['root']);
  
  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const fetchData = async () => {
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
    }
  }

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filterByDate = (items: any[], dateKey: string) => {
    if (!selectedDate) return items;
    return items.filter(item => new Date(item[dateKey]).toDateString() === selectedDate.toDateString());
  }
  
  const isOutgoing = (call: CallData | AdvancedCallData) => call.status_detail === 'Outgoing';

  const baseFilteredCalls = useMemo(() => filterByDate(calls, 'enter_datetime'), [calls, selectedDate]);
  const baseFilteredAdvancedCalls = useMemo(() => filterByDate(advancedCalls, 'enter_datetime'), [advancedCalls, selectedDate]);
  const baseFilteredAgentStatus = useMemo(() => filterByDate(agentStatus, 'date'), [agentStatus, selectedDate]);
  const baseFilteredProfileAvailability = useMemo(() => filterByDate(profileAvailability, 'date'), [profileAvailability, selectedDate]);

  const totalCalls = baseFilteredCalls.length;
  const answeredCalls = baseFilteredCalls.filter((c) => c.status !== "Abandoned").length;
  const avgWaitTime = baseFilteredCalls.reduce((acc, c) => acc + (c.time_in_queue_seconds || 0), 0) / totalCalls || 0;
  
  const serviceLevel10s = (baseFilteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (baseFilteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;

  const statusTreemapData = React.useMemo(() => {
    return Object.values(baseFilteredCalls.reduce((acc, call) => {
      const detailStatus = call.status_detail || call.status || 'N/A';
      if (!acc[detailStatus]) {
        acc[detailStatus] = { name: detailStatus, size: 0 };
      }
      acc[detailStatus].size++;
      return acc;
    }, {} as Record<string, { name: string; size: number }>));
  }, [baseFilteredCalls]);

  const handleStatusClick = (statusName: string) => {
    setStatusTreemapFilter(prev => (prev === statusName ? null : statusName));
    setStatusFilteredCallsPage(1);
  };

  const statusFilteredCalls = statusTreemapFilter
    ? baseFilteredCalls.filter(call => (call.status === statusTreemapFilter || call.status_detail === statusTreemapFilter))
    : baseFilteredCalls;
  
  const statusFilteredCallsPaginated = statusFilteredCalls.slice((statusFilteredCallsPage - 1) * ITEMS_PER_PAGE, statusFilteredCallsPage * ITEMS_PER_PAGE);
  const totalStatusFilteredPages = Math.ceil(statusFilteredCalls.length / ITEMS_PER_PAGE);


  const filteredSimplifiedCalls = baseFilteredCalls.filter(call => {
    const searchTerm = simplifiedCallsFilter.toLowerCase();
    const statusMatch = simplifiedCallsStatusFilter === 'all' || call.status === simplifiedCallsStatusFilter;
    if (!statusMatch) return false;

    return Object.values(call).some(val => 
        String(val).toLowerCase().includes(searchTerm)
    );
  });
  const simplifiedCallsPaginated = filteredSimplifiedCalls.slice((simplifiedCallsPage - 1) * ITEMS_PER_PAGE, simplifiedCallsPage * ITEMS_PER_PAGE);
  const totalSimplifiedCallsPages = Math.ceil(filteredSimplifiedCalls.length / ITEMS_PER_PAGE);


  const filteredAdvancedCalls = baseFilteredAdvancedCalls.filter(call => {
      const searchTerm = advancedCallsFilter.toLowerCase();
      return Object.values(call).some(val => 
          String(val).toLowerCase().includes(searchTerm)
      );
  });
  const advancedCallsPaginated = filteredAdvancedCalls.slice((advancedCallsPage - 1) * ITEMS_PER_PAGE, advancedCallsPage * ITEMS_PER_PAGE);
  const totalAdvancedCallsPages = Math.ceil(filteredAdvancedCalls.length / ITEMS_PER_PAGE);

  const filteredProfileAvailability = baseFilteredProfileAvailability.filter(profile => {
    const searchTerm = profileAvailabilityFilter.toLowerCase();
    return (
        profile.user.toLowerCase().includes(searchTerm) ||
        profile.email.toLowerCase().includes(searchTerm) ||
        new Date(profile.date).toLocaleDateString().toLowerCase().includes(searchTerm)
    );
  });
  const profileAvailabilityPaginated = filteredProfileAvailability.slice((profileAvailabilityPage - 1) * ITEMS_PER_PAGE, profileAvailabilityPage * ITEMS_PER_PAGE);
  const totalProfileAvailabilityPages = Math.ceil(filteredProfileAvailability.length / ITEMS_PER_PAGE);

  const filteredAgentConnections = baseFilteredAgentStatus.filter(status => {
    const searchTerm = agentConnectionsFilter.toLowerCase();
    return (
        status.user.toLowerCase().includes(searchTerm) ||
        status.email.toLowerCase().includes(searchTerm) ||
        status.queuename.toLowerCase().includes(searchTerm) ||
        new Date(status.date).toLocaleDateString().toLowerCase().includes(searchTerm)
    );
  });
  const agentConnectionsPaginated = filteredAgentConnections.slice((agentConnectionsPage - 1) * ITEMS_PER_PAGE, agentConnectionsPage * ITEMS_PER_PAGE);
  const totalAgentConnectionsPages = Math.ceil(filteredAgentConnections.length / ITEMS_PER_PAGE);


  const getCountryFromNumber = (phoneNumber: string) => {
      if (!phoneNumber) return 'Unknown';
      if (phoneNumber.startsWith('0032')) return 'Belgium';
      if (phoneNumber.startsWith('0033')) return 'France';
      if (phoneNumber.startsWith('00216')) return 'Tunisia';
      return 'Other';
  };
  
  const distributionTreemapData = useMemo(() => {
    const hierarchy = { name: 'root', children: [] as any[] };

    baseFilteredCalls.forEach(call => {
        const direction = isOutgoing(call) ? 'Outbound' : 'Inbound';
        const country = getCountryFromNumber(call.calling_number);
        const agentOrQueue = call.agent?.trim() || call.queue_name?.trim() || 'N/A';

        let directionNode = hierarchy.children.find(d => d.name === direction);
        if (!directionNode) {
            directionNode = { name: direction, children: [] };
            hierarchy.children.push(directionNode);
        }

        let countryNode = directionNode.children.find((c:any) => c.name === country);
        if (!countryNode) {
            countryNode = { name: country, children: [] };
            directionNode.children.push(countryNode);
        }

        let leafNode = countryNode.children.find((l:any) => l.name === agentOrQueue);
        if (!leafNode) {
            leafNode = { name: agentOrQueue, size: 0 };
            countryNode.children.push(leafNode);
        }
        leafNode.size++;
    });

    return hierarchy.children;
  }, [baseFilteredCalls]);

  const handleTreemapClick = (data: any) => {
    if (data && data.name) {
      setTreemapBreadcrumbs(prev => [...prev, data.name]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setTreemapBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const getCurrentTreemapData = () => {
    let currentData: any[] = distributionTreemapData;
    for (let i = 1; i < treemapBreadcrumbs.length; i++) {
        const breadcrumb = treemapBreadcrumbs[i];
        const nextNode = currentData.find(item => item.name === breadcrumb);
        if (nextNode && nextNode.children) {
            currentData = nextNode.children;
        } else {
            return [];
        }
    }
    return currentData;
  };
  const currentTreemapLevelData = getCurrentTreemapData();


  const distributionFilteredCalls = useMemo(() => {
    let filtered = baseFilteredCalls;
    const level = treemapBreadcrumbs.length;

    if (level > 1) { // Direction level
        const direction = treemapBreadcrumbs[1] === 'Outbound';
        filtered = filtered.filter(call => isOutgoing(call) === direction);
    }
    if (level > 2) { // Country level
        const country = treemapBreadcrumbs[2];
        filtered = filtered.filter(call => getCountryFromNumber(call.calling_number) === country);
    }
    if (level > 3) { // Agent/Queue level
        const agentOrQueue = treemapBreadcrumbs[3];
        filtered = filtered.filter(call => (call.agent?.trim() || call.queue_name?.trim() || 'N/A') === agentOrQueue);
    }
    return filtered;
  }, [baseFilteredCalls, treemapBreadcrumbs]);
  
  const distributionFilteredCallsPaginated = distributionFilteredCalls.slice((distributionFilteredCallsPage - 1) * ITEMS_PER_PAGE, distributionFilteredCallsPage * ITEMS_PER_PAGE);
  const totalDistributionFilteredPages = Math.ceil(distributionFilteredCalls.length / ITEMS_PER_PAGE);

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
            description={`${baseFilteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Service Level (<30s)"
            value={`${serviceLevel30s.toFixed(1)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description={`${baseFilteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length}/${totalCalls} calls answered in time`}
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
                <TabsTrigger value="call-distribution">Distribution des appels</TabsTrigger>
            </TabsList>
            <TabsContent value="simplified-calls">
                <Card>
                    <CardHeader>
                        <CardTitle>Données d'appel simplifiées</CardTitle>
                        <CardDescription>Une ligne pour chaque appel. Recommandé pour Power BI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <Input 
                                placeholder="Filter across all columns..." 
                                className="max-w-sm"
                                value={simplifiedCallsFilter}
                                onChange={(e) => { setSimplifiedCallsFilter(e.target.value); setSimplifiedCallsPage(1); }}
                            />
                             <Select value={simplifiedCallsStatusFilter} onValueChange={(value) => { setSimplifiedCallsStatusFilter(value); setSimplifiedCallsPage(1); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Answered">Answered</SelectItem>
                                    <SelectItem value="Abandoned">Abandoned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="border rounded-lg">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Direction</TableHead>
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
                                {simplifiedCallsPaginated.map((call) => {
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
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                        <span className="text-sm text-muted-foreground">
                            Page {simplifiedCallsPage} of {totalSimplifiedCallsPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setSimplifiedCallsPage(p => p - 1)} disabled={simplifiedCallsPage === 1}>Précédent</Button>
                        <Button variant="outline" size="sm" onClick={() => setSimplifiedCallsPage(p => p + 1)} disabled={simplifiedCallsPage >= totalSimplifiedCallsPages}>Suivant</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="advanced-calls">
                 <Card>
                    <CardHeader>
                        <CardTitle>Données d'appel avancées</CardTitle>
                        <CardDescription>Plus précis que « Données d'appel simplifiées ». Chaque appel peut être détaillé sur plusieurs lignes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input 
                            placeholder="Filter across all columns..." 
                            className="max-w-sm mb-4"
                            value={advancedCallsFilter}
                            onChange={(e) => { setAdvancedCallsFilter(e.target.value); setAdvancedCallsPage(1); }}
                        />
                         <div className="border rounded-lg">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Direction</TableHead>
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
                                {advancedCallsPaginated.map((call, index) => {
                                    const outgoing = isOutgoing(call);
                                    return(
                                    <TableRow key={`${call.call_id}-${index}`}>
                                         <TableCell>
                                            {outgoing ? (
                                                <ArrowUpCircle className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <ArrowDownCircle className="h-5 w-5 text-green-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(call.enter_datetime).toLocaleString([], { ...timeFormat, day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                                        <TableCell>{call.call_id}</TableCell>
                                        <TableCell>{call.agent || 'N/A'}</TableCell>
                                        <TableCell>{call.calling_number}</TableCell>
                                        <TableCell>{call.status}</TableCell>
                                        <TableCell>{call.status_detail}</TableCell>
                                        <TableCell>{call.processing_time_seconds ? `${call.processing_time_seconds}s` : 'N/A'}</TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                        <span className="text-sm text-muted-foreground">
                            Page {advancedCallsPage} of {totalAdvancedCallsPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setAdvancedCallsPage(p => p - 1)} disabled={advancedCallsPage === 1}>Précédent</Button>
                        <Button variant="outline" size="sm" onClick={() => setAdvancedCallsPage(p => p + 1)} disabled={advancedCallsPage >= totalAdvancedCallsPages}>Suivant</Button>
                    </CardFooter>
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
                   <Input 
                      placeholder="Filter by agent, email, or date..." 
                      value={profileAvailabilityFilter}
                      onChange={(e) => { setProfileAvailabilityFilter(e.target.value); setProfileAvailabilityPage(1); }}
                      className="max-w-sm mb-4" 
                  />
                  <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Hour</TableHead>
                            <TableHead>Available (min)</TableHead>
                            <TableHead>Lunch (min)</TableHead>
                            <TableHead>Meeting (min)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profileAvailabilityPaginated.map((profile, index) => (
                            <TableRow key={`${profile.user_id}-${profile.hour}-${index}`}>
                              <TableCell>{new Date(profile.date).toLocaleDateString()}</TableCell>
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
                  </div>
                </CardContent>
                 <CardFooter className="justify-end space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Page {profileAvailabilityPage} of {totalProfileAvailabilityPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setProfileAvailabilityPage(p => p - 1)} disabled={profileAvailabilityPage === 1}>Précédent</Button>
                    <Button variant="outline" size="sm" onClick={() => setProfileAvailabilityPage(p => p + 1)} disabled={profileAvailabilityPage >= totalProfileAvailabilityPages}>Suivant</Button>
                </CardFooter>
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
                   <Input 
                      placeholder="Filter by agent, email or queue..." 
                      value={agentConnectionsFilter}
                      onChange={(e) => { setAgentConnectionsFilter(e.target.value); setAgentConnectionsPage(1); }}
                      className="max-w-sm mb-4" 
                  />
                  <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>File d'attente</TableHead>
                            <TableHead>Connecté (min)</TableHead>
                            <TableHead>En pause (min)</TableHead>
                            <TableHead>Déconnecté (min)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agentConnectionsPaginated.map((status, index) => (
                            <TableRow key={`${status.user_id}-${status.queue_id}-${index}`}>
                              <TableCell>{new Date(status.date).toLocaleDateString()}</TableCell>
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
                  </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Page {agentConnectionsPage} of {totalAgentConnectionsPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setAgentConnectionsPage(p => p - 1)} disabled={agentConnectionsPage === 1}>Précédent</Button>
                    <Button variant="outline" size="sm" onClick={() => setAgentConnectionsPage(p => p + 1)} disabled={agentConnectionsPage >= totalAgentConnectionsPages}>Suivant</Button>
                </CardFooter>
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
                <CardContent className="space-y-8">
                  <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                      data={statusTreemapData}
                      dataKey="size"
                      stroke="hsl(var(--card))"
                      fill="hsl(var(--primary))"
                      isAnimationActive={false}
                      content={<CustomTreemapContent />}
                      onClick={(data) => handleStatusClick(data.name)}
                    >
                       <Tooltip
                          labelFormatter={(name) => name}
                          formatter={(value: any, name: any, props: any) => [`${value} calls`, props.payload.name]}
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          contentStyle={{
                              background: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                          }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                   <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Journal des appels {statusTreemapFilter && ` - ${statusTreemapFilter}`}
                    </h3>
                     <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Direction</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Caller</TableHead>
                                <TableHead>Queue</TableHead>
                                <TableHead>Wait Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Status Detail</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statusFilteredCallsPaginated.map((call) => {
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
                                    <TableCell>{callDate.toLocaleTimeString([], timeFormat)}</TableCell>
                                    <TableCell>{call.calling_number}</TableCell>
                                    <TableCell>{call.queue_name}</TableCell>
                                    <TableCell>{call.time_in_queue_seconds || 0}s</TableCell>
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
                    </div>
                     <div className="flex justify-end space-x-2 pt-4">
                        <span className="text-sm text-muted-foreground">
                            Page {statusFilteredCallsPage} of {totalStatusFilteredPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setStatusFilteredCallsPage(p => p - 1)} disabled={statusFilteredCallsPage === 1}>Précédent</Button>
                        <Button variant="outline" size="sm" onClick={() => setStatusFilteredCallsPage(p => p + 1)} disabled={statusFilteredCallsPage >= totalStatusFilteredPages}>Suivant</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="call-distribution">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution des appels par pays</CardTitle>
                        <CardDescription>Cliquez sur un rectangle pour explorer la hiérarchie des appels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            {treemapBreadcrumbs.map((breadcrumb, index) => (
                                <React.Fragment key={breadcrumb}>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto"
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {breadcrumb === 'root' ? 'Total' : breadcrumb}
                                    </Button>
                                    {index < treemapBreadcrumbs.length - 1 && <span>/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                           <Treemap
                                data={currentTreemapLevelData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="hsl(var(--card))"
                                fill="hsl(var(--primary))"
                                isAnimationActive={false}
                                content={<CustomTreemapContent />}
                                onClick={handleTreemapClick}
                           />
                        </ResponsiveContainer>
                        <div>
                            <h3 className="text-xl font-semibold mb-4">
                                Journal des appels
                            </h3>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Direction</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Caller Number</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Queue/Agent</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {distributionFilteredCallsPaginated.map(call => {
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
                                                <TableCell>{new Date(call.enter_datetime).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(call.enter_datetime).toLocaleTimeString([], timeFormat)}</TableCell>
                                                <TableCell>{call.calling_number}</TableCell>
                                                <TableCell>{getCountryFromNumber(call.calling_number)}</TableCell>
                                                <TableCell>{call.agent || call.queue_name}</TableCell>
                                                <TableCell>{call.status}</TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <span className="text-sm text-muted-foreground">
                                    Page {distributionFilteredCallsPage} of {totalDistributionFilteredPages}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setDistributionFilteredCallsPage(p => p - 1)} disabled={distributionFilteredCallsPage === 1}>Précédent</Button>
                                <Button variant="outline" size="sm" onClick={() => setDistributionFilteredCallsPage(p => p + 1)} disabled={distributionFilteredCallsPage >= totalDistributionFilteredPages}>Suivant</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
