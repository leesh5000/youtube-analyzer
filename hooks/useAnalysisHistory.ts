"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface AnalysisHistory {
  id: string
  userId: string
  channelId?: string
  channelName?: string
  searchQuery?: string
  analysisType: "channel" | "search"
  metadata?: any
  createdAt: string
}

interface CreateHistoryData {
  channelId?: string
  channelName?: string
  searchQuery?: string
  analysisType: "channel" | "search"
  metadata?: any
}

interface HistoryResponse {
  history: AnalysisHistory[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function useAnalysisHistory(options?: {
  type?: "channel" | "search"
  limit?: number
  offset?: number
}) {
  const { type, limit = 50, offset = 0 } = options || {}

  return useQuery({
    queryKey: ["analysisHistory", type, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (type) {
        params.append("type", type)
      }

      const response = await fetch(`/api/history?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analysis history")
      }
      return response.json() as Promise<HistoryResponse>
    },
  })
}

export function useCreateHistoryEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateHistoryData) => {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create history entry")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysisHistory"] })
    },
  })
}
