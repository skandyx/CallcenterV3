

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
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { TreemapContent } from '@/components/treemap-content';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  initialCalls: CallData[];
  initialAdvancedCalls: AdvancedCallData[];
  initialAgentStatus: AgentStatusData[];
  initialProfileAvailability: ProfileAvailabilityData[];
}

export default function DashboardClient({
    initialCalls,
    initialAdvancedCalls,
    initialAgentStatus,
    initialProfileAvailability
}: DashboardClientProps) {
  const [calls, setCalls] = useState<CallData[]>(initialCalls);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>(initialAdvancedCalls);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData[]>(initialAgentStatus);
  const [profileAvailability, setProfileAvailability] = useState<ProfileAvailabilityData[]>(initialProfileAvailability);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [countryTreemapData, setCountryTreemapData] = useState<any[]>([]);
  const [treemapLevel, setTreemapLevel] = useState<'direction' | 'country'>('direction');
  const [selectedDirection, setSelectedDirection] = useState<'Inbound' | 'Outbound' | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const filterByDate = (items: any[], dateKey: string) => {
    if (!selectedDate) return items;
    return items.filter(item => new Date(item[dateKey]).toDateString() === selectedDate.toDateString());
  }

  const isOutgoing = (call: CallData | AdvancedCallData) => call.status_detail === 'Outgoing';

  const filteredCalls = filterByDate(calls, 'enter_datetime');
  const filteredAdvancedCalls = filterByDate(advancedCalls, 'enter_datetime');
  const filteredAgentStatus = filterByDate(agentStatus, 'date');
  const filteredProfileAvailability = filterByDate(profileAvailability, 'date');

  const totalCalls = filteredCalls.length;
  const answeredCalls = filteredCalls.filter((c) => c.status !== "Abandoned").length;
  const avgWaitTime = filteredCalls.reduce((acc, c) => acc + (c.time_in_queue_seconds || 0), 0) / totalCalls || 0;
  
  const serviceLevel10s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;
  
  const statusAnalysis = filteredCalls.reduce((acc, call) => {
    const status = call.status_detail || call.status;
    if (!acc[status]) {
      acc[status] = { count: 0, totalWait: 0, totalTalk: 0 };
    }
    acc[status].count++;
    acc[status].totalWait += call.time_in_queue_seconds || 0;
    acc[status].totalTalk += call.talk_time_seconds || 0;
    return acc;
  }, {} as Record<string, { count: number, totalWait: number, totalTalk: number }>);

  const getCountryFromNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'Unknown';
    if (phoneNumber.startsWith('0032')) return 'Belgium';
    if (phoneNumber.startsWith('0033')) return 'France';
    if (phoneNumber.startsWith('00216')) return 'Tunisia';
    return 'Other';
  };

  useEffect(() => {
      const directionData = filteredCalls.reduce((acc, call) => {
          const direction = isOutgoing(call) ? 'Outbound' : 'Inbound';
          if (!acc[direction]) {
              acc[direction] = { name: direction, children: [] };
          }

          const country = getCountryFromNumber(call.calling_number);
          let countryNode = acc[direction].children.find((child: any) => child.name === country);

          if (!countryNode) {
              countryNode = { name: country, size: 0 };
              acc[direction].children.push(countryNode);
          }
          countryNode.size++;

          return acc;
      }, {} as Record<string, { name: string; children: { name: string; size: number }[] }>);

      setCountryTreemapData(Object.values(directionData));
  }, [filteredCalls]);

  const handleTreemapClick = (data: any) => {
      if (treemapLevel === 'direction') {
          setSelectedDirection(data.name);
          setTreemapLevel('country');
      } else if (treemapLevel === 'country') {
          setSelectedCountry(data.name);
      }
  };

  const handleBackClick = () => {
      if (treemapLevel === 'country') {
          setSelectedCountry(null);
          setSelectedDirection(null);
          setTreemapLevel('direction');
      }
  };

  const treemapDataToDisplay = useMemo(() => {
      if (treemapLevel === 'direction') {
          return countryTreemapData.map(item => ({ name: item.name, size: item.children.reduce((sum: number, child: any) => sum + child.size, 0) }));
      } else if (treemapLevel === 'country' && selectedDirection) {
          const directionNode = countryTreemapData.find(item => item.name === selectedDirection);
          return directionNode ? directionNode.children : [];
      }
      return [];
  }, [countryTreemapData, treemapLevel, selectedDirection]);

  const distributionFilteredCalls = useMemo(() => {
      let filtered = filteredCalls;

      if (selectedDirection) {
          filtered = filtered.filter(call => (isOutgoing(call) ? 'Outbound' : 'Inbound') === selectedDirection);
      }
      if (selectedCountry) {
          filtered = filtered.filter(call => getCountryFromNumber(call.calling_number) === selectedCountry);
      }
      return filtered;
  }, [filteredCalls, selectedDirection, selectedCountry]);


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
  };

  const statusFilteredCalls = selectedStatus
    ? filteredCalls.filter(call => (call.status === selectedStatus || call.status_detail === selectedStatus))
    : filteredCalls;


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
                            <Input placeholder="Filter across all columns..." className="max-w-sm" />
                             <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="abandoned">Abandoned</SelectItem>
                                    <SelectItem value="missed">Missed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                            {filteredCalls.map((call) => {
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
                        <Input placeholder="Filter across all columns..." className="max-w-sm mb-4" />
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
                            {filteredAdvancedCalls.map((call, index) => (
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
                      {filteredProfileAvailability.map((profile, index) => (
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
                      {filteredAgentStatus.map((status, index) => (
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
                        Journal des appels {selectedStatus && ` - ${selectedStatus}`}
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
                  <CardDescription>
                    {treemapLevel === 'direction' ? 'Cliquez sur une direction pour afficher les pays.' : 'Cliquez sur un pays pour filtrer le journal des appels.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {treemapLevel === 'country' && selectedDirection && (
                        <Button onClick={handleBackClick} variant="outline" size="sm">
                           Retour à {selectedDirection}
                        </Button>
                     )}
                    <ResponsiveContainer width="100%" height={300}>
                        <Treemap
                            data={treemapDataToDisplay}
                            dataKey={treemapLevel === 'direction' ? 'size' : 'size'}
                            aspectRatio={4 / 3}
                            stroke="hsl(var(--card))"
                            fill="hsl(var(--primary))"
                            content={<TreemapContent />}
                            isAnimationActive={false}
                            onClick={(data) => handleTreemapClick(data)}
                        >
                            <Tooltip
                                formatter={(value: any, name: any) => [value, 'calls']}
                                cursor={{fill: 'hsl(var(--muted))'}}
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
                        Journal des appels {selectedDirection && ` - ${selectedDirection}`}{selectedCountry && ` - ${selectedCountry}`}
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
                            {distributionFilteredCalls.map(call => {
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

