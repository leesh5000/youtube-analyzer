import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    isAdmin?: boolean
  }
}

// Kakao Provider Configuration
// https://developers.kakao.com/docs/latest/en/kakaologin/rest-api
const KakaoProvider = {
  id: "kakao",
  name: "Kakao",
  type: "oauth" as const,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname profile_image account_email" },
  },
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname,
      email: profile.kakao_account?.email,
      image: profile.kakao_account?.profile?.profile_image_url,
    }
  },
}

// Naver Provider Configuration
// https://developers.naver.com/docs/login/api/api.md
const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image,
    }
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "admin",
      name: "Admin Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
          console.error("Admin credentials not configured in environment variables")
          return null
        }

        // Check if credentials match admin account
        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          // Find or create admin user in database
          let adminUser = await prisma.user.findUnique({
            where: { email: adminEmail },
          })

          if (!adminUser) {
            adminUser = await prisma.user.create({
              data: {
                email: adminEmail,
                name: "Administrator",
                emailVerified: new Date(),
              },
            })
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            image: adminUser.image,
            isAdmin: true,
          }
        }

        return null
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    KakaoProvider,
    NaverProvider,
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // First time JWT is created (after sign in)
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin || false
      }

      // Handle OAuth providers - save to database
      if (account && account.provider !== "admin" && token.email) {
        // Check if user exists in database
        let dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })

        // Create user if doesn't exist
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: token.email,
              name: token.name || null,
              image: token.picture || null,
              emailVerified: new Date(),
            },
          })
        }

        // Store database user ID in token
        token.id = dbUser.id
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
