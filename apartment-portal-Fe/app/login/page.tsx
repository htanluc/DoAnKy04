import AuthRedirectGuard from "@/components/auth/auth-redirect-guard"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthRedirectGuard>
      <LoginForm />
    </AuthRedirectGuard>
  )
} 