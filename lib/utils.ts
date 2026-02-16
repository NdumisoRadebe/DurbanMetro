import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateHours(clockIn: Date, clockOut: Date, breakMinutes = 0): number {
  const diff = clockOut.getTime() - clockIn.getTime()
  const hours = (diff / (1000 * 60 * 60)) - (breakMinutes / 60)
  return Math.round(hours * 100) / 100
}

export function calculateLeaveDays(startDate: Date, endDate: Date, excludeWeekends = true): number {
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    if (!excludeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}
