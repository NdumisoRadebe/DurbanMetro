import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.isActive) return null

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account locked. Try again later.')
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          const failedAttempts = (user.failedAttempts || 0) + 1
          const updates: { failedAttempts: number; lockedUntil?: Date } = {
            failedAttempts,
          }
          if (failedAttempts >= 5) {
            updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 min lockout
          }
          await prisma.user.update({
            where: { id: user.id },
            data: updates,
          })
          return null
        }

        // Reset failed attempts on success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLogin: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
}
