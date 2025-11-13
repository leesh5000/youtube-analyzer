"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface SavedChannel {
  id: string
  userId: string
  channelId: string
  channelName: string
  channelThumbnail?: string
  subscriberCount?: string
  notes?: string
  tags: string[]
  metadata?: any
  createdAt: string
  updatedAt: string
}

interface SaveChannelData {
  channelId: string
  channelName: string
  channelThumbnail?: string
  subscriberCount?: string
  metadata?: any
  notes?: string
  tags?: string[]
}

interface UpdateChannelData {
  notes?: string
  tags?: string[]
}

export function useSavedChannels() {
  return useQuery({
    queryKey: ["savedChannels"],
    queryFn: async () => {
      const response = await fetch("/api/channels/saved")
      if (!response.ok) {
        throw new Error("Failed to fetch saved channels")
      }
      const data = await response.json()
      return data.savedChannels as SavedChannel[]
    },
  })
}

export function useSaveChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SaveChannelData) => {
      const response = await fetch("/api/channels/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save channel")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedChannels"] })
    },
  })
}

export function useUpdateSavedChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChannelData }) => {
      const response = await fetch(`/api/channels/save/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update saved channel")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedChannels"] })
    },
  })
}

export function useDeleteSavedChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/channels/save/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete saved channel")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedChannels"] })
    },
  })
}
