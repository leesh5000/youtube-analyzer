import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SavedChannelsList } from "@/components/SavedChannels/SavedChannelsList"

export default async function SavedPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Channels</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Your bookmarked YouTube channels and their analyses
          </p>
        </div>

        <SavedChannelsList />
      </div>
    </div>
  )
}
