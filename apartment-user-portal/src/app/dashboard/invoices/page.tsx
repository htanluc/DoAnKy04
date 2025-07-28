"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Wallet, Smartphone, Globe } from 'lucide-react'
import { fetchMyInvoices } from '@/lib/api'
import { createVNPayPayment, createMoMoPayment, createZaloPayPayment, createVisaPayment } from '@/lib/api';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hóa đơn</h1>
        <p className="text-gray-600">Quản lý và thanh toán hóa đơn</p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Chưa có hóa đơn nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Hóa đơn {invoice.billingPeriod}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Ngày phát hành: {formatDate(invoice.issueDate)} | 
                      Hạn thanh toán: {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    {invoice.status === 'UNPAID' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedInvoice(invoice)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Thanh toán
                          </Button>
                        </DialogTrigger>
                        <Dialog>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid gap-3">
                                {paymentMethods.map((method) => (
                                  <div
                                    key={method.id}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedPaymentMethod === method.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedPaymentMethod(method.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {method.icon}
                                      <div>
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {paymentError && (
                                <Alert variant="destructive">
                                  <AlertDescription>{paymentError}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPaymentMethod('')
                                    setPaymentError('')
                                  }}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={handlePayment}
                                  disabled={!selectedPaymentMethod || paymentLoading}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {paymentLoading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    'Tiếp tục'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.description}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 