// src/components/directory.tsx
"use client";

import { useState, useMemo } from 'react';
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
import { Input } from './ui/input';

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
  const [filter, setFilter] = useState('');

  const directoryData = useMemo(() => {
    const entries = new Map<string, DirectoryEntry>();
    const allCalls = [...calls, ...advancedCalls];

    allCalls.forEach(call => {
      const { agent, agent_number, queue_name, status, time_in_queue_seconds } = call;

      let entityType: 'Agent' | 'File' | 'IVR' | null = null;
      let entityName: string | undefined = agent?.trim();
      let entityNumber: string | undefined = agent_number;

      if (status === 'IVR' && agent) {
        entityType = 'IVR';
      } else if (time_in_queue_seconds !== undefined && queue_name) {
         // This is a queue
         if (!entries.has(queue_name.trim())) {
             entries.set(queue_name.trim(), {
                 name: queue_name.trim(),
                 number: agent_number || 'N/A', // A queue itself doesn't have a number, but we can associate one from an agent.
                 type: 'File',
             });
         }
         // The agent associated with this queue call should be added as an agent.
         entityType = 'Agent';
      } else if (agent && agent_number) {
        // Default to Agent if not specified otherwise
        entityType = 'Agent';
      }

      if (entityType && entityName && entityNumber && !entries.has(entityName)) {
        entries.set(entityName, {
          name: entityName,
          number: entityNumber,
          type: entityType,
        });
      }
      
      // Separately, always try to add queues from queue_name if available
      if (queue_name && !entries.has(queue_name.trim())) {
        entries.set(queue_name.trim(), {
            name: queue_name.trim(),
            number: agent_number || 'N/A',
            type: 'File',
        });
      }
    });

    const allEntries = Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));

    if (!filter) {
        return allEntries;
    }

    const lowercasedFilter = filter.toLowerCase();
    return allEntries.filter(entry =>
        entry.name.toLowerCase().includes(lowercasedFilter) ||
        entry.number.toLowerCase().includes(lowercasedFilter)
    );
  }, [calls, advancedCalls, filter]);

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
        <div className="pt-2">
            <Input
                placeholder="Filtrer par nom ou numéro..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
            />
        </div>
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
