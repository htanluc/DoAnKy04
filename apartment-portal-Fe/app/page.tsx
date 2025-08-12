import AuthGuard from "@/components/auth/auth-guard"
import AdminLayout from "@/components/admin/AdminLayout"
import DashboardHeader from "@/components/dashboard-header"
import DashboardStats from "@/components/dashboard-stats"
import ResidentOverview from "@/components/resident-overview"
import BillingOverview from "@/components/billing-overview"
import RecentActivities from "@/components/recent-activities"
import UpcomingEvents from "@/components/upcoming-events"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AdminLayout title={"Tổng quan hệ thống"}>
        <div className="space-y-8">
          <DashboardHeader />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStats />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ResidentOverview />
            <BillingOverview />
            <RecentActivities />
            <UpcomingEvents />
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
