import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SavedChannelsList } from "@/components/SavedChannels/SavedChannelsList"
import { getTranslations } from "next-intl/server"

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  const t = await getTranslations()

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('saved.pageTitle')}</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            {t('saved.pageDescription')}
          </p>
        </div>

        <SavedChannelsList />
      </div>
    </div>
  )
}
