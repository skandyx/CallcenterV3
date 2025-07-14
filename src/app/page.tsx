import {
  readCalls, readAdvancedCalls
} from "@/lib/data";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Activity,
  PhoneOff,
  Phone,
  Clock,
  Zap,
  Percent
} from "lucide-react";

export default async function Dashboard() {
  const calls = await readCalls();
  const advancedCalls = await readAdvancedCalls();

  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === "completed");
  const answeredCalls = completedCalls.length;
  const avgWaitTime = calls.reduce((acc, c) => acc + c.duration, 0) / totalCalls || 0;
  
  const serviceLevel10s = (calls.filter(c => c.duration <= 10).length / totalCalls) * 100 || 0;
  const serviceLevel30s = (calls.filter(c => c.duration <= 30).length / totalCalls) * 100 || 0;
  const answerRate = (answeredCalls / totalCalls) * 100 || 0;


  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="manual-input">Manual Data Input</TabsTrigger>
          </TabsList>
        </Tabs>
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
            description={`${calls.filter(c => c.duration <= 10).length}/${totalCalls} calls answered in time`}
            valueClassName="text-green-600"
          />
          <StatCard
            title="Service Level (<30s)"
            value={`${serviceLevel30s.toFixed(1)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description={`${calls.filter(c => c.duration <= 30).length}/${totalCalls} calls answered in time`}
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
                <TabsTrigger value="world-map">Carte du monde</TabsTrigger>
            </TabsList>
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
                            {advancedCalls.map((call) => (
                                <TableRow key={call.callId}>
                                    <TableCell>{new Date(call.timestamp).toLocaleString()}</TableCell>
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
        </Tabs>

      </main>
    </div>
  );
}