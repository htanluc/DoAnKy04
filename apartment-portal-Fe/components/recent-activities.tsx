import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "payment",
      description: "Nguyễn Văn A đã thanh toán hóa đơn tháng 5",
      time: "10 phút trước",
      status: "success",
    },
    {
      id: 2,
      type: "feedback",
      description: "Trần Thị B báo cáo sự cố ở hành lang tầng 5",
      time: "30 phút trước",
      status: "pending",
    },
    {
      id: 3,
      type: "registration",
      description: "Lê Văn C đăng ký sử dụng phòng gym",
      time: "1 giờ trước",
      status: "success",
    },
    {
      id: 4,
      type: "announcement",
      description: "Admin đã đăng thông báo bảo trì hệ thống nước",
      time: "2 giờ trước",
      status: "info",
    },
    {
      id: 5,
      type: "feedback",
      description: "Phạm Thị D báo cáo vấn đề về điều hòa",
      time: "3 giờ trước",
      status: "pending",
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.description}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              <Badge
                variant={
                  activity.status === "success" ? "default" : activity.status === "pending" ? "secondary" : "outline"
                }
              >
                {activity.status === "success"
                  ? "Hoàn thành"
                  : activity.status === "pending"
                    ? "Đang xử lý"
                    : "Thông tin"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
