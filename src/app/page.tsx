import {
  readCalls
} from "@/lib/data";
import StatCard from "@/components/stat-card";
import {
  Activity,
  PhoneOff,
  Phone,
  Clock
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function Dashboard() {
  const calls = await readCalls();

  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === "completed").length;
  const abandonedCalls = calls.filter((c) => c.status === "abandoned").length;
  const abandonmentRate = totalCalls > 0 ? (abandonedCalls / totalCalls) * 100 : 0;
  const avgDuration =
    completedCalls > 0
      ? calls
          .filter((c) => c.status === "completed")
          .reduce((acc, c) => acc + c.duration, 0) / completedCalls
      : 0;

  const callsByQueue = calls.reduce((acc, call) => {
    acc[call.queue] = (acc[call.queue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartDataByQueue = Object.entries(callsByQueue).map(([name, value]) => ({
    name,
    size: value,
    children: [{ name, value }], // Recharts Treemap expects children
  }));

  const callsByHour = calls.reduce((acc, call) => {
    const hour = new Date(call.timestamp).getUTCHours();
    const hourKey = `${String(hour).padStart(2, '0')}:00`;
    acc[hourKey] = (acc[hourKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartDataByHour = Object.entries(callsByHour)
    .map(([name, value]) => ({ name, calls: value }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  
  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Calls"
            value={totalCalls}
            icon={<Phone className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Abandonment Rate"
            value={`${abandonmentRate.toFixed(1)}%`}
            icon={<PhoneOff className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Avg. Handle Time"
            value={`${Math.round(avgDuration)}s`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Completed Calls"
            value={completedCalls}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <DashboardCharts chartDataByHour={chartDataByHour} chartDataByQueue={chartDataByQueue} />
      </main>
    </div>
  );
}
