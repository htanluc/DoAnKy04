"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function QuickCreateFAB() {
  const router = useRouter()
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
        <button className="h-12 w-12 inline-flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center gap-1 pr-2">
          <button onClick={() => router.push('/admin-dashboard/announcements/create')} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm">Thông báo</button>
          <button onClick={() => router.push('/admin-dashboard/events/create')} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm">Sự kiện</button>
          <button onClick={() => router.push('/admin-dashboard/invoices/create')} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm">Hóa đơn</button>
          <button onClick={() => router.push('/admin-dashboard/users/create')} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm">Người dùng</button>
        </div>
      </div>
    </div>
  )
}


