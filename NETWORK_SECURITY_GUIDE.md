
# Network Security Guide for Warehouse Check-In App

## 🔒 Overview

This guide explains how to properly secure your SQL Server database and backend API to prevent unauthorized external access while maintaining functionality within your local network.

**⚠️ CRITICAL UNDERSTANDING:**
- The React Native app code **CANNOT** control network security
- Database accessibility from outside your network is a **server-side infrastructure issue**
- Security must be configured on your SQL Server machine and network router
- All security layers must be properly configured to prevent data breaches

---

## 🎯 Security Goal

**Objective:** Make the database and API accessible ONLY from devices within your local network (192.168.40.x), while completely blocking all external access from the internet.

**What this prevents:**
- Unauthorized access to customer data
- Data breaches from external attackers
- Accidental exposure of sensitive information
- Compliance violations related to data security

---

## 🛡️ Security Layers (All Required)

To properly secure your system, you must configure **ALL** of these layers. Missing even one layer can leave your database exposed.

### Layer 1: SQL Server Network Configuration

**Purpose:** Configure SQL Server to only listen on your local network interface.

**Steps:**

1. Open **SQL Server Configuration Manager**
   - Press Windows Key + R
   - Type: `SQLServerManager15.msc` (or appropriate version)
   - Press Enter

2. Navigate to **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**

3. Right-click **TCP/IP** → **Properties**

4. Go to the **IP Addresses** tab

5. Configure each IP section:

   **IPAll Section:**
   - Clear the **TCP Dynamic Ports** field
   - Clear the **TCP Port** field

   **IP1 (Your Local Network IP - 192.168.40.239):**
   - **Enabled**: Yes
   - **Active**: Yes
   - **TCP Dynamic Ports**: (leave blank)
   - **TCP Port**: 1433

   **IP2 (Loopback - 127.0.0.1):**
   - **Enabled**: Yes
   - **Active**: Yes
   - **TCP Dynamic Ports**: (leave blank)
   - **TCP Port**: 1433

   **All Other IP Sections:**
   - **Enabled**: No
   - **Active**: No

6. Click **OK**

7. Restart SQL Server:
   - In SQL Server Configuration Manager
   - Go to **SQL Server Services**
   - Right-click **SQL Server (SQLEXPRESS)**
   - Click **Restart**

**What this does:**
- SQL Server will ONLY accept connections from 192.168.40.239 and localhost
- Connections from any other IP address will be rejected at the SQL Server level
- Even if firewall rules are bypassed, SQL Server won't respond

**Verification:**
```powershell
# Check which IPs SQL Server is listening on
netstat -an | findstr :1433
```
You should only see 192.168.40.239:1433 and 127.0.0.1:1433

---

### Layer 2: Windows Firewall Configuration

**Purpose:** Create explicit firewall rules to block external connections while allowing local network access.

**Steps:**

1. Open **Command Prompt as Administrator**
   - Press Windows Key
   - Type: `cmd`
   - Right-click **Command Prompt**
   - Select **Run as administrator**

2. Remove any existing conflicting rules:
```powershell
netsh advfirewall firewall delete rule name="SQL Server"
netsh advfirewall firewall delete rule name="SQL Server Browser"
netsh advfirewall firewall delete rule name="Warehouse API"
```

3. Create new restrictive rules:

**For SQL Server (Port 1433):**
```powershell
# Allow connections from local network only
netsh advfirewall firewall add rule name="SQL Server - Local Network Only" dir=in action=allow protocol=TCP localport=1433 remoteip=192.168.40.0/24 profile=any

# Block all other connections
netsh advfirewall firewall add rule name="SQL Server - Block External" dir=in action=block protocol=TCP localport=1433 remoteip=any profile=any
```

**For Backend API (Port 3000):**
```powershell
# Allow connections from local network only
netsh advfirewall firewall add rule name="Warehouse API - Local Network Only" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.40.0/24 profile=any

# Block all other connections
netsh advfirewall firewall add rule name="Warehouse API - Block External" dir=in action=block protocol=TCP localport=3000 remoteip=any profile=any
```

