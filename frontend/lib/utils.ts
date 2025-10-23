import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'agora há pouco'
  if (minutes < 60) return `há ${minutes}m`
  if (hours < 24) return `há ${hours}h`
  if (days < 7) return `há ${days}d`

  return formatDate(d)
}

export function getSentimentColor(score: number): string {
  if (score > 0.6) return 'text-green-400'
  if (score > 0.3) return 'text-yellow-400'
  if (score > -0.3) return 'text-gray-400'
  return 'text-red-400'
}

export function getSentimentBg(score: number): string {
  if (score > 0.6) return 'bg-green-500/10 border-green-500/30'
  if (score > 0.3) return 'bg-yellow-500/10 border-yellow-500/30'
  if (score > -0.3) return 'bg-gray-500/10 border-gray-500/30'
  return 'bg-red-500/10 border-red-500/30'
}

export function getSentimentLabel(score: number): string {
  if (score > 0.6) return 'Muito Positivo'
  if (score > 0.3) return 'Positivo'
  if (score > -0.3) return 'Neutro'
  if (score > -0.6) return 'Negativo'
  return 'Muito Negativo'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}
