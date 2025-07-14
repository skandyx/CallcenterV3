'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TreemapContent } from "@/components/treemap-content";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Treemap } from "recharts";

interface DashboardChartsProps {
    chartDataByHour: { name: string; calls: number }[];
    chartDataByQueue: { name: string; size: number; children: { name: string; value: number }[] }[];
}

const chartConfig = {
    calls: {
      label: "Calls",
      color: "hsl(var(--primary))",
    },
} satisfies import("@/components/ui/chart").ChartConfig;

export function DashboardCharts({ chartDataByHour, chartDataByQueue }: DashboardChartsProps) {
    return (
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
                      formatter={(value: any, name: any) => [value, 'Calls']}
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
    );
}
