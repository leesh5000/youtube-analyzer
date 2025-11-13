import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HistoryList } from "@/components/History/HistoryList"

export default async function HistoryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Your channel analyses and search history
          </p>
        </div>

        <HistoryList />
      </div>
    </div>
  )
}
