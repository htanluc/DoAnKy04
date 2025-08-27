"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Wrench,
  Droplets,
  Shield,
  Zap,
  Settings,
  Upload,
  Image,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createSupportRequest, fetchMySupportRequests } from '@/lib/api'
import ImageUpload from '@/components/ui/image-upload'
import ServiceRequestStatusProgress from '@/components/ServiceRequestStatusProgress'

interface ServiceRequest {
  id: string
  title: string
  description: string
  category: 'MAINTENANCE' | 'CLEANING' | 'SECURITY' | 'UTILITY' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ASSIGNED'
  createdAt: string
  updatedAt: string
  assignedTo?: string
  assignedToId?: number
  assignedToPhone?: string
  assignedAt?: string
  completedAt?: string
  estimatedCompletion?: string
  actualCompletion?: string
  staffPhone?: string
  resolutionNotes?: string
  comments: Comment[]
  attachmentUrls?: string[]
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  isStaff: boolean
}

interface ServiceCategory {
  id: number
  categoryCode: string
  categoryName: string
  description?: string
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [staffPhoneMap, setStaffPhoneMap] = useState<{[key: string]: string}>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImages, setCurrentImages] = useState<string[]>([])

  const getImageUrl = (rawUrl: string): string => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
      const cacheBust = Date.now()
      const params = new URLSearchParams({ url: rawUrl })
      if (token) params.set('token', token)
      params.set('_', String(cacheBust))
      return `/api/image-proxy?${params.toString()}`
    } catch {
      return rawUrl
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      }
    }
    if (lightboxOpen) {
      window.addEventListener('keydown', onKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen, currentImages])

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMySupportRequests()
        setRequests(data)
        
        // Lấy số điện thoại của các nhân viên được gán
        const assignedStaffIds = data
          .filter((req: any) => req.assignedToId) // Sử dụng assignedToId từ backend
          .map((req: any) => req.assignedToId)
          .filter(Boolean) // Loại bỏ null/undefined
        
        if (assignedStaffIds.length > 0) {
          const uniqueStaffIds = Array.from(new Set(assignedStaffIds))
          const phoneMap: {[key: string]: string} = {}
          
          // Lấy thông tin nhân viên từ API
          for (const staffId of uniqueStaffIds) {
            try {
              const token = localStorage.getItem('token')
              
              // Thử các API khác nhau để lấy số điện thoại nhân viên
              let phone = ''
              
              // Thử 1: API users (nếu có)
              try {
                const res1 = await fetch(`http://localhost:8080/api/users/${staffId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res1.ok) {
                  const staffData = await res1.json()
                  phone = staffData.phoneNumber || staffData.phone || staffData.mobile || ''
                  console.log(`API users: Đã lấy được số điện thoại nhân viên ${staffId}:`, phone)
                }
              } catch (err) {
                console.log(`API users không hoạt động cho ${staffId}:`, err)
              }
              
              // Thử 2: API admin/users (có thể không có quyền)
              if (!phone) {
                try {
                  const res2 = await fetch(`http://localhost:8080/api/admin/users/${staffId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  if (res2.ok) {
                    const staffData = await res2.json()
                    phone = staffData.phoneNumber || staffData.phone || staffData.mobile || ''
                    console.log(`API admin/users: Đã lấy được số điện thoại nhân viên ${staffId}:`, phone)
                  } else {
                    console.log(`API admin/users không có quyền cho ${staffId}, status:`, res2.status)
                  }
                } catch (err) {
                  console.log(`API admin/users lỗi cho ${staffId}:`, err)
                }
              }
              
              // Thử 3: API residents (nếu có)
              if (!phone) {
                try {
                  const res3 = await fetch(`http://localhost:8080/api/admin/residents/${staffId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  if (res3.ok) {
                    const staffData = await res3.json()
                    phone = staffData.phoneNumber || staffData.phone || staffData.mobile || ''
                    console.log(`API residents: Đã lấy được số điện thoại nhân viên ${staffId}:`, phone)
                  } else {
                    console.log(`API residents không có quyền cho ${staffId}, status:`, res3.status)
                  }
                } catch (err) {
                  console.log(`API residents lỗi cho ${staffId}:`, err)
                }
              }
              
              if (phone) {
                phoneMap[String(staffId)] = phone
              } else {
                console.log(`Không thể lấy số điện thoại nhân viên ${staffId} từ bất kỳ API nào`)
              }
              
            } catch (err) {
              console.log('Lỗi tổng quát khi lấy số điện thoại nhân viên:', staffId, err)
            }
          }
          
          setStaffPhoneMap(phoneMap)
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi lấy yêu cầu hỗ trợ')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()

    // Fetch categories
    const token = localStorage.getItem('token')
    fetch('http://localhost:8080/api/service-categories', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.data)
        }
      })
      .catch((err: any) => console.error('Error fetching categories:', err))

    // Fetch current user - removed as function doesn't exist
    // fetchCurrentResident()
    //   .then((data: any) => setCurrentUser(data))
    //   .catch((err: any) => console.error('Error fetching user:', err))
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có ngày'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Ngày không hợp lệ'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      'ASSIGNED': { color: 'bg-purple-100 text-purple-800', icon: <User className="h-3 w-3" /> },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', icon: <Wrench className="h-3 w-3" /> },
      'COMPLETED': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">
          {status === 'PENDING' && 'Chờ xử lý'}
          {status === 'ASSIGNED' && 'Đã giao'}
          {status === 'IN_PROGRESS' && 'Đang xử lý'}
          {status === 'COMPLETED' && 'Hoàn thành'}
          {status === 'CANCELLED' && 'Đã hủy'}
        </span>
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'LOW': { color: 'bg-gray-100 text-gray-800', label: 'Thấp' },
      'MEDIUM': { color: 'bg-blue-100 text-blue-800', label: 'Trung bình' },
      'HIGH': { color: 'bg-orange-100 text-orange-800', label: 'Cao' },
      'URGENT': { color: 'bg-red-100 text-red-800', label: 'Khẩn cấp' }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig]
    if (!config) return null

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MAINTENANCE': return <Wrench className="h-4 w-4" />
      case 'CLEANING': return <Droplets className="h-4 w-4" />
      case 'SECURITY': return <Shield className="h-4 w-4" />
      case 'UTILITY': return <Zap className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'MAINTENANCE': return 'Bảo trì'
      case 'CLEANING': return 'Vệ sinh'
      case 'SECURITY': return 'An ninh'
      case 'UTILITY': return 'Tiện ích'
      default: return 'Khác'
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      
      const response = await fetch('http://localhost:8080/api/upload/service-request', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setUploadedUrls(prev => [...prev, ...result.data])
          setUploadedFiles(prev => [...prev, ...Array.from(files)])
        }
      } else {
        throw new Error('Upload file thất bại')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi upload file')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description || !newRequest.category) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setError(null)
      
      // Chuyển đổi category string thành categoryId number
      const categoryMapping: { [key: string]: number } = {
        'MAINTENANCE': 1,
        'CLEANING': 2, 
        'SECURITY': 3,
        'UTILITY': 4,
        'OTHER': 5
      }
      
      const requestData = {
        title: newRequest.title,
        description: newRequest.description,
        categoryId: categoryMapping[newRequest.category] || 5, // Default to OTHER
        priority: newRequest.priority,
        attachmentUrls: uploadedUrls // Thêm URLs của files đã upload
      }
      
      await createSupportRequest(requestData)
      setSuccess('Tạo yêu cầu hỗ trợ thành công!')
      setShowCreateForm(false)
      setNewRequest({ title: '', description: '', category: '', priority: 'MEDIUM' })
      setUploadedFiles([])
      setUploadedUrls([])
      
      // Refresh requests
      const data = await fetchMySupportRequests()
      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo yêu cầu hỗ trợ')
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Bạn có chắc muốn hủy yêu cầu này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/support-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setSuccess('Hủy yêu cầu thành công!')
        // Refresh requests
        const data = await fetchMySupportRequests()
        setRequests(data)
      } else {
        setError('Lỗi khi hủy yêu cầu')
      }
    } catch (err) {
      setError('Lỗi khi hủy yêu cầu')
    }
  }

  const getPendingRequests = () => requests.filter(r => r.status === 'PENDING').length
  const getInProgressRequests = () => requests.filter(r => r.status === 'IN_PROGRESS').length
  const getCompletedRequests = () => requests.filter(r => r.status === 'COMPLETED').length

  const toggleExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setCurrentImages(images)
    setCurrentImageIndex(startIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setCurrentImages([])
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  const filteredRequests = requests.filter(request => {
    const title = request.title || ''
    const description = request.description || ''
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu dịch vụ</h1>
          <p className="text-gray-600">Quản lý các yêu cầu hỗ trợ và dịch vụ</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo yêu cầu mới</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-stagger">
        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingRequests()}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInProgressRequests()}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedRequests()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Tìm theo tiêu đề hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
                             <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                 title="Lọc theo trạng thái"
               >
                <option value="all">Tất cả</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Danh mục</label>
                             <select
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value)}
                 className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                 title="Lọc theo danh mục"
               >
                <option value="all">Tất cả</option>
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Tạo yêu cầu dịch vụ mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Nhập tiêu đề yêu cầu..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Mô tả chi tiết yêu cầu..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Danh mục</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    title="Chọn danh mục dịch vụ"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                    <option value="CLEANING">Vệ sinh</option>
                    <option value="SECURITY">An ninh</option>
                    <option value="UTILITY">Tiện ích</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mức độ ưu tiên</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    title="Chọn mức độ ưu tiên"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>
              
              {/* File Upload Section */}
              <ImageUpload
                onImagesUploaded={(urls) => setUploadedUrls(prev => [...prev, ...urls])}
                onImagesRemoved={(urls) => setUploadedUrls(prev => prev.filter(url => !urls.includes(url)))}
                uploadedUrls={uploadedUrls}
                maxImages={5}
                endpoint="/api/upload/service-request"
                title="Hình ảnh đính kèm"
                description="Upload hình ảnh để mô tả vấn đề"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateRequest}>
                  Tạo yêu cầu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có yêu cầu nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover-lift transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(request.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.title || 'Không có tiêu đề'}</CardTitle>
                      <CardDescription>
                        {getCategoryName(request.category)} • {formatDate(request.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">{request.description || 'Không có mô tả'}</p>
                
                {/* Display Attached Images */}
                {request.attachmentUrls && request.attachmentUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Hình ảnh đính kèm ({request.attachmentUrls.length} ảnh):</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {request.attachmentUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={getImageUrl(url)}
                            alt={`Hình ảnh ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                            onClick={() => openLightbox(request.attachmentUrls!, index)}
                            title="Click để xem ảnh đầy đủ"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white bg-opacity-90 rounded-full p-1">
                                <Image className="h-4 w-4 text-gray-700" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Debug info */}
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  Debug: assignedTo={request.assignedTo || 'undefined'}, 
                  assignedToId={request.assignedToId || 'N/A'}, 
                  assignedToPhone={request.assignedToPhone || 'undefined'}, 
                  staffPhone={request.staffPhone || 'undefined'}, 
                  staffPhoneMap={JSON.stringify(staffPhoneMap)}
                </div>
                
                {/* Service Request Status Progress */}
                <ServiceRequestStatusProgress
                  status={request.status}
                  assignedTo={request.assignedTo || ''}
                  assignedAt={request.assignedAt}
                  completedAt={request.completedAt}
                  staffPhone={request.assignedToPhone || request.staffPhone || staffPhoneMap[String(request.assignedToId || '')]}
                  className="w-full"
                />
                
                {/* Comments Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {(request.comments || []).length} bình luận
                    </div>
                    {request.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Hủy yêu cầu
                      </Button>
                    )}
                  </div>
                  
                  {/* Show comments if any */}
                  {request.comments && request.comments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {request.comments.map((comment, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          comment.isStaff ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-medium ${
                              comment.isStaff ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {comment.isStaff ? '👤 Nhân viên' : '👤 Bạn'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            comment.isStaff ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="max-w-4xl max-h-full p-4">
              <img
                src={getImageUrl(currentImages[currentImageIndex])}
                alt={`Hình ảnh ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Image counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 