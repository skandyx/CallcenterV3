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
import { cn } from "@/lib/utils";

export default async function WallboardPage() {
  const agents = await readAgentStatus();
  const calls = await readCalls();

  const callsWaiting = calls.filter(c => c.status === 'missed').length; // Simplified logic
  const longestWaitTime = calls.filter(c => c.status === 'abandoned').reduce((max, call) => call.duration > max ? call.duration : max, 0);

  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };


  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "default";
      case "on_call":
        return "secondary";
      case "paused":
        return "outline";
      case "offline":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Wallboard" />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <StatCard
            title="Agents Online"
            value={agents.filter(a => a.status === 'online' || a.status === 'on_call').length}
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
                  <TableHead>Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.agentId}>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(agent.status)} className="capitalize">
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.queue}</TableCell>
                    <TableCell>{new Date(agent.timestamp).toLocaleTimeString([], timeFormat)}</TableCell>
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
