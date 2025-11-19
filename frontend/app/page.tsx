'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import WebApp from '@twa-dev/sdk'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'

import rocketAnimation from '@/public/animations/rocket.json'
import { authApi } from '@/lib/api'

const NAV_ITEMS: Array<{ label: string; id: string; icon: JSX.Element }> = [
  {
    label: 'Home',
    id: 'home',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.6 11.3 4c.4-.4 1-.4 1.4 0L20 11.6V20a1 1 0 0 1-1 1h-4.5a.5.5 0 0 1-.5-.5V16a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v4.5a.5.5 0 0 1-.5.5H5a1 1 0 0 1-1-1v-8.4Z" />
      </svg>
    ),
  },
  {
    label: 'Game',
    id: 'game',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 8A4.5 4.5 0 0 0 2 12.5v1.2A4.3 4.3 0 0 0 4.9 18l1.7.6a1 1 0 0 0 1.2-.5l.9-1.8h4.6l.9 1.8a1 1 0 0 0 1.2.5l1.7-.6A4.3 4.3 0 0 0 22 13.7v-1.2A4.5 4.5 0 0 0 17.5 8h-11ZM8.2 11a.8.8 0 0 1 .8.8V13h1.2a.8.8 0 0 1 0 1.6H9v1.2a.8.8 0 1 1-1.6 0V14H6.2A.8.8 0 0 1 6.2 13H7.4v-1.2a.8.8 0 0 1 .8-.8Zm7.8.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1.8-1.8a1 1 0 1 1-1.4 1.4 1 1 0 0 1 1.4-1.4Z" />
      </svg>
    ),
  },
  {
    label: 'Gifts',
    id: 'gifts',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.8 4C7.2 4 6 5.4 6 7s1.2 3 2.8 3h.7L8.8 4Zm1.9 0v6H12V4h-1.3Zm3.3 0h-.7L14.5 10h.7C16.8 10 18 8.6 18 7s-1.2-3-3-3Zm3.3 6H19a1 1 0 0 1 1 1v2.5H12V10h5.3ZM4 11a1 1 0 0 1 1-1h2.7v3.5H4V11Zm7 4.5V21H5a1 1 0 0 1-1-1v-4.5h7Zm2 0h7V20a1 1 0 0 1-1 1h-6v-5.5Z" />
      </svg>
    ),
  },
  {
    label: 'Stats',
    id: 'stats',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11.5a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.5Zm5-4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1V7.5Zm5-3a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H16a1 1 0 0 1-1-1V4.5Z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    id: 'profile',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm0 8.7c3.3 0 6 2.1 6 4.8 0 1-.8 1.8-1.8 1.8H7.8A1.8 1.8 0 0 1 6 17.7c0-2.7 2.7-4.8 6-4.8Z" />
      </svg>
    ),
  },
]

const STARFIELD = [
  { top: '8%', left: '12%', size: 3, opacity: 0.9, blur: 20, duration: 3.2, delay: 0 },
  { top: '15%', left: '45%', size: 4, opacity: 0.85, blur: 24, duration: 4.1, delay: 0.3 },
  { top: '22%', left: '78%', size: 2, opacity: 0.7, blur: 16, duration: 3.8, delay: 0.6 },
  { top: '32%', left: '25%', size: 3, opacity: 0.8, blur: 18, duration: 4.5, delay: 0.9 },
  { top: '38%', left: '68%', size: 5, opacity: 0.9, blur: 28, duration: 3.6, delay: 1.2 },
  { top: '48%', left: '15%', size: 2, opacity: 0.65, blur: 14, duration: 5.2, delay: 1.5 },
  { top: '55%', left: '55%', size: 4, opacity: 0.85, blur: 22, duration: 4.3, delay: 1.8 },
  { top: '62%', left: '82%', size: 3, opacity: 0.75, blur: 19, duration: 3.9, delay: 2.1 },
  { top: '72%', left: '30%', size: 2, opacity: 0.7, blur: 15, duration: 4.7, delay: 2.4 },
  { top: '78%', left: '65%', size: 4, opacity: 0.88, blur: 26, duration: 3.5, delay: 2.7 },
  { top: '85%', left: '18%', size: 3, opacity: 0.8, blur: 20, duration: 4.2, delay: 3.0 },
  { top: '12%', left: '88%', size: 2, opacity: 0.6, blur: 12, duration: 5.5, delay: 0.2 },
  { top: '28%', left: '5%', size: 4, opacity: 0.9, blur: 25, duration: 3.7, delay: 0.5 },
  { top: '42%', left: '92%', size: 2, opacity: 0.65, blur: 13, duration: 4.8, delay: 0.8 },
  { top: '58%', left: '8%', size: 3, opacity: 0.75, blur: 17, duration: 4.4, delay: 1.1 },
  { top: '68%', left: '48%', size: 5, opacity: 0.92, blur: 30, duration: 3.4, delay: 1.4 },
  { top: '88%', left: '75%', size: 2, opacity: 0.7, blur: 14, duration: 5.1, delay: 1.7 },
  { top: '5%', left: '35%', size: 3, opacity: 0.8, blur: 21, duration: 4.0, delay: 2.0 },
  { top: '92%', left: '42%', size: 4, opacity: 0.86, blur: 23, duration: 3.8, delay: 2.3 },
  { top: '18%', left: '58%', size: 2, opacity: 0.68, blur: 11, duration: 5.3, delay: 2.6 },
]
const MAX_MULTIPLIER = 20

