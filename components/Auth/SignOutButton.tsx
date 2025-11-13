"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
    >
      Sign Out
    </button>
  )
}
