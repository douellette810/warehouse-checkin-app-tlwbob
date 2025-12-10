
# Backend Setup Guide for Warehouse Check-In App

## 📋 Overview

This guide will walk you through setting up a backend API server to connect your React Native Warehouse Check-In app to your SQL Server database on your local network.

**Goal:** Keep all data confined to your local network to prevent data breaches.

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

**For Windows Authentication (Recommended):**

```env
# SQL Server Configuration
DB_SERVER=CRSERV\\SQLEXPRESS
DB_AUTH_MODE=windows
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# API Configuration
PORT=3000
```

**For SQL Server Authentication (Alternative):**

```env
# SQL Server Configuration
DB_SERVER=CRSERV\\SQLEXPRESS
DB_AUTH_MODE=sql
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# API Configuration
PORT=3000
```

**Important Notes:**
- Replace `WarehouseCheckIn` with your actual database name
- The double backslash `\\` in `CRSERV\\SQLEXPRESS` is required
- For Windows Authentication, do NOT include DB_USER or DB_PASSWORD
- Keep this file secure - it may contain sensitive information

### Step 5: Copy Server Template

1. Copy the `server-template.js` file from `app/api/server-template.js` in your React Native project
2. Save it as `server.js` in your `warehouse-api` directory

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
4. Restart SQL Server service:
   - Go to SQL Server Services
   - Right-click **SQL Server (SQLEXPRESS)**
   - Click **Restart**

### Step 8: Configure SQL Server Authentication Mode

**For Windows Authentication:**
1. The Node.js server must run under a Windows account that has SQL Server access
2. By default, the local Administrator account should have access
3. No additional SQL Server configuration needed

**For SQL Server Authentication:**
1. Open **SQL Server Management Studio** (SSMS)
2. Right-click the server → Properties → Security
3. Select "SQL Server and Windows Authentication mode"
4. Click OK and restart SQL Server
5. Create a SQL Server login with appropriate permissions

### Step 9: Configure Windows Firewall

Open Command Prompt **as Administrator** and run:

```powershell
netsh advfirewall firewall add rule name="Warehouse API" dir=in action=allow protocol=TCP localport=3000
```

This allows devices on your local network to access the API on port 3000.

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
     ✅ Server running on: http://localhost:3000
     ✅ Network access: http://<your-ip>:3000
     🔐 Authentication: windows
     ✅ Connected to SQL Server
        Server: CRSERV\SQLEXPRESS
        Database: WarehouseCheckIn
   ```

### Step 11: Find Your Server's IP Address

1. On CRSERV, open Command Prompt
2. Run:
   ```bash
   ipconfig
   ```
3. Look for **IPv4 Address** under your network adapter
   - Example: `192.168.1.100`
4. Write this down - you'll need it for the React Native app

### Step 12: Test the API

Open a web browser on CRSERV and visit:
- http://localhost:3000/health

You should see:
```json
{
  "success": true,
  "message": "Warehouse API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "authMode": "windows"
}
```

### Step 13: Update React Native App

1. In your React Native project, open `app/api/client.ts`
2. Update the `API_BASE_URL` with your server's IP address:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:3000'; // Replace with your IP
   ```

### Step 14: Test from Mobile Device

1. Make sure your mobile device is on the **same Wi-Fi network** as CRSERV
2. Open your React Native app
3. Try accessing the Admin panel
4. The app should now fetch data from your local SQL Server database

---

## 🔒 Security Considerations

### Network Security

1. **Firewall Configuration:**
   - Only allow connections from your local network
   - Block external access to port 3000
   - Consider using a VPN if accessing remotely

2. **Database Security:**
   - Use strong passwords for SQL Server Authentication
   - Limit database user permissions
   - Enable SQL Server authentication logging

3. **API Security (Optional but Recommended):**
   - Add authentication tokens
   - Implement rate limiting
   - Add request validation

### Adding Authentication (Optional)

If you want to add API authentication:

```bash
npm install jsonwebtoken bcrypt
```

Then modify your server.js to require authentication tokens for API calls.

---

## 🏭 Production Deployment

### Option 1: Run as Windows Service

This keeps the API running even after you log out of Windows.

1. Install node-windows:
   ```bash
   npm install -g node-windows
   ```

2. Create `install-service.js`:
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

## 🐛 Troubleshooting

### Problem: "Login failed for user 'CRSERV\Administrator'"

**This is the error you're experiencing!**

**Solutions:**

1. **Use Windows Authentication (Recommended):**
   - Edit your `.env` file:
     ```env
     DB_AUTH_MODE=windows
     ```
   - Remove or comment out `DB_USER` and `DB_PASSWORD` lines
   - The server will use the Windows account running Node.js

2. **Verify SQL Server allows Windows Authentication:**
   - Open SQL Server Management Studio
   - Right-click server → Properties → Security
   - Ensure "Windows Authentication mode" or "SQL Server and Windows Authentication mode" is selected

3. **Check Windows account has SQL Server access:**
   - In SSMS, expand Security → Logins
   - Look for `CRSERV\Administrator`
   - If not present, right-click Logins → New Login
   - Add `CRSERV\Administrator` with appropriate permissions

4. **Alternative: Use SQL Server Authentication:**
   - Create a SQL Server login in SSMS
   - Edit `.env`:
     ```env
     DB_AUTH_MODE=sql
     DB_USER=your_sql_username
     DB_PASSWORD=your_sql_password
     ```

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
1. Verify both devices are on the same Wi-Fi network
2. Check Windows Firewall settings
3. Ping the server from your mobile device
4. Ensure server is listening on `0.0.0.0` not just `localhost`

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

## ✅ Checklist

- [ ] Node.js installed on CRSERV
- [ ] Backend project created (`warehouse-api` directory)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct authentication mode
- [ ] `server.js` copied from template
- [ ] SQL Server database exists (or imported from CSV)
- [ ] TCP/IP enabled in SQL Server
- [ ] Windows Firewall rule added
- [ ] API server started and tested
- [ ] Server IP address identified
- [ ] React Native app updated with server IP
- [ ] End-to-end test successful
- [ ] (Optional) Windows Service configured for production

---

## 📞 Support

If you encounter issues:

1. Check the server logs in Command Prompt
2. Verify SQL Server connection with SSMS
3. Test API endpoints with a browser or Postman
4. Check network connectivity between devices
5. Review Windows Firewall and SQL Server logs

---

## 🎉 Success!

Once everything is set up, your Warehouse Check-In app will:
- ✅ Store all data on your local SQL Server
- ✅ Keep all communication within your local network
- ✅ Prevent data breaches by avoiding external services
- ✅ Provide fast, reliable access to your data
- ✅ Work seamlessly with your existing infrastructure

Your data is now secure and confined to your local network! 🔒