**Important Notes:**
- `192.168.40.0/24` means IPs from 192.168.40.1 to 192.168.40.254
- If your network uses a different subnet (e.g., 192.168.1.x), adjust accordingly
- The BLOCK rules have lower priority but catch anything not explicitly allowed
- `profile=any` applies rules to all firewall profiles (Domain, Private, Public)

**What this does:**
- Creates explicit ALLOW rules for your local network
- Creates explicit BLOCK rules for all other IPs
- Protects both SQL Server and the API server
- Works even if someone tries to bypass other security layers

**Verification:**
```powershell
# View SQL Server firewall rules
netsh advfirewall firewall show rule name="SQL Server - Local Network Only"
netsh advfirewall firewall show rule name="SQL Server - Block External"

# View API firewall rules
netsh advfirewall firewall show rule name="Warehouse API - Local Network Only"
netsh advfirewall firewall show rule name="Warehouse API - Block External"
```

---

### Layer 3: Network Router Configuration

**Purpose:** Ensure your router is not forwarding external traffic to your database server.

**Steps:**

1. **Find your router's IP address:**
   ```powershell
   ipconfig | findstr "Default Gateway"
   ```
   Common addresses: 192.168.1.1, 192.168.0.1, 192.168.40.1

2. **Log into router admin panel:**
   - Open a web browser
   - Navigate to your router's IP address
   - Enter admin username and password

3. **Check Port Forwarding settings:**
   - Look for sections named:
     - "Port Forwarding"
     - "Virtual Server"
     - "NAT Forwarding"
     - "Applications & Gaming"
   - **Verify there are NO rules for:**
     - Port 1433 (SQL Server)
     - Port 3000 (API Server)
   - **If any exist, DELETE them**

4. **Check DMZ settings:**
   - Look for "DMZ" or "Demilitarized Zone" settings
   - **Ensure CRSERV (192.168.40.239) is NOT in the DMZ**
   - If it is, remove it immediately

5. **Check UPnP settings:**
   - Look for "UPnP" or "Universal Plug and Play"
   - **Consider disabling UPnP** to prevent automatic port forwarding
   - Some applications may automatically open ports via UPnP

6. **Save all changes and reboot router if necessary**

**What this does:**
- Prevents your router from forwarding external internet traffic to your server
- Ensures the database is not accessible from the internet
- Blocks automatic port opening by applications

**Verification:**
- Use an online port checker from outside your network
- Visit: https://www.yougetsignal.com/tools/open-ports/
- Enter your public IP address and port 1433
- Should show "closed" or "filtered"

---

### Layer 4: Backend API Server Binding

**Purpose:** Configure the Node.js API server to only accept connections on the local network interface.

**Steps:**

1. **Update your `.env` file** in the `warehouse-api` directory:
```env
HOST=192.168.40.239
PORT=3000
```

2. **Update your `server.js` file** to use the HOST variable:

Find the section near the end of the file:
```javascript
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '192.168.40.239';

app.listen(PORT, HOST, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🚀 Warehouse Check-In API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on: http://${HOST}:${PORT}`);
  console.log(`  🔒 Server bound to local network only`);
  console.log(`  🔐 Authentication: ${config.authMode}`);
  console.log('═══════════════════════════════════════════════════════════');
});
```

**What NOT to do:**
```javascript
// ❌ WRONG - Accepts connections from any IP
app.listen(PORT, '0.0.0.0', () => { ... });

// ❌ WRONG - Only accepts localhost connections
app.listen(PORT, '127.0.0.1', () => { ... });

