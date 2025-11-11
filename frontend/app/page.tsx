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

const STARFIELD = [
  { top: '12%', left: '18%', size: 4, opacity: 0.85, blur: 18, duration: 3.8, delay: 0 },
  { top: '28%', left: '68%', size: 3, opacity: 0.6, blur: 14, duration: 4.6, delay: 0.6 },
  { top: '48%', left: '12%', size: 2, opacity: 0.7, blur: 10, duration: 5.4, delay: 1.1 },
  { top: '70%', left: '30%', size: 3, opacity: 0.65, blur: 16, duration: 4.2, delay: 1.7 },
  { top: '78%', left: '72%', size: 4, opacity: 0.75, blur: 22, duration: 3.4, delay: 0.4 },
  { top: '18%', left: '82%', size: 2, opacity: 0.55, blur: 12, duration: 5.8, delay: 1.9 },
  { top: '62%', left: '56%', size: 3, opacity: 0.7, blur: 15, duration: 4.8, delay: 1.2 },
  { top: '38%', left: '42%', size: 2, opacity: 0.6, blur: 9, duration: 5.1, delay: 0.9 },
  { top: '86%', left: '44%', size: 3, opacity: 0.8, blur: 18, duration: 4.1, delay: 0.3 },
  { top: '8%', left: '52%', size: 2, opacity: 0.7, blur: 11, duration: 6.2, delay: 1.5 },
]
const MAX_MULTIPLIER = 20

