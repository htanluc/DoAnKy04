import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export default function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Họp cư dân quý II/2025",
      date: "25/05/2025",
      time: "19:00 - 21:00",
      location: "Sảnh chính tầng 1",
      participants: 45,
    },
    {
      id: 2,
      title: "Workshop kỹ năng phòng cháy chữa cháy",
      date: "28/05/2025",
      time: "09:00 - 11:00",
      location: "Sân tập tầng 3",
      participants: 32,
    },
    {
      id: 3,
      title: "Tiệc cộng đồng chào hè",
      date: "01/06/2025",
      time: "18:00 - 21:00",
      location: "Khu vực BBQ tầng thượng",
      participants: 78,
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sự kiện sắp tới</CardTitle>
        <CardDescription>Các sự kiện cộng đồng trong thời gian tới</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="rounded-lg border p-3 hover:bg-muted/50">
              <h3 className="font-medium">{event.title}</h3>
              <div className="mt-2 grid gap-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-3.5 w-3.5" />
                  {event.participants} người tham gia
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline">
                  Chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
