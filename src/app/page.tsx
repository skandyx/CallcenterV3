import DashboardClient from '@/components/dashboard-client';

export default function HomePage() {
  // The DashboardClient component will now fetch its own data.
  // This makes the main page static and prevents build-time errors.
  return <DashboardClient />;
}
