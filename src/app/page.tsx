

'use client';

import { useState, useEffect } from 'react';
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
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';


export default function Dashboard() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData[]>([]);
  const [profileAvailability, setProfileAvailability] = useState<ProfileAvailabilityData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);


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
      setCalls([]);
      setAdvancedCalls([]);
      setAgentStatus([]);
      setProfileAvailability([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(); // Fetch data on initial load
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const filterByDate = (items: any[], dateKey: string) => {
    if (!selectedDate) return items;
    return items.filter(item => new Date(item[dateKey]).toDateString() === selectedDate.toDateString());
  }

  const filteredCalls = filterByDate(calls, 'enter_datetime');
  const filteredAdvancedCalls = filterByDate(advancedCalls, 'enter_datetime');
  const filteredAgentStatus = filterByDate(agentStatus, 'date');
  const filteredProfileAvailability = filterByDate(profileAvailability, 'date');

  const totalCalls = filteredCalls.length;
  const answeredCalls = filteredCalls.filter((c) => c.status !== "Abandoned").length;
  const avgWaitTime = filteredCalls.reduce((acc, c) => acc + c.time_in_queue_seconds, 0) / totalCalls || 0;
  
  const serviceLevel10s = (filteredCalls.filter(c => c.time_in_queue_seconds <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (filteredCalls.filter(c => c.time_in_queue_seconds <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;
  
  const statusAnalysis = filteredCalls.reduce((acc, call) => {
    const status = call.status_detail || call.status;
    if (!acc[status]) {
      acc[status] = { count: 0, totalWait: 0, totalTalk: 0 };
    }
    acc[status].count++;
    acc[status].totalWait += call.time_in_queue_seconds;
    acc[status].totalTalk += call.talk_time_seconds || 0;
    return acc;
  }, {} as Record<string, { count: number, totalWait: number, totalTalk: number }>);

  const getCountryFromNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('0032')) return 'Belgium';
    if (phoneNumber.startsWith('0033')) return 'France';
    if (phoneNumber.startsWith('00216')) return 'Tunisia';
    return 'Unknown';
  };

  const countryData = filteredCalls.reduce((acc, call) => {
      const country = getCountryFromNumber(call.calling_number);
      if (country !== 'Unknown') {
          if (!acc[country]) {
              acc[country] = { name: country, value: 0, color: '' };
          }
          acc[country].value++;
      }
      return acc;
  }, {} as Record<string, { name: string; value: number, color: string }>);

  const countryColors = ['bg-indigo-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400', 'bg-blue-400'];
  const countryDataArray = Object.values(countryData).map((country, index) => ({
      ...country,
      color: countryColors[index % countryColors.length],
  }));

  const totalCountryCalls = countryDataArray.reduce((acc, country) => acc + country.value, 0);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(prev => (prev === countryName ? null : countryName));
  };

  const distributionFilteredCalls = selectedCountry
    ? filteredCalls.filter(call => getCountryFromNumber(call.calling_number) === selectedCountry)
    : filteredCalls;


  if (loading) {
    return (
        <div className="flex flex-col">
            <PageHeader title="Dashboard" selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-96" />
            </main>
        </div>
    )
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
            description={`${filteredCalls.filter(c => c.time_in_queue_seconds <= 10).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Service Level (<30s)"
            value={`${serviceLevel30s.toFixed(1)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description={`${filteredCalls.filter(c => c.time_in_queue_seconds <= 30).length}/${totalCalls} calls answered in time`}
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
                <TabsTrigger value="agent-availability">Disponibilité des agents</TabsTrigger>
                <TabsTrigger value="ivr-journey">Parcours IVR (avancé)</TabsTrigger>
                <TabsTrigger value="status-analysis">Analyse par statut</TabsTrigger>
                <TabsTrigger value="call-distribution">Call Distribution by Country</TabsTrigger>
            </TabsList>
            <TabsContent value="simplified-calls">
                <Card>
                    <CardHeader>
                        <CardTitle>Call Log</CardTitle>
                        <CardDescription>Vue détaillée des appels individuels pour la journée en cours.</CardDescription>
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
                                    <TableCell>{call.time_in_queue_seconds}s</TableCell>
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
                        <CardTitle>Advanced Call Log</CardTitle>
                        <CardDescription>Journaux d'événements détaillés pour chaque appel, y compris les transferts et les tentatives. Idéal pour une analyse forensique.</CardDescription>
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
             <TabsContent value="agent-availability">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilité des agents</CardTitle>
                  <CardDescription>
                    Vue détaillée de la disponibilité des agents (en minutes) par heure pour la journée sélectionnée.
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
                      {filteredProfileAvailability.map((profile) => (
                        <TableRow key={`${profile.user_id}-${profile.hour}`}>
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
            <TabsContent value="ivr-journey">
              <Card>
                <CardHeader>
                  <CardTitle>Parcours IVR (avancé)</CardTitle>
                  <CardDescription>
                    Temps passé par les agents dans chaque statut pour chaque file d'attente (en minutes).
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
                    Répartition des appels par statut de terminaison, avec statistiques associées.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Statut</TableHead>
                        <TableHead>Nombre d'appels</TableHead>
                        <TableHead>Temps d'attente moyen</TableHead>
                        <TableHead>Temps de conversation moyen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(statusAnalysis).map(([status, data]) => (
                        <TableRow key={status}>
                          <TableCell>{status}</TableCell>
                          <TableCell>{data.count}</TableCell>
                          <TableCell>{(data.totalWait / data.count).toFixed(1)}s</TableCell>
                          <TableCell>{(data.totalTalk / data.count).toFixed(1)}s</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="call-distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Call Distribution by Country</CardTitle>
                  <CardDescription>Geographic call distribution. Click a country to see agent breakdown.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="w-full h-48 flex rounded-lg overflow-hidden">
                    {countryDataArray.map(country => (
                      <div
                        key={country.name}
                        className={`${country.color} flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:opacity-90 transition-opacity ${selectedCountry === country.name ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                        style={{ width: `${(country.value / totalCountryCalls) * 100}%` }}
                        onClick={() => handleCountryClick(country.name)}
                      >
                       {country.name} ({country.value})
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Call Log {selectedCountry && ` - ${selectedCountry}`}
                    </h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Caller Number</TableHead>
                            <TableHead>Queue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {distributionFilteredCalls.map(call => (
                                <TableRow key={call.call_id}>
                                    <TableCell>{new Date(call.enter_datetime).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(call.enter_datetime).toLocaleTimeString([], timeFormat)}</TableCell>
                                    <TableCell>{call.calling_number}</TableCell>
                                    <TableCell>{call.queue_name}</TableCell>
                                    <TableCell>{call.status}</TableCell>
                                    <TableCell>{call.time_in_queue_seconds || 0}s</TableCell>
                                </TableRow>
                            ))}
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
