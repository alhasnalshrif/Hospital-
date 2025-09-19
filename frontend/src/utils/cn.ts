import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string | null, format: 'short' | 'long' | 'time' = 'short'): string {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString()
    case 'long':
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'time':
      return d.toLocaleString()
    default:
      return d.toLocaleDateString()
  }
}

// Currency formatting
export function formatCurrency(amount: number | string | null): string {
  if (amount === null || amount === undefined) return '$0.00'
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

// Phone number formatting
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return 'N/A'
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  return phone
}

// Name formatting
export function formatName(firstName: string | null, lastName: string | null): string {
  if (!firstName && !lastName) return 'N/A'
  return [firstName, lastName].filter(Boolean).join(' ')
}

// Age calculation
export function calculateAge(dateOfBirth: Date | string | null): number {
  if (!dateOfBirth) return 0
  
  const today = new Date()
  const birth = new Date(dateOfBirth)
  
  if (isNaN(birth.getTime())) return 0
  
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1
  }
  
  return age
}

// Text truncation
export function truncateText(text: string | null, maxLength: number = 50): string {
  if (!text) return 'N/A'
  
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength) + '...'
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate initials from name
export function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || 'U'
}

// Status badge color mapping
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Appointment statuses
    scheduled: 'badge-neutral',
    confirmed: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-error',
    no_show: 'badge-warning',
    
    // Bill statuses  
    pending: 'badge-warning',
    partial: 'badge-primary',
    paid: 'badge-success',
    overdue: 'badge-error',
    
    // General statuses
    active: 'badge-success',
    inactive: 'badge-neutral',
    approved: 'badge-success',
    denied: 'badge-error',
    draft: 'badge-neutral',
  }
  
  return statusColors[status.toLowerCase()] || 'badge-neutral'
}

// Blood type color mapping
export function getBloodTypeColor(bloodType: string | null): string {
  if (!bloodType) return 'badge-neutral'
  
  const bloodTypeColors: Record<string, string> = {
    'A+': 'badge-success',
    'A-': 'badge-primary',
    'B+': 'badge-warning',
    'B-': 'badge-error', 
    'AB+': 'badge-primary',
    'AB-': 'badge-success',
    'O+': 'badge-warning',
    'O-': 'badge-error',
  }
  
  return bloodTypeColors[bloodType] || 'badge-neutral'
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number format
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Generate random color for avatars
export function getRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}

// Local storage utilities with error handling
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}