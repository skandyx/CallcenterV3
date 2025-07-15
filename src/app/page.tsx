
import DashboardClient from '@/components/dashboard-client';
import { 
  readCalls, 
  readAdvancedCalls, 
  readAgentStatus, 
  readProfileAvailability 
} from '@/lib/data';

export default async function Dashboard() {
  const initialCalls = await readCalls();
  const initialAdvancedCalls = await readAdvancedCalls();
  const initialAgentStatus = await readAgentStatus();
  const initialProfileAvailability = await readProfileAvailability();

  return (
    <DashboardClient
      initialCalls={initialCalls}
      initialAdvancedCalls={initialAdvancedCalls}
      initialAgentStatus={initialAgentStatus}
      initialProfileAvailability={initialProfileAvailability}
    />
  );
}
