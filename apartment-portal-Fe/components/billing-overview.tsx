"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function BillingOverview() {
  // Dữ liệu mẫu cho biểu đồ
  const data = [
    {
      name: "T1",
      total: 1200000000,
      paid: 1150000000,
    },
    {
      name: "T2",
      total: 1180000000,
      paid: 1100000000,
    },
    {
      name: "T3",
      total: 1250000000,
      paid: 1200000000,
    },
    {
      name: "T4",
      total: 1300000000,
      paid: 1250000000,
    },
    {
      name: "T5",
      total: 1220000000,
      paid: 1150000000,
    },
  ]

  // Format số tiền
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Tổng quan thanh toán</CardTitle>
        <CardDescription>Tình hình thanh toán hóa đơn 5 tháng gần đây</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Số tiền"]} />
              <Bar name="Tổng hóa đơn" dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar name="Đã thanh toán" dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline">Xem báo cáo</Button>
        </div>
      </CardContent>
    </Card>
  )
}
