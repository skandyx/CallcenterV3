// src/app/wallboard/page.tsx
'use client';
import { readAgentStatus, readCalls } from "@/lib/data";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, PhoneIncoming, Clock } from "lucide-react";
import type { AgentStatusData, CallData } from "@/types";
import { useState, useEffect } from "react";

const getStatusVariant = (loggedIn: number) => {
    return loggedIn > 0 ? "default" : "destructive";
};

const getStatusText = (loggedIn: number) => {
    return loggedIn > 0 ? "En ligne" : "Hors ligne";
};


export default function WallboardPage() {
    const [agents, setAgents] = useState<AgentStatusData[]>([]);
    const [calls, setCalls] = useState<CallData[]>([]);
    const [loading, setLoading] = useState(true);

    const timeFormat: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    const fetchData = async () => {
        try {
            const [agentData, callData] = await Promise.all([readAgentStatus(), readCalls()]);
            setAgents(agentData);
            setCalls(callData);
        } catch (error) {
            console.error("Error fetching wallboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh data every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <PageHeader title="Wallboard" />
                <div className="flex-1 p-4 md:p-8">Chargement...</div>
            </div>
        );
    }
    
    const agentsOnline = agents.filter(a => a.loggedIn > 0).length;
    const callsWaiting = calls.filter(c => c.status === 'Abandoned').length; // Using Abandoned as waiting
    const longestWaitTime = calls.reduce((max, call) => (call.time_in_queue_seconds || 0) > max ? (call.time_in_queue_seconds || 0) : max, 0);


  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Wallboard" />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <StatCard
            title="Agents Online"
            value={agentsOnline}
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            valueClassName="text-4xl"
          />
          <StatCard
            title="Calls Waiting"
            value={callsWaiting}
            icon={<PhoneIncoming className="h-6 w-6 text-muted-foreground" />}
             valueClassName="text-4xl"
          />
          <StatCard
            title="Longest Wait"
            value={`${longestWaitTime}s`}
            icon={<Clock className="h-6 w-6 text-muted-foreground" />}
             valueClassName="text-4xl"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent, index) => (
                  <TableRow key={`${agent.user_id}-${agent.queue_id}-${index}`}>
                    <TableCell className="font-medium">{agent.user}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(agent.loggedIn)} className="capitalize">
                         {getStatusText(agent.loggedIn)}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.queuename}</TableCell>
                    <TableCell>{new Date(agent.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
