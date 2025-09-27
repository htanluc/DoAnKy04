import React from "react";

export default function AdminModuleSkeleton({ title = "Module Title", children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block p-4">
        <div className="font-bold text-lg mb-6">Admin Menu</div>
        <ul className="space-y-2">
          <li><a href="/admin-dashboard" className="text-blue-700 hover:underline">Dashboard</a></li>
          <li><a href="/admin-dashboard/users" className="hover:underline">Quản lý User</a></li>
          <li><a href="/admin-dashboard/residents" className="hover:underline">Quản lý Cư dân</a></li>
          <li><a href="/admin-dashboard/apartments" className="hover:underline">Quản lý Căn hộ</a></li>
          <li><a href="/admin-dashboard/announcements" className="hover:underline">Thông báo</a></li>
          <li><a href="/admin-dashboard/events" className="hover:underline">Sự kiện</a></li>
          <li><a href="/admin-dashboard/facilities" className="hover:underline">Tiện ích</a></li>
          <li><a href="/admin-dashboard/invoices" className="hover:underline">Hóa đơn</a></li>
          <li><a href="/admin-dashboard/feedbacks" className="hover:underline">Phản hồi</a></li>
          <li><a href="/admin-dashboard/support-requests" className="hover:underline">Yêu cầu hỗ trợ</a></li>
          {/* <li><a href="/admin-dashboard/history" className="hover:underline">Lịch sử AI Q&A</a></li> */}
          {/* <li><a href="/admin-dashboard/reports" className="hover:underline">Báo cáo</a></li> */} {/* Tạm ẩn toàn bộ section vì chưa hoàn thành */}
        </ul>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">{title}</h1>
          {/* Có thể thêm user menu, logout ở đây */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="bg-white rounded shadow p-6 min-h-[300px]">
            {children || <div className="text-gray-400 text-center">(Nội dung module sẽ hiển thị ở đây)</div>}
          </div>
        </main>
      </div>
    </div>
  );
} 