import { SignInButton } from "@/components/Auth/SignInButton"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await auth()

  // Redirect if already signed in
  if (session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:py-12">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to YouTube Analyzer
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Sign in to save your channel analyses and track your history
          </p>
        </div>

        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <SignInButton />
        </div>

        <p className="text-xs text-center text-gray-500 mt-3 sm:mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
