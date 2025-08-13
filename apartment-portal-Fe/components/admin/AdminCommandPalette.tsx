"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Calendar, Bell, Users, Receipt, Building2, Search } from "lucide-react"

export default function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const openHandler = () => setOpen(true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-cmd' as any, openHandler)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-cmd' as any, openHandler)
    }
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm nhanh..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy</CommandEmpty>
        <CommandGroup heading="Điều hướng">
          <CommandItem onSelect={() => go('/admin-dashboard')}>
            <Search className="mr-2 h-4 w-4" /> Tổng quan
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/users')}>
            <Users className="mr-2 h-4 w-4" /> Người dùng
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/apartments')}>
            <Building2 className="mr-2 h-4 w-4" /> Căn hộ
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/invoices')}>
            <Receipt className="mr-2 h-4 w-4" /> Hóa đơn
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/announcements')}>
            <Bell className="mr-2 h-4 w-4" /> Thông báo
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/events')}>
            <Calendar className="mr-2 h-4 w-4" /> Sự kiện
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tạo nhanh">
          <CommandItem onSelect={() => go('/admin-dashboard/announcements/create')}>
            <Bell className="mr-2 h-4 w-4" /> Thông báo mới
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/events/create')}>
            <Calendar className="mr-2 h-4 w-4" /> Sự kiện mới
          </CommandItem>
          <CommandItem onSelect={() => go('/admin-dashboard/invoices/create')}>
            <Receipt className="mr-2 h-4 w-4" /> Hóa đơn mới
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}


