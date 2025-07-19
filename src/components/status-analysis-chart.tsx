
'use client';

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CallData } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { CustomTreemapContent } from './custom-treemap-content';

const ITEMS_PER_PAGE = 10;

const StatusAnalysisChart = ({ data }: { data: CallData[] }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusAnalysisPage, setStatusAnalysisPage] = useState(1);

  const statusTreemapData = useMemo(() => {
    return Object.values(
      data.reduce((acc, call) => {
        const detailStatus = call.status_detail || call.status || 'N/A';
        if (!acc[detailStatus]) {
          acc[detailStatus] = { name: detailStatus, size: 0 };
        }
        acc[detailStatus].size++;
        return acc;
      }, {} as Record<string, { name: string; size: number }>)
    );
  }, [data]);

  const statusFilteredCalls = useMemo(() => {
    if (!selectedStatus) return data;
    return data.filter(call => (call.status === selectedStatus || call.status_detail === selectedStatus));
  }, [data, selectedStatus]);

  const handleStatusClick = (statusName: string) => {
    setSelectedStatus(prev => (prev === statusName ? null : statusName));
    setStatusAnalysisPage(1);
  };
  
  const isOutgoing = (call: CallData) => call.status_detail === 'Outgoing';
  
  const paginate = (data: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  const paginatedStatusAnalysisCalls = paginate(statusFilteredCalls, statusAnalysisPage);
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse par statut</CardTitle>
        <CardDescription>
          Cliquez sur un statut dans le graphique pour filtrer le journal des appels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
              <Treemap
                  data={statusTreemapData}
                  dataKey="size"
                  type="squarify"
                  stroke="hsl(var(--card))"
                  fill="hsl(var(--primary))"
                  content={<CustomTreemapContent />}
                  onClick={(data) => handleStatusClick(data.name)}
                  isAnimationActive={false}
              />
          </ResponsiveContainer>
        </div>
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
                  <TableHead>Caller</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStatusAnalysisCalls.map((call) => {
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
                      <TableCell>{call.calling_number}</TableCell>
                      <TableCell>
                        <Badge variant={call.status === 'Abandoned' ? 'destructive' : 'outline'} className="capitalize">
                          {call.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {renderPaginationControls(statusFilteredCalls.length, statusAnalysisPage, setStatusAnalysisPage)}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusAnalysisChart;
