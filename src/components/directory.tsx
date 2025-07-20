// src/components/directory.tsx
"use client";

import { useMemo } from 'react';
import type { CallData, AdvancedCallData } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { User, Phone, Users } from 'lucide-react';

interface DirectoryProps {
  calls: CallData[];
  advancedCalls: AdvancedCallData[];
}

interface DirectoryEntry {
  name: string;
  number: string;
  type: 'Agent' | 'File' | 'IVR';
}

export default function Directory({ calls, advancedCalls }: DirectoryProps) {
  const directoryData = useMemo(() => {
    const entries = new Map<string, DirectoryEntry>();
    const allCalls = [...calls, ...advancedCalls];

    allCalls.forEach(call => {
      const { agent, agent_number, queue_name, status } = call;

      // Add agents
      if (agent && agent_number && !entries.has(agent.trim())) {
        entries.set(agent.trim(), {
          name: agent.trim(),
          number: agent_number,
          type: 'Agent',
        });
      }

      // Add queues
      if (queue_name && agent_number && !entries.has(queue_name.trim())) {
        let type: DirectoryEntry['type'] = 'File';
        if (status === 'IVR') {
            type = 'IVR';
        }

        entries.set(queue_name.trim(), {
          name: queue_name.trim(),
          number: agent_number,
          type: type,
        });
      }
    });

    return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [calls, advancedCalls]);

  const getIconForType = (type: DirectoryEntry['type']) => {
    switch(type) {
      case 'Agent':
        return <User className="h-4 w-4 text-muted-foreground" />;
      case 'File':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'IVR':
        return <Phone className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annuaire</CardTitle>
        <CardDescription>
          Liste de tous les agents, files d'attente et IVR avec leurs numéros associés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Numéro de Téléphone</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directoryData.length > 0 ? (
                directoryData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.number}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        {getIconForType(entry.type)}
                        {entry.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Aucune donnée d'annuaire à afficher.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