// ❌ WRONG - Accepts connections from any IP (default behavior)
app.listen(PORT, () => { ... });
```

**What this does:**
- The API server will ONLY accept connections on the 192.168.40.239 interface
- Connections to other interfaces (if they exist) will be rejected
- Provides an additional layer of security at the application level

**Verification:**
```powershell
# Check which IP the API is listening on
netstat -an | findstr :3000
```
You should only see 192.168.40.239:3000

---

## 🧪 Security Testing Procedures

After configuring all security layers, you must test to ensure external access is blocked.

### Test 1: Internal Access (Should Work)

**Purpose:** Verify that devices on your local network can access the system.

**Steps:**
1. Connect a device (phone, tablet, laptop) to your local Wi-Fi network
2. Verify the device has an IP in the 192.168.40.x range:
   - On phone: Settings → Wi-Fi → Tap your network → View IP
   - On laptop: Run `ipconfig` in Command Prompt
3. Open a web browser on the device
4. Navigate to: `http://192.168.40.239:3000/health`
5. **Expected result:** ✅ You should see a JSON response:
   ```json
   {
     "success": true,
     "message": "Warehouse API is running",
     "database": "connected"
   }
   ```

**If this fails:**
- Check that the API server is running
- Verify Windows Firewall rules allow local network access
- Ensure the device is on the correct network
- Check that the API is bound to the correct IP

---

### Test 2: External Access via Public IP (Should Fail)

**Purpose:** Verify that devices outside your network cannot access the system.

**Steps:**
1. Find your public IP address:
   - On CRSERV, visit: https://whatismyipaddress.com
   - Note your public IP (e.g., 203.0.113.45)

2. Disconnect your mobile device from Wi-Fi
3. Use mobile data (4G/5G) to access the internet
4. Open a web browser on the device
5. Try to navigate to: `http://[YOUR_PUBLIC_IP]:3000/health`
   - Example: `http://203.0.113.45:3000/health`
6. **Expected result:** ❌ Connection should timeout or be refused
   - "This site can't be reached"
   - "Connection timed out"
   - "ERR_CONNECTION_REFUSED"

**If you CAN access it (SECURITY ISSUE):**
- Your router has port forwarding enabled → Check Layer 3
- UPnP automatically opened the port → Disable UPnP
- VPN or remote access software is exposing the port → Disable temporarily
- Firewall rules are not active → Check Layer 2

---

### Test 3: SQL Server Direct Access (Should Fail Externally)

**Purpose:** Verify that SQL Server cannot be accessed directly from outside the network.

**Steps:**
1. From a device OUTSIDE your network (using mobile data)
2. Try to connect to SQL Server using any SQL client:
   - Server: `[YOUR_PUBLIC_IP],1433`
   - Example: `203.0.113.45,1433`
3. **Expected result:** ❌ Connection should timeout or be refused

**If you CAN connect (CRITICAL SECURITY ISSUE):**
- SQL Server is listening on all interfaces → Check Layer 1
- Router is forwarding port 1433 → Check Layer 3
- Firewall rules are not blocking → Check Layer 2

---

### Test 4: Port Scanning (Should Show Closed)

**Purpose:** Verify that ports appear closed to external scanners.

**Steps:**
1. Visit: https://www.yougetsignal.com/tools/open-ports/
2. Enter your public IP address
3. Enter port: 1433
4. Click "Check"
5. **Expected result:** ❌ "Port 1433 is closed"

6. Repeat for port 3000
7. **Expected result:** ❌ "Port 3000 is closed"

**If ports show as "open" (SECURITY ISSUE):**
- Router is forwarding these ports → Check Layer 3
- Firewall is not blocking → Check Layer 2
- SQL Server is listening on all interfaces → Check Layer 1

---

## 🚨 Common Security Issues and Solutions

### Issue 1: Database accessible from internet despite firewall rules

**Symptoms:**
- External devices can connect to SQL Server
- Port scanners show port 1433 as open

**Possible causes and solutions:**

1. **Router port forwarding:**
   - Log into router admin panel
   - Check for port forwarding rules
   - Delete any rules for ports 1433 or 3000

2. **UPnP automatically opened ports:**
   - Disable UPnP in router settings
   - Reboot router
   - Retest external access

