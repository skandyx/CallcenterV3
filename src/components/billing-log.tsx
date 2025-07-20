// src/components/billing-log.tsx
"use client";

import { useState, useMemo } from 'react';
import type { AdvancedCallData, ProfileAvailabilityData, BillingData } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface BillingLogProps {
  advancedCalls: AdvancedCallData[];
  profileAvailability: ProfileAvailabilityData[];
}

const ROWS_PER_PAGE = 10;

export default function BillingLog({ advancedCalls, profileAvailability }: BillingLogProps) {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const billingData = useMemo(() => {
    const outgoingCalls = advancedCalls.filter(call =>
      call.status_detail?.toLowerCase().includes('outgoing') && call.agent_id
    );

    const profileMap = new Map<string, ProfileAvailabilityData>();
    profileAvailability.forEach(p => {
      const key = `${p.user_id}-${p.date}-${p.hour}`;
      profileMap.set(key, p);
    });

    const standardProfiles = ['user_id', 'user', 'date', 'hour', 'email', 'Available', 'Lunch', 'Meeting', 'Left for the day'];

    const result: BillingData[] = outgoingCalls.map(call => {
      const callTime = new Date(call.enter_datetime);
      const callDate = callTime.toISOString().split('T')[0];
      const callHour = callTime.getHours();
      
      const profileKey = `${call.agent_id}-${callDate}-${callHour}`;
      const agentProfile = profileMap.get(profileKey);

      let usedProfile = 'Unknown';
      if (agentProfile) {
        // Find the profile key with a value > 0
        const activeProfile = Object.keys(agentProfile).find(key => 
          !standardProfiles.includes(key) && agentProfile[key] > 0
        );
        usedProfile = activeProfile || 'Available'; // Default to 'Available' if no specific profile is active but data exists
      }

      return {
        call_id: call.call_id,
        agent: call.agent || 'N/A',
        agent_id: call.agent_id!,
        enter_datetime: call.enter_datetime,
        calling_number: call.calling_number,
        processing_time_seconds: call.processing_time_seconds || 0,
        profile: usedProfile,
      };
    });

    // Filtering logic
    const lowercasedFilter = filter.toLowerCase();
    const filteredResult = filter 
        ? result.filter(item => 
            item.agent.toLowerCase().includes(lowercasedFilter) ||
            item.calling_number.toLowerCase().includes(lowercasedFilter) ||
            item.profile.toLowerCase().includes(lowercasedFilter)
          )
        : result;

    return filteredResult.sort((a,b) => new Date(b.enter_datetime).getTime() - new Date(a.enter_datetime).getTime());

  }, [advancedCalls, profileAvailability, filter]);

  const totalPages = Math.ceil(billingData.length / ROWS_PER_PAGE);
  const paginatedData = billingData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Log</CardTitle>
        <CardDescription>
          Journal des appels sortants avec le profil de l'agent utilisé au moment de l'appel.
        </CardDescription>
        <div className="pt-4">
            <Input
                placeholder="Filtrer par agent, numéro ou profil..."
                value={filter}
                onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                }}
                className="max-w-sm"
            />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Numéro Appelé</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Profil Utilisé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item.call_id}>
                    <TableCell>
                        <div>{new Date(item.enter_datetime).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-muted-foreground">{new Date(item.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                    </TableCell>
                    <TableCell>{item.agent}</TableCell>
                    <TableCell>{item.calling_number}</TableCell>
                    <TableCell>{item.processing_time_seconds}s</TableCell>
                    <TableCell>
                      <Badge variant={item.profile === 'Unknown' ? 'destructive' : 'secondary'}>{item.profile}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucune donnée de facturation trouvée pour la période sélectionnée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end pt-4 space-x-2">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages || 1}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
            >
                Précédent
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
            >
                Suivant
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
