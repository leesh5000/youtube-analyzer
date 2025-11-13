"use client"

import { useSavedChannels, useDeleteSavedChannel, useUpdateSavedChannel } from "@/hooks/useSavedChannels"
import Link from "next/link"
import { useState } from "react"

export function SavedChannelsList() {
  const { data: savedChannels, isLoading, error } = useSavedChannels()
  const deleteSavedChannel = useDeleteSavedChannel()
  const updateSavedChannel = useUpdateSavedChannel()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [editTags, setEditTags] = useState("")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load saved channels</p>
      </div>
    )
  }

  if (!savedChannels || savedChannels.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No saved channels</h3>
        <p className="mt-1 text-sm text-gray-500">Start analyzing channels and save your favorites!</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Analyze Channels
          </Link>
        </div>
      </div>
    )
  }

  const handleEdit = (channel: any) => {
    setEditingId(channel.id)
    setEditNotes(channel.notes || "")
    setEditTags(channel.tags?.join(", ") || "")
  }

  const handleSaveEdit = async (id: string) => {
    await updateSavedChannel.mutateAsync({
      id,
      data: {
        notes: editNotes,
        tags: editTags.split(",").map((tag) => tag.trim()).filter(Boolean),
      },
    })
    setEditingId(null)
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedChannels.map((channel) => (
        <div key={channel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              {channel.channelThumbnail && (
                <img
                  src={channel.channelThumbnail}
                  alt={channel.channelName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {channel.channelName}
                </h3>
                {channel.subscriberCount && (
                  <p className="text-xs sm:text-sm text-gray-500">{channel.subscriberCount} subscribers</p>
                )}
              </div>
            </div>

            {editingId === channel.id ? (
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(channel.id)}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {channel.notes && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 line-clamp-2">{channel.notes}</p>
                )}

                {channel.tags && channel.tags.length > 0 && (
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {channel.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-2 sm:mt-3 text-xs text-gray-400">
                  Saved {new Date(channel.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/?channelId=${channel.channelId}`}
                    className="flex-1 text-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                  >
                    View Analysis
                  </Link>
                  <button
                    onClick={() => handleEdit(channel)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs sm:text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSavedChannel.mutate(channel.id)}
                    disabled={deleteSavedChannel.isPending}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-xs sm:text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
