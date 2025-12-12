import 'dotenv/config'

import { giftProcessingService } from '../src/services/giftProcessingService'
import { giftRepository } from '../src/repositories/giftRepository'

async function main() {
  const [, , giftIdentifier] = process.argv
  if (!giftIdentifier) {
    console.error('Usage: npm run process:gift <gift-id-or-url>')
    process.exit(1)
  }

  const looksLikeUuid = /^[0-9a-fA-F-]{36}$/.test(giftIdentifier)

  const gift = looksLikeUuid
    ? (await giftRepository.findById(giftIdentifier)) ?? (await findGiftByUrl(giftIdentifier))
    : (await findGiftByUrl(giftIdentifier)) ?? (await giftRepository.findById(giftIdentifier))

  if (!gift || !gift.gift_url) {
    console.error('Gift not found or missing gift_url:', giftIdentifier)
    process.exit(1)
  }

  console.log(`Processing gift ${gift.id}: ${gift.gift_url}`)
  const processed = await giftProcessingService.processGiftUrl(gift.gift_url, {
    giftId: gift.id,
  })

  await giftRepository.update(gift.id, {
    animationData: processed.animationData,
    giftUrl: gift.gift_url,
    imageUrl: processed.previewImageUrl ?? undefined,
    animationTgsPath: processed.tgsStoragePath ?? undefined,
  })

  console.log(
    `✅ Updated gift ${gift.id} (image=${Boolean(
      processed.previewImageUrl,
    )}, tgs=${Boolean(processed.tgsStoragePath)})`,
  )
  process.exit(0)
}

async function findGiftByUrl(giftUrl: string) {
  const { supabase } = await import('../src/lib/supabase')
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('gift_url', giftUrl)
    .single()

  if (error) {
    console.error('Failed to fetch gift by url:', error.message)
    return null
  }

  return data ?? null
}

main().catch((error) => {
  console.error('Failed to process gift:', error)
  process.exit(1)
})