type SessionState = 'idle' | 'running' | 'cashed' | 'crashed'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [beamAnimation, setBeamAnimation] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [targetCrashMultiplier, setTargetCrashMultiplier] = useState<number | null>(null)
  const [collectedMultiplier, setCollectedMultiplier] = useState<number | null>(null)
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
      'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_65%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.2),transparent_55%)] before:opacity-80',
    []
  )

  const gameAreaBackgroundClass = useMemo(() => {
    switch (sessionState) {
      case 'running':
        if (collectedMultiplier !== null) {
          return 'bg-gradient-to-b from-[#1a3a4a] via-[#2a4a5a] to-[#1a2a3a]'
        }
        return 'bg-gradient-to-b from-[#052914] via-[#0A4F2B] to-[#042414]'
      case 'crashed':
        return 'bg-gradient-to-b from-[#2B0508] via-[#5A0F19] to-[#1A0408]'
      default:
        return 'bg-white/5'
    }
  }, [collectedMultiplier, sessionState])

  const displayedMultiplier = useMemo(() => {
    if (sessionState === 'idle') {
      return '1.00x'
    }

    const value =
      sessionState === 'running'
        ? currentMultiplier
        : targetCrashMultiplier ?? currentMultiplier

    return `${Math.min(value, MAX_MULTIPLIER).toFixed(2)}x`
  }, [currentMultiplier, sessionState, targetCrashMultiplier])

  const sessionMessage = useMemo(() => {
    switch (sessionState) {
      case 'running':
        if (collectedMultiplier !== null) {
          return `You collected at ${collectedMultiplier.toFixed(2)}x - Watching rocket...`
        }
        return `Live multiplier: ${currentMultiplier.toFixed(2)}x`
      case 'cashed':
        return `You collected at ${collectedMultiplier?.toFixed(2)}x - Rocket crashed at ${(targetCrashMultiplier ?? currentMultiplier).toFixed(2)}x`
      case 'crashed':
        return `Rocket crashed at ${(targetCrashMultiplier ?? currentMultiplier).toFixed(2)}x`
      default:
        return 'Ready for launch'
    }
  }, [collectedMultiplier, currentMultiplier, sessionState, targetCrashMultiplier])

  const players = useMemo(
    () => [
      { name: 'Anastasia', amount: '7 TON', icon: '⭐', status: 'Bet' },
      { name: 'Raphael', amount: '1 TON', icon: '⚡', status: 'Bet' },
      {
        name: 'You',
        amount:
          sessionState === 'running' && collectedMultiplier !== null
            ? `${collectedMultiplier.toFixed(2)}x`
            : sessionState === 'running' || sessionState === 'cashed' || sessionState === 'crashed'
              ? `${currentMultiplier.toFixed(2)}x`
              : '—',
        icon: '🧑',
        status:
          sessionState === 'running' && collectedMultiplier !== null
            ? 'Collected'
            : sessionState === 'running'
              ? 'Live'
              : sessionState === 'cashed'
                ? 'Collected'
                : sessionState === 'crashed'
                  ? 'Crashed'
                  : 'Ready',
      },
    ],
    [collectedMultiplier, currentMultiplier, sessionState]
  )

  const handleLaunch = useCallback(() => {
    if (sessionState === 'running') return

    const crashPoint = parseFloat((Math.random() * (MAX_MULTIPLIER - 1.1) + 1.1).toFixed(2))
    crashTargetRef.current = crashPoint

    setTargetCrashMultiplier(crashPoint)
    setCurrentMultiplier(1)
    setCollectedMultiplier(null)
    setSessionState('running')

    if (animationRef.current) {
      animationRef.current.play()
    }
  }, [sessionState])

  const handleCollect = useCallback(() => {
    if (sessionState !== 'running' || collectedMultiplier !== null) return

    setCollectedMultiplier(currentMultiplier)
  }, [collectedMultiplier, currentMultiplier, sessionState])

  useEffect(() => {
    if (sessionState === 'running') {
      setBeamAnimation(false)
      const timeout = setTimeout(() => setBeamAnimation(true), 180)
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

  const beamStyle = useMemo(
    () => ({
      opacity: beamAnimation ? 1 : 0,
      transform: `rotate(-57deg) scaleY(${beamAnimation ? 1 : 0})`,
      transformOrigin: 'bottom left',
    }),
    [beamAnimation]
  )

  const multiplierClasses = useMemo(() => {
    if (sessionState === 'running') {
      return 'text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.85)]'
    }

    if (sessionState === 'crashed') {
      return 'text-red-200 drop-shadow-[0_18px_45px_rgba(239,68,68,0.65)]'
    }

    return 'text-blue-100/90 drop-shadow-[0_15px_45px_rgba(59,130,246,0.55)]'
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
    sessionState === 'running' && collectedMultiplier !== null
      ? `Collected at ${collectedMultiplier.toFixed(2)}x`
      : sessionState === 'running'
        ? `Collect ${currentMultiplier.toFixed(2)}x`
        : sessionState === 'cashed'
          ? 'Collected'
          : 'Collect'
  const collectDisabled = sessionState !== 'running' || collectedMultiplier !== null

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050015] via-[#09002F] to-[#01010A] text-white">
      <div className={`absolute inset-0 ${gradientOverlay}`} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(71,72,255,0.4)_0%,rgba(71,72,255,0.05)_70%,transparent_100%)] blur-3xl" />
        <div className="absolute -right-48 top-1/3 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.35)_0%,rgba(236,72,153,0.07)_65%,transparent_100%)] blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.28)_0%,rgba(14,165,233,0.05)_72%,transparent_100%)] blur-[120px]" />
        {STARFIELD.map((star, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="absolute rounded-full bg-white/90"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              filter: `drop-shadow(0 0 ${star.blur}px rgba(255,255,255,0.9))`,
              animation: `pulse ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

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
          <div className={`relative flex h-[360px] w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/10 px-7 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px] transition-colors duration-700 ${gameAreaBackgroundClass}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />

            {/* Beam */}
            <div
              className="absolute left-[62%] top-[78%] flex h-[420px] w-[6px] -translate-x-1/2 -translate-y-full items-start justify-center transition-all duration-700"
              style={beamStyle}
            >
              <div className="h-full w-full rounded-full bg-gradient-to-b from-[#5BB6FF] via-[#3D7BFF] to-transparent blur-[1px]" />
              <div className="absolute h-full w-[8px] rounded-full bg-gradient-to-b from-[#5BB6FF] via-[#3D7BFF] to-transparent opacity-60 blur-[12px]" />
            </div>

            {/* Rocket */}
            <div className="absolute left-1/2 top-[42%] z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <div className="absolute -bottom-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(89,145,255,0.45)_0%,rgba(89,145,255,0.05)_70%,transparent_100%)] blur-2xl" />
                <Lottie
                  lottieRef={animationRef}
                  animationData={rocketAnimation}
                  loop
                  autoplay={false}
                  className="h-40 w-40"
                />
              </div>
            </div>

            {/* Live multiplier - below rocket */}
            <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
              <span className={`text-[2.8rem] font-bold tracking-tight transition-all duration-500 ${multiplierClasses}`}>
                {displayedMultiplier}
              </span>
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

