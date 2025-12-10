
# Build Errors Fixed

## Summary

Fixed two build errors that were preventing the React Native app from building:

1. **Expo config warning** - Duplicate `scheme` key in `app.json`
2. **Module resolution error** - Backend template files being included in React Native bundle

---

## Error 1: Expo Config Warning

### The Error
```
Warning: Root-level "expo" object found. Ignoring extra key in Expo config: "scheme"
```

### The Problem
The `app.json` file had the `scheme` key defined in two places:
- Inside the `expo` object: `"scheme": "natively"`
- At the root level: `"scheme": "WareHouse CheckIn"`

### The Fix
Removed the duplicate root-level `scheme` key. The correct configuration is:

```json
{
  "expo": {
    "scheme": "natively",
    ...
  }
}
```

### File Changed
- `app.json`

---

## Error 2: Module Resolution Error

### The Error
```
Error: Unable to resolve module express from /expo-project/app/api/server-template.js
```

### The Problem
The React Native bundler (Metro) was trying to include `app/api/server-template.js` in the app bundle. This file is a **backend server template** that uses Node.js modules like:
- `express` - Web framework
- `mssql` - SQL Server client
- `cors` - CORS middleware
- `dotenv` - Environment variables

These modules are **not compatible with React Native** and should never be included in the mobile app bundle.

### The Solution
Updated `metro.config.js` to explicitly exclude backend template files from the React Native bundle:

```javascript
config.resolver.blockList = [
  /app\/api\/server-template\.js$/,
  /app\/api\/package\.json\.template$/,
];
```

### What This Does
- Prevents Metro from bundling backend template files
- The template files remain in the project for reference
- Only `app/api/client.ts` is used by the React Native app

### Files Changed
- `metro.config.js`
- `app/api/README.md` (added clarification)
- `BACKEND_SETUP_GUIDE.md` (added troubleshooting section)

---

## Understanding the Architecture

### Backend Template Files (NOT for React Native)
These files are templates for a **separate Node.js backend project**:
- `app/api/server-template.js` - Express server template
- `app/api/package.json.template` - Backend package.json template
- `app/api/.env.template` - Environment variables template

**Usage:**
1. Copy these files to a separate directory (e.g., `C:\warehouse-api`)
2. Install Node.js dependencies (`npm install express mssql cors dotenv`)
3. Run the backend server on CRSERV machine
4. The backend connects to SQL Server and exposes REST API endpoints

### React Native App Files (Used by the app)
- `app/api/client.ts` - HTTP client for making API requests
- Makes HTTP requests to the backend API
- No direct database connection

### Architecture Flow
```
React Native App (Mobile)
    ↓ HTTP Requests (client.ts)
Backend API Server (Node.js on CRSERV)
    ↓ SQL Queries (server-template.js)
SQL Server Database
```

---

## How to Use the Backend Templates

### Step 1: Create Separate Backend Project
On your CRSERV machine:
```bash
mkdir C:\warehouse-api
cd C:\warehouse-api
npm init -y
```

### Step 2: Copy Template Files
```bash
# From your React Native project
copy app\api\server-template.js C:\warehouse-api\server.js
copy app\api\.env.template C:\warehouse-api\.env
```

### Step 3: Install Dependencies
```bash
cd C:\warehouse-api
npm install express mssql cors dotenv
```

### Step 4: Configure Database
Edit `C:\warehouse-api\.env`:
```env
DB_SERVER=CRSERV\\SQLEXPRESS
DB_AUTH_MODE=windows
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
PORT=3000
```

### Step 5: Start Backend Server
```bash
npm start
```

### Step 6: Update React Native App
Edit `app/api/client.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.100:3000'; // Your server IP
```

---

## Verification

### Check 1: Expo Config
Run the app and verify no warnings about duplicate `scheme` keys:
```bash
npm run dev
```

### Check 2: Metro Bundler
Verify Metro doesn't try to bundle backend files:
```bash
npm run dev
```

You should NOT see any errors about `express`, `mssql`, or other Node.js modules.

### Check 3: Backend Server
If you've set up the backend, verify it's running:
```bash
# On CRSERV machine
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Warehouse API is running",
  "database": "connected"
}
```

---

## Additional Documentation

For more information, see:
- `BACKEND_SETUP_GUIDE.md` - Complete backend setup instructions
- `app/api/README.md` - Backend API overview
- `app/api/API_REFERENCE.md` - API endpoint documentation

---

## Summary of Changes

### Files Modified
1. **app.json** - Removed duplicate `scheme` key
2. **metro.config.js** - Added blockList to exclude backend files
3. **app/api/README.md** - Added clarification about backend templates
4. **BACKEND_SETUP_GUIDE.md** - Added troubleshooting section

### Files Created
1. **BUILD_ERRORS_FIXED.md** - This file

### No Dependencies Added
No new npm packages were installed. The errors were configuration issues, not missing dependencies.

---

## Next Steps

1. ✅ Build errors are fixed
2. ✅ React Native app can build successfully
3. ⏭️ Set up backend API server (if not already done)
4. ⏭️ Test end-to-end functionality

---

## Questions?

If you encounter any issues:
1. Make sure you've restarted the Expo dev server
2. Clear Metro cache: `npx expo start --clear`
3. Verify `metro.config.js` has the correct blockList
4. Check that backend files are in a separate directory
