import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Loading({ size = "md", text = "Đang tải...", fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    : "flex items-center justify-center p-8"

  return (
    <div className={containerClasses}>
      <div className="text-center animate-fade-in">
        <div className="relative">
          <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-blue-600`} />
          <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-400 rounded-full animate-ping opacity-20`}></div>
        </div>
        {text && (
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">{text}</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
      <div className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
} 