3. **SQL Server listening on all interfaces:**
   - Check SQL Server Configuration Manager
   - Verify TCP/IP is only enabled for local network IP
   - Restart SQL Server service

4. **Firewall rules not active:**
   - Verify Windows Firewall is enabled
   - Check that rules are in the correct profile (Domain/Private/Public)
   - Recreate rules with `profile=any` parameter

5. **VPN or remote access software:**
   - TeamViewer, AnyDesk, LogMeIn, etc. may expose ports
   - Temporarily disable and retest
   - Configure these tools to not expose SQL Server ports

---

### Issue 2: Internal devices cannot connect

**Symptoms:**
- Devices on local network get connection errors
- API health check fails from local devices

**Possible causes and solutions:**

1. **API not running:**
   - Check that Node.js server is running
   - Restart with `npm run dev`

2. **API bound to wrong IP:**
   - Check `.env` file has correct HOST value
   - Verify `server.js` uses the HOST variable
   - Restart API server

3. **Firewall blocking local network:**
   - Verify ALLOW rules exist for local network
   - Check that `remoteip=192.168.40.0/24` is correct
   - Ensure ALLOW rules have higher priority than BLOCK rules

4. **Device on wrong network:**
   - Verify device is connected to correct Wi-Fi
   - Check device IP is in 192.168.40.x range
   - Try pinging the server: `ping 192.168.40.239`

---

### Issue 3: Intermittent connectivity issues

**Symptoms:**
- Sometimes works, sometimes doesn't
- Connection drops randomly

**Possible causes and solutions:**

1. **DHCP IP address changes:**
   - Server IP changed from 192.168.40.239
   - Set static IP in Windows network settings
   - Update all configuration files if IP changed

2. **SQL Server service stopping:**
   - Check SQL Server service status
   - Set service to start automatically
   - Check Windows Event Logs for errors

3. **Firewall profile switching:**
   - Windows switches between Public/Private profiles
   - Use `profile=any` in firewall rules
   - Set network to Private profile in Windows settings

---

## 📋 Security Checklist

Use this checklist to verify all security layers are properly configured:

### SQL Server Configuration
- [ ] SQL Server Configuration Manager opened
- [ ] TCP/IP protocol enabled
- [ ] TCP/IP bound to local network IP only (192.168.40.239)
- [ ] TCP/IP NOT listening on 0.0.0.0 or other interfaces
- [ ] SQL Server service restarted after changes
- [ ] Verified with `netstat -an | findstr :1433`

### Windows Firewall Configuration
- [ ] Command Prompt opened as Administrator
- [ ] Old conflicting rules deleted
- [ ] ALLOW rule created for SQL Server (local network)
- [ ] BLOCK rule created for SQL Server (external)
- [ ] ALLOW rule created for API (local network)
- [ ] BLOCK rule created for API (external)
- [ ] Rules verified with `netsh advfirewall firewall show rule`
- [ ] Windows Firewall is enabled

### Router Configuration
- [ ] Router admin panel accessed
- [ ] Port forwarding checked (NO rules for 1433 or 3000)
- [ ] DMZ checked (server NOT in DMZ)
- [ ] UPnP status checked (consider disabling)
- [ ] Router rebooted after changes
- [ ] Changes saved

### Backend API Configuration
- [ ] `.env` file has HOST=192.168.40.239
- [ ] `server.js` uses HOST variable in app.listen()
- [ ] API server restarted after changes
- [ ] Verified with `netstat -an | findstr :3000`

### Testing
- [ ] Internal access test passed (from local network)
- [ ] External access test failed (from mobile data)
- [ ] SQL Server direct access test failed (from external)
- [ ] Port scanning test shows ports closed
- [ ] React Native app can connect from local network

### Documentation
- [ ] All configuration changes documented
- [ ] IP addresses recorded
- [ ] Firewall rules documented
- [ ] Security testing results recorded
- [ ] Team members informed of security requirements

---

## 🔄 Maintenance and Monitoring

### Regular Security Audits

Perform these checks monthly:

