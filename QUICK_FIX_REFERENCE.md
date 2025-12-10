
# Quick Fix Reference

## ✅ Build Errors Fixed

### Error 1: Expo Config Warning ✅ FIXED
**Error Message:**
```
Warning: Root-level "expo" object found. Ignoring extra key in Expo config: "scheme"
```

**What was fixed:**
- Removed duplicate `scheme` key from `app.json`
- Now only defined once inside the `expo` object

---

### Error 2: Module Resolution Error ✅ FIXED
**Error Message:**
```
Error: Unable to resolve module express from /expo-project/app/api/server-template.js
```

**What was fixed:**
- Updated `metro.config.js` to exclude backend template files
- Backend files are now blocked from React Native bundle

---

## 🚀 What You Need to Know

### Important: Backend vs React Native

Your project has TWO separate parts:

#### 1. React Native App (Mobile)
- **Location:** Your current project directory
- **Uses:** `app/api/client.ts` to make HTTP requests
- **Runs on:** Mobile devices (iOS/Android)

#### 2. Backend API Server (Node.js)
- **Location:** Separate directory on CRSERV (e.g., `C:\warehouse-api`)
- **Uses:** `server-template.js` (copied from `app/api/`)
- **Runs on:** CRSERV machine
- **Connects to:** SQL Server database

### The Template Files

Files in `app/api/` directory:

| File | Purpose | Used By |
|------|---------|---------|
| `client.ts` | HTTP client | ✅ React Native App |
| `server-template.js` | Backend server | ⚠️ Copy to separate backend project |
| `.env.template` | Config template | ⚠️ Copy to separate backend project |
| `package.json.template` | Package config | ⚠️ Copy to separate backend project |
| `README.md` | Documentation | 📖 Reference |
| `API_REFERENCE.md` | API docs | 📖 Reference |

---

## 🔧 Next Steps

### If You Haven't Set Up the Backend Yet

1. **Create backend project on CRSERV:**
   ```bash
   mkdir C:\warehouse-api
   cd C:\warehouse-api
   npm init -y
   ```

2. **Install dependencies:**
   ```bash
   npm install express mssql cors dotenv
   ```

3. **Copy template:**
   ```bash
   copy app\api\server-template.js C:\warehouse-api\server.js
   ```

4. **Configure database:**
   - Create `.env` file in `C:\warehouse-api`
   - Add your SQL Server credentials

5. **Start server:**
   ```bash
   npm start
   ```

6. **Update React Native app:**
   - Edit `app/api/client.ts`
   - Set `API_BASE_URL` to your server IP

### If You Already Have the Backend Running

1. **Restart Expo dev server:**
   ```bash
   npm run dev
   ```

2. **Clear cache if needed:**
   ```bash
   npx expo start --clear
   ```

3. **Test the app:**
   - Open on your mobile device
   - Try accessing Admin panel
   - Verify data loads from SQL Server

---

## 📚 Full Documentation

For complete instructions, see:
- **BACKEND_SETUP_GUIDE.md** - Step-by-step backend setup
- **BUILD_ERRORS_FIXED.md** - Detailed explanation of fixes
- **app/api/README.md** - Backend API overview

---

## ❓ Common Questions

### Q: Why can't React Native connect directly to SQL Server?
**A:** React Native apps run on mobile devices and cannot use Node.js modules like `mssql`. You need a backend API as an intermediary.

### Q: Do I need to install express in my React Native project?
**A:** No! Express is only needed in the separate backend project. The React Native app uses `fetch` to make HTTP requests.

### Q: Where should the backend server run?
**A:** On your CRSERV machine (or any machine on your local network that can access SQL Server).

### Q: Can I delete the template files from my React Native project?
**A:** You can, but it's recommended to keep them for reference. They're now excluded from the bundle by Metro config.

### Q: What if I see the express error again?
**A:** 
1. Make sure `metro.config.js` has the blockList configuration
2. Restart Expo dev server
3. Clear Metro cache: `npx expo start --clear`

---

## 🎯 Quick Checklist

- [x] Fixed Expo config warning
- [x] Fixed module resolution error
- [x] Updated Metro config
- [x] Updated documentation
- [ ] Set up backend API server (if not done)
- [ ] Test end-to-end functionality

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Metro config:**
   - Open `metro.config.js`
   - Verify `blockList` is present

2. **Restart dev server:**
   ```bash
   npx expo start --clear
   ```

3. **Check backend setup:**
   - Is backend running on CRSERV?
   - Can you access `http://localhost:3000/health`?
   - Is firewall configured?

4. **Review documentation:**
   - BACKEND_SETUP_GUIDE.md
   - BUILD_ERRORS_FIXED.md

---

## ✨ You're All Set!

The build errors are fixed. Your React Native app should now build successfully without trying to include Node.js backend modules.

If you haven't set up the backend API yet, follow the BACKEND_SETUP_GUIDE.md to get it running on your CRSERV machine.
