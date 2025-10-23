'use client'

import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Card({ className, hover = false, padding = 'md', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50',
        hover && 'cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