1. **Test external access:**
   - Use mobile data to verify ports are still blocked
   - Run port scans to check for exposure

2. **Review firewall rules:**
   ```powershell
   netsh advfirewall firewall show rule name=all | findstr "SQL\|Warehouse"
   ```

3. **Check SQL Server configuration:**
   - Verify TCP/IP settings haven't changed
   - Check for unauthorized logins in SQL Server logs

4. **Review router settings:**
   - Check for new port forwarding rules
   - Verify UPnP status

### Logging and Monitoring

Enable logging to detect unauthorized access attempts:

1. **SQL Server logging:**
   - Enable failed login auditing
   - Review SQL Server error logs regularly
   - Monitor for unusual connection attempts

2. **Windows Firewall logging:**
   ```powershell
   # Enable firewall logging
   netsh advfirewall set allprofiles logging droppedconnections enable
   netsh advfirewall set allprofiles logging allowedconnections enable
   
   # View log location
   netsh advfirewall show allprofiles
   ```

3. **API server logging:**
   - Implement request logging in your API
   - Monitor for unusual access patterns
   - Log all failed authentication attempts

---

## 📞 Emergency Response

If you discover unauthorized access:

1. **Immediate actions:**
   - Disconnect server from network
   - Change all SQL Server passwords
   - Review SQL Server logs for unauthorized queries
   - Check for data modifications or deletions

2. **Investigation:**
   - Review firewall logs
   - Check router logs
   - Examine SQL Server audit logs
   - Identify how access was gained

3. **Remediation:**
   - Reconfigure all security layers
   - Update passwords and credentials
   - Patch any vulnerabilities discovered
   - Restore from backup if data was compromised

4. **Prevention:**
   - Document the incident
   - Update security procedures
   - Implement additional monitoring
   - Train team members on security best practices

---

## 📚 Additional Resources

### Windows Firewall Commands Reference

```powershell
# View all firewall rules
netsh advfirewall firewall show rule name=all

# View specific rule
netsh advfirewall firewall show rule name="SQL Server - Local Network Only"

# Delete a rule
netsh advfirewall firewall delete rule name="Rule Name"

# Enable/disable firewall
netsh advfirewall set allprofiles state on
netsh advfirewall set allprofiles state off

# Reset firewall to defaults (USE WITH CAUTION)
netsh advfirewall reset
```

### SQL Server Configuration Commands

```sql
-- Check current connections
SELECT 
    session_id,
    login_name,
    host_name,
    program_name,
    client_interface_name,
    login_time
FROM sys.dm_exec_sessions
WHERE is_user_process = 1;

-- View failed login attempts
SELECT TOP 100 *
FROM sys.fn_xe_file_target_read_file('system_health*.xel', NULL, NULL, NULL)
WHERE object_name = 'error_reported'
AND CAST(event_data AS XML).value('(event/data[@name="error_number"]/value)[1]', 'int') = 18456;
```

### Network Diagnostic Commands

```powershell
# Check which ports are listening
netstat -an | findstr LISTENING

# Check specific port
netstat -an | findstr :1433

# Test connectivity to server
Test-NetConnection -ComputerName 192.168.40.239 -Port 3000

# View network interfaces
ipconfig /all

# View routing table
route print
```

---

## ✅ Summary

**Key Points:**

1. **The React Native app cannot control network security** - this is entirely a server-side configuration issue

2. **All four security layers must be configured:**
   - SQL Server network binding
   - Windows Firewall rules
   - Router configuration
   - Backend API binding

3. **Testing is critical:**
   - Always test both internal and external access
   - Use multiple methods to verify security
   - Perform regular security audits

4. **Documentation is important:**
   - Keep records of all configuration changes
   - Document IP addresses and network settings
   - Maintain security testing results

5. **Security is ongoing:**
   - Regularly review and test security
   - Monitor logs for unauthorized access attempts
   - Keep systems updated and patched

**Your data is only as secure as your weakest security layer. Configure all layers properly and test regularly!** 🔒
