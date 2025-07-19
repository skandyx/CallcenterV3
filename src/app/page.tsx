

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
import { TreemapContent } from '@/components/treemap-content';

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
  };

  const statusFilteredCalls = statusTreemapFilter
    ? baseFilteredCalls.filter(call => (call.status === statusTreemapFilter || call.status_detail === statusTreemapFilter))
    : baseFilteredCalls;

  const filteredSimplifiedCalls = baseFilteredCalls.filter(call => {
    const searchTerm = simplifiedCallsFilter.toLowerCase();
    const statusMatch = simplifiedCallsStatusFilter === 'all' || call.status === simplifiedCallsStatusFilter;
    if (!statusMatch) return false;

    return Object.values(call).some(val => 
        String(val).toLowerCase().includes(searchTerm)
    );
  });

  const filteredAdvancedCalls = baseFilteredAdvancedCalls.filter(call => {
      const searchTerm = advancedCallsFilter.toLowerCase();
      return Object.values(call).some(val => 
          String(val).toLowerCase().includes(searchTerm)
      );
  });

  const filteredProfileAvailability = baseFilteredProfileAvailability.filter(profile => {
    const searchTerm = profileAvailabilityFilter.toLowerCase();
    return (
        profile.user.toLowerCase().includes(searchTerm) ||
        profile.email.toLowerCase().includes(searchTerm) ||
        new Date(profile.date).toLocaleDateString().toLowerCase().includes(searchTerm)
    );
  });

  const filteredAgentConnections = baseFilteredAgentStatus.filter(status => {
    const searchTerm = agentConnectionsFilter.toLowerCase();
    return (
        status.user.toLowerCase().includes(searchTerm) ||
        status.email.toLowerCase().includes(searchTerm) ||
        status.queuename.toLowerCase().includes(searchTerm) ||
        new Date(status.date).toLocaleDateString().toLowerCase().includes(searchTerm)
    );
  });

  const getCountryFromNumber = (phoneNumber: string) => {
      if (!phoneNumber) return 'Unknown';
      if (phoneNumber.startsWith('0032')) return 'Belgium';
      if (phoneNumber.startsWith('0033')) return 'France';
      if (phoneNumber.startsWith('00216')) return 'Tunisia';
      return 'Other';
  };
  
  const countryDistributionData = useMemo(() => {
    const countryCounts: { [key: string]: number } = {};
    baseFilteredCalls.forEach(call => {
      const country = getCountryFromNumber(call.calling_number);
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    return Object.entries(countryCounts).map(([name, size]) => ({ name, size }));
  }, [baseFilteredCalls]);


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
                                onChange={(e) => setSimplifiedCallsFilter(e.target.value)}
                            />
                             <Select value={simplifiedCallsStatusFilter} onValueChange={setSimplifiedCallsStatusFilter}>
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
                            {filteredSimplifiedCalls.map((call) => {
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
                        <Input 
                            placeholder="Filter across all columns..." 
                            className="max-w-sm mb-4"
                            value={advancedCallsFilter}
                            onChange={(e) => setAdvancedCallsFilter(e.target.value)}
                        />
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
                            {filteredAdvancedCalls.map((call, index) => {
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
                  <Input 
                      placeholder="Filter by agent, email, or date..." 
                      value={profileAvailabilityFilter}
                      onChange={(e) => setProfileAvailabilityFilter(e.target.value)}
                      className="max-w-sm mb-4" 
                  />
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
                      {filteredProfileAvailability.map((profile, index) => (
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
                   <Input 
                      placeholder="Filter by agent, email or queue..." 
                      value={agentConnectionsFilter}
                      onChange={(e) => setAgentConnectionsFilter(e.target.value)}
                      className="max-w-sm mb-4" 
                  />
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
                      {filteredAgentConnections.map((status, index) => (
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
                <CardContent className="space-y-8">
                  <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                      data={statusTreemapData}
                      dataKey="size"
                      stroke="hsl(var(--card))"
                      fill="hsl(var(--primary))"
                      isAnimationActive={false}
                      content={<TreemapContent />}
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
                            {statusFilteredCalls.map((call) => {
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="call-distribution">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution des appels par pays</CardTitle>
                        <CardDescription>Visualisation de tous les appels répartis par pays.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <Treemap
                                data={countryDistributionData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="hsl(var(--card))"
                                fill="hsl(var(--primary))"
                                content={<TreemapContent />}
                                isAnimationActive={false}
                            >
                                <Tooltip
                                    formatter={(value: any, name: any) => [`${value} calls`, name]}
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
                                        {baseFilteredCalls.map(call => {
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
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

