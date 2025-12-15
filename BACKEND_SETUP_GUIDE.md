
# Backend Setup Guide for Warehouse Check-In App

## 📋 Overview

This guide will walk you through setting up a backend API server to connect your React Native Warehouse Check-In app to your SQL Server database on your local network.

**Goal:** Keep all data confined to your local network to prevent data breaches.

**⚠️ IMPORTANT:** The backend API is a **SEPARATE Node.js project** that runs on your CRSERV machine. It is NOT part of the React Native app bundle.

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│  React Native App       │
│  (Mobile Device)        │
└───────────┬─────────────┘
            │ HTTP Requests
            │ (Local Network)
            ↓
┌─────────────────────────┐
│  Backend API Server     │
│  (Node.js + Express)    │
│  Running on CRSERV      │
└───────────┬─────────────┘
            │ SQL Queries
            ↓
┌─────────────────────────┐
│  SQL Server Database    │
│  CRSERV\SQLEXPRESS      │
└─────────────────────────┘
```

**Why do we need a backend API?**
- React Native apps cannot directly connect to SQL Server databases
- The backend API acts as a secure intermediary
- All communication stays within your local network
- No external services or cloud dependencies

---

## 🔒 CRITICAL: Network Security Configuration

**⚠️ IMPORTANT:** The React Native app code CANNOT control network security. Database accessibility from outside your network is a **server-side infrastructure issue** that must be configured on your SQL Server machine and network router.

### Security Layers Required

To properly secure your database and prevent external access, you must configure **ALL** of the following layers:

#### 1. SQL Server Network Configuration

**Configure SQL Server to listen ONLY on your local network:**

1. Open **SQL Server Configuration Manager**
2. Navigate to: **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**
3. Right-click **TCP/IP** → **Properties**
4. Go to the **IP Addresses** tab
5. For each IP address section:
   - **IPAll**: Clear the TCP Port field
   - **IP1** (your local network IP, e.g., 192.168.40.239):
     - Set **Enabled**: Yes
     - Set **Active**: Yes
     - Set **TCP Port**: 1433
   - **IP2** (127.0.0.1 - localhost):
     - Set **Enabled**: Yes
     - Set **Active**: Yes
     - Set **TCP Port**: 1433
   - **All other IPs**: Set **Enabled**: No
6. Click **OK** and restart SQL Server service

**What this does:**
- SQL Server will ONLY accept connections from your local network IP and localhost
- External connections will be rejected at the SQL Server level

#### 2. Windows Firewall Configuration

**Create strict firewall rules to block external access:**

Open Command Prompt **as Administrator** and run these commands:

```powershell
# Remove any existing rules for SQL Server
netsh advfirewall firewall delete rule name="SQL Server"
netsh advfirewall firewall delete rule name="SQL Server Browser"

# Create NEW rule that ONLY allows local network access to SQL Server
netsh advfirewall firewall add rule name="SQL Server - Local Network Only" dir=in action=allow protocol=TCP localport=1433 remoteip=192.168.40.0/24

# Block all other incoming connections to SQL Server port
netsh advfirewall firewall add rule name="SQL Server - Block External" dir=in action=block protocol=TCP localport=1433 remoteip=any

# Allow the Warehouse API on local network only
netsh advfirewall firewall add rule name="Warehouse API - Local Network Only" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.40.0/24

# Block all other incoming connections to API port
netsh advfirewall firewall add rule name="Warehouse API - Block External" dir=in action=block protocol=TCP localport=3000 remoteip=any
```

**Important Notes:**
- Replace `192.168.40.0/24` with your actual local network subnet
- The `/24` means it allows IPs from 192.168.40.1 to 192.168.40.254
- If your network uses a different subnet (e.g., 192.168.1.x), adjust accordingly

**What this does:**
- Creates explicit ALLOW rules for your local network
- Creates explicit BLOCK rules for all other IPs
- Protects both SQL Server (port 1433) and the API (port 3000)

#### 3. Network Router Configuration

**Verify your router is NOT exposing the database:**

1. Log into your router's admin panel (usually http://192.168.1.1 or http://192.168.0.1)
2. Navigate to **Port Forwarding** or **Virtual Server** settings
3. **Verify there are NO port forwarding rules for:**
   - Port 1433 (SQL Server)
   - Port 3000 (API Server)
4. Check **DMZ Settings** - ensure CRSERV is NOT in the DMZ
5. Check **UPnP Settings** - consider disabling UPnP to prevent automatic port forwarding

**What this does:**
- Prevents your router from forwarding external traffic to your database server
- Ensures the database is not accessible from the internet

#### 4. Backend API Server Binding

**Configure the Node.js API to bind to local network only:**

When you create your `server.js` file (Step 5 below), ensure it includes:

```javascript
const PORT = process.env.PORT || 3000;
const HOST = '192.168.40.239'; // Your server's local IP

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on: http://${HOST}:${PORT}`);
  console.log(`🔒 Server bound to local network only`);
});
```

**What this does:**
- The API server will ONLY accept connections on the local network interface
- Connections to other interfaces (if they exist) will be rejected

#### 5. Testing Security Configuration

**After configuring all security layers, test them:**

**Test 1: Internal Access (Should Work)**
1. From a device on your local network (e.g., 192.168.40.x)
2. Try to access: `http://192.168.40.239:3000/health`
3. **Expected result:** ✅ Success - API responds

