import { useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/contexts/AuthContext";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { UpcomingClasses } from "@/components/dashboard/upcoming-classes";
import { OverviewTabs } from "@/components/dashboard/overview-tabs";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  useEffect(() => { setTitle("Dashboard"); }, [setTitle]);

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <KpiCards />

      <div className="grid gap-6 lg:grid-cols-5">
        {isAdmin && (
          <div className="lg:col-span-3">
            <FinanceChart />
          </div>
        )}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <UpcomingClasses />
        </div>
        {!isAdmin && (
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OverviewTabs />
        </div>
        {isAdmin && (
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        )}
      </div>
    </div>
  );
}
