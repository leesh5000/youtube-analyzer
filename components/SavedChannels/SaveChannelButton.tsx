"use client"

import { useSaveChannel, useDeleteSavedChannel, useSavedChannels } from "@/hooks/useSavedChannels"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface SaveChannelButtonProps {
  channelId: string
  channelName: string
  channelThumbnail?: string
  subscriberCount?: string
  metadata?: any
}

export function SaveChannelButton({
  channelId,
  channelName,
  channelThumbnail,
  subscriberCount,
  metadata,
}: SaveChannelButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: savedChannels } = useSavedChannels()
  const saveChannel = useSaveChannel()
  const deleteSavedChannel = useDeleteSavedChannel()

  const isSaved = savedChannels?.some((sc) => sc.channelId === channelId)
  const savedChannel = savedChannels?.find((sc) => sc.channelId === channelId)

  const handleClick = async () => {
    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (isSaved && savedChannel) {
      await deleteSavedChannel.mutateAsync(savedChannel.id)
    } else {
      await saveChannel.mutateAsync({
        channelId,
        channelName,
        channelThumbnail,
        subscriberCount,
        metadata,
      })
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={saveChannel.isPending || deleteSavedChannel.isPending}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
        isSaved
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {saveChannel.isPending || deleteSavedChannel.isPending ? (
        <>
          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="hidden sm:inline">Processing...</span>
        </>
      ) : isSaved ? (
        <>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Saved
        </>
      ) : (
        <>
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <span className="hidden sm:inline">Save Channel</span>
          <span className="sm:hidden">Save</span>
        </>
      )}
    </button>
  )
}
