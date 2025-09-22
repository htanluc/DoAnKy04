"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password-phone-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Mật khẩu mới đã được gửi qua email của bạn!');
        setIsSuccess(true);
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setEmail('');
    setMessage('');
    setError('');
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Email đã được gửi!</CardTitle>
          <CardDescription>
            Mật khẩu mới đã được gửi đến email của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button 
              onClick={resetForm}
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đặt lại mật khẩu
            </Button>
            <Button 
              asChild
              className="w-full"
            >
              <Link href="/login">
                Đăng nhập ngay
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Phone className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập số điện thoại và email để nhận mật khẩu mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Nhập số điện thoại đã đăng ký"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                required
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && !isSuccess && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !phoneNumber.trim() || !email.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Gửi mật khẩu mới
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              type="button"
              variant="ghost" 
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Lưu ý:</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Số điện thoại và email phải khớp với thông tin đã đăng ký</li>
            <li>• Mật khẩu mới sẽ được gửi qua email</li>
            <li>• Vui lòng đổi mật khẩu sau khi đăng nhập</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

