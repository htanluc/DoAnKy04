"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import { Building2, Sparkles, Star } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="page-background auth-background min-h-screen flex items-center justify-center px-4 py-0 relative">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10">
        <Sparkles className="h-8 w-8 text-brand-accent animate-pulse" />
      </div>
      <div className="absolute top-20 right-20">
        <Star className="h-6 w-6 text-yellow-400 animate-ping" />
      </div>
      <div className="absolute bottom-20 left-20">
        <Star className="h-4 w-4 text-brand-primary animate-bounce" />
      </div>

      {showForm ? (
        <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Trải Nghiệm Căn Hộ FPT
            </h1>
            <p className="text-gray-600 mb-6">
              Chức năng quên mật khẩu đang được phát triển
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-brand-gradient-via hover:from-[color:#ff761a] hover:via-[color:#00ab7a] hover:to-[color:#0a74d1] text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

