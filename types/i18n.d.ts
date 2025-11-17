import "next-intl"

// TypeScript type definitions for next-intl
// This provides autocomplete and type checking for translation keys

type Messages = typeof import("../messages/ko.json")

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
