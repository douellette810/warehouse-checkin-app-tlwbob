
# Security Quick Reference Guide

## 🚨 Problem: Database is accessible from outside the network

### Quick Diagnosis

Run these commands on CRSERV to check your security configuration:

```powershell
# 1. Check if SQL Server is listening on all interfaces (BAD)
netstat -an | findstr :1433

# 2. Check firewall rules
netsh advfirewall firewall show rule name="SQL Server - Local Network Only"
netsh advfirewall firewall show rule name="SQL Server - Block External"

# 3. Check API binding
netstat -an | findstr :3000
```

### Expected Results

**SQL Server (Port 1433):**
```
TCP    192.168.40.239:1433    0.0.0.0:0    LISTENING
TCP    127.0.0.1:1433         0.0.0.0:0    LISTENING
```
❌ If you see `0.0.0.0:1433` → SQL Server is listening on ALL interfaces (INSECURE)

**API Server (Port 3000):**
```
TCP    192.168.40.239:3000    0.0.0.0:0    LISTENING
```
❌ If you see `0.0.0.0:3000` → API is listening on ALL interfaces (INSECURE)

---

## 🔧 Quick Fixes

### Fix 1: SQL Server Listening on All Interfaces

**Problem:** SQL Server is accessible from any network interface.

**Solution:**
1. Open SQL Server Configuration Manager
2. SQL Server Network Configuration → Protocols for SQLEXPRESS
3. Right-click TCP/IP → Properties → IP Addresses tab
4. **IPAll section:** Clear both TCP Port fields
5. **IP1 (192.168.40.239):** Set TCP Port to 1433, Enabled = Yes
6. **IP2 (127.0.0.1):** Set TCP Port to 1433, Enabled = Yes
7. **All other IPs:** Set Enabled = No
8. Restart SQL Server service

---

### Fix 2: Missing Firewall Rules

**Problem:** No firewall rules blocking external access.

**Solution (Run as Administrator):**
```powershell
# SQL Server rules
netsh advfirewall firewall add rule name="SQL Server - Local Network Only" dir=in action=allow protocol=TCP localport=1433 remoteip=192.168.40.0/24 profile=any

netsh advfirewall firewall add rule name="SQL Server - Block External" dir=in action=block protocol=TCP localport=1433 remoteip=any profile=any

# API rules
netsh advfirewall firewall add rule name="Warehouse API - Local Network Only" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.40.0/24 profile=any

netsh advfirewall firewall add rule name="Warehouse API - Block External" dir=in action=block protocol=TCP localport=3000 remoteip=any profile=any
```

---

### Fix 3: Router Port Forwarding

**Problem:** Router is forwarding external traffic to your server.

**Solution:**
1. Log into router admin panel (usually http://192.168.40.1)
2. Find "Port Forwarding" or "Virtual Server" section
3. Delete ANY rules for ports 1433 or 3000
4. Check DMZ settings - remove server from DMZ if present
5. Consider disabling UPnP
6. Save and reboot router

---

### Fix 4: API Listening on All Interfaces

**Problem:** Backend API accepts connections from any IP.

**Solution:**
1. Edit `.env` file in `warehouse-api` directory:
   ```env
   HOST=192.168.40.239
   ```

2. Edit `server.js` to use HOST variable:
   ```javascript
   const HOST = process.env.HOST || '192.168.40.239';
   app.listen(PORT, HOST, () => {
     console.log(`Server running on: http://${HOST}:${PORT}`);
   });
   ```

3. Restart API server:
   ```bash
   npm run dev
   ```

---

## 🧪 Quick Security Test

### Test from OUTSIDE your network (use mobile data):

```bash
# Try to access API (should FAIL)
curl http://[YOUR_PUBLIC_IP]:3000/health

# Expected: Connection timeout or refused
```

### Test from INSIDE your network (use Wi-Fi):

```bash
# Try to access API (should WORK)
curl http://192.168.40.239:3000/health

# Expected: {"success":true,"message":"Warehouse API is running"}
```

---

## 📋 Security Checklist (5 Minutes)

Quick verification that all security layers are configured:

```powershell
# Run these commands on CRSERV:

# 1. Check SQL Server binding
netstat -an | findstr :1433
# Should show: 192.168.40.239:1433 and 127.0.0.1:1433 ONLY

# 2. Check API binding
netstat -an | findstr :3000
# Should show: 192.168.40.239:3000 ONLY

# 3. Check firewall rules exist
netsh advfirewall firewall show rule name="SQL Server - Local Network Only"
netsh advfirewall firewall show rule name="SQL Server - Block External"
netsh advfirewall firewall show rule name="Warehouse API - Local Network Only"
netsh advfirewall firewall show rule name="Warehouse API - Block External"
# All four rules should exist

# 4. Check Windows Firewall is enabled
netsh advfirewall show allprofiles state
# Should show: State ON for all profiles
```

**Router Check:**
- [ ] Log into router admin panel
- [ ] Verify NO port forwarding for 1433 or 3000
- [ ] Verify server NOT in DMZ

**External Access Test:**
- [ ] Use mobile data (not Wi-Fi)
- [ ] Try accessing http://[PUBLIC_IP]:3000/health
- [ ] Should fail with timeout or connection refused

---

## 🆘 Emergency Commands

### Immediately Block All External Access

If you discover unauthorized access, run these commands immediately:

```powershell
# Block ALL incoming connections to SQL Server
netsh advfirewall firewall add rule name="EMERGENCY - Block SQL Server" dir=in action=block protocol=TCP localport=1433 profile=any

# Block ALL incoming connections to API
netsh advfirewall firewall add rule name="EMERGENCY - Block API" dir=in action=block protocol=TCP localport=3000 profile=any

# Stop SQL Server service
net stop MSSQL$SQLEXPRESS

# Stop API server (if running as service)
# Or close the Command Prompt window running the API
```

### Check for Unauthorized Access

```sql
-- In SQL Server Management Studio, run:

-- Check current connections
SELECT 
    session_id,
    login_name,
    host_name,
    program_name,
    login_time,
    last_request_start_time
FROM sys.dm_exec_sessions
WHERE is_user_process = 1
ORDER BY login_time DESC;

-- Check recent failed login attempts
-- (Requires SQL Server Audit to be enabled)
```

---

## 📞 Support Contacts

**For security issues:**
1. Immediately disconnect server from network
2. Document what you observed
3. Review logs for unauthorized access
4. Change all passwords
5. Restore from backup if necessary

**For configuration help:**
- See: `NETWORK_SECURITY_GUIDE.md` for detailed instructions
- See: `BACKEND_SETUP_GUIDE.md` for setup procedures

---

## 🔑 Key Takeaways

1. **The React Native app CANNOT fix this** - it's a server configuration issue
2. **All four layers must be configured** - SQL Server, Firewall, Router, API
3. **Test regularly** - Security configurations can change
4. **Document everything** - Keep records of your security setup
5. **Monitor logs** - Watch for unauthorized access attempts

**Security is not a one-time setup - it requires ongoing maintenance and monitoring!** 🔒