type SessionState = 'idle' | 'running' | 'cashed' | 'crashed'

interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('home')
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [beamAnimation, setBeamAnimation] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [targetCrashMultiplier, setTargetCrashMultiplier] = useState<number | null>(null)
  const [collectedMultiplier, setCollectedMultiplier] = useState<number | null>(null)
  const animationRef = useRef<LottieRefCurrentProps>(null)
  const crashTargetRef = useRef<number>(10)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeApp = async () => {
      try {
        WebApp.ready()
        WebApp.expand()

        // Get Telegram user data
        const initData = WebApp.initDataUnsafe
        if (initData?.user) {
          const user = initData.user as TelegramUser
          setTelegramUser(user)

          // Register or update user in database
          try {
            await authApi.registerUser({
              telegramId: user.id,
              username: user.username,
              firstName: user.first_name,
              lastName: user.last_name,
            })
            console.log('✅ User registered successfully')
          } catch (error: any) {
            // Don't block app initialization if registration fails
            // This is expected if backend is not deployed or not running
            if (error.message?.includes('Failed to fetch')) {
              console.warn(
                '⚠️ User registration skipped: Backend server not available.',
                'This is normal if backend is not deployed yet.'
              )
            } else {
              console.error('Failed to register user:', error)
            }
          }
        }
      } catch (error) {
        console.warn('Telegram WebApp SDK init failed, continuing in fallback mode.', error)
      }

    setMounted(true)
    }

    initializeApp()
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

  const sessionStartTimeRef = useRef<number>(0)
  const isRunningRef = useRef<boolean>(false)

  useEffect(() => {
    if (sessionState !== 'running') {
      isRunningRef.current = false
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current.goToAndStop(0, true)
      }
      return
    }

    // Store start time for proportional growth calculation
    isRunningRef.current = true
    sessionStartTimeRef.current = performance.now()
    setCurrentMultiplier(1)

    // Use requestAnimationFrame for smooth proportional growth
    let rafId: number
    const tick = (timestamp: number) => {
      if (!isRunningRef.current) return

      const elapsedSeconds = (timestamp - sessionStartTimeRef.current) / 1000
      // Proportional growth: value = startValue * (ratePerSecond ^ elapsedSeconds)
      const ratePerSecond = 1.35
      const next = parseFloat((1 * Math.pow(ratePerSecond, elapsedSeconds)).toFixed(2))

      if (next >= crashTargetRef.current) {
        isRunningRef.current = false
        setCurrentMultiplier(parseFloat(crashTargetRef.current.toFixed(2)))
        setSessionState('crashed')
        return
      }

      if (next >= MAX_MULTIPLIER) {
        isRunningRef.current = false
        setCurrentMultiplier(MAX_MULTIPLIER)
        setSessionState('crashed')
        return
      }

      setCurrentMultiplier(next)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      isRunningRef.current = false
      cancelAnimationFrame(rafId)
    }
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

  // Multiplier always uses the glowing style
  const multiplierClasses = 'glow-number'

  const activeIndex = useMemo(() => {
    const index = NAV_ITEMS.findIndex((item) => item.id === activeTab)
    return index === -1 ? 0 : index
  }, [activeTab])

  const indicatorStyle = useMemo(
    () => ({
      transform: `translateX(${activeIndex * 100}%)`,
    }),
    [activeIndex]
  )

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

        {/* Content based on active tab */}
        {activeTab === 'home' ? (
          <>
            {/* Home View */}
            <section className="relative mt-6 flex flex-1 flex-col">
              <div className="relative w-full rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
                
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome! 🚀</h1>
                  <p className="text-white/70 mb-6">Ready to launch and collect amazing gifts?</p>
                  
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎮</span>
                        <h3 className="text-lg font-semibold text-white">Game</h3>
                      </div>
                      <p className="text-sm text-white/60">Launch rockets and collect multipliers to win gifts!</p>
                    </div>
                    
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎁</span>
                        <h3 className="text-lg font-semibold text-white">Gifts</h3>
                      </div>
                      <p className="text-sm text-white/60">Browse and manage your collected gifts</p>
                    </div>
                    
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📊</span>
                        <h3 className="text-lg font-semibold text-white">Stats</h3>
                      </div>
                      <p className="text-sm text-white/60">Track your game performance and achievements</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'gifts' ? (
          <>
            {/* Gifts View */}
            <section className="relative mt-6 flex flex-1 flex-col">
              <div className="relative w-full rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
                
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-white mb-6">Your Gifts 🎁</h1>
                  
                  <div className="space-y-4">
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎁</div>
                      <p className="text-white/70 text-lg mb-2">No gifts yet</p>
                      <p className="text-white/50 text-sm">Play the game to collect amazing gifts!</p>
                    </div>
                  </div>
                  
                  {/* Placeholder for future gift grid */}
                  <div className="mt-6 grid grid-cols-2 gap-4 opacity-50">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white/5 aspect-square flex items-center justify-center backdrop-blur-lg"
                      >
                        <span className="text-4xl">🎁</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'stats' ? (
          <>
            {/* Stats View */}
            <section className="relative mt-6 flex flex-1 flex-col">
              <div className="relative w-full rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
                
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-white mb-6">Statistics 📊</h1>
                  
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Total Games</span>
                        <span className="text-xl font-bold text-white">0</span>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Best Multiplier</span>
                        <span className="text-xl font-bold text-white">—</span>
                      </div>
        </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Total Gifts</span>
                        <span className="text-xl font-bold text-white">0</span>
            </div>
            </div>
                    
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Win Rate</span>
                        <span className="text-xl font-bold text-white">—</span>
            </div>
          </div>
        </div>

                  <div className="mt-8 text-center">
                    <p className="text-white/50 text-sm">Start playing to see your stats!</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'profile' ? (
          <>
            {/* Profile View */}
            <section className="relative mt-6 flex flex-1 flex-col items-center justify-center">
              <div className="relative flex w-full max-w-xs flex-col items-center rounded-[32px] border border-white/10 bg-white/5 px-7 py-12 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
                
                {/* Avatar */}
                <div className="relative z-10 mb-6">
                  {telegramUser?.photo_url ? (
                    <img
                      src={telegramUser.photo_url}
                      alt="Profile"
                      className="h-32 w-32 rounded-full border-4 border-white/20 object-cover shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/20 bg-gradient-to-br from-[#36B8FF] to-[#2478FF] text-5xl shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                      👤
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="relative z-10 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    {telegramUser?.username ? `@${telegramUser.username}` : 'User'}
                  </h2>
                  {(telegramUser?.first_name || telegramUser?.last_name) && (
                    <p className="mt-2 text-base text-white/70">
                      {[telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ')}
                    </p>
                  )}
                  {!telegramUser && (
                    <p className="mt-2 text-sm text-white/50">Loading user data...</p>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
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
                <div className="relative z-20 flex flex-col items-center justify-center">
                  <div className="relative flex h-52 w-52 items-center justify-center">
                    <div className="absolute -bottom-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(89,145,255,0.45)_0%,rgba(89,145,255,0.05)_70%,transparent_100%)] blur-2xl" />
                    <Lottie
                      lottieRef={animationRef}
                      animationData={rocketAnimation}
                      loop
                      autoplay={false}
                      className="h-52 w-52"
                    />
                  </div>

                  {/* Live multiplier - below rocket */}
                  <div className="mt-4 flex flex-col items-center">
                    <span className={multiplierClasses}>
                      {displayedMultiplier}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-sm font-medium text-white/80">{sessionMessage}</div>

              {/* Actions - moved below game frame */}
              <section className="mt-6 flex gap-3">
                <button
                  className="btn flex-1 min-w-[120px] py-3 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none"
                  onClick={handleLaunch}
                  disabled={sessionState === 'running'}
                >
                  {launchLabel}
                </button>
                <button
                  className="btn flex-1 min-w-[120px] py-3 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none"
                  onClick={handleCollect}
                  disabled={collectDisabled}
                >
                  {collectLabel}
                </button>
              </section>

              {/* Player list - only show on game tab */}
              {activeTab === 'game' && (
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
              )}
            </section>
          </>
        )}

        {/* Inventory Block - shown on game tab */}
        {activeTab === 'game' && (
          <section className="mt-6 w-full">
            <div className="relative rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 shadow-[0_15px_35px_-15px_rgba(41,88,255,0.4)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_65%)]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🎒</span>
                    Inventory
                  </h3>
                  <span className="text-xs text-white/50">0 items</span>
                </div>
                
                {/* Placeholder for inventory items */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-lg opacity-50">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-lg opacity-50">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-lg opacity-50">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-lg opacity-50">
                    <span className="text-2xl">🎁</span>
                  </div>
                </div>
                
                <p className="text-xs text-white/40 mt-3 text-center">Your collected gifts will appear here</p>
              </div>
        </div>
          </section>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="neo-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-indicator" style={indicatorStyle} />
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              data-tab={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item${isActive ? ' nav-item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </main>
  )
}

