"use client"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import UserMenu from "@/components/user-menu"

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Xin chào, Admin! Đây là tổng quan hệ thống quản lý tòa nhà.</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[200px] md:w-[300px]"
          />
        </div>
        <Button size="icon" variant="outline">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Thông báo</span>
        </Button>
        <UserMenu />
      </div>
    </div>
  )
}
