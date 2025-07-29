"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Globe, 
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Star,
  Zap,
  Calendar,
  Building,
  AlertCircle
} from 'lucide-react'
import { fetchMyInvoices } from '@/lib/api'
import { createVNPayPayment, createMoMoPayment, createZaloPayPayment, createVisaPayment } from '@/lib/api'

// Custom CSS for animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slideInFromLeft 0.5s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slideInFromRight 0.5s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce 2s infinite;
  }
  
  .invoice-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }
  
  .invoice-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .invoice-card.unpaid {
    border: 2px solid #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  }
  
  .invoice-card.paid {
    border: 2px solid #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  }
  
  .invoice-card.overdue {
    border: 2px solid #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    animation: pulse 2s infinite;
  }
  
  .payment-method-card {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .payment-method-card:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .payment-method-card.selected {
    border: 2px solid #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    transform: translateY(-4px) scale(1.05);
  }
  
  .status-badge {
    transition: all 0.2s ease;
  }
  
  .status-badge:hover {
    transform: scale(1.1);
  }
  
  .summary-card {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }
  
  .summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`

interface Invoice {
  id: number
  apartmentId: number
  billingPeriod: string
  issueDate: string
  dueDate: string
  totalAmount: number
  status: 'UNPAID' | 'PAID' | 'OVERDUE'
  remarks?: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: number
  feeType: string
  description: string
  amount: number
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'momo',
    name: 'MoMo',
    icon: <Wallet className="w-5 h-5" />,
    description: 'Thanh toán qua ví MoMo'
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Thanh toán qua VNPay'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'Thanh toán qua ZaloPay'
  },
  {
    id: 'visa',
    name: 'Visa/Mastercard',
    icon: <Globe className="w-5 h-5" />,
    description: 'Thanh toán thẻ quốc tế'
  }
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchMyInvoices()
        setInvoices(data)
      } catch (err: any) {
        console.error('Error fetching invoices:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePayment = async () => {
    if (!selectedInvoice || !selectedPaymentMethod) return

    setPaymentLoading(true)
    setPaymentError('')

    try {
      let data, payUrl;
      if (selectedPaymentMethod === 'vnpay') {
        data = await createVNPayPayment(selectedInvoice.id, selectedInvoice.totalAmount, `Thanh toán hóa đơn ${selectedInvoice.billingPeriod}`);
        payUrl = data.data?.payUrl || data.data?.payurl;
      } else if (selectedPaymentMethod === 'momo') {
        data = await createMoMoPayment(selectedInvoice.id, selectedInvoice.totalAmount, `Thanh toán hóa đơn ${selectedInvoice.billingPeriod}`);
        payUrl = data.data?.payUrl || data.data?.payurl;
      } else if (selectedPaymentMethod === 'zalopay') {
        data = await createZaloPayPayment(selectedInvoice.id, selectedInvoice.totalAmount, `Thanh toán hóa đơn ${selectedInvoice.billingPeriod}`);
        payUrl = data.data?.payUrl || data.data?.payurl;
      } else if (selectedPaymentMethod === 'visa') {
        data = await createVisaPayment(selectedInvoice.id, selectedInvoice.totalAmount, `Thanh toán hóa đơn ${selectedInvoice.billingPeriod}`);
        payUrl = data.data?.payUrl || data.data?.payurl;
      } else {
        setPaymentError('Phương thức thanh toán không hợp lệ');
        setPaymentLoading(false);
        return;
      }
      if (payUrl) {
        if (selectedPaymentMethod === 'vnpay') {
          window.location.href = payUrl;
        } else {
          window.open(payUrl, '_blank');
        }
      } else {
        setPaymentError('Không nhận được đường dẫn thanh toán');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Không thể kết nối đến server');
    } finally {
      setPaymentLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case 'UNPAID':
        return <Badge className="bg-yellow-100 text-yellow-800">Chưa thanh toán</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{customStyles}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Receipt className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
              </div>
              <p className="text-gray-600 text-lg">Xem và thanh toán các hóa đơn của bạn</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-500">Thanh toán an toàn</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tổng hóa đơn</CardTitle>
                <Receipt className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{invoices.length}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Tổng số hóa đơn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Chưa thanh toán</CardTitle>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {invoices.filter(inv => inv.status === 'UNPAID').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Hóa đơn chờ thanh toán
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Quá hạn</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {invoices.filter(inv => inv.status === 'OVERDUE').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hóa đơn quá hạn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.4s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Đã thanh toán</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {invoices.filter(inv => inv.status === 'PAID').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hóa đơn đã thanh toán
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoices List */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          {invoices.length === 0 ? (
            <Card className="text-center py-16">
              <div className="animate-pulse-slow">
                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Chưa có hóa đơn nào</p>
                <p className="text-gray-400 text-sm">Hóa đơn sẽ xuất hiện ở đây khi có</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map((invoice, index) => {
                const cardClass = `invoice-card ${invoice.status.toLowerCase()}`
                
                return (
                  <Card 
                    key={invoice.id} 
                    className={cardClass}
                    style={{animationDelay: `${0.6 + index * 0.1}s`}}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="status-badge">
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </div>
                          <p className="text-xs text-gray-500">Tổng tiền</p>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                        Hóa đơn {invoice.billingPeriod}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {invoice.remarks || 'Hóa đơn dịch vụ chung cư'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="font-medium">Ngày phát hành: {formatDate(invoice.issueDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-3 text-orange-500" />
                          <span>Hạn thanh toán: {formatDate(invoice.dueDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-3 text-green-500" />
                          <span>Căn hộ: {invoice.apartmentId}</span>
                        </div>
                        {invoice.status === 'UNPAID' && (
                          <div className="pt-4">
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Thanh toán ngay
                            </Button>
                          </div>
                        )}
                        {invoice.status === 'OVERDUE' && (
                          <div className="pt-4">
                            <Button 
                              variant="destructive"
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Thanh toán gấp
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method-card p-4 rounded-lg border cursor-pointer ${
                    selectedPaymentMethod === method.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {paymentError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || paymentLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Thanh toán
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 