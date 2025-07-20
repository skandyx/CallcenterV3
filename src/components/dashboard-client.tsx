

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
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import WorldMapChart from './world-map-chart';
import StatusAnalysisChart from './status-analysis-chart';
import AdvancedCallLog from './advanced-call-log';
import CallLog from './call-log';
import Directory from './directory';
import { Input } from './ui/input';

export default function DashboardClient() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [advancedCalls, setAdvancedCalls] = useState<AdvancedCallData[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatusData[]>([]);
  const [profileAvailability, setProfileAvailability] = useState<ProfileAvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const [profileAvailabilityPage, setProfileAvailabilityPage] = useState(1);
  const [agentStatusPage, setAgentStatusPage] = useState(1);
  const [profileAgentFilter, setProfileAgentFilter] = useState('');
  const [agentQueueFilter, setAgentQueueFilter] = useState('');


  const ITEMS_PER_PAGE = 10;

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
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const filterByDate = (items: any[], dateKey: string) => {
    if (!selectedDate) return items;
    return items.filter(item => {
        const itemDate = new Date(item[dateKey]);
        // Compare year, month, and day. Ignore time.
        return itemDate.getFullYear() === selectedDate.getFullYear() &&
               itemDate.getMonth() === selectedDate.getMonth() &&
               itemDate.getDate() === selectedDate.getDate();
    });
  }

  const filteredCalls = useMemo(() => filterByDate(calls, 'enter_datetime'), [calls, selectedDate]);
  const filteredAdvancedCalls = useMemo(() => filterByDate(advancedCalls, 'enter_datetime'), [advancedCalls, selectedDate]);
  
  const filteredAgentStatus = useMemo(() => {
    let data = filterByDate(agentStatus, 'date');
    if (agentQueueFilter) {
      const lowercasedFilter = agentQueueFilter.toLowerCase();
      data = data.filter(status => 
        status.user.toLowerCase().includes(lowercasedFilter) ||
        status.queuename.toLowerCase().includes(lowercasedFilter)
      );
    }
    return data;
  }, [agentStatus, selectedDate, agentQueueFilter]);
  
  const filteredProfileAvailability = useMemo(() => {
    let data = filterByDate(profileAvailability, 'date');
    if (profileAgentFilter) {
      data = data.filter(profile => 
        profile.user.toLowerCase().includes(profileAgentFilter.toLowerCase())
      );
    }
    return data;
  }, [profileAvailability, selectedDate, profileAgentFilter]);

  const totalCalls = filteredCalls.length;
  const answeredCalls = filteredCalls.filter((c) => c.status !== "Abandoned").length;
  const avgWaitTime = filteredCalls.reduce((acc, c) => acc + (c.time_in_queue_seconds || 0), 0) / totalCalls || 0;
  
  const serviceLevel10s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (filteredCalls.filter(c => (c.time_in_queue_seconds || 0) <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;

  // Pagination Logic
  const paginate = (data: any[], page: number) => {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedProfileAvailability = paginate(filteredProfileAvailability, profileAvailabilityPage);
  const paginatedAgentStatus = paginate(filteredAgentStatus, agentStatusPage);

  const availableProfileKeys = useMemo(() => {
    const keys = new Set<string>();
    const standardKeys = ['user_id', 'user', 'date', 'hour', 'email'];
    filteredProfileAvailability.forEach(profile => {
        Object.keys(profile).forEach(key => {
            if (!standardKeys.includes(key) && (profile[key] > 0)) {
                keys.add(key);
            }
        });
    });
    return Array.from(keys).sort();
  }, [filteredProfileAvailability]);

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
            <TabsList className="grid w-full grid-cols-7 bg-muted">
                <TabsTrigger value="simplified-calls">Données d'appel simplifiées</TabsTrigger>
                <TabsTrigger value="advanced-calls">Données d'appel avancées</TabsTrigger>
                <TabsTrigger value="profile-availability">Disponibilité des profils</TabsTrigger>
                <TabsTrigger value="agent-connections">État des files et des agents</TabsTrigger>
                <TabsTrigger value="status-analysis">Analyse par statut</TabsTrigger>
                <TabsTrigger value="call-distribution">Call Distribution</TabsTrigger>
                <TabsTrigger value="directory">Annuaire</TabsTrigger>
            </TabsList>
            <TabsContent value="simplified-calls">
                <CallLog data={filteredCalls} />
            </TabsContent>
            <TabsContent value="advanced-calls">
                 <AdvancedCallLog data={filteredAdvancedCalls} />
            </TabsContent>
             <TabsContent value="profile-availability">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilité des profils</CardTitle>
                  <CardDescription>
                    Les données indiquant le temps passé par chaque utilisateur dans chaque profil (en minutes).
                  </CardDescription>
                  <div className="pt-4">
                    <Input
                        placeholder="Filtrer par nom d'agent..."
                        value={profileAgentFilter}
                        onChange={(e) => {
                            setProfileAgentFilter(e.target.value);
                            setProfileAvailabilityPage(1); 
                        }}
                        className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        {availableProfileKeys.map(key => <TableHead key={key}>{key}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProfileAvailability.length > 0 ? (
                        paginatedProfileAvailability.map((profile, index) => (
                          <TableRow key={`${profile.user_id}-${profile.date}-${profile.hour}-${index}`}>
                            <TableCell>{profile.user}</TableCell>
                            <TableCell>{new Date(profile.date).toLocaleDateString()}</TableCell>
                            <TableCell>{profile.hour}:00</TableCell>
                            {availableProfileKeys.map(key => (
                                <TableCell key={key}>{profile[key] || 0}</TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3 + availableProfileKeys.length} className="h-24 text-center">
                            No results found.
                          </TableCell>
                        </TableRow>
                      )}
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
                   <div className="pt-4">
                    <Input
                        placeholder="Filtrer par nom d'agent ou de file..."
                        value={agentQueueFilter}
                        onChange={(e) => {
                            setAgentQueueFilter(e.target.value);
                            setAgentStatusPage(1); 
                        }}
                        className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>File d'attente</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Connecté (min)</TableHead>
                        <TableHead>En pause (min)</TableHead>
                        <TableHead>Déconnecté (min)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAgentStatus.map((status, index) => (
                        <TableRow key={`${status.user_id}-${status.queue_id}-${index}`}>
                          <TableCell>{status.user}</TableCell>
                          <TableCell>{status.queuename}</TableCell>
                          <TableCell>{new Date(status.date).toLocaleDateString()}</TableCell>
                          <TableCell>{status.hour}:00</TableCell>
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
              <StatusAnalysisChart data={filteredCalls} />
            </TabsContent>
            <TabsContent value="call-distribution">
                <WorldMapChart data={filteredCalls} />
            </TabsContent>
            <TabsContent value="directory">
                <Directory calls={calls} advancedCalls={advancedCalls} />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
