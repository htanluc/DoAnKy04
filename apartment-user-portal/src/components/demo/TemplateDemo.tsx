"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  House, 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee, 
  User,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface TemplateOption {
  id: string
  name: string
  description: string
  features: string[]
  pros: string[]
  cons: string[]
  component: React.ReactNode
}

export default function TemplateDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('bootstrap')

  const templateOptions: TemplateOption[] = [
    {
      id: 'bootstrap',
      name: 'Bootstrap 5',
      description: 'Framework CSS phổ biến với nhiều components có sẵn',
      features: [
        'Responsive design tự động',
        'Components phong phú',
        'Dễ tùy chỉnh',
        'Mobile-first approach',
        'Hỗ trợ tốt cho accessibility'
      ],
      pros: [
        'Dễ học và sử dụng',
        'Nhiều tài liệu và community',
        'Components đẹp có sẵn',
        'Responsive tự động'
      ],
      cons: [
        'Bundle size lớn hơn',
        'Ít linh hoạt hơn Tailwind',
        'Có thể trông giống các site khác'
      ],
      component: (
        <div className="row g-4">
          <div className="col-md-3 col-sm-6">
            <div className="stats-card stats-card-primary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng hóa đơn</h6>
                  <h3 className="mb-0">24</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    +12% so với tháng trước
                  </small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <Receipt className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stats-card stats-card-warning">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Chờ thanh toán</h6>
                  <h3 className="mb-0">5</h3>
                  <small className="text-warning">
                    <Clock size={12} className="me-1" />
                    Cần thanh toán sớm
                  </small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <AlertTriangle className="text-warning" size={24} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stats-card stats-card-success">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Sự kiện sắp tới</h6>
                  <h3 className="mb-0">3</h3>
                  <small className="text-success">
                    <Calendar size={12} className="me-1" />
                    Sự kiện mới
                  </small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <Calendar className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <div className="stats-card stats-card-danger">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Quá hạn</h6>
                  <h3 className="mb-0">1</h3>
                  <small className="text-danger">
                    <AlertTriangle size={12} className="me-1" />
                    Cần xử lý ngay
                  </small>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <AlertTriangle className="text-danger" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tabler',
      name: 'Tabler Design',
      description: 'Modern design system cho enterprise applications',
      features: [
        'Clean, modern interface',
        'Professional color scheme',
        'Advanced data visualization',
        'Interactive components',
        'Dark/light theme support'
      ],
      pros: [
        'Giao diện hiện đại và chuyên nghiệp',
        'Phù hợp cho enterprise',
        'Accessibility tốt',
        'Performance tối ưu'
      ],
      cons: [
        'Ít tài liệu hơn Bootstrap',
        'Cần thời gian học',
        'Community nhỏ hơn'
      ],
      component: (
        <div className="row row-deck row-cards">
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Tổng hóa đơn</div>
                  <div className="ms-auto lh-1">
                    <div className="text-muted">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                </div>
                <div className="h1 mb-3">24</div>
                <div className="d-flex mb-2">
                  <div>+12% so với tháng trước</div>
                </div>
                <div className="progress progress-sm" style={{ height: '3px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Chờ thanh toán</div>
                  <div className="ms-auto lh-1">
                    <div className="text-muted">
                      <Clock size={16} />
                    </div>
                  </div>
                </div>
                <div className="h1 mb-3">5</div>
                <div className="d-flex mb-2">
                  <div>Cần thanh toán sớm</div>
                </div>
                <div className="progress progress-sm" style={{ height: '3px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Sự kiện sắp tới</div>
                  <div className="ms-auto lh-1">
                    <div className="text-muted">
                      <Calendar size={16} />
                    </div>
                  </div>
                </div>
                <div className="h1 mb-3">3</div>
                <div className="d-flex mb-2">
                  <div>Sự kiện mới</div>
                </div>
                <div className="progress progress-sm" style={{ height: '3px' }}>
                  <div className="progress-bar bg-success" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Quá hạn</div>
                  <div className="ms-auto lh-1">
                    <div className="text-muted">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                </div>
                <div className="h1 mb-3">1</div>
                <div className="d-flex mb-2">
                  <div>Cần xử lý ngay</div>
                </div>
                <div className="progress progress-sm" style={{ height: '3px' }}>
                  <div className="progress-bar bg-danger" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tailwind',
      name: 'Enhanced Tailwind',
      description: 'Tối ưu hóa Tailwind CSS hiện tại với animations và effects',
      features: [
        'Tùy chỉnh cao',
        'Bundle size nhỏ',
        'Hot reload nhanh',
        'Custom components',
        'Modern animations'
      ],
      pros: [
        'Linh hoạt cao',
        'Performance tốt',
        'Developer experience tốt',
        'Tích hợp với shadcn/ui'
      ],
      cons: [
        'Cần thời gian setup',
        'Ít components có sẵn',
        'Cần tự build nhiều components'
      ],
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12% so với tháng trước</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                  <p className="text-3xl font-bold text-gray-900">5</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm text-yellow-600">Cần thanh toán sớm</span>
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sự kiện sắp tới</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">Sự kiện mới</span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                  <p className="text-3xl font-bold text-gray-900">1</p>
                  <div className="flex items-center mt-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600">Cần xử lý ngay</span>
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const selectedOption = templateOptions.find(option => option.id === selectedTemplate)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Demo</h1>
        <p className="text-gray-600">Chọn template phù hợp cho dự án của bạn</p>
      </div>

      {/* Template Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {templateOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTemplate(option.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedTemplate === option.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Info */}
      {selectedOption && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                {selectedOption.name}
              </CardTitle>
              <CardDescription>{selectedOption.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Ưu điểm</h4>
                  <ul className="space-y-2">
                    {selectedOption.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Nhược điểm</h4>
                  <ul className="space-y-2">
                    {selectedOption.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Preview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          {selectedOption?.component}
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Hướng dẫn triển khai</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Cài đặt dependencies</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {selectedTemplate === 'bootstrap' && 'npm install bootstrap bootstrap-icons'}
                  {selectedTemplate === 'tabler' && 'npm install @tabler/icons-react'}
                  {selectedTemplate === 'tailwind' && 'npm install (đã có sẵn)'}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Import CSS</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {selectedTemplate === 'bootstrap' && `import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './bootstrap-theme.css'`}
                  {selectedTemplate === 'tabler' && `import '@tabler/icons-react'`}
                  {selectedTemplate === 'tailwind' && `// Đã có sẵn trong globals.css`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Sử dụng component</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {selectedTemplate === 'bootstrap' && `import BootstrapDashboard from '@/components/bootstrap/BootstrapDashboard'

export default function DashboardPage() {
  return <BootstrapDashboard />
}`}
                  {selectedTemplate === 'tabler' && `import TablerDashboard from '@/components/tabler/TablerDashboard'

export default function DashboardPage() {
  return <TablerDashboard />
}`}
                  {selectedTemplate === 'tailwind' && `// Sử dụng component hiện tại với enhancements`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            if (selectedTemplate === 'bootstrap') {
              // Run Bootstrap installation script
              console.log('Installing Bootstrap...')
            }
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Triển khai {selectedOption?.name}
        </Button>
        
        <Button variant="outline">
          Xem demo chi tiết
        </Button>
      </div>
    </div>
  )
}
