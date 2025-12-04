/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import WebApp from '@twa-dev/sdk'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'

import rocketAnimation from '@/public/animations/rocket.json'
import arrowsAnimation from '@/public/animations/arrows.json'
import { authApi, inventoryApi, giftProcessingApi, type InventoryResponse } from '@/lib/api'

type Gift = InventoryResponse['inventory'][number]

const STATIC_ASSET_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH !== '/'
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : ''

const buildStaticAssetPath = (relativePath: string): string => {
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${STATIC_ASSET_BASE_PATH}${normalized}`
}

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
const BOT_NAMES = [
  'Nova',
  'Cosmo',
  'Luna',
  'Orion',
  'Stella',
  'Astra',
  'Zen',
  'Blaze',
  'Ivy',
  'Axel',
  'Mira',
  'Vega',
  'Kira',
  'Rex',
  'Tara',
]


const PLAYER_AVATARS = [
  '/avatars/1a.jpg',
  '/avatars/2a.jpg',
  '/avatars/3a.jpg',
  '/avatars/5a.jpg',
  '/avatars/6a.jpg',
  '/avatars/7a.jpg',
  '/avatars/8a.jpg',
  '/avatars/11a.jpg',
  '/avatars/12a.jpg',
  '/avatars/13a.jpg',
  '/avatars/15a.jpg',
  '/avatars/16a.jpg',
  '/avatars/33a.jpg',
  '/avatars/44v.jpg',
  '/avatars/77a.jpg',
  '/avatars/122a.jpg',
  '/avatars/123a.jpg',
  '/avatars/133a.jpg',
  '/avatars/143a.jpg',
  '/avatars/154a.jpg',
  '/avatars/bb2.jpg',
  '/avatars/bbb2.jpg',
  '/avatars/cc3.jpg',
  '/avatars/cxz.jpg',
  '/avatars/gg2.jpg',
  '/avatars/zzz1.jpg',
].map(buildStaticAssetPath)

const FAKE_USERNAMES = [
  'StarWhale',
  'CryptoLion',
  'LunaSpark',
  'OrbitAce',
  'PixelPilot',
  'MoonWalker',
  'GalaxyNova',
  'ZenithFox',
  'RocketMira',
  'AstroIvy',
  'Skylark',
  'SolarTide',
  'PulseRay',
  'NebulaCat',
  'IonWave',
  'QuasarJay',
  'TurboLynx',
  'VortexRay',
  'DriftKing',
  'EchoByte',
  'OrbitRow',
  'HyperNova',
  'Stardust',
  'CometRex',
  'PhotonBee',
  'MetalPunk',
  'RocketRosa',
  'VantaRay',
  'ZenPulse',
]
const MIN_BOT_COUNT = 3
const MAX_BOT_COUNT = 12

type SessionState = 'idle' | 'countdown' | 'running' | 'crashed'

interface BotPlayer {
  id: string
  name: string
  username: string
  avatar: string
  giftAnimationData: any | null
  giftFileName: string
  status: 'countdown' | 'flying' | 'cashed' | 'crashed'
  cashedAt?: number
  result?: 'won' | 'lost'
  willCollectAt?: number // Preferred multiplier when bot will decide to collect
  greediness: number // 0-1, higher = more greedy, waits longer, more likely to crash
}

const parseAnimationData = (raw: unknown, giftId: string): any | null => {
  if (raw === null || raw === undefined) return null

  const value = typeof raw === 'string' ? raw.trim() : raw
  if (value === '' || value === 'null' || value === 'undefined') {
    return null
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (parsed && typeof parsed === 'object' && 'v' in parsed) {
      return parsed
    }

    console.warn('Invalid Lottie structure for gift:', giftId)
    return null
  } catch (error) {
    console.warn('Failed to parse animation_data for gift:', giftId, error)
    return null
  }
}

const getRandomItem = <T,>(collection: T[]): T =>
  collection[Math.floor(Math.random() * collection.length)]

const getRandomBetween = (min: number, max: number, precision = 2): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(precision))

// Cache for first frame images
const firstFrameCache = new Map<string, string>()

/**
 * Extract the first frame from a Lottie animation and convert it to an image data URL
 */
const extractFirstFrame = async (animationData: any, giftId: string, size = 256): Promise<string | null> => {
  // Check cache first
  if (firstFrameCache.has(giftId)) {
    return firstFrameCache.get(giftId) || null
  }

  try {
    // Dynamically import lottie-web to avoid SSR issues
    const lottieModule = await import('lottie-web')
    const lottie = lottieModule.default || lottieModule
    
    // Create a canvas element
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.warn('Failed to get canvas context for gift:', giftId)
      return null
    }

    // Create a container for the animation (off-screen)
    const container = document.createElement('div')
    container.style.width = `${size}px`
    container.style.height = `${size}px`
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    document.body.appendChild(container)

    // Render the first frame
    const anim = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData,
    })

    // Wait for animation to be ready and extract first frame
    return new Promise<string | null>((resolve) => {
      const onReady = () => {
        try {
          // Go to first frame (frame 0)
          anim.goToAndStop(0, true)
          
          // Get the canvas from the animation
          const animCanvas = container.querySelector('canvas') as HTMLCanvasElement
          if (animCanvas) {
            // Draw the animation canvas to our canvas
            ctx.drawImage(animCanvas, 0, 0, size, size)
            
            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png')
            firstFrameCache.set(giftId, dataUrl)
            
            // Cleanup
            anim.destroy()
            document.body.removeChild(container)
            
            resolve(dataUrl)
          } else {
            anim.destroy()
            document.body.removeChild(container)
            resolve(null)
          }
        } catch (error) {
          console.warn('Error extracting frame:', error)
          anim.destroy()
          document.body.removeChild(container)
          resolve(null)
        }
      }

      // Try both event names (different versions of lottie-web)
      anim.addEventListener('DOMLoaded', onReady)
      anim.addEventListener('data_ready', onReady)
      
      // Fallback timeout
      setTimeout(() => {
        if (container.parentNode) {
          try {
            anim.goToAndStop(0, true)
            const animCanvas = container.querySelector('canvas') as HTMLCanvasElement
            if (animCanvas) {
              ctx.drawImage(animCanvas, 0, 0, size, size)
              const dataUrl = canvas.toDataURL('image/png')
              firstFrameCache.set(giftId, dataUrl)
              anim.destroy()
              document.body.removeChild(container)
              resolve(dataUrl)
            } else {
              anim.destroy()
              document.body.removeChild(container)
              resolve(null)
            }
          } catch (error) {
            anim.destroy()
            if (container.parentNode) {
              document.body.removeChild(container)
            }
            resolve(null)
          }
        }
      }, 2000)
    })
  } catch (error) {
    console.warn('Failed to extract first frame for gift:', giftId, error)
    return null
  }
}

const generateBotPlayers = async (crashPoint: number): Promise<BotPlayer[]> => {
  const botCount = Math.floor(Math.random() * (MAX_BOT_COUNT - MIN_BOT_COUNT + 1)) + MIN_BOT_COUNT
  const namesPool = [...BOT_NAMES].sort(() => Math.random() - 0.5)
  const usernamesPool = [...FAKE_USERNAMES].sort(() => Math.random() - 0.5)
  const avatarPool = [...PLAYER_AVATARS].sort(() => Math.random() - 0.5)
  const giftPool = [...GIFT_FILES].sort(() => Math.random() - 0.5)
  const crashBuffer = Math.max(0.05, crashPoint * 0.1)
  const maxSafePoint = Math.max(1.0, parseFloat((crashPoint - crashBuffer).toFixed(2)))
  const minSafePoint = Math.max(1.0, parseFloat((maxSafePoint - 0.35).toFixed(2)))

  const bots = await Promise.all(
    Array.from({ length: botCount }).map(async (_, index) => {
      // Greediness: 0 = conservative (collects early), 1 = greedy (waits long, risks crash)
      const greediness = Math.random()
      // Greedy bots prefer higher multipliers, conservative bots prefer lower
      const preferredMultiplier = minSafePoint + (maxSafePoint - minSafePoint) * greediness
      const willCollectAt = getRandomBetween(
        Math.max(minSafePoint, preferredMultiplier - 0.5),
        Math.min(maxSafePoint, preferredMultiplier + 0.5),
        2
      )
      const avatar = avatarPool[index % avatarPool.length]
      const baseName = namesPool[index % namesPool.length] ?? `Bot ${index + 1}`
      const usernameHandle = usernamesPool[index % usernamesPool.length] ?? `@bot${index + 1}`
      const giftFileName = giftPool[index % giftPool.length]
      const giftAnimationData = await loadGiftAnimation(giftFileName)

      return {
        id: `bot-${Date.now()}-${index}`,
        name: baseName,
        username: usernameHandle.startsWith('@') ? usernameHandle : `@${usernameHandle}`,
        avatar,
        giftAnimationData,
        giftFileName,
        status: 'countdown' as const,
        willCollectAt,
        greediness,
      }
    })
  )

  return bots
}

interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

// Component to display first frame of Lottie animation as static image
function LottieFirstFrame({ animationData, giftId, className = '', alt = 'Gift' }: { 
  animationData: any
  giftId: string
  className?: string
  alt?: string
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    let mounted = true

    const loadFirstFrame = async () => {
      try {
        const frameUrl = await extractFirstFrame(animationData, giftId, 512)
        if (mounted) {
          setImageSrc(frameUrl)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Failed to load first frame:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadFirstFrame()

    return () => {
      mounted = false
    }
  }, [animationData, giftId])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin text-4xl">🎁</div>
      </div>
    )
  }

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="text-4xl">🎁</span>
    </div>
  )
}

function GiftAnimationPlayer({
  animationData,
  className = '',
  playKey,
  onComplete,
}: {
  animationData: any
  className?: string
  playKey: number
  onComplete?: () => void
}) {
  const animationRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (!playKey || !animationRef.current) {
      return
    }

    const instance = animationRef.current
    const eventTarget = instance as {
      addEventListener?: (event: string, cb: () => void) => void
      removeEventListener?: (event: string, cb: () => void) => void
    }
    const handleComplete = () => {
      onComplete?.()
    }

    instance.goToAndStop(0, true)
    instance.setSpeed?.(1)
    instance.play()
    eventTarget.addEventListener?.('complete', handleComplete)

    return () => {
      eventTarget.removeEventListener?.('complete', handleComplete)
      instance.stop()
    }
  }, [playKey, onComplete])

  return (
    <Lottie
      lottieRef={animationRef}
      animationData={animationData}
      loop={false}
      autoplay={false}
      className={className}
    />
  )
}

// List of available gift files
const GIFT_FILES = [
  'cleaned-astralshard-arctite.json',
  'cleaned-astralshard-barbed.json',
  'cleaned-bunnymuffin-chillout.json',
  'cleaned-diamondring-frostband.json',
  'cleaned-diamondring-midnight.json',
  'cleaned-diamondring-redwedding.json',
  'cleaned-durovscap-falcon.json',
  'cleaned-easteregg-deepfreeze.json',
  'cleaned-eternalcandle-vanillaoasis.json',
  'cleaned-flyingbroom-subzero.json',
  'cleaned-gingercookie-frostbite.json',
  'cleaned-hangingstar-tropicana.json',
  'cleaned-hexpot-coldbrew.json',
  'cleaned-hypnolollipop-compactdisk.json',
  'cleaned-jellybunny-jevil.json',
  'cleaned-jinglebells-icechime.json',
  'cleaned-kissedfrog-icefrog.json',
  'cleaned-lolpop-darkdelight.json',
  'cleaned-lootbag-aquaatoll.json',
  'cleaned-lootbag-Vertd\'Eau.json',
  'cleaned-lunarsnake-fallenstar.json',
  'cleaned-minioscar-deepfreeze.json',
  'cleaned-nekohelmet-blackout.json',
  'cleaned-nekohelmet-greyshark.json',
  'cleaned-nekohelmet-lagoon.json',
  'cleaned-partysparkler-cyansizzle.json',
  'cleaned-perfumebottle-noir.json',
  'cleaned-plushpepe-frozen.json',
  'cleaned-plushpepe-guccileap.json',
  'cleaned-plushpepe-marble.json',
  'cleaned-plushpepe-peppermint.json',
  'cleaned-recordplayer-retrosilver.json',
  'cleaned-recordplayer-winter.json',
  'cleaned-sakuraflower-icebound.json',
  'cleaned-santahat-thinice.json',
  'cleaned-scaredcat-mentos.json',
  'cleaned-sharptongue-spicymint.json',
  'cleaned-signetring-spades.json',
  'cleaned-signetring-titanium.json',
  'cleaned-snowglobe-oceanoasis.json',
  'cleaned-spicedwine-overice.json',
  'cleaned-spyagaric-bliss.json',
  'cleaned-swisswatch-fulltint.json',
  'cleaned-swisswatch-icedout.json',
  'cleaned-swisswatch-timeless.json',
  'cleaned-tamagadget-vividsky.json',
  'cleaned-tophat-alabaster.json',
  'cleaned-toybear-darkknight.json',
  'cleaned-toybear-snowman.json',
  'cleaned-vintagecigar-cobalt.json',
  'cleaned-vintagecigar-icecold.json',
  'cleaned-vintagecigar-oilbaron.json',
  'cleaned-voodoodoll-iceblock.json',
  'cleaned-winterwreath-spirit.json',
  'darkaura-cleaned-crystalball-9027.json',
  'darkaura-cleaned-eternalrose-7069.json',
  'darkaura-cleaned-genielamp-4594.json',
  'darkaura-cleaned-lootbag-7239.json',
  'girlish-cleaned-astralshard-3087.json',
  'girlish-cleaned-eternalcandle-17246.json',
  'girlish-cleaned-homemadecake-20291.json',
  'girlish-cleaned-iongem-2891.json',
  'girlish-cleaned-lolpop-271620.json',
  'girlish-cleaned-lootbag-7825.json',
  'girlish-cleaned-nekohelmet-402.json',
  'girlish-cleaned-plushpepe-2707.json',
  'girlish-cleaned-starnotepad-34945.json',
  'girlish-cleaned-toybear-31469.json',
  'girlish-cleaned-winterwreath-9594.json',
]

// Cache for loaded gift animations
const giftAnimationCache = new Map<string, any>()

const loadGiftAnimation = async (fileName: string): Promise<any | null> => {
  if (giftAnimationCache.has(fileName)) {
    return giftAnimationCache.get(fileName)
  }

  try {
    const giftPath = buildStaticAssetPath(`/gifts/${fileName}`)
    const response = await fetch(giftPath)
    if (!response.ok) {
      console.warn(`Failed to load gift: ${fileName} from ${giftPath}`)
      return null
    }
    const data = await response.json()
    giftAnimationCache.set(fileName, data)
    return data
  } catch (error) {
    console.warn(`Error loading gift ${fileName}:`, error)
    return null
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('home')
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [targetCrashMultiplier, setTargetCrashMultiplier] = useState<number | null>(null)
  const [collectedMultiplier, setCollectedMultiplier] = useState<number | null>(null)
  const [inventory, setInventory] = useState<Gift[]>([])
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([])
  const [showGiftSelectionModal, setShowGiftSelectionModal] = useState(false)
  const [isQueuedForNextSession, setIsQueuedForNextSession] = useState(false)
  const [isUserInCurrentSession, setIsUserInCurrentSession] = useState(false)
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<{ id: string; key: number } | null>(null)
  const [playingGiftAnimations, setPlayingGiftAnimations] = useState<Map<string, number>>(new Map())
  const [botPlayers, setBotPlayers] = useState<BotPlayer[]>([])
  const animationRef = useRef<LottieRefCurrentProps>(null)
  const crashTargetRef = useRef<number>(10)
  const countdownEndsAtRef = useRef<number | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])

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

  const startCountdownCycle = useCallback(async (durationSeconds = 10) => {
    const crashPoint = getRandomBetween(1.4, 12, 2)
    crashTargetRef.current = crashPoint
    countdownEndsAtRef.current = Date.now() + durationSeconds * 1000
    setTargetCrashMultiplier(crashPoint)
    setSessionState('countdown')
    setCountdown(durationSeconds)
    setCurrentMultiplier(1)
    setCollectedMultiplier(null)
    setIsUserInCurrentSession(false)
    // Generate new bots for the next session
    const newBots = await generateBotPlayers(crashPoint)
    setBotPlayers(newBots)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (countdownEndsAtRef.current) return
    startCountdownCycle()
  }, [mounted, startCountdownCycle])

  useEffect(() => {
    if (!mounted) return
    if (sessionState !== 'crashed') return

    const timer = setTimeout(() => {
      startCountdownCycle()
    }, 4000)

    return () => clearTimeout(timer)
  }, [mounted, sessionState, startCountdownCycle])

  // Update countdown display
  useEffect(() => {
    if (sessionState !== 'countdown' || !countdownEndsAtRef.current) {
      if (sessionState !== 'countdown') {
        setCountdown(0)
      }
      return
    }

      const updateCountdown = () => {
      if (!countdownEndsAtRef.current) return
      const remaining = Math.max(0, countdownEndsAtRef.current - Date.now())
          setCountdown(Math.ceil(remaining / 1000))
      }
      
      updateCountdown()
    const interval = setInterval(updateCountdown, 200)
      return () => clearInterval(interval)
  }, [sessionState])

  useEffect(() => {
    if (sessionState !== 'countdown') return
    if (countdown > 0) return

    countdownEndsAtRef.current = null
    setSessionState('running')
    setCurrentMultiplier(1)
    setCollectedMultiplier(null)
    setBotPlayers((prev) =>
      prev.map((bot) =>
        bot.status === 'cashed'
          ? bot
          : {
              ...bot,
              status: 'flying',
              cashedAt: undefined,
              result: undefined,
            },
      ),
    )

    if (isQueuedForNextSession) {
      setIsUserInCurrentSession(true)
      setIsQueuedForNextSession(false)
    } else {
      setIsUserInCurrentSession(false)
    }
  }, [countdown, isQueuedForNextSession, sessionState])

  // Process all unprocessed gifts when app loads
  useEffect(() => {
    if (mounted && telegramUser) {
      const processAllGifts = async () => {
        try {
          console.log('🔄 Processing all unprocessed gifts...')
          const result = await giftProcessingApi.processAllUnprocessed()
          console.log('✅ Finished processing gifts:', result)
          
          // Refetch inventory after processing
          try {
            const updatedResponse: InventoryResponse = await inventoryApi.getInventory()
            setInventory(updatedResponse.inventory || [])
          } catch (fetchError) {
            console.error('Failed to refetch inventory after processing:', fetchError)
          }
        } catch (error: any) {
          console.warn('Failed to process unprocessed gifts:', error.message || error)
          // Don't block app if processing fails - might be auth issue or no gifts to process
        }
      }
      // Process gifts after a short delay to ensure user is authenticated
      setTimeout(processAllGifts, 2000)
    }
  }, [mounted, telegramUser])

  // Fetch inventory when gifts or game tab is active
  useEffect(() => {
    const shouldLoadInventory = mounted && telegramUser && (activeTab === 'gifts' || activeTab === 'game')

    if (shouldLoadInventory) {
      const fetchInventory = async () => {
        try {
          setLoadingInventory(true)
          const response: InventoryResponse = await inventoryApi.getInventory()
          const gifts = response.inventory || []
          setInventory(gifts)
          
          // Check if any gifts need processing
          const needsProcessing = gifts.some(g => g.gift_url && !g.animation_data)
          if (needsProcessing) {
            // Trigger processing in background
            giftProcessingApi.processAllUnprocessed()
              .then((result) => {
                console.log('Background processing completed:', result)
                // Refetch inventory after processing
                return inventoryApi.getInventory()
              })
              .then((updatedResponse: InventoryResponse) => {
                setInventory(updatedResponse.inventory || [])
              })
              .catch(err => {
                console.warn('Background processing failed:', err)
              })
          }
        } catch (error: any) {
          console.error('Failed to fetch inventory:', error)
          // Don't show error if it's an auth issue - user might not be authenticated yet
          if (error.message?.includes('Unauthorized')) {
            console.warn('⚠️ Authentication required to view inventory')
          }
          setInventory([])
        } finally {
          setLoadingInventory(false)
        }
      }
      fetchInventory()
    }
  }, [activeTab, mounted, telegramUser])

  useEffect(() => {
    if (!selectedGiftId && inventory.length > 0) {
      setSelectedGiftId(inventory[0].id)
    } else if (inventory.length === 0) {
      setSelectedGiftId(null)
    }
  }, [inventory, selectedGiftId])

  const triggerGiftAnimation = useCallback((giftId: string) => {
    setActiveGiftAnimation({ id: giftId, key: Date.now() })
  }, [])

  const handleGiftAnimationComplete = useCallback(() => {
    setActiveGiftAnimation(null)
  }, [])

  const triggerPlayerGiftAnimation = useCallback((playerId: string) => {
    setPlayingGiftAnimations((prev) => {
      const newMap = new Map(prev)
      newMap.set(playerId, Date.now())
      return newMap
    })
  }, [])

  const handlePlayerGiftAnimationComplete = useCallback((playerId: string) => {
    setPlayingGiftAnimations((prev) => {
      const newMap = new Map(prev)
      newMap.delete(playerId)
      return newMap
    })
  }, [])
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
    if (sessionState === 'idle' || sessionState === 'countdown') {
      return '1.00x'
    }

    const value =
      sessionState === 'running'
        ? currentMultiplier
        : targetCrashMultiplier ?? currentMultiplier

    return `${Math.min(value, MAX_MULTIPLIER).toFixed(2)}x`
  }, [currentMultiplier, sessionState, targetCrashMultiplier])

  const canJoinSession = sessionState === 'countdown'

  const sessionMessage = useMemo(() => {
    switch (sessionState) {
      case 'countdown':
        return isQueuedForNextSession
          ? `You&apos;re locked in! Launching in ${countdown}s...`
          : `Next session begins in ${countdown}s`
      case 'running':
        if (collectedMultiplier !== null) {
          return `You collected at ${collectedMultiplier.toFixed(2)}x - Watching rocket...`
        }
        return `Live multiplier: ${currentMultiplier.toFixed(2)}x`
      case 'crashed':
        return `Rocket crashed at ${(targetCrashMultiplier ?? currentMultiplier).toFixed(2)}x`
      default:
        return 'Waiting for next session...'
    }
  }, [
    collectedMultiplier,
    countdown,
    currentMultiplier,
    isQueuedForNextSession,
    sessionState,
    targetCrashMultiplier,
  ])

  const defaultAvatar = PLAYER_AVATARS[0]

  const players = useMemo(() => {
    const botEntries = botPlayers.map((bot) => {
      let bgColor = 'bg-white/10'
      let frameColor = 'border-white/20' // Default frame color
      
      // During running: normal background if not collected
      // After collection: green
      // After crash if didn't collect: red
      if (bot.status === 'cashed') {
        bgColor = 'bg-green-500/30'
        frameColor = 'border-green-400' // Green frame for winners
      } else if (bot.status === 'crashed') {
        bgColor = 'bg-red-500/30'
        frameColor = 'border-red-400' // Red frame for losers
      } else if (sessionState === 'running' && bot.status === 'flying') {
        bgColor = 'bg-white/10' // Normal during running
        frameColor = 'border-white/20' // Neutral frame during flight
      }

      return {
        id: bot.id,
        name: bot.name,
        username: bot.username,
        avatar: bot.avatar,
        giftAnimationData: bot.giftAnimationData,
        giftFileName: bot.giftFileName,
        amount: bot.status === 'cashed' && bot.cashedAt
          ? `${bot.cashedAt.toFixed(2)}x`
          : sessionState === 'running'
            ? `${currentMultiplier.toFixed(2)}x`
            : '—',
        icon: '🤖',
        status:
          bot.status === 'cashed'
            ? `Collected at ${bot.cashedAt?.toFixed(2) ?? '0.00'}x`
            : bot.status === 'crashed'
              ? 'Crashed'
              : sessionState === 'countdown'
                ? 'Ready'
                : 'In flight',
        bgColor,
        frameColor,
      }
    })

    let userBgColor = 'bg-white/10'
    // During running: normal if not collected, green if collected
    // After crash: red if didn't collect, green if collected
    if (sessionState === 'running' && isUserInCurrentSession) {
      userBgColor = collectedMultiplier !== null ? 'bg-green-500/30' : 'bg-white/10'
    } else if (sessionState === 'crashed' && isUserInCurrentSession) {
      userBgColor = collectedMultiplier !== null ? 'bg-green-500/30' : 'bg-red-500/30'
    }

    let userFrameColor = 'border-white/20'
    if (sessionState === 'running' && isUserInCurrentSession) {
      userFrameColor = collectedMultiplier !== null ? 'border-green-400' : 'border-white/20'
    } else if (sessionState === 'crashed' && isUserInCurrentSession) {
      userFrameColor = collectedMultiplier !== null ? 'border-green-400' : 'border-red-400'
    }

    const youEntry = {
      id: 'you',
        name: 'You',
      username: telegramUser?.username ? `@${telegramUser.username}` : '@you',
      avatar: telegramUser?.photo_url ?? botPlayers[0]?.avatar ?? defaultAvatar,
      giftAnimationData: null, // User doesn't have a gift bet in the list
      giftFileName: '',
        amount:
        collectedMultiplier !== null
            ? `${collectedMultiplier.toFixed(2)}x`
          : sessionState === 'running'
              ? `${currentMultiplier.toFixed(2)}x`
              : '—',
        icon: '🧑',
      status: isQueuedForNextSession && sessionState === 'countdown'
        ? `Joining in ${countdown}s`
        : isUserInCurrentSession && sessionState === 'running' && collectedMultiplier === null
              ? 'Live'
          : collectedMultiplier !== null
            ? `Collected ${collectedMultiplier.toFixed(2)}x`
                : sessionState === 'crashed' && isUserInCurrentSession
              ? 'Crashed'
                : sessionState === 'countdown'
                ? 'Ready'
                : 'Watching',
      bgColor: userBgColor,
      frameColor: userFrameColor,
    }

    return [...botEntries, youEntry]
  }, [
    botPlayers,
    countdown,
    collectedMultiplier,
    currentMultiplier,
    defaultAvatar,
    isQueuedForNextSession,
    isUserInCurrentSession,
    sessionState,
    telegramUser?.username,
    telegramUser?.photo_url,
  ])

  const activePlayerCount = useMemo(
    () => botPlayers.length + (isUserInCurrentSession ? 1 : 0),
    [botPlayers, isUserInCurrentSession],
  )

  const playerChips = useMemo(() => {
    const botChips = botPlayers.map((bot) => {
      let tone = 'text-white/60'
      let statusLabel = sessionState === 'running' ? `${currentMultiplier.toFixed(2)}x` : 'Ready'
      let bgColor = 'bg-white/5'

      if (bot.status === 'cashed') {
        tone = 'text-green-400'
        statusLabel = `Collected @ ${bot.cashedAt?.toFixed(2) ?? '0.00'}x`
        bgColor = 'bg-green-500/30'
      } else if (bot.status === 'crashed') {
        tone = 'text-red-400'
        statusLabel = 'Crashed'
        bgColor = 'bg-red-500/30'
      } else if (sessionState === 'running' && bot.status === 'flying') {
        bgColor = 'bg-white/5' // Normal during running
        statusLabel = `${currentMultiplier.toFixed(2)}x`
      }

      return {
        id: bot.id,
        avatar: bot.avatar,
        username: bot.username,
        giftAnimationData: bot.giftAnimationData,
        giftFileName: bot.giftFileName,
        tone,
        statusLabel,
        bgColor,
      }
    })

    // Add user chip if they're in the session
    if (isUserInCurrentSession && sessionState === 'running') {
      const userChip = {
        id: 'you',
        avatar: telegramUser?.photo_url ?? botPlayers[0]?.avatar ?? defaultAvatar,
        username: telegramUser?.username ? `@${telegramUser.username}` : '@you',
        giftAnimationData: null,
        giftFileName: '',
        tone: collectedMultiplier !== null ? 'text-green-400' : 'text-white/60',
        statusLabel: collectedMultiplier !== null 
          ? `Collected @ ${collectedMultiplier.toFixed(2)}x`
          : `${currentMultiplier.toFixed(2)}x`,
        bgColor: collectedMultiplier !== null ? 'bg-green-500/30' : 'bg-white/5',
      }
      return [...botChips, userChip]
    }

    return botChips
  }, [botPlayers, isUserInCurrentSession, sessionState, collectedMultiplier, currentMultiplier, telegramUser, defaultAvatar])

  const queueNextSession = useCallback(() => {
    if (sessionState !== 'countdown' || isQueuedForNextSession) {
      return
    }

    if (inventory.length === 0) {
      alert('You need at least one gift in your inventory to join a session')
      return
    }

    // Open modal for gift selection
    setShowGiftSelectionModal(true)
    setSelectedGiftIds([])
  }, [inventory, isQueuedForNextSession, sessionState])

  const handleGiftSelectionContinue = useCallback(() => {
    if (selectedGiftIds.length === 0) {
      alert('Please select at least one gift')
      return
    }

    setShowGiftSelectionModal(false)
    setIsQueuedForNextSession(true)
    // Use first selected gift for backward compatibility (if needed elsewhere)
    setSelectedGiftId(selectedGiftIds[0])
  }, [selectedGiftIds])

  const handleGiftSelectionCancel = useCallback(() => {
    setShowGiftSelectionModal(false)
    setSelectedGiftIds([])
  }, [])

  const toggleGiftSelection = useCallback((giftId: string) => {
    setSelectedGiftIds((prev) => {
      if (prev.includes(giftId)) {
        return prev.filter((id) => id !== giftId)
      }
      return [...prev, giftId]
    })
  }, [])

  const cancelQueuedSession = useCallback(() => {
    setIsQueuedForNextSession(false)
  }, [])

  const handleCollect = useCallback(() => {
    if (sessionState !== 'running' || collectedMultiplier !== null) return
      setCollectedMultiplier(currentMultiplier)
  }, [collectedMultiplier, currentMultiplier, sessionState])

  useEffect(() => {
    if (sessionState === 'running') {
      const targetCrash = targetCrashMultiplier ?? crashTargetRef.current
      const distanceToCrash = targetCrash - currentMultiplier
      const progressToCrash = Math.max(0, Math.min(1, (currentMultiplier - 1) / (targetCrash - 1)))
      
      setBotPlayers((prev) =>
        prev.map((bot) => {
          if (bot.status === 'cashed' || bot.status === 'crashed') {
            return bot
          }

          // Calculate collection chance based on bot's greediness and current situation
          let collectChance = 0.01 // 1% base chance per update
          
          if (bot.willCollectAt) {
            const distanceToPreferred = Math.abs(currentMultiplier - bot.willCollectAt)
            const nearPreferred = distanceToPreferred < 0.3
            
            if (nearPreferred) {
              // High chance when at preferred multiplier
              collectChance = 0.25
            } else if (currentMultiplier >= bot.willCollectAt) {
              // Past preferred point - chance increases with greediness
              collectChance = 0.05 + (bot.greediness * 0.1)
            } else {
              // Before preferred point - lower chance, but increases as we approach
              const approachFactor = Math.max(0, 1 - distanceToPreferred / 2)
              collectChance = 0.01 + (approachFactor * 0.05)
            }
          }
          
          // As we get closer to crash, conservative bots collect more, greedy bots less
          if (distanceToCrash < 0.5) {
            // Very close to crash - conservative bots panic, greedy bots hold
            if (bot.greediness < 0.5) {
              collectChance = 0.4 // Conservative bots collect
            } else {
              collectChance = Math.max(0.01, collectChance * 0.3) // Greedy bots hold
            }
          } else if (distanceToCrash < 1.0) {
            // Close to crash
            collectChance = collectChance * (1 - bot.greediness * 0.5)
          }
          
          // Randomly decide to collect
          if (Math.random() < collectChance) {
            return {
              ...bot,
              status: 'cashed',
              cashedAt: currentMultiplier,
              result: 'won',
            }
          }

          return { ...bot, status: 'flying' }
        }),
      )
    } else if (sessionState === 'countdown') {
      // Keep crashed and cashed status during countdown - only reset flying bots
      setBotPlayers((prev) =>
        prev.map((bot) =>
          bot.status === 'crashed' || bot.status === 'cashed'
            ? bot
            : { ...bot, status: 'countdown', result: undefined, cashedAt: undefined },
        ),
      )
    }
  }, [currentMultiplier, sessionState, targetCrashMultiplier])

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
      
      // Total time to reach 20x: 30 seconds
      // Phase 1: 1x to 2x (takes 5 seconds)
      // Phase 2: 2x to 20x (takes 25 seconds, slower growth)
      let next: number
      const PHASE1_DURATION = 5 // seconds to reach 2x
      
      if (elapsedSeconds < PHASE1_DURATION) {
        // Phase 1: Slow growth from 1x to 2x in 5 seconds
        // Using exponential: 2 = 1 * rate^5, so rate = 2^(1/5) ≈ 1.1487
        const phase1Rate = Math.pow(2, 1 / PHASE1_DURATION)
        next = parseFloat((1 * Math.pow(phase1Rate, elapsedSeconds)).toFixed(2))
      } else {
        // Phase 2: Slower growth from 2x to 20x in 25 seconds
        // We need: 20 = 2 * rate^25, so rate = 10^(1/25) ≈ 1.0965
        const timeAfter2x = elapsedSeconds - PHASE1_DURATION
        const phase2Rate = Math.pow(10, 1 / 25) // Rate to go from 2x to 20x in 25 seconds
        next = parseFloat((2 * Math.pow(phase2Rate, timeAfter2x)).toFixed(2))
      }

      const targetCrash = targetCrashMultiplier ?? crashTargetRef.current
      
      if (next >= targetCrash) {
        isRunningRef.current = false
        const finalValue = parseFloat(targetCrash.toFixed(2))
        setCurrentMultiplier(finalValue)
        setSessionState('crashed')
        setBotPlayers((prev) =>
          prev.map((bot) =>
            bot.status === 'cashed'
              ? { ...bot, result: 'won' }
              : { ...bot, status: 'crashed', result: 'lost' },
          ),
        )
        setIsUserInCurrentSession(false)
        return
      }

      if (next >= MAX_MULTIPLIER) {
        isRunningRef.current = false
        setCurrentMultiplier(MAX_MULTIPLIER)
        setSessionState('crashed')
        setBotPlayers((prev) =>
          prev.map((bot) =>
            bot.status === 'cashed'
              ? { ...bot, result: 'won' }
              : { ...bot, status: 'crashed', result: 'lost' },
          ),
        )
        setIsUserInCurrentSession(false)
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
  }, [sessionState, targetCrashMultiplier])

  useEffect(() => {
    if (!animationRef.current) return

    if (sessionState === 'running') {
      animationRef.current.setSpeed(1.1)
      animationRef.current.play()
    } else {
      animationRef.current.stop()
    }
  }, [sessionState])

  // Multiplier always uses the glowing style
  const multiplierClasses = 'glow-number'

  const activeIndex = useMemo(() => {
    const index = NAV_ITEMS.findIndex((item) => item.id === activeTab)
    return index === -1 ? 0 : index
  }, [activeTab])

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ transform: 'translateX(0)' })

  // Update indicator position based on active tab
  useEffect(() => {
    if (!mounted) return

    const updateIndicatorPosition = () => {
      const activeItem = navItemsRef.current[activeIndex]
      const nav = navRef.current
      if (!activeItem || !nav) return

      const navRect = nav.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      const indicatorLeft = 4 // CSS left: 4px
      const translateX = itemRect.left - navRect.left - indicatorLeft

      setIndicatorStyle({
        transform: `translateX(${translateX}px)`,
      })
    }

    // Update immediately
    updateIndicatorPosition()

    // Update on window resize
    window.addEventListener('resize', updateIndicatorPosition)
    return () => window.removeEventListener('resize', updateIndicatorPosition)
  }, [activeIndex, mounted])

  const joinButtonLabel = isQueuedForNextSession ? 'Cancel Join' : 'Join Next Session'
  const joinButtonDisabled =
    !isQueuedForNextSession && (!canJoinSession || inventory.length === 0)
  const inventoryCountLabel = loadingInventory
    ? 'Loading...'
    : `${inventory.length} item${inventory.length === 1 ? '' : 's'}`
  const collectLabel =
    sessionState === 'running' && collectedMultiplier !== null
      ? `Collected at ${collectedMultiplier.toFixed(2)}x`
      : sessionState === 'running'
        ? `Collect ${currentMultiplier.toFixed(2)}x`
          : 'Collect'
  const collectDisabled: boolean = 
    sessionState !== 'running' || 
    collectedMultiplier !== null ||
    !isUserInCurrentSession

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
                    <button
                      type="button"
                      onClick={() => setActiveTab('game')}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg hover:bg-white/15 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎮</span>
                        <h3 className="text-lg font-semibold text-white">Game</h3>
                      </div>
                      <p className="text-sm text-white/60">Launch rockets and collect multipliers to win gifts!</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveTab('gifts')}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg hover:bg-white/15 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎁</span>
                        <h3 className="text-lg font-semibold text-white">Gifts</h3>
                      </div>
                      <p className="text-sm text-white/60">Browse and manage your collected gifts</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveTab('stats')}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-lg hover:bg-white/15 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📊</span>
                        <h3 className="text-lg font-semibold text-white">Stats</h3>
                      </div>
                      <p className="text-sm text-white/60">Track your game performance and achievements</p>
                    </button>
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
                  
                  {loadingInventory ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 animate-pulse">🎁</div>
                      <p className="text-white/70 text-lg">Loading gifts...</p>
                    </div>
                  ) : inventory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎁</div>
                      <p className="text-white/70 text-lg mb-2">No gifts yet</p>
                      <p className="text-white/50 text-sm">Play the game to collect amazing gifts!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {inventory.map((gift) => {
                        const isProcessing = gift.gift_url && !gift.animation_data
                        const animationData = parseAnimationData(gift.animation_data, gift.id)
                        const hasStaticPreview = Boolean(gift.image_url)
                        const isPlaying = activeGiftAnimation?.id === gift.id
                        
                        return (
                          <button
                            type="button"
                            key={gift.id}
                            onClick={() => {
                              if (animationData) {
                                triggerGiftAnimation(gift.id)
                              }
                            }}
                            className="relative rounded-2xl border border-white/10 bg-white/5 aspect-square overflow-hidden backdrop-blur-lg hover:bg-white/10 transition-all text-left"
                          >
                            {isProcessing && !animationData && !hasStaticPreview ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <div className="animate-spin text-4xl mb-2">🎁</div>
                                <p className="text-white/60 text-xs text-center">Processing animation...</p>
                              </div>
                            ) : animationData ? (
                              <div className="w-full h-full flex items-center justify-center p-3">
                                {isPlaying && activeGiftAnimation ? (
                                  <GiftAnimationPlayer
                                  animationData={animationData}
                                    playKey={activeGiftAnimation.key}
                                    className="w-3/4 h-3/4 object-contain"
                                    onComplete={handleGiftAnimationComplete}
                                  />
                                ) : (
                                  <LottieFirstFrame
                                    animationData={animationData}
                                    giftId={gift.id}
                                    className="w-3/4 h-3/4 object-contain"
                                    alt={gift.name || 'Gift'}
                                  />
                                )}
                              </div>
                            ) : gift.image_url ? (
                              <img
                                src={gift.image_url}
                                alt={gift.name || 'Gift'}
                                className="w-full h-full object-contain p-3"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl">🎁</span>
                              </div>
                            )}
                            {gift.name && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/70 to-transparent backdrop-blur-md px-3 py-2.5 rounded-b-2xl">
                                <p className="text-white text-sm font-semibold truncate drop-shadow-lg">{gift.name}</p>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
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
                    // eslint-disable-next-line @next/next/no-img-element
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

                {/* Arrows animation - behind rocket, only when running and multiplier increasing */}
                {sessionState === 'running' && collectedMultiplier === null && (
                  <div className="absolute z-10 flex h-52 w-52 items-center justify-center">
                    <Lottie
                      animationData={arrowsAnimation}
                      loop
                      autoplay
                      className="h-full w-full opacity-80"
                    />
                  </div>
                )}

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
                  onClick={isQueuedForNextSession ? cancelQueuedSession : queueNextSession}
                  disabled={joinButtonDisabled}
                >
                  {joinButtonLabel}
                </button>
                <button
                  className="btn flex-1 min-w-[120px] py-3 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none"
                  onClick={handleCollect}
                  disabled={collectDisabled}
                >
                  {collectLabel}
                </button>
              </section>
              {isQueuedForNextSession && sessionState === 'countdown' && (
                <p className="mt-2 text-center text-sm text-white/70">
                  You&apos;ll join the next launch in {countdown}s
                </p>
              )}

              {/* Player list - only show on game tab */}
              {activeTab === 'game' && (
                <section className="mt-6 w-full">
                  <div className="mb-4 text-center">
                    <p className="text-sm font-medium text-white/80">
                      {activePlayerCount} {activePlayerCount === 1 ? 'player' : 'players'} in session
                    </p>
                  </div>
                  <div className="space-y-4">
                    {players.map((player) => {
                      const playKey = playingGiftAnimations.get(player.id)
                      const isPlayingGift = playKey !== undefined
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between rounded-2xl border border-white/10 ${player.bgColor} px-6 py-5 text-sm font-medium text-white/90 shadow-[0_15px_35px_-15px_rgba(41,88,255,0.6)] backdrop-blur-lg w-full`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="h-16 w-16 rounded-xl object-cover border border-white/20"
                            />
                            <div>
                              <p className="text-lg font-semibold">{player.name}</p>
                              <p className="text-sm text-white/60 mt-1">{player.status}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {player.giftAnimationData ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (player.giftAnimationData) {
                                    triggerPlayerGiftAnimation(player.id)
                                  }
                                }}
                                className={`relative rounded-xl border-2 ${player.frameColor} bg-white/5 p-2 transition-all hover:scale-105 w-20 h-20 flex items-center justify-center overflow-hidden`}
                              >
                                {isPlayingGift && playKey ? (
                                  <GiftAnimationPlayer
                                    animationData={player.giftAnimationData}
                                    playKey={playKey}
                                    className="w-full h-full object-contain"
                                    onComplete={() => handlePlayerGiftAnimationComplete(player.id)}
                                  />
                                ) : (
                                  <LottieFirstFrame
                                    animationData={player.giftAnimationData}
                                    giftId={player.giftFileName}
                                    className="w-full h-full object-contain"
                                    alt="Gift bet"
                                  />
                                )}
                              </button>
                            ) : (
                              <div className="w-20 h-20 flex items-center justify-center">
                                <span className="text-2xl">🎁</span>
                              </div>
                            )}
                            <div className="text-right">
                              <p className="text-sm text-white/60 mt-1">{player.amount}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </section>
          </>
        )}

      </div>

      {/* Gift Selection Modal */}
      {showGiftSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-[32px] border border-white/10 bg-gradient-to-b from-[#050015] via-[#09002F] to-[#01010A] p-6 shadow-[0_25px_60px_-20px_rgba(56,97,255,0.6)] backdrop-blur-[32px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_65%)]" />
            
            <div className="relative z-10">
              <h2 className="mb-4 text-2xl font-bold text-white">Select Gifts</h2>
              <p className="mb-4 text-sm text-white/70">Choose one or more gifts to bet with</p>
              
              {loadingInventory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-400"></div>
                </div>
              ) : inventory.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-white/70">No gifts in inventory</p>
                </div>
              ) : (
                <div className="mb-6 max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-3">
                    {inventory.map((gift) => {
                      const animationData = parseAnimationData(gift.animation_data, gift.id)
                      const isSelected = selectedGiftIds.includes(gift.id)
                      const isPlaying = activeGiftAnimation?.id === gift.id
                      return (
                        <button
                          key={gift.id}
                          type="button"
                          onClick={() => toggleGiftSelection(gift.id)}
                          className={`relative rounded-xl border-2 p-2 transition-all ${
                            isSelected
                              ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/30'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="aspect-square flex items-center justify-center">
                            {animationData ? (
                              isPlaying && activeGiftAnimation ? (
                                <GiftAnimationPlayer
                                  animationData={animationData}
                                  playKey={activeGiftAnimation.key}
                                  className="w-full h-full object-contain"
                                  onComplete={handleGiftAnimationComplete}
                                />
                              ) : (
                                <LottieFirstFrame
                                  animationData={animationData}
                                  giftId={gift.id}
                                  className="w-full h-full object-contain"
                                  alt={gift.name || 'Gift'}
                                />
                              )
                            ) : gift.image_url ? (
                              <img
                                src={gift.image_url}
                                alt={gift.name || 'Gift'}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl">🎁</span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-400 text-xs font-bold text-white">
                              ✓
                            </div>
                          )}
                          {gift.name && (
                            <p className="mt-1 text-xs text-white/80 truncate text-center">
                              {gift.name}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleGiftSelectionCancel}
                  className="btn flex-1 py-3 text-base font-bold bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGiftSelectionContinue}
                  disabled={selectedGiftIds.length === 0}
                  className="btn flex-1 py-3 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none"
                >
                  Continue ({selectedGiftIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav ref={navRef} className="neo-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-indicator" style={indicatorStyle} />
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              ref={(el) => {
                navItemsRef.current[index] = el
              }}
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

