"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

export default function ResidentOverview() {
  // Dữ liệu mẫu cho biểu đồ
  const data = [
    { name: "Đã thuê", value: 432, color: "#0ea5e9" },
    { name: "Trống", value: 68, color: "#f97316" },
    { name: "Bảo trì", value: 12, color: "#eab308" },
    { name: "Đang xây dựng", value: 38, color: "#a3a3a3" },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Tổng quan cư dân</CardTitle>
        <CardDescription>Phân bố trạng thái căn hộ trong tòa nhà</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline">Xem chi tiết</Button>
        </div>
      </CardContent>
    </Card>
  )
}
