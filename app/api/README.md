
# Backend API Setup Guide

This guide will help you set up a backend API server to connect your React Native app to your SQL Server database on your local network.

## Overview

Since React Native apps cannot directly connect to SQL Server databases, you need to create a backend API that:
- Runs on your local network (e.g., on the CRSERV machine)
- Connects to your SQL Server database
- Exposes REST API endpoints that your React Native app can call
- Keeps all data confined to your local network

## Architecture

```
React Native App (Mobile Device)
    ↓ HTTP Requests
Backend API Server (Node.js/Express on CRSERV)
    ↓ SQL Queries
SQL Server Database (CRSERV\SQLEXPRESS)
```

## Option 1: Node.js + Express (Recommended)

### Prerequisites

1. Install Node.js on your CRSERV machine:
   - Download from: https://nodejs.org/
   - Install LTS version (20.x or higher)

2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 1: Create Backend Project

On your CRSERV machine, create a new directory:

```bash
mkdir warehouse-api
cd warehouse-api
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mssql cors dotenv
npm install --save-dev nodemon
```

**Package explanations:**
- `express`: Web framework for creating API endpoints
- `mssql`: SQL Server client for Node.js
- `cors`: Enable Cross-Origin Resource Sharing (allows React Native app to call API)
- `dotenv`: Load environment variables from .env file
- `nodemon`: Auto-restart server during development

### Step 3: Create Database Configuration

Create a file named `.env`:

```env
# SQL Server Configuration
DB_SERVER=CRSERV\\SQLEXPRESS
DB_USER=CRSERV\\Administrator
DB_PASSWORD=W1@3!-j/R
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# API Configuration
PORT=3000
```

**Important:** Replace `WarehouseCheckIn` with your actual database name.

### Step 4: Create Database Connection Module

Create a file named `db.js`:

```javascript
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    }
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

module.exports = {
  getConnection,
  sql
};
```

### Step 5: Create API Server

Create a file named `server.js` (see the template in this directory).

### Step 6: Update package.json Scripts

Edit `package.json` and add these scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 7: Create SQL Server Tables

Run these SQL commands in SQL Server Management Studio to create the required tables:

```sql
-- Create database (if not exists)
CREATE DATABASE WarehouseCheckIn;
GO

USE WarehouseCheckIn;
GO

-- Employees table
CREATE TABLE employees (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Companies table
CREATE TABLE companies (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    address NVARCHAR(500) NOT NULL,
    contact_person NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Categories table
CREATE TABLE categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Value Scrap table
CREATE TABLE value_scrap (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    measurement NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Charge Materials table
CREATE TABLE charge_materials (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    measurement NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- i-Series table
CREATE TABLE i_series (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    processor_series NVARCHAR(100) NOT NULL,
    processor_generation NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Check-ins table
CREATE TABLE check_ins (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_name NVARCHAR(255) NOT NULL,
    total_time NVARCHAR(50) NOT NULL,
    company_id UNIQUEIDENTIFIER NOT NULL,
    company_name NVARCHAR(255) NOT NULL,
    address NVARCHAR(500) NOT NULL,
    contact_person NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    categories NVARCHAR(MAX),
    value_scrap NVARCHAR(MAX),
    charge_materials NVARCHAR(MAX),
    suspected_value_note NVARCHAR(MAX),
    other_notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    started_at DATETIME,
    finished_at DATETIME,
    value_scrap_totals NVARCHAR(MAX),
    charge_materials_totals NVARCHAR(MAX),
    has_i_series_pcs BIT DEFAULT 0,
    has_i_series_laptops BIT DEFAULT 0,
    i_series_pcs NVARCHAR(MAX),
    i_series_laptops NVARCHAR(MAX)
);
```

### Step 8: Start the Server

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3000
Connected to SQL Server
```

### Step 9: Test the API

Open a browser or use curl to test:

```bash
# Test health check
curl http://localhost:3000/health

# Test employees endpoint
curl http://localhost:3000/api/employees
```

### Step 10: Find Your Server's IP Address

On the CRSERV machine, open Command Prompt and run:

```bash
ipconfig
```

Look for "IPv4 Address" under your network adapter (e.g., `192.168.1.100`).

### Step 11: Update React Native App

In your React Native app, update the API base URL to point to your server:

```typescript
// In app/api/client.ts
const API_BASE_URL = 'http://192.168.1.100:3000'; // Replace with your server's IP
```

## Option 2: .NET Core API

If you prefer C# and .NET:

### Prerequisites

1. Install .NET SDK 8.0 or higher
2. Install Visual Studio or VS Code

### Create Project

```bash
dotnet new webapi -n WarehouseAPI
cd WarehouseAPI
dotnet add package Microsoft.Data.SqlClient
```

### Configure Connection String

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=CRSERV\\SQLEXPRESS;Database=WarehouseCheckIn;User Id=CRSERV\\Administrator;Password=W1@3!-j/R;TrustServerCertificate=True;"
  }
}
```

### Create Controllers

Similar to the Node.js approach, create controllers for each entity (Employees, Companies, etc.).

## Security Considerations

### Network Security

1. **Firewall Configuration:**
   - Open port 3000 (or your chosen port) on CRSERV firewall
   - Only allow connections from your local network
   - Block external access

2. **Windows Firewall Rule:**
   ```powershell
   New-NetFirewallRule -DisplayName "Warehouse API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

### API Security

1. **Add Authentication (Optional but Recommended):**
   ```bash
   npm install jsonwebtoken bcrypt
   ```

2. **Add Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

3. **Add Request Validation:**
   ```bash
   npm install express-validator
   ```

## Production Deployment

### Option 1: Run as Windows Service

Install `node-windows`:

```bash
npm install -g node-windows
```

Create `install-service.js`:

```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Warehouse API',
  description: 'Warehouse Check-In API Server',
  script: 'C:\\path\\to\\warehouse-api\\server.js'
});

svc.on('install', () => {
  svc.start();
});

svc.install();
```

Run:
```bash
node install-service.js
```

### Option 2: Use PM2 Process Manager

```bash
npm install -g pm2
pm2 start server.js --name warehouse-api
pm2 startup
pm2 save
```

## Monitoring and Logging

### Add Logging

```bash
npm install winston
```

Create `logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

## Troubleshooting

### Cannot Connect to SQL Server

1. Check SQL Server is running:
   ```powershell
   Get-Service MSSQL*
   ```

2. Enable TCP/IP in SQL Server Configuration Manager

3. Check SQL Server Browser service is running

4. Verify Windows Authentication or SQL Server Authentication is enabled

### Cannot Access API from Mobile Device

1. Verify both devices are on the same network
2. Check Windows Firewall settings
3. Test with `ping` from mobile device to server
4. Ensure server is listening on `0.0.0.0` not `localhost`

### CORS Errors

Make sure CORS is properly configured in your server:

```javascript
app.use(cors({
  origin: '*', // For local network, or specify your app's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Next Steps

1. ✅ Set up the backend API server
2. ✅ Create SQL Server database and tables
3. ✅ Test API endpoints
4. ✅ Update React Native app to use API
5. ✅ Test end-to-end functionality
6. ✅ Deploy as Windows service for production

## Support

For issues or questions:
- Check the logs in `error.log` and `combined.log`
- Verify SQL Server connection with SQL Server Management Studio
- Test API endpoints with Postman or curl
- Check network connectivity between devices
