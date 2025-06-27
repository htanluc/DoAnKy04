import AuthRedirectGuard from "@/components/auth/auth-redirect-guard"
import RegisterForm from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthRedirectGuard>
      <RegisterForm />
    </AuthRedirectGuard>
  )
} 