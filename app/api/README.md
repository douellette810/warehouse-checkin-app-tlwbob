
# Backend API Setup Guide

**⚠️ IMPORTANT: This directory contains templates for a SEPARATE backend server project.**

**These files are NOT part of the React Native app and should NOT be imported or used directly in the app.**

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

## Quick Setup Instructions

### 1. Create a Separate Backend Project

**On your CRSERV machine**, create a new directory for the backend:

```bash
mkdir warehouse-api
cd warehouse-api
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mssql cors dotenv
npm install --save-dev nodemon
```

### 3. Copy Template Files

Copy these files from this directory to your new `warehouse-api` directory:
- `server-template.txt` → rename to `server.js`
- `.env.template` → rename to `.env` and fill in your credentials
- `package.json.template` → rename to `package.json`

### 4. Configure Database Connection

Edit the `.env` file with your SQL Server credentials:

```env
DB_SERVER=CRSERV\\SQLEXPRESS
DB_USER=sql
DB_PASSWORD=W1@3!-j/R
DB_DATABASE=WarehouseCheckIn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
PORT=3000
```

### 5. Start the Server

```bash
npm run dev
```

### 6. Configure Windows Firewall

Open Command Prompt as Administrator:

```powershell
netsh advfirewall firewall add rule name="Warehouse API" dir=in action=allow protocol=TCP localport=3000
```

### 7. Find Your Server IP

```bash
ipconfig
```

Look for the IPv4 Address (e.g., `192.168.40.239`)

### 8. Update React Native App

In your React Native project, edit `app/api/client.ts`:

```typescript
const API_BASE_URL = 'http://192.168.40.239:3000'; // Replace with your server IP
```

## Files in This Directory

- **server-template.txt** - Complete Express server template (copy to backend project as server.js)
- **.env.template** - Environment variables template (copy and configure)
- **package.json.template** - Package configuration template (copy to backend project)
- **client.ts** - React Native API client (THIS IS USED BY THE APP)
- **README.md** - This file
- **API_REFERENCE.md** - API endpoint documentation

## Important Notes

⚠️ **DO NOT import server-template.txt in your React Native app!**

The `server-template.txt` file contains Node.js server code (express, mssql, etc.) that is not compatible with React Native. It should only be used in a separate Node.js backend project.

The React Native app should only use `client.ts` to make HTTP requests to the backend API.

## Troubleshooting

### "Login failed for user" Error

- Verify SQL Server Authentication is enabled
- Check that the SQL user has proper permissions (db_datareader and db_datawriter roles)
- Ensure the credentials in `.env` are correct

### Cannot Access API from Mobile Device

1. Verify both devices are on the same network
2. Check Windows Firewall settings
3. Ensure server is listening on `0.0.0.0` (not just `localhost`)
4. Test with: `http://<server-ip>:3000/health`

### Module Resolution Errors in React Native

If you see errors like "Unable to resolve module express":
- This means the React Native bundler is trying to include backend files
- The backend files should be in a separate project directory
- Make sure you've copied `server-template.txt` to your backend project

## Full Documentation

For complete setup instructions, see:
- `BACKEND_SETUP_GUIDE.md` in the project root
- `API_REFERENCE.md` for API endpoint documentation

## Production Deployment

### Run as Windows Service

```bash
npm install -g node-windows
```

Create `install-service.js` in your backend project and run it to install the API as a Windows service.

### Use PM2 Process Manager

```bash
npm install -g pm2
pm2 start server.js --name warehouse-api
pm2 startup
pm2 save
```

## Support

For issues:
1. Check server logs in Command Prompt
2. Verify SQL Server connection with SSMS
3. Test API endpoints with browser or Postman
4. Check network connectivity
5. Review Windows Firewall and SQL Server logs
