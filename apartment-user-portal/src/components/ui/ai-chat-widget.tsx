"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AiChatWidgetProps {
  title?: string
  placeholder?: string
  initialMessages?: ChatMessage[]
}

export default function AiChatWidget({
  title = 'Trợ lý AI',
  placeholder = 'Nhập câu hỏi của bạn... (Enter để gửi)',
  initialMessages = [{ role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bạn về cư dân, hóa đơn, đặt chỗ tiện ích...?' }],
}: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const endRef = useRef<HTMLDivElement | null>(null)
  const lastUserQuestionRef = useRef<string>('')

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])

  const handleSend = async () => {
    if (!canSend) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    lastUserQuestionRef.current = userMsg.content
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsSending(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BE_URL || ''
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Bạn cần đăng nhập để dùng Chat AI.' },
        ])
        return
      }
      const res = await fetch(`${baseUrl}/api/ai/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Nếu BE yêu cầu xác thực, thêm Authorization tại đây
        body: JSON.stringify({
          question: userMsg.content,
          context: ''
        }),
      })

      if (res.status === 401 || res.status === 403) {
        throw new Error('Bạn cần đăng nhập để dùng Chat AI')
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Lỗi không xác định' }))
        throw new Error(err?.detail || err?.error || 'Lỗi máy chủ')
      }

      const data = await res.json()
      const text = data?.answer || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.'
      setMessages((prev) => [...prev, { role: 'assistant', content: text }])
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Đã xảy ra lỗi: ${e?.message || 'Không xác định'}` },
      ])
    } finally {
      setIsSending(false)
    }
  }

  // Quick links based on the user's question keywords
  const getQuickLinksFor = (text: string) => {
    // Normalize Vietnamese diacritics to improve matching
    const normalize = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')

    const t = normalize(text)
    const links: { href: string; label: string }[] = []

    // Invoices
    if (/(hoa ?don|bill|invoice|thanh toan|vnpay|don tien dien nuoc|thanh toan hoa don)/.test(t)) {
      links.push({ href: '/dashboard/invoices', label: 'Mở trang Hóa đơn' })
      links.push({ href: '/payment/vnpay-result', label: 'Kết quả thanh toán' })
    }
    // Vehicles
    if (/(xe|phuong tien|vehicle|dang ky xe|dang ky the xe|bai do xe)/.test(t)) {
      links.push({ href: '/dashboard/vehicles', label: 'Mở trang Phương tiện' })
    }
    // Service Requests (support)
    if (/(ho tro|support|yeu cau|yeu cau ho tro|bao hong|service request)/.test(t)) {
      links.push({ href: '/dashboard/service-requests', label: 'Mở trang Yêu cầu hỗ trợ' })
    }
    // Profile
    if (/(thong tin|profile|cap nhat|doi thong tin|cap nhat ho so)/.test(t)) {
      links.push({ href: '/dashboard/update-info', label: 'Mở trang Cập nhật thông tin' })
    }
    // Dashboard
    if (/(tong quan|dashboard|trang chu)/.test(t)) {
      links.push({ href: '/dashboard', label: 'Mở trang Tổng quan' })
    }

    // De-duplicate by href
    const unique = new Map<string, { href: string; label: string }>()
    links.forEach(l => unique.set(l.href, l))
    return Array.from(unique.values())
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-[60]">
      {/* Toggle Button */}
      <button
        aria-label="Mở khung chat AI"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full shadow-lg bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 focus:outline-none"
      >
        {isOpen ? 'Đóng chat' : 'Chat AI'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-3 w-[320px] sm:w-[380px] h-[440px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">{title}</div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Đóng
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-neutral-50 dark:bg-neutral-950">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ' +
                    (m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100')
                  }
                >
                  {m.content}
                </div>
                {/* Quick links under the latest assistant reply */}
                {m.role === 'assistant' && idx === messages.length - 1 && (
                  (() => {
                    const suggestions = getQuickLinksFor(lastUserQuestionRef.current || m.content)
                    if (!suggestions.length) return null
                    return (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )
                  })()
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isSending}
                placeholder={placeholder}
                className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


