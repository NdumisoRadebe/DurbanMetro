import { DefaultSession } from 'next-auth'
import type {} from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export type Role = 'SUPER_ADMIN' | 'HR_ADMIN' | 'VIEWER'
export type OfficerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RETIRED'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type LeaveType = 'ANL' | 'SICK' | 'AOL' | 'FR' | 'TRN' | 'COMP' | 'MAT' | 'SUS'
export type ShiftType = 'DAY' | 'NIGHT' | 'SPECIAL'
