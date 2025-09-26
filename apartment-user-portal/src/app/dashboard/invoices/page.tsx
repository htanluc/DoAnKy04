"use client"

import { useState, useEffect, useMemo } from 'react'
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
import { fetchMyInvoices, fetchPaymentsByInvoice, fetchInvoiceDetail } from '@/lib/api'
import { createVNPayPayment, createVisaPayment } from '@/lib/api'

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
  createdAt?: string
  updatedAt?: string
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
    id: 'vnpay',
    name: 'VNPay',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Thanh toán qua VNPay'
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Thẻ Visa'
  }
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])
  const [showPaymentsHistory, setShowPaymentsHistory] = useState(false)
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [allPaymentsLoading, setAllPaymentsLoading] = useState(false)
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
  const deriveStatus = (invoice: Invoice) => {
    if (invoice.status === 'PAID') return 'PAID'
    try {
      const now = new Date()
      const due = new Date(invoice.dueDate)
      return now > due ? 'OVERDUE' : 'UNPAID'
    } catch {
      return invoice.status
    }
  }

  const openAllPaymentsHistory = async () => {
    setShowPaymentsHistory(true)
    setAllPaymentsLoading(true)
    try {
      const paid = invoices.filter(iv => deriveStatus(iv as any) === 'PAID')
      const result: any[] = []
      for (const inv of paid) {
        try {
          const data = await fetchPaymentsByInvoice(String(inv.id))
          const rows = (Array.isArray(data) ? data : data?.data || []).map((p: any) => ({
            invoiceId: inv.id,
            billingPeriod: inv.billingPeriod,
            amount: p.amount || p.totalAmount || inv.totalAmount,
            method: p.method || p.gateway || 'Thanh toán',
            timestamp: p.createdAt || p.timestamp || inv.updatedAt,
          }))
          if (rows.length === 0) {
            // Fallback hiển thị 1 dòng đã thanh toán nếu API không trả giao dịch
            result.push({
              invoiceId: inv.id,
              billingPeriod: inv.billingPeriod,
              amount: inv.totalAmount,
              method: 'Đã thanh toán',
              timestamp: inv.updatedAt,
            })
          } else {
            result.push(...rows)
          }
        } catch {}
      }
      // Sắp xếp theo thời gian mới nhất
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setAllPayments(result)
    } finally {
      setAllPaymentsLoading(false)
    }
  }

  const openInvoiceDetail = async (invoice: Invoice) => {
    setDetailInvoice(invoice)
    setDetailLoading(true)
    try {
      const full = await fetchInvoiceDetail(invoice.id)
      setInvoiceItems(full?.items || [])
      const data = await fetchPaymentsByInvoice(String(invoice.id))
      setPayments(Array.isArray(data) ? data : data?.data || [])
    } catch {
      setPayments([])
      setInvoiceItems([])
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedInvoice || !selectedPaymentMethod || paymentLoading) return

    setPaymentLoading(true)
    setPaymentError('')

    try {
      let data, payUrl;
      if (selectedPaymentMethod === 'vnpay') {
        data = await createVNPayPayment(selectedInvoice.id, selectedInvoice.totalAmount, `Thanh toán hóa đơn ${selectedInvoice.billingPeriod}`);
        // Backend mới trả về trực tiếp payUrl ở root level
        payUrl = data.payUrl || data.data?.payUrl || data.data?.payurl;
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
        // Mở ngay trên tab hiện tại cho mọi cổng để tránh user quay lại/đúp giao dịch
        window.location.href = payUrl;
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

  // Group invoices by apartmentId
  const invoiceGroups = useMemo(() => {
    const map = new Map<number, Invoice[]>()
    invoices.forEach((inv: any) => {
      const key = Number(inv.apartmentId)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(inv)
    })
    return Array.from(map.entries()) // [ [apartmentId, Invoice[]], ... ]
  }, [invoices])

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
                <Receipt className="h-8 w-8 text-[color:#0066CC]" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Quản lý hóa đơn</h1>
              </div>
              <p className="text-gray-600 text-lg">Xem và thanh toán các hóa đơn của bạn</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-500">Thanh toán an toàn</span>
            </div>
          </div>
        </div>

        {/* Payment History Global Button */}
        <div className="mb-6 flex justify-end">
          <Button variant="outline" onClick={openAllPaymentsHistory}>
            Xem lịch sử thanh toán
          </Button>
        </div>

        {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <Card className="border-0 shadow-none bg-transparent min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tổng hóa đơn</CardTitle>
                <Receipt className="h-5 w-5 text-[color:#0066CC]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">{invoices.length}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Tổng số hóa đơn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <Card className="border-0 shadow-none bg-transparent min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Chưa thanh toán</CardTitle>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                  {invoices.filter(inv => deriveStatus(inv as any) === 'UNPAID').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Hóa đơn chờ thanh toán
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            <Card className="border-0 shadow-none bg-transparent min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Quá hạn</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                  {invoices.filter(inv => deriveStatus(inv as any) === 'OVERDUE').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hóa đơn quá hạn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.4s'}}>
            <Card className="border-0 shadow-none bg-transparent min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Đã thanh toán</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                  {invoices.filter(inv => deriveStatus(inv as any) === 'PAID').length}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hóa đơn đã thanh toán
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoices List - grouped by apartment */}
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
            <div className="space-y-10">
              {invoiceGroups.map(([apartmentId, group]) => (
                <div key={apartmentId} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-semibold">Căn hộ {apartmentId}</h2>
                    <span className="text-sm text-gray-500">{group.length} hóa đơn</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.map((invoice, index) => {
                const cardClass = `invoice-card ${invoice.status.toLowerCase()} min-w-0`
                
                return (
                  <Card 
                    key={invoice.id} 
                    className={cardClass}
                    style={{animationDelay: `${0.6 + index * 0.1}s`}}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="status-badge">
                          {getStatusBadge(deriveStatus(invoice))}
                        </div>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold text-gray-900 leading-tight break-words">
                            {formatCurrency(invoice.totalAmount)}
                          </div>
                          <p className="text-xs text-gray-500">Tổng tiền</p>
                        </div>
                      </div>
                      <CardTitle className="text-base md:text-lg font-bold text-gray-900 mb-2 leading-tight break-words">
                        Hóa đơn {invoice.billingPeriod}
                      </CardTitle>
                      <CardDescription className="text-gray-600 break-words">
                        {invoice.remarks || 'Hóa đơn dịch vụ chung cư'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-3 text-[color:#0066CC]" />
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
                        {deriveStatus(invoice) === 'UNPAID' && (
                          <div className="pt-4">
                            <Button 
                              className="w-full bg-gradient-to-r from-[color:#FF6600] to-[color:#0066CC] hover:from-[color:#ff761a] hover:to-[color:#0a74d1] transition-all duration-200 transform hover:scale-105"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Thanh toán ngay
                            </Button>
                            <div className="mt-2">
                              <Button variant="outline" className="w-full" onClick={() => openInvoiceDetail(invoice)}>
                                Chi tiết hóa đơn
                              </Button>
                            </div>
                          </div>
                        )}
                        {deriveStatus(invoice) === 'OVERDUE' && (
                          <div className="pt-4">
                            <Button 
                              variant="destructive"
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Thanh toán gấp
                            </Button>
                            <div className="mt-2">
                              <Button variant="outline" className="w-full" onClick={() => openInvoiceDetail(invoice)}>
                                Chi tiết hóa đơn
                              </Button>
                            </div>
                          </div>
                        )}
                        {deriveStatus(invoice) === 'PAID' && (
                          <div className="pt-3">
                            <Button variant="outline" className="w-full" onClick={() => openInvoiceDetail(invoice)}>
                              Chi tiết hóa đơn
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
                  </div>
                </div>
              ))}
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

      {/* Invoice Detail Dialog */}
      <Dialog open={!!detailInvoice} onOpenChange={() => setDetailInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hóa đơn #{detailInvoice?.id}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {detailInvoice && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Kỳ thanh toán</div>
                    <div className="font-medium">{detailInvoice.billingPeriod}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Hạn thanh toán</div>
                    <div className="font-medium">{new Date(detailInvoice.dueDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tổng tiền</div>
                    <div className="font-semibold">{formatCurrency(detailInvoice.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trạng thái</div>
                    <div>{getStatusBadge(deriveStatus(detailInvoice))}</div>
                  </div>
                </div>
              )}
              <div>
                <div className="font-semibold mb-2">Chi tiết các khoản phí</div>
                {invoiceItems.length === 0 ? (
                  <div className="text-sm text-gray-500">Không có dữ liệu mục phí</div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-xs text-gray-500">
                      <div className="col-span-6">Hạng mục</div>
                      <div className="col-span-3">Loại phí</div>
                      <div className="col-span-3 text-right">Số tiền</div>
                    </div>
                    <div className="h-px bg-border" />
                    {invoiceItems.map((it: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-6 font-medium">{it.description || it.feeType}</div>
                        <div className="col-span-3 text-gray-500 uppercase">{it.feeType}</div>
                        <div className="col-span-3 text-right font-semibold">{formatCurrency(it.amount || 0)}</div>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-9 font-semibold">Tổng cộng</div>
                      <div className="col-span-3 text-right font-bold text-[color:#0066CC]">{formatCurrency(detailInvoice?.totalAmount || 0)}</div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-2">Lịch sử thanh toán</div>
                {payments.length === 0 ? (
                  <div className="text-sm text-gray-500">Chưa có giao dịch</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {payments.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded border">
                        <div className="text-sm">
                          <div className="font-medium">{p.method || p.gateway || 'Thanh toán'}</div>
                          <div className="text-gray-500">{new Date(p.createdAt || p.timestamp).toLocaleString('vi-VN')}</div>
                        </div>
                        <div className="font-semibold text-[color:#009966]">{formatCurrency(p.amount || p.totalAmount || 0)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All Payments History Dialog */}
      <Dialog open={showPaymentsHistory} onOpenChange={() => setShowPaymentsHistory(false)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử thanh toán</DialogTitle>
          </DialogHeader>
          {allPaymentsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {allPayments.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có giao dịch</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-12 text-xs text-gray-500">
                    <div className="col-span-2">Mã HĐ</div>
                    <div className="col-span-3">Kỳ</div>
                    <div className="col-span-3">Phương thức</div>
                    <div className="col-span-2">Thời gian</div>
                    <div className="col-span-2 text-right">Số tiền</div>
                  </div>
                  <div className="h-px bg-border" />
                  {allPayments.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-2">#{r.invoiceId}</div>
                      <div className="col-span-3">{r.billingPeriod}</div>
                      <div className="col-span-3">{r.method}</div>
                      <div className="col-span-2">{new Date(r.timestamp).toLocaleDateString('vi-VN')}</div>
                      <div className="col-span-2 text-right font-semibold text-[color:#009966]">{formatCurrency(r.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 