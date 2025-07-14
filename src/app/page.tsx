import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Treemap,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { readCalls } from "@/lib/data";
import StatCard from "@/components/stat-card";
import { Activity, PhoneOff, Phone, Clock } from "lucide-react";
import PageHeader from "@/components/page-header";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TreemapContent } from "@/components/treemap-content";

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
  
  const chartConfig = {
    calls: {
      label: "Calls",
      color: "hsl(var(--primary))",
    },
  } satisfies import("@/components/ui/chart").ChartConfig;


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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Call Volume Overview</CardTitle>
              <CardDescription>
                Total calls received per hour throughout the day.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart accessibilityLayer data={chartDataByHour}>
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Legend />
                  <Line dataKey="calls" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Calls by Queue</CardTitle>
              <CardDescription>
                Distribution of calls across different queues.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={chartDataByQueue}
                  dataKey="size"
                  ratio={4 / 3}
                  stroke="hsl(var(--card))"
                  fill="hsl(var(--primary))"
                  isAnimationActive={false}
                  content={<TreemapContent />}
                >
                   <Tooltip
                      labelFormatter={(name) => name}
                      formatter={(value, name) => [value, 'Calls']}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{
                          background: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                      }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
