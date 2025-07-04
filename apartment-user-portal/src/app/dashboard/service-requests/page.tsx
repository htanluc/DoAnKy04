"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Wrench,
  Home,
  Settings
} from 'lucide-react'
import { fetchCurrentUser, fetchMySupportRequests, createSupportRequest } from '@/lib/api'

interface ServiceRequest {
  id: string
  title: string
  description: string
  category: 'MAINTENANCE' | 'CLEANING' | 'SECURITY' | 'UTILITY' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  assignedTo?: string
  estimatedCompletion?: string
  actualCompletion?: string
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  isStaff: boolean
}

interface ServiceCategory {
  categoryCode: string;
  categoryName: string;
  description?: string;
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM'
  })
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMySupportRequests()
        setRequests(data)
      } catch (err: any) {
        setError(err.message || 'Lỗi khi lấy yêu cầu hỗ trợ')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()

    // Fetch categories
    fetch('http://localhost:8080/api/service-categories')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCategories(data) : setCategories([]))
      .catch(() => setCategories([]));

    // Fetch current user
    fetchCurrentUser().then(setCurrentUser);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xử lý
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Settings className="h-3 w-3 mr-1" />
            Đang xử lý
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Thấp
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Trung bình
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Cao
          </span>
        )
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Khẩn cấp
          </span>
        )
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4" />
      case 'CLEANING':
        return <Home className="h-4 w-4" />
      case 'SECURITY':
        return <AlertTriangle className="h-4 w-4" />
      case 'UTILITY':
        return <Settings className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'MAINTENANCE':
        return 'Bảo trì'
      case 'CLEANING':
        return 'Vệ sinh'
      case 'SECURITY':
        return 'An ninh'
      case 'UTILITY':
        return 'Tiện ích'
      case 'OTHER':
        return 'Khác'
      default:
        return category
    }
  }

  const handleCreateRequest = async () => {
    setError(null)
    setSuccess(null)
    try {
      await createSupportRequest(newRequest)
      setSuccess('Gửi yêu cầu hỗ trợ thành công!')
      setShowCreateForm(false)
      // Refresh requests
      const data = await fetchMySupportRequests()
      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Gửi yêu cầu hỗ trợ thất bại')
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/support-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (!res.ok) throw new Error('Lỗi khi huỷ yêu cầu');
      const updated = await res.json();
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r));
    } catch (e) {
      alert('Không thể huỷ yêu cầu!');
    }
  };

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'PENDING').length
  }

  const getInProgressRequests = () => {
    return requests.filter(request => request.status === 'IN_PROGRESS').length
  }

  const getCompletedRequests = () => {
    return requests.filter(request => request.status === 'COMPLETED').length
  }

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!requests || requests.length === 0) return <div>Chưa có yêu cầu hỗ trợ nào.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yêu cầu dịch vụ</h1>
              <p className="text-gray-600">Quản lý và theo dõi các yêu cầu dịch vụ của bạn</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu mới
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">
                Tổng số yêu cầu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPendingRequests()}</div>
              <p className="text-xs text-muted-foreground">
                Yêu cầu chờ xử lý
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getInProgressRequests()}</div>
              <p className="text-xs text-muted-foreground">
                Yêu cầu đang xử lý
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCompletedRequests()}</div>
              <p className="text-xs text-muted-foreground">
                Yêu cầu đã hoàn thành
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Request Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tạo yêu cầu dịch vụ mới</CardTitle>
              <CardDescription>
                Điền thông tin chi tiết về yêu cầu của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <Input
                    placeholder="Nhập tiêu đề yêu cầu..."
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <Textarea
                    placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRequest.category}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat.categoryCode} value={cat.categoryCode}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức độ ưu tiên
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                      <option value="URGENT">Khẩn cấp</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateRequest} disabled={!newRequest.title || !newRequest.description}>
                    Tạo yêu cầu
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm yêu cầu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="CLEANING">Vệ sinh</option>
                  <option value="SECURITY">An ninh</option>
                  <option value="UTILITY">Tiện ích</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu ({filteredRequests.length})</CardTitle>
            <CardDescription>
              Các yêu cầu dịch vụ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có yêu cầu nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(request.category)}
                            <span className="text-sm text-gray-600">
                              {getCategoryName(request.category)}
                            </span>
                            {getPriorityBadge(request.priority)}
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span>Tạo lúc: {formatDate(request.createdAt)}</span>
                            {request.assignedTo && (
                              <span>Người phụ trách: {request.assignedTo}</span>
                            )}
                            {request.estimatedCompletion && (
                              <span>Dự kiến hoàn thành: {formatDate(request.estimatedCompletion)}</span>
                            )}
                          </div>
                          
                          {request.comments.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm font-medium">Bình luận ({request.comments.length})</span>
                              </div>
                              <div className="space-y-2">
                                {request.comments.slice(-2).map((comment) => (
                                  <div key={comment.id} className="text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{comment.author}</span>
                                      <span className="text-gray-500">
                                        {formatDate(comment.createdAt)}
                                      </span>
                                      {comment.isStaff && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          Nhân viên
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-700 mt-1">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {request.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 