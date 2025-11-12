#!/usr/bin/env node

/**
 * Script to verify Supabase MCP connection
 * This checks if the project reference matches and provides connection details
 */

const projectRef = 'ixxhzuppvvfnhacugdse'
const expectedUrl = `https://${projectRef}.supabase.co`
const mcpUrl = `https://mcp.supabase.com/mcp?project_ref=${projectRef}`

console.log('🔍 Supabase MCP Connection Check\n')
console.log('=' .repeat(50))
console.log('Project Reference:', projectRef)
console.log('Expected Supabase URL:', expectedUrl)
console.log('MCP Server URL:', mcpUrl)
console.log('=' .repeat(50))
console.log('')

// Check if environment variables are set
const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '../.env')

let envVars = {}
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      envVars[key] = value
    }
  })
}

console.log('📋 Environment Variables Check:')
console.log('  SUPABASE_URL:', envVars.SUPABASE_URL ? '✅ Set' : '❌ Not set')
console.log('  SUPABASE_ANON_KEY:', envVars.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
console.log('')

if (envVars.SUPABASE_URL) {
  const urlMatch = envVars.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (urlMatch) {
    const envProjectRef = urlMatch[1]
    if (envProjectRef === projectRef) {
      console.log('✅ Project reference matches between MCP config and .env file')
    } else {
      console.log('⚠️  Project reference mismatch!')
      console.log(`   MCP config: ${projectRef}`)
      console.log(`   .env file: ${envProjectRef}`)
    }
  } else {
    console.log('⚠️  SUPABASE_URL format doesn\'t match expected pattern')
  }
} else {
  console.log('⚠️  SUPABASE_URL not set in .env file')
}

console.log('')
console.log('📝 Next Steps:')
console.log('1. Verify the project reference in Supabase Dashboard')
console.log('2. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in backend/.env')
console.log('3. Test the connection by running your backend server')
console.log('4. Check MCP connection in Cursor settings')
console.log('')

