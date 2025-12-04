'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, User, Hammer, Target } from 'lucide-react'

export function FourBTile() {
  const router = useRouter()

  const fourBs = [
    {
      id: 'brain',
      label: 'Brain',
      icon: Brain,
      route: '/dashboard/brain',
      description: 'Neural Testing',
    },
    {
      id: 'body',
      label: 'Body',
      icon: User,
      route: '/dashboard/body',
      description: 'Ground • Engine • Barrel',
    },
    {
      id: 'bat',
      label: 'Bat',
      icon: Hammer,
      route: '/dashboard/bat',
      description: 'Bat Speed & Path',
    },
    {
      id: 'ball',
      label: 'Ball',
      icon: Target,
      route: '/dashboard/ball',
      description: 'Exit Velo & Launch',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-barrels-surface border border-barrels-border p-4 md:p-5"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">4B System</h2>
        <p className="text-sm text-barrels-muted mt-1">
          Track your progress across all four fundamentals
        </p>
      </div>

      {/* 4B Grid */}
      <div className="grid grid-cols-2 gap-3">
        {fourBs.map((b, index) => {
          const Icon = b.icon
          return (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              onClick={() => router.push(b.route)}
              className="group relative rounded-xl bg-white/3 border border-barrels-border p-4 text-left transition-all duration-200 hover:bg-white/5 hover:border-barrels-gold active:scale-[0.98]"
            >
              {/* Icon */}
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light">
                  <Icon className="w-6 h-6 text-barrels-black" strokeWidth={2.5} />
                </div>
              </div>

              {/* Label */}
              <h3 className="text-base font-bold text-white mb-1">{b.label}</h3>

              {/* Description */}
              <p className="text-xs text-barrels-muted">{b.description}</p>

              {/* Hover indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-barrels-gold" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
