'use client'

import { useEffect, useMemo, useState } from 'react'
import { init } from '@twa-dev/sdk'

const players = [
  { name: 'Anastasia', amount: '7 TON', icon: '⭐' },
  { name: 'Raphael', amount: '1 TON', icon: '⚡' },
  { name: 'You', amount: '1 TON', icon: '🧑' },
]

const multipliers = ['1.2x', '2.4x', '6x', '10x']

const navItems = [
  { label: 'Home', icon: '🏠' },
  { label: 'Game', icon: '🚀', active: true },
  { label: 'Gifts', icon: '🎁' },
  { label: 'Stats', icon: '📊' },
  { label: 'Profile', icon: '👤' },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [beamAnimation, setBeamAnimation] = useState(false)

  useEffect(() => {
    init()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const timeout = setTimeout(() => setBeamAnimation(true), 300)
    return () => clearTimeout(timeout)
  }, [mounted])

  const gradientOverlay = useMemo(
    () =>
      'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.35),transparent_60%),radial-gradient(circle_at_bottom,rgba(250,204,21,0.15),transparent_55%)] before:opacity-80',
    []
  )

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040018]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-400"></div>
          <p className="mt-4 text-sm text-purple-200/70">Preparing launch...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#09002B] via-[#0F0B40] to-[#020215] text-white">
      <div className={`absolute inset-0 ${gradientOverlay}`} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-24 pt-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6940FF] to-[#9A6BFF] shadow-lg shadow-[#6940FF40]">
            <span className="text-2xl">🎁</span>
          </div>

          <div className="flex items-center gap-3 text-white/80">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition hover:bg-white/20">
              <span className="text-lg">📶</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition hover:bg-white/20">
              <span className="text-lg">☰</span>
            </button>
          </div>
        </header>

        {/* Game area */}
        <section className="relative mt-8 flex flex-1 flex-col items-center justify-center">
          <div className="relative flex h-[360px] w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-7 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />

            {/* Multipliers */}
            <div className="relative z-10 flex flex-col items-center gap-8 text-3xl font-semibold tracking-wide text-blue-100/80">
              {multipliers.map((value) => (
                <span key={value} className="drop-shadow-[0_10px_40px_rgba(53,150,255,0.45)]">
                  {value}
                </span>
              ))}
            </div>

            {/* Beam */}
            <div
              className={`absolute top-0 flex h-full w-[4px] -translate-x-1/2 transform items-start justify-center transition-all duration-700 ${
                beamAnimation ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
              }`}
              style={{ left: '52%' }}
            >
              <div className="h-full w-full rounded-full bg-gradient-to-b from-[#5BB6FF] via-[#3D7BFF] to-transparent blur-[1px]" />
              <div className="absolute h-full w-[6px] rounded-full bg-gradient-to-b from-[#5BB6FF] via-[#3D7BFF] to-transparent opacity-50 blur-[8px]" />
            </div>

            {/* Rocket */}
            <div className="absolute left-1/2 top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute -bottom-4 h-16 w-16 rounded-full bg-gradient-to-b from-[#FFD54F] via-[#FFA726] to-transparent blur-2xl opacity-80" />
                <div className="absolute -bottom-2 h-10 w-10 rounded-full bg-[radial-gradient(circle,rgba(255,189,89,1)_0%,rgba(255,152,0,0.2)_70%,transparent_100%)] opacity-80" />
                <div className="relative flex h-16 w-10 flex-col items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-[#3E7BFF] via-[#2953C7] to-[#1A2A6C] shadow-[0_15px_35px_-10px_rgba(59,130,246,0.7)]">
                  <span className="text-sm font-semibold tracking-[0.3em] text-white/80">TON</span>
                  <div className="absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,203,59,1)_0%,rgba(255,171,0,1)_70%,rgba(255,152,0,0.75)_100%)] text-2xl shadow-[0_10px_25px_-5px_rgba(255,214,64,0.7)]">
                    🪙
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Player list */}
        <section className="mt-6 space-y-3">
          {players.map((player) => (
            <div
              key={player.name}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white/90 shadow-[0_15px_35px_-15px_rgba(41,88,255,0.6)] backdrop-blur-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/5 text-lg">
                  {player.icon}
                </div>
                <div>
                  <p className="text-base font-semibold">{player.name}</p>
                  <p className="text-xs text-white/60">Bet</p>
                </div>
              </div>
              <span className="text-base font-semibold text-blue-100">{player.amount}</span>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="mt-6 flex gap-4">
          <button className="flex-1 rounded-2xl bg-gradient-to-br from-[#894CFF] via-[#7B5BFF] to-[#5B3CFF] py-4 text-lg font-semibold shadow-[0_18px_40px_-18px_rgba(123,91,255,0.8)] transition hover:brightness-110">
            Launch
          </button>
          <button className="flex-1 rounded-2xl bg-gradient-to-br from-[#36B8FF] via-[#2F9DFF] to-[#2478FF] py-4 text-lg font-semibold shadow-[0_18px_40px_-18px_rgba(63,157,255,0.8)] transition hover:brightness-110">
            Collect
          </button>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 w-[92%] max-w-md rounded-[28px] border border-white/10 bg-white/10 px-4 py-3 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition ${
                item.active ? 'text-white' : 'text-white/50'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  item.active
                    ? 'bg-gradient-to-br from-[#36B8FF] to-[#2478FF] shadow-[0_10px_25px_-10px_rgba(36,120,255,0.9)]'
                    : 'bg-white/10'
                } text-base`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  )
}

