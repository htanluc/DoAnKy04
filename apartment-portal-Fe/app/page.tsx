import AuthGuard from "@/components/auth/auth-guard"
import Sidebar from "@/components/sidebar"
import DashboardHeader from "@/components/dashboard-header"
import DashboardStats from "@/components/dashboard-stats"
import ResidentOverview from "@/components/resident-overview"
import BillingOverview from "@/components/billing-overview"
import RecentActivities from "@/components/recent-activities"
import UpcomingEvents from "@/components/upcoming-events"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <DashboardHeader />
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardStats />
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ResidentOverview />
                <BillingOverview />
                <RecentActivities />
                <UpcomingEvents />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
