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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DirectoryProps {
  calls: CallData[];
  advancedCalls: AdvancedCallData[];
}

type DirectoryEntryType = 'Agent' | 'File' | 'IVR';

interface DirectoryEntry {
  name: string;
  number: string;
  type: DirectoryEntryType;
}

export default function Directory({ calls, advancedCalls }: DirectoryProps) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const directoryData = useMemo(() => {
    const entries = new Map<string, DirectoryEntry>();
    const allCalls = [...calls, ...advancedCalls];

    allCalls.forEach(call => {
      const { agent, agent_number, queue_name, status } = call;

      const addOrUpdateEntry = (name: string, number: string | undefined, type: DirectoryEntryType) => {
        const trimmedName = name.trim();
        const existingEntry = entries.get(trimmedName);
        
        // If the entry doesn't exist, or if it exists but has no number, add/update it.
        // This prioritizes the first valid number found for an entry.
        if (!existingEntry || (existingEntry.number === 'N/A' && number)) {
            entries.set(trimmedName, {
                name: trimmedName,
                number: number || 'N/A',
                type: type,
            });
        }
      };
      
      // Rule for IVRs
      if (status === 'IVR' && agent) {
        addOrUpdateEntry(agent, agent_number, 'IVR');
      }
      
      // Rule for Queues
      if (queue_name) {
        addOrUpdateEntry(queue_name, agent_number, 'File');
      }

      // Rule for Agents
      if (agent && agent_number) {
        // We only add as agent if it's not already classified as something else, to avoid conflicts.
        if (!entries.has(agent.trim())) {
            addOrUpdateEntry(agent, agent_number, 'Agent');
        }
      }
    });

    const allEntries = Array.from(entries.values());
    
    // Apply filters
    const lowercasedFilter = filter.toLowerCase();
    const filteredEntries = allEntries.filter(entry => {
        const typeMatch = typeFilter === 'all' || entry.type.toLowerCase() === typeFilter.toLowerCase();
        const textMatch = !filter ||
            entry.name.toLowerCase().includes(lowercasedFilter) ||
            entry.number.toLowerCase().includes(lowercasedFilter);
        return typeMatch && textMatch;
    });

    // Sort entries: by Type first (Agent -> File -> IVR), then alphabetically by name
    const typeOrder: Record<DirectoryEntryType, number> = { 'Agent': 1, 'File': 2, 'IVR': 3 };
    return filteredEntries.sort((a, b) => {
      if (a.type !== b.type) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.name.localeCompare(b.name);
    });

  }, [calls, advancedCalls, filter, typeFilter]);

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
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
            <Input
                placeholder="Filtrer par nom ou numéro..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
            />
             <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="File">File</SelectItem>
                    <SelectItem value="IVR">IVR</SelectItem>
                </SelectContent>
            </Select>
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
