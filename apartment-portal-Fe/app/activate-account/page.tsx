"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resendVerification } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailOrPhone = searchParams.get("emailOrPhone") || "";
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const { language, t } = useLanguage();

  const handleResend = async () => {
    setStatus("loading");
    setMessage("");
    const res = await resendVerification(emailOrPhone);
    if (res.success) {
      setStatus("success");
      setMessage(res.message || "Đã gửi lại email xác thực!");
    } else {
      setStatus("error");
      setMessage(res.message || "Không thể gửi lại email xác thực, vui lòng thử lại sau");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-2xl font-bold mb-2 text-red-600">{t('activate.title')}</h1>
      <p className="mb-4 text-center text-gray-700 max-w-md">
        {t('activate.description').replace('{emailOrPhone}', emailOrPhone ? emailOrPhone : t('register.email'))}
      </p>
      <button
        onClick={handleResend}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold mb-2"
        disabled={status === "loading" || !emailOrPhone}
      >
        {status === "loading" ? t('activate.resending') : t('activate.resend')}
      </button>
      {message && (
        <div className={`mt-2 text-center font-medium ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.includes("No EntityManager with actual transaction available for current thread")
            ? t('error.transaction')
            : message === "Đã gửi lại email xác thực!" || message === "Verification email resent!"
              ? t('activate.success')
              : message === "Không thể gửi lại email xác thực, vui lòng thử lại sau" || message === "Cannot resend verification email, please try again later"
                ? t('activate.error')
                : message}
        </div>
      )}
      <button
        className="mt-6 underline text-blue-600 hover:text-blue-800"
        onClick={() => router.push("/login")}
      >
        {t('activate.back')}
      </button>
    </div>
  );
} 