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
