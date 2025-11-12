# Supabase MCP Connection Check

## ✅ MCP Configuration Status

Your MCP configuration file is located at: `~/.cursor/mcp.json`

### Current Configuration:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=ixxhzuppvvfnhacugdse"
    }
  }
}
```

### Project Details:
- **Project Reference**: `ixxhzuppvvfnhacugdse`
- **Expected Supabase URL**: `https://ixxhzuppvvfnhacugdse.supabase.co`
- **MCP Server URL**: `https://mcp.supabase.com/mcp?project_ref=ixxhzuppvvfnhacugdse`

## 🔍 Connection Verification

### 1. Verify Project Reference

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (should be named "utyagifts" or similar)
3. Go to **Settings** → **General**
4. Check the **Reference ID** - it should match: `ixxhzuppvvfnhacugdse`

### 2. Get Your Supabase Credentials

1. In Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL**: `https://ixxhzuppvvfnhacugdse.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Update Your Backend `.env` File

Edit `backend/.env` and add:

```env
SUPABASE_URL=https://ixxhzuppvvfnhacugdse.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Test the Connection

Run the verification script:
```bash
cd backend
node scripts/check-supabase-mcp.js
```

Or test manually by starting your backend:
```bash
cd backend
npm run dev
```

If the connection is working, you should see no errors related to Supabase.

## 🔐 MCP Authentication

The MCP server may require authentication. To authenticate:

1. **In Cursor/VS Code**:
   - The MCP server should prompt you to authenticate
   - Click the authentication link when prompted
   - Log in to your Supabase account
   - Grant permissions to the MCP server

2. **Manual Authentication**:
   - Open: https://mcp.supabase.com/mcp?project_ref=ixxhzuppvvfnhacugdse
   - Log in with your Supabase credentials
   - Authorize the connection

## 🧪 Test MCP Connection

Once authenticated, you can test the MCP connection by:

1. **In Cursor**, try asking:
   - "List all tables in my Supabase project"
   - "Show me the schema of the User table"
   - "Query the User table"

2. **Check MCP Server Status**:
   - Look for MCP server status in Cursor's status bar
   - Check for any error messages in the output panel

## 📊 Expected Database Tables

After running migrations, you should have these tables:
- `User` - User information
- `Gift` - Gift data
- `GameSession` - Game session data

## 🐛 Troubleshooting

### MCP Server Not Connecting

1. **Check Project Reference**:
   - Verify the project ref in `mcp.json` matches your Supabase project
   - Project ref is case-sensitive

2. **Check Authentication**:
   - Make sure you're logged into Supabase
   - Re-authenticate if needed

3. **Check Network**:
   - Ensure you can access `https://mcp.supabase.com`
   - Check firewall/proxy settings

### Environment Variables Not Set

If you see errors about missing environment variables:

1. Create `backend/.env` file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```env
   SUPABASE_URL=https://ixxhzuppvvfnhacugdse.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Restart your development server

### Tables Not Found

If MCP can't find your tables:

1. Run the SQL migration:
   - Go to Supabase Dashboard → **SQL Editor**
   - Copy/paste `backend/supabase/migrations/001_initial_schema.sql`
   - Click **Run**

2. Verify tables exist:
   - Go to **Table Editor** in Supabase Dashboard
   - You should see: `User`, `Gift`, `GameSession`

## ✅ Success Indicators

You'll know the MCP connection is working when:

- ✅ No errors when starting your backend
- ✅ Can query tables through MCP in Cursor
- ✅ Environment variables are set correctly
- ✅ Tables exist in Supabase Dashboard

## 📚 Additional Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [MCP Server Configuration](https://supabase.com/docs/guides/getting-started/mcp#configuration)

## 🔄 Next Steps

1. ✅ Verify project reference matches
2. ✅ Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env
3. ✅ Run database migrations
4. ✅ Test MCP connection in Cursor
5. ✅ Verify tables are accessible

---

**Project Reference**: `ixxhzuppvvfnhacugdse`  
**Project Name**: `utyagifts`  
**Last Checked**: $(date)

