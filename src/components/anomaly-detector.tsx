'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { detectCallAnomalies } from '@/ai/flows/detect-call-anomalies';
import type { DetectCallAnomaliesOutput } from '@/ai/flows/detect-call-anomalies';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface AnomalyDetectorProps {
  callData: string;
}

export function AnomalyDetector({ callData }: AnomalyDetectorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectCallAnomaliesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await detectCallAnomalies({ callData });
      setResult(res);
    } catch (e) {
      setError('An error occurred during analysis.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Call Data</CardTitle>
                <CardDescription>The following JSON data will be sent for analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border p-4 bg-muted/50">
                    <pre className="text-sm">{callData}</pre>
                </ScrollArea>
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Run Analysis</CardTitle>
                    <CardDescription>Click the button to analyze the call data for anomalies using GenAI. This may take a moment.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleAnalysis} disabled={loading}>
                        {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                        ) : (
                        'Analyze Call Data'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Alert variant={result.hasAnomalies ? 'destructive' : 'default'}>
                {result.hasAnomalies ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                <AlertTitle>{result.hasAnomalies ? 'Anomalies Detected!' : 'No Anomalies Found'}</AlertTitle>
                <AlertDescription>{result.anomaliesDescription}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    </div>
  );
}
