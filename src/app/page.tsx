
'use client';

import { useState, useEffect } from 'react';
import type {
  CallData, AdvancedCallData
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
  PlusCircle
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';


export default function Dashboard() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching data:", error);
      setCalls([]);
      setAdvancedCalls([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(); // Fetch data on initial load
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const filteredCalls = selectedDate
    ? calls.filter(call => new Date(call.timestamp).toDateString() === selectedDate.toDateString())
    : calls;

  const filteredAdvancedCalls = selectedDate
    ? advancedCalls.filter(call => new Date(call.timestamp).toDateString() === selectedDate.toDateString())
    : advancedCalls;

  const totalCalls = filteredCalls.length;
  const completedCalls = filteredCalls.filter((c) => c.status === "completed");
  const answeredCalls = completedCalls.length;
  const avgWaitTime = filteredCalls.reduce((acc, c) => acc + c.duration, 0) / totalCalls || 0;
  
  const serviceLevel10s = (filteredCalls.filter(c => c.duration <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (filteredCalls.filter(c => c.duration <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;

  const countryData = [
    { name: 'Belgium', value: 110, color: 'bg-indigo-400' },
    { name: 'France', value: 14, color: 'bg-green-400' },
    { name: 'Tunisia', value: 2, color: 'bg-yellow-400' },
  ];
  const totalCountryCalls = countryData.reduce((acc, country) => acc + country.value, 0);


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
            description={`${filteredCalls.filter(c => c.duration <= 10).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Service Level (<30s)"
            value={`${serviceLevel30s.toFixed(1)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description={`${filteredCalls.filter(c => c.duration <= 30).length}/${totalCalls} calls answered in time`}
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
        
        <Tabs defaultValue="advanced-calls">
            <TabsList className="grid w-full grid-cols-6 bg-muted">
                <TabsTrigger value="simplified-calls">Données d'appel simplifiées</TabsTrigger>
                <TabsTrigger value="advanced-calls">Données d'appel avancées</TabsTrigger>
                <TabsTrigger value="agent-availability">Disponibilité des agents</TabsTrigger>
                <TabsTrigger value="ivr-path">Parcours IVR (avancé)</TabsTrigger>
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
                                <TableHead>Agent</TableHead>
                                <TableHead>Wait Time</TableHead>
                                <TableHead>Talk Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCalls.map((call) => {
                                const callDate = new Date(call.timestamp);
                                return (
                                <TableRow key={call.callId}>
                                    <TableCell>{callDate.toLocaleDateString()}</TableCell>
                                    <TableCell>{callDate.toLocaleTimeString([], timeFormat)}</TableCell>
                                    <TableCell>{call.callId.startsWith('c2') || call.callId.startsWith('c3') ? <div className="flex items-center gap-2"><PlusCircle className="h-4 w-4 text-red-500" /><span>003228829609</span></div> : '003228829631'}</TableCell>
                                    <TableCell>{call.queue}</TableCell>
                                    <TableCell>{call.status === 'abandoned' ? 'N/A' : (call.callId.startsWith('c2') || call.callId.startsWith('c3') ? 'Luffy Monkey D' : 'Alex 777')}</TableCell>
                                    <TableCell>{call.status === 'abandoned' ? '2s' : '0s'}</TableCell>
                                    <TableCell>{call.duration}s</TableCell>
                                    <TableCell>
                                        <Badge variant={call.status === 'abandoned' ? 'destructive' : 'outline'} className="capitalize">
                                            {call.status === 'completed' ? 'Direct call' : call.status}
                                        </Badge>
                                    </TableCell>
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
                        <p className="text-muted-foreground">Journaux d'événements détaillés pour chaque appel, y compris les transferts et les tentatives. Idéal pour une analyse forensique.</p>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="Filter across all columns..." className="max-w-sm mb-4" />
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Caller</TableHead>
                                <TableHead>IVR</TableHead>
                                <TableHead>Queue</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Status Detail</TableHead>
                                <TableHead>Talk Time</TableHead>
                                <TableHead>Call ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAdvancedCalls.map((call) => (
                                <TableRow key={`${call.callId}-${call.timestamp}`}>
                                    <TableCell>{new Date(call.timestamp).toLocaleString([], { ...timeFormat, day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                                    <TableCell>003228829609</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>{call.to}</TableCell>
                                    <TableCell>{call.from === 'Sales' ? 'Luffy Monkey D' : 'N/A'}</TableCell>
                                    <TableCell>Direct call</TableCell>
                                    <TableCell>Outgoing</TableCell>
                                    <TableCell>0s</TableCell>
                                    <TableCell>{call.callId}</TableCell>
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
                  <p className="text-muted-foreground">Geographic call distribution. Click a country to see agent breakdown.</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="w-full h-48 flex rounded-lg overflow-hidden">
                    {countryData.map(country => (
                      <div
                        key={country.name}
                        className={`${country.color} flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:opacity-90 transition-opacity`}
                        style={{ width: `${(country.value / totalCountryCalls) * 100}%` }}
                      >
                       {country.name} ({country.value})
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Call Log</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
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
                            {filteredAdvancedCalls.map(call => (
                                <TableRow key={`${call.callId}-${call.timestamp}`}>
                                    <TableCell>{new Date(call.timestamp).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(call.timestamp).toLocaleTimeString([], timeFormat)}</TableCell>
                                    <TableCell>003228829631</TableCell>
                                    <TableCell>Agent Smith</TableCell>
                                    <TableCell>{call.to}</TableCell>
                                    <TableCell>Direct call</TableCell>
                                    <TableCell>Outgoing</TableCell>
                                    <TableCell>{call.duration || 0}s</TableCell>
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