**Test 2: External Access (Should Fail)**
1. From a device OUTSIDE your network (use mobile data, not Wi-Fi)
2. Find your public IP address (visit https://whatismyipaddress.com from CRSERV)
3. Try to access: `http://[YOUR_PUBLIC_IP]:3000/health`
4. **Expected result:** ❌ Connection timeout or refused

**Test 3: SQL Server Direct Access (Should Fail Externally)**
1. From a device OUTSIDE your network
2. Try to connect to SQL Server using SSMS or any SQL client
3. Use: `[YOUR_PUBLIC_IP],1433`
4. **Expected result:** ❌ Connection timeout or refused

**If external access still works:**
- Your router may have automatic port forwarding enabled (UPnP)
- Check for VPN or remote access software that might be exposing ports
- Verify Windows Firewall is enabled and rules are active
- Check for other firewall software that might override Windows Firewall

---

## 🚀 Quick Start (Step-by-Step)

### Step 1: Install Node.js on CRSERV

1. On the CRSERV machine, download Node.js:
   - Visit: https://nodejs.org/
   - Download the **LTS version** (20.x or higher)
   - Run the installer and follow the prompts

2. Verify installation:
   - Open Command Prompt
   - Run these commands:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers (e.g., v20.11.0 and 10.2.4)

### Step 2: Create Backend Project Directory

**⚠️ IMPORTANT:** Create this in a SEPARATE directory, NOT inside your React Native project!

1. Open Command Prompt on CRSERV
2. Navigate to where you want to create the project:
   ```bash
   cd C:\
   mkdir warehouse-api
   cd warehouse-api
   ```

3. Initialize the Node.js project:
   ```bash
   npm init -y
   ```

### Step 3: Install Required Packages

Run this command in the `warehouse-api` directory:

```bash
npm install express mssql cors dotenv
npm install --save-dev nodemon
```

**What each package does:**
- **express**: Web framework for creating API endpoints
- **mssql**: SQL Server client for Node.js
- **cors**: Allows your React Native app to call the API
- **dotenv**: Manages environment variables (database credentials)
- **nodemon**: Auto-restarts server when you make changes (development only)

### Step 4: Create Configuration File

Create a file named `.env` in the `warehouse-api` directory.

**Current Configuration (SQL Server Authentication):**

```env
# SQL Server Configuration
DB_SERVER=192.168.40.239\\SQLEXPRESS
DB_AUTH_MODE=sql
DB_USER=sql
DB_PASSWORD=W1@3!-j/R
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# API Configuration
PORT=3000
HOST=192.168.40.239
```

**Important Notes:**
- The `HOST` variable ensures the API binds to the local network interface only
- Replace `WarehouseCheckIn` with your actual database name
- The double backslash `\\` in the server name is required
- Keep this file secure - it contains sensitive credentials

### Step 5: Copy and Configure Server Template

1. From your React Native project, navigate to `app/api/`
2. Copy the `server-template.txt` file
3. Paste it into your `warehouse-api` directory
4. Rename it to `server.js`
5. **IMPORTANT:** Edit `server.js` and update the listen configuration:

```javascript
// Find this section near the end of the file:
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '192.168.40.239'; // Add this line

// Update the app.listen call:
app.listen(PORT, HOST, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🚀 Warehouse Check-In API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on: http://${HOST}:${PORT}`);
  console.log(`  🔒 Server bound to local network only`);
  console.log(`  🔐 Authentication: ${config.authMode}`);
  if (dbConnected) {
    console.log('  ✅ Connected to SQL Server');
    console.log(`     Server: ${config.server}`);
    console.log(`     Database: ${config.database}`);
  } else {
    console.log('  ⚠️  Database connection pending...');
  }
  console.log('═══════════════════════════════════════════════════════════');
});
```

**Command line method:**
```bash
# From your React Native project directory
copy app\api\server-template.txt C:\warehouse-api\server.js
```

### Step 6: Update package.json

Edit the `package.json` file in your `warehouse-api` directory and add these scripts:

```json
{
  "name": "warehouse-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "mssql": "^10.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
```

### Step 7: Enable SQL Server TCP/IP (If Not Already Enabled)

1. Open **SQL Server Configuration Manager**
2. Navigate to: SQL Server Network Configuration → Protocols for SQLEXPRESS
3. Right-click **TCP/IP** → Enable
4. **Follow the network security configuration in the section above**
5. Restart SQL Server service:
   - Go to SQL Server Services
   - Right-click **SQL Server (SQLEXPRESS)**
   - Click **Restart**

### Step 8: Configure SQL Server Authentication

**Your current setup uses SQL Server Authentication:**

1. Verify SQL Server allows SQL Server Authentication:
   - Open SQL Server Management Studio (SSMS)
   - Right-click server → Properties → Security
   - Ensure "SQL Server and Windows Authentication mode" is selected
   - Click OK and restart SQL Server if you made changes

2. Verify the SQL user exists and has permissions:
   - In SSMS, expand Security → Logins
   - Look for the `sql` user
   - Right-click → Properties → User Mapping
   - Ensure the user has access to your database with appropriate permissions

### Step 9: Configure Windows Firewall

**Use the comprehensive firewall rules from the Security Configuration section above.**

Open Command Prompt **as Administrator** and run:

```powershell
# Allow local network access to API
netsh advfirewall firewall add rule name="Warehouse API - Local Network Only" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.40.0/24

# Block external access to API
netsh advfirewall firewall add rule name="Warehouse API - Block External" dir=in action=block protocol=TCP localport=3000 remoteip=any

# Allow local network access to SQL Server
netsh advfirewall firewall add rule name="SQL Server - Local Network Only" dir=in action=allow protocol=TCP localport=1433 remoteip=192.168.40.0/24

# Block external access to SQL Server
netsh advfirewall firewall add rule name="SQL Server - Block External" dir=in action=block protocol=TCP localport=1433 remoteip=any
```

### Step 10: Start the API Server

1. Open Command Prompt in the `warehouse-api` directory
2. Run:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ═══════════════════════════════════════════════════════════
     🚀 Warehouse Check-In API Server
   ═══════════════════════════════════════════════════════════
     ✅ Server running on: http://192.168.40.239:3000
     🔒 Server bound to local network only
     🔐 Authentication: sql
     ✅ Connected to SQL Server
        Server: 192.168.40.239\SQLEXPRESS
        Database: WarehouseCheckIn
   ```

### Step 11: Test the API

**From a device on your local network:**

Open a web browser and visit:
- http://192.168.40.239:3000/health

You should see:
```json
{
  "success": true,
  "message": "Warehouse API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "authMode": "sql"
}
```

### Step 12: Verify React Native App Configuration

1. In your React Native project, open `app/api/client.ts`
2. Verify the `API_BASE_URL` is set to your server's IP address:
   ```typescript
   const API_BASE_URL = 'http://192.168.40.239:3000';
   ```

### Step 13: Test from Mobile Device

1. Make sure your mobile device is on the **same Wi-Fi network** as CRSERV (192.168.40.x)
2. Open your React Native app
3. Try accessing the Admin panel
4. The app should now fetch data from your local SQL Server database

### Step 14: Verify External Access is Blocked

**This is the most important security test:**

1. Disconnect your mobile device from Wi-Fi
2. Use mobile data (4G/5G) to access the internet
3. Try to access: `http://[YOUR_PUBLIC_IP]:3000/health`
4. **Expected result:** Connection should timeout or be refused
5. If you can still access it, review the security configuration section above

---

## 🔧 Understanding the Build Error

If you see this error when building your React Native app:

```
Error: Unable to resolve module express from /expo-project/app/api/server-template.txt
```

**This means:**
- The React Native bundler is trying to include the backend server template in the app bundle
- This is incorrect - the server template should only be used in the separate backend project

**Solution:**
The `metro.config.js` file has been updated to exclude backend files from the React Native bundle:

```javascript
config.resolver.blockList = [
  /app\/api\/server-template\.txt$/,
  /app\/api\/package\.json\.template$/,
];
```

**What this does:**
- Prevents Metro (React Native bundler) from including backend template files
- The backend files remain in the project for reference but are not bundled
- Only `app/api/client.ts` is used by the React Native app

**Remember:**
- `server-template.txt` → Copy to separate backend project
- `client.ts` → Used by React Native app to make HTTP requests

---

## 🐛 Troubleshooting

### Problem: Database is accessible from outside the network

**This is a server-side configuration issue, not an app code issue!**

**Solutions:**

1. **Verify SQL Server network binding:**
   - Open SQL Server Configuration Manager
   - Check TCP/IP properties
   - Ensure it's only listening on local network IP

2. **Check Windows Firewall rules:**
   ```powershell
   # List all firewall rules for SQL Server
   netsh advfirewall firewall show rule name=all | findstr "SQL"
   
   # List all firewall rules for port 1433
   netsh advfirewall firewall show rule name=all | findstr "1433"
   ```
   - Verify BLOCK rules exist for external IPs
   - Verify ALLOW rules only exist for local network

3. **Check router port forwarding:**
   - Log into router admin panel
   - Verify NO port forwarding for ports 1433 or 3000
   - Disable UPnP if enabled

4. **Test with online port scanner:**
   - Visit https://www.yougetsignal.com/tools/open-ports/
   - Enter your public IP and port 1433
   - Should show "closed" or "filtered"

5. **Check for VPN or remote access software:**
   - TeamViewer, AnyDesk, LogMeIn, etc. might expose ports
   - Temporarily disable and retest

### Problem: "Login failed for user 'sql'"

**Solutions:**

1. **Verify SQL Server Authentication is enabled:**
   - Open SSMS
   - Right-click server → Properties → Security
   - Select "SQL Server and Windows Authentication mode"
   - Restart SQL Server

2. **Verify user exists and has permissions:**
   - In SSMS, expand Security → Logins
   - Right-click `sql` user → Properties
   - Check User Mapping tab
   - Ensure database access is granted

3. **Check password in .env file:**
   - Verify password matches: `W1@3!-j/R`
   - Check for extra spaces or hidden characters

4. **Test connection with SSMS:**
   - Try logging in with the same credentials
   - If it fails in SSMS, the issue is with SQL Server, not the API

### Problem: Cannot connect to SQL Server

**Solutions:**
1. Check SQL Server is running:
   ```powershell
   Get-Service MSSQL*
   ```

2. Verify TCP/IP is enabled in SQL Server Configuration Manager

3. Check SQL Server Browser service is running

4. Test connection with SQL Server Management Studio

### Problem: Cannot access API from mobile device

**Solutions:**
1. Verify both devices are on the same Wi-Fi network (192.168.40.x)
2. Check Windows Firewall settings
3. Ping the server from your mobile device
4. Ensure server is listening on the correct IP (192.168.40.239)
5. Check that the API server is running

### Problem: "CORS Error" in React Native app

**Solution:**
Make sure CORS is enabled in your server.js:
```javascript
app.use(cors({
  origin: '*', // For local network
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Problem: Database connection timeout

**Solutions:**
1. Check `.env` file has correct credentials
2. Verify SQL Server allows the user to connect
3. Check SQL Server error logs
4. Ensure database name is correct
5. Verify SQL Server is listening on the correct IP

### Problem: "Unable to resolve module express" in React Native

**This is NOT an error with your React Native app!**

**Explanation:**
- This error appears when the React Native bundler tries to include backend files
- The backend files should be in a separate project directory
- The `metro.config.js` has been updated to exclude these files

**Solution:**
- Make sure you've copied `server-template.txt` to a separate `warehouse-api` directory
- The React Native app should only use `app/api/client.ts`
- Restart the Expo dev server after updating `metro.config.js`

---

## 📊 API Endpoints Reference

### Health Check
- **GET** `/health` - Check if API is running

### Employees
- **GET** `/api/employees` - Get all employees
- **POST** `/api/employees` - Create employee
- **PUT** `/api/employees/:id` - Update employee
- **DELETE** `/api/employees/:id` - Delete employee

### Companies
- **GET** `/api/companies` - Get all companies
- **POST** `/api/companies` - Create company
- **PUT** `/api/companies/:id` - Update company
- **DELETE** `/api/companies/:id` - Delete company

### Categories
- **GET** `/api/categories` - Get all categories
- **POST** `/api/categories` - Create category
- **PUT** `/api/categories/:id` - Update category
- **DELETE** `/api/categories/:id` - Delete category

### Value Scrap
- **GET** `/api/value-scrap` - Get all value scrap
- **POST** `/api/value-scrap` - Create value scrap
- **PUT** `/api/value-scrap/:id` - Update value scrap
- **DELETE** `/api/value-scrap/:id` - Delete value scrap

### Charge Materials
- **GET** `/api/charge-materials` - Get all charge materials
- **POST** `/api/charge-materials` - Create charge material
- **PUT** `/api/charge-materials/:id` - Update charge material
- **DELETE** `/api/charge-materials/:id` - Delete charge material

### i-Series
- **GET** `/api/i-series` - Get all i-series
- **POST** `/api/i-series` - Create i-series
- **PUT** `/api/i-series/:id` - Update i-series
- **DELETE** `/api/i-series/:id` - Delete i-series

### Check-Ins
- **GET** `/api/check-ins` - Get all check-ins
- **GET** `/api/check-ins/:id` - Get single check-in
- **POST** `/api/check-ins` - Create check-in

---

## 🏭 Production Deployment

### Option 1: Run as Windows Service

This keeps the API running even after you log out of Windows.

1. Install node-windows:
   ```bash
   npm install -g node-windows
   ```

2. Create `install-service.js` in your `warehouse-api` directory:
   ```javascript
   const Service = require('node-windows').Service;

   const svc = new Service({
     name: 'Warehouse API',
     description: 'Warehouse Check-In API Server',
     script: 'C:\\warehouse-api\\server.js',
     nodeOptions: [
       '--harmony',
       '--max_old_space_size=4096'
     ]
   });

   svc.on('install', () => {
     svc.start();
     console.log('Service installed and started!');
   });

   svc.install();
   ```

3. Run:
   ```bash
   node install-service.js
   ```

4. The API will now start automatically when Windows boots

### Option 2: Use PM2 Process Manager

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Start the API:
   ```bash
   pm2 start server.js --name warehouse-api
   ```

3. Configure PM2 to start on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

---

## ✅ Security Checklist

- [ ] SQL Server configured to listen only on local network IP
- [ ] Windows Firewall rules created to block external access
- [ ] Router port forwarding verified (NO forwarding for ports 1433 or 3000)
- [ ] Backend API bound to local network IP only
- [ ] External access test performed and blocked
- [ ] Internal access test performed and working
- [ ] SQL Server authentication configured correctly
- [ ] Strong passwords used for SQL Server accounts
- [ ] `.env` file secured with proper permissions
- [ ] Database user has minimum required permissions
- [ ] Regular security audits scheduled

---

## ✅ Setup Checklist

- [ ] Node.js installed on CRSERV
- [ ] Backend project created in SEPARATE directory (`C:\warehouse-api`)
- [ ] Dependencies installed in backend project (`npm install`)
- [ ] `.env` file created with SQL authentication credentials
- [ ] `server.js` copied from template and configured to bind to local IP
- [ ] SQL Server database exists
- [ ] SQL Server configured for SQL authentication
- [ ] TCP/IP enabled in SQL Server (bound to local network only)
- [ ] Windows Firewall rules configured (ALLOW local, BLOCK external)
- [ ] Router verified (NO port forwarding)
- [ ] API server started and tested
- [ ] React Native app updated with server IP in `app/api/client.ts`
- [ ] Metro config updated to exclude backend files
- [ ] Internal access test successful
- [ ] External access test blocked (security verified)
- [ ] (Optional) Windows Service configured for production

---

## 📁 Project Structure

```
Your Computer/
├── expo-project/                    # React Native App
│   ├── app/
│   │   ├── api/
│   │   │   ├── client.ts           # ✅ Used by React Native app
│   │   │   ├── server-template.txt # ⚠️ Template only - copy to backend
│   │   │   ├── .env.template       # ⚠️ Template only - copy to backend
│   │   │   └── README.md
│   │   └── ...
│   └── metro.config.js             # Excludes backend files
│
CRSERV Machine (192.168.40.239)/
└── warehouse-api/                   # Backend API Server (SEPARATE)
    ├── server.js                    # Copied from server-template.txt
    ├── .env                         # Database credentials (SQL auth)
    ├── package.json
    └── node_modules/
```

---

## 📞 Support

If you encounter issues:

1. Check the server logs in Command Prompt
2. Verify SQL Server connection with SSMS
3. Test API endpoints with a browser or Postman
4. Check network connectivity between devices
5. Review Windows Firewall and SQL Server logs
6. Verify security configuration with external access test
7. Ensure backend files are in a separate directory

---

## 🎉 Success!

Once everything is set up, your Warehouse Check-In app will:
- ✅ Store all data on your local SQL Server
- ✅ Keep all communication within your local network
- ✅ Block all external access to the database
- ✅ Prevent data breaches by avoiding external services
- ✅ Provide fast, reliable access to your data
- ✅ Work seamlessly with your existing infrastructure

Your data is now secure and confined to your local network! 🔒
