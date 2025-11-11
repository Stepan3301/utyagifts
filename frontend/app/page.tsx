'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'

import rocketAnimation from '@/public/animations/rocket.json'

const NAV_ITEMS = [
  { label: 'Home', icon: '🏠' },
  { label: 'Game', icon: '🚀', active: true },
  { label: 'Gifts', icon: '🎁' },
  { label: 'Stats', icon: '📊' },
  { label: 'Profile', icon: '👤' },
]

const DEFAULT_MULTIPLIERS = ['1.20x', '2.40x', '6.00x', '10.00x']
const MAX_MULTIPLIER = 20

type SessionState = 'idle' | 'running' | 'cashed' | 'crashed'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [beamAnimation, setBeamAnimation] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [targetCrashMultiplier, setTargetCrashMultiplier] = useState<number | null>(null)
  const animationRef = useRef<LottieRefCurrentProps>(null)
  const crashTargetRef = useRef<number>(10)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      WebApp.ready()
      WebApp.expand()
    } catch (error) {
      console.warn('Telegram WebApp SDK init failed, continuing in fallback mode.', error)
    }

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

  const displayedMultipliers = useMemo(() => {
    if (sessionState === 'idle') {
      return DEFAULT_MULTIPLIERS
    }

    const progressValue = Math.min(currentMultiplier, targetCrashMultiplier ?? 10, MAX_MULTIPLIER)
    const ratios = [0.35, 0.55, 0.75, 1]

    return ratios.map((ratio) => {
      const value = Math.max(1, progressValue * ratio)
      return `${Math.min(value, MAX_MULTIPLIER).toFixed(2)}x`
    })
  }, [currentMultiplier, sessionState, targetCrashMultiplier])

  const sessionMessage = useMemo(() => {
    switch (sessionState) {
      case 'running':
        return `Live multiplier: ${currentMultiplier.toFixed(2)}x`
      case 'cashed':
        return `You collected at ${currentMultiplier.toFixed(2)}x`
      case 'crashed':
        return `Rocket crashed at ${(targetCrashMultiplier ?? currentMultiplier).toFixed(2)}x`
      default:
        return 'Ready for launch'
    }
  }, [currentMultiplier, sessionState, targetCrashMultiplier])

  const players = useMemo(
    () => [
      { name: 'Anastasia', amount: '7 TON', icon: '⭐', status: 'Bet' },
      { name: 'Raphael', amount: '1 TON', icon: '⚡', status: 'Bet' },
      {
        name: 'You',
        amount:
          sessionState === 'running' || sessionState === 'cashed' || sessionState === 'crashed'
            ? `${currentMultiplier.toFixed(2)}x`
            : '—',
        icon: '🧑',
        status:
          sessionState === 'running'
            ? 'Live'
            : sessionState === 'cashed'
              ? 'Collected'
              : sessionState === 'crashed'
                ? 'Crashed'
                : 'Ready',
      },
    ],
    [currentMultiplier, sessionState]
  )

  const handleLaunch = useCallback(() => {
    if (sessionState === 'running') return

    const crashPoint = parseFloat((Math.random() * (MAX_MULTIPLIER - 1.1) + 1.1).toFixed(2))
    crashTargetRef.current = crashPoint

    setTargetCrashMultiplier(crashPoint)
    setCurrentMultiplier(1)
    setSessionState('running')

    if (animationRef.current) {
      animationRef.current.play()
    }
  }, [sessionState])

  const handleCollect = useCallback(() => {
    if (sessionState !== 'running') return

    setSessionState('cashed')
  }, [sessionState])

  useEffect(() => {
    if (sessionState === 'running') {
      setBeamAnimation(false)
      const timeout = setTimeout(() => setBeamAnimation(true), 200)
      return () => clearTimeout(timeout)
    }

    setBeamAnimation(false)
  }, [sessionState])

  useEffect(() => {
    if (sessionState !== 'running') {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current.goToAndStop(0, true)
      }
      return
    }

    const interval = window.setInterval(() => {
      setCurrentMultiplier((prev) => {
        const acceleration = prev * 0.03 + 0.05
        const next = parseFloat((prev + acceleration).toFixed(2))

        if (next >= crashTargetRef.current) {
          window.clearInterval(interval)
          setSessionState('crashed')
          return parseFloat(crashTargetRef.current.toFixed(2))
        }

        return Math.min(next, MAX_MULTIPLIER)
      })
    }, 120)

    return () => window.clearInterval(interval)
  }, [sessionState])

  useEffect(() => {
    if (!animationRef.current) return

    if (sessionState === 'running') {
      animationRef.current.setSpeed(1.1)
      animationRef.current.play()
    } else {
      animationRef.current.stop()
    }
  }, [sessionState])

  const launchLabel =
    sessionState === 'running'
      ? 'Running...'
      : sessionState === 'crashed'
        ? 'Restart'
        : sessionState === 'cashed'
          ? 'Replay'
          : 'Launch'
  const collectLabel =
    sessionState === 'running'
      ? `Collect ${currentMultiplier.toFixed(2)}x`
      : sessionState === 'cashed'
        ? 'Collected'
        : 'Collect'
  const collectDisabled = sessionState !== 'running'

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
        <section className="relative mt-6 flex flex-1 flex-col items-center justify-center">
          <div className="relative flex h-[360px] w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-7 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />

            {/* Multipliers */}
            <div className="relative z-10 flex flex-col items-center gap-8 text-3xl font-semibold tracking-wide text-blue-100/80">
              {displayedMultipliers.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className={`drop-shadow-[0_10px_40px_rgba(53,150,255,0.45)] transition-opacity ${
                    sessionState === 'running' ? 'opacity-100' : 'opacity-90'
                  }`}
                >
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
              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute -bottom-6 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(89,145,255,0.45)_0%,rgba(89,145,255,0.05)_70%,transparent_100%)] blur-2xl" />
                <Lottie
                  lottieRef={animationRef}
                  animationData={rocketAnimation}
                  loop
                  autoplay={false}
                  className="h-32 w-32"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-sm font-medium text-white/80">{sessionMessage}</div>
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
                  <p className="text-xs text-white/60">{player.status}</p>
                </div>
              </div>
              <span className="text-base font-semibold text-blue-100">{player.amount}</span>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="mt-6 flex gap-4">
          <button
            className="flex-1 rounded-2xl bg-gradient-to-br from-[#894CFF] via-[#7B5BFF] to-[#5B3CFF] py-4 text-lg font-semibold shadow-[0_18px_40px_-18px_rgba(123,91,255,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleLaunch}
            disabled={sessionState === 'running'}
          >
            {launchLabel}
          </button>
          <button
            className="flex-1 rounded-2xl bg-gradient-to-br from-[#36B8FF] via-[#2F9DFF] to-[#2478FF] py-4 text-lg font-semibold shadow-[0_18px_40px_-18px_rgba(63,157,255,0.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCollect}
            disabled={collectDisabled}
          >
            {collectLabel}
          </button>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 w-[92%] max-w-md rounded-[28px] border border-white/10 bg-white/10 px-4 py-3 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {NAV_ITEMS.map((item) => (
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

