#!/usr/bin/env node

const { spawn } = require('child_process')
const net = require('net')

const FALLBACK_PORT = 8000
const MAX_PORT = 9000

const parsePort = (value) => {
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    console.warn(`Ignoring invalid port value "${value}"`)
    return undefined
  }

  return parsed
}

const preferredPort =
  parsePort(process.env.PORT) ??
  parsePort(process.env.NEXT_DEV_PORT) ??
  parsePort(process.env.NEXT_PORT) ??
  parsePort(process.env.APP_PORT)

const checkPortAvailable = (port) =>
  new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => {
        resolve(false)
      })
      .once('listening', () => {
        tester
          .once('close', () => {
            resolve(true)
          })
          .close()
      })
      .listen(port, '0.0.0.0')
  })

const findAvailablePort = async (startPort) => {
  let candidate = startPort

  while (candidate <= MAX_PORT) {
    // eslint-disable-next-line no-await-in-loop
    const available = await checkPortAvailable(candidate)
    if (available) return candidate
    candidate += 1
  }

  throw new Error(`No available port found between ${startPort} and ${MAX_PORT}`)
}

const run = async () => {
  const portNumber = preferredPort ?? (await findAvailablePort(FALLBACK_PORT))
  const port = portNumber.toString()

  if (preferredPort && preferredPort !== portNumber) {
    console.warn(
      `Requested port ${preferredPort} is unavailable. Falling back to ${portNumber}.`
    )
  } else if (!preferredPort && portNumber !== FALLBACK_PORT) {
    console.info(`Port ${FALLBACK_PORT} in use. Using next available port ${portNumber}.`)
  }

  console.log(`Starting Next.js dev server on port ${port}…`)

  const child = spawn('next', ['dev', '-p', port], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port,
    },
  })

  child.on('close', (code) => {
    process.exit(code ?? 0)
  })

  child.on('error', (error) => {
    console.error('Failed to start Next.js dev server:', error)
    process.exit(1)
  })
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})


