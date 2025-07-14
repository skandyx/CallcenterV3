import { AnomalyDetector } from '@/components/anomaly-detector';
import { readCalls } from '@/lib/data';
import PageHeader from '@/components/page-header';

export default async function AnomalyDetectionPage() {
  const calls = await readCalls();
  const callDataString = JSON.stringify(calls, null, 2);

  return (
    <div className="flex flex-col h-full">
        <PageHeader title="Anomaly Detection"/>
        <main className="flex-1 p-4 md:p-8">
            <AnomalyDetector callData={callDataString} />
        </main>
    </div>
  );
}
