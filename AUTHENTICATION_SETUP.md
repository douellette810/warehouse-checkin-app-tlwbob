
# Authentication Setup Guide

This guide will help you set up user authentication for the Warehouse Check-In app.

## Database Setup

### 1. Create Users Table

Run the following SQL script in SQL Server Management Studio to create the users table:

```sql
-- Create users table
CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    employee_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON dbo.users(email);

-- Add foreign key constraint with explicit schema reference
ALTER TABLE dbo.users
ADD CONSTRAINT FK_users_employee_id 
FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE SET NULL;

-- Insert the two initial users
-- Password for both: W1@3!-j/R
-- Note: In production, these should be properly hashed. For now, we'll store them as plain text
-- and implement proper hashing in the server code.

INSERT INTO dbo.users (name, email, password_hash) VALUES 
('Dan', 'dan@circuitry.solutions', 'W1@3!-j/R'),
('Mike', 'mike@circuitry.solutions', 'W1@3!-j/R');

-- Verify the users were created
SELECT * FROM dbo.users;
```

### Alternative: Create Without Foreign Key First

If you still encounter issues, you can create the table without the foreign key first, then add it separately:

```sql
-- Step 1: Create users table without foreign key
CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    employee_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Step 2: Create index on email for faster lookups
CREATE INDEX idx_users_email ON dbo.users(email);

-- Step 3: Insert the two initial users
INSERT INTO dbo.users (name, email, password_hash) VALUES 
('Dan', 'dan@circuitry.solutions', 'W1@3!-j/R'),
('Mike', 'mike@circuitry.solutions', 'W1@3!-j/R');

-- Step 4: Verify employees table exists and has data
SELECT * FROM dbo.employees;

-- Step 5: Add foreign key constraint (only after verifying employees table exists)
ALTER TABLE dbo.users
ADD CONSTRAINT FK_users_employee_id 
FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE SET NULL;

-- Step 6: Verify the users were created
SELECT * FROM dbo.users;
```

### Troubleshooting Foreign Key Issues

If you're still getting the "references invalid table" error, try these steps:

1. **Verify the employees table exists in the dbo schema:**
   ```sql
   SELECT TABLE_SCHEMA, TABLE_NAME 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_NAME = 'employees';
   ```

2. **Check if the employees table has an 'id' column:**
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'employees' AND TABLE_SCHEMA = 'dbo';
   ```

3. **Verify the 'id' column in employees is a primary key:**
   ```sql
   SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
   FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
   WHERE TABLE_NAME = 'employees' AND TABLE_SCHEMA = 'dbo';
   ```

4. **If the foreign key constraint already exists and is causing issues, drop it first:**
   ```sql
   -- Find the constraint name
   SELECT name 
   FROM sys.foreign_keys 
   WHERE parent_object_id = OBJECT_ID('dbo.users');
   
   -- Drop the constraint (replace with actual constraint name)
   ALTER TABLE dbo.users DROP CONSTRAINT FK__users__employee___52793849;
   
   -- Then recreate it with the correct reference
   ALTER TABLE dbo.users
   ADD CONSTRAINT FK_users_employee_id 
   FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE SET NULL;
   ```

### 2. Update Server Code

Add the following authentication endpoints to your `server.js` file (after the existing endpoints):

```javascript
// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    console.log('Login attempt for:', email);
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM dbo.users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = result.recordset[0];
    
    // Check password (in production, use bcrypt.compare)
    if (user.password_hash !== password) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    console.log('Login successful for:', email);
    
    // Return user data (excluding password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      employee_id: user.employee_id,
      created_at: user.created_at
    };
    
    res.json({
      success: true,
      data: userData,
      message: 'Login successful'
    });
  } catch (error) {
    handleError(res, error, 'Error during login');
  }
});

// POST change password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    console.log('Password change attempt for user:', userId);
    
    // Get current user
    const userResult = await pool.request()
      .input('id', sql.UniqueIdentifier, userId)
      .query('SELECT * FROM dbo.users WHERE id = @id');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = userResult.recordset[0];
    
    // Verify current password (in production, use bcrypt.compare)
    if (user.password_hash !== currentPassword) {
      console.log('Current password incorrect for user:', userId);
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password (in production, use bcrypt.hash)
    await pool.request()
      .input('id', sql.UniqueIdentifier, userId)
      .input('newPassword', sql.NVarChar, newPassword)
      .query('UPDATE dbo.users SET password_hash = @newPassword WHERE id = @id');
    
    console.log('Password changed successfully for user:', userId);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error changing password');
  }
});

// POST update employee preference
app.post('/api/auth/update-employee-preference', async (req, res) => {
  try {
    const { userId, employeeId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    console.log('Updating employee preference for user:', userId, 'to employee:', employeeId);
    
    // Update user's employee preference
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, userId)
      .input('employeeId', employeeId ? sql.UniqueIdentifier : sql.NVarChar, employeeId || null)
      .query(`
        UPDATE dbo.users SET employee_id = @employeeId WHERE id = @id;
        SELECT id, name, email, employee_id, created_at FROM dbo.users WHERE id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('Employee preference updated successfully');
    
    res.json({
      success: true,
      data: result.recordset[0],
      message: 'Employee preference updated successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error updating employee preference');
  }
});
```

### 3. Update Available Endpoints List

Update the server startup message to include the new authentication endpoints:

```javascript
console.log('  Available endpoints:');
console.log(`     GET  /health                    - Health check`);
console.log(`     POST /api/auth/login            - User login`);
console.log(`     POST /api/auth/change-password  - Change password`);
console.log(`     POST /api/auth/update-employee-preference - Update employee preference`);
console.log(`     GET  /api/employees             - Get all employees`);
// ... rest of endpoints
```

## Testing

### 1. Test User Login

Use a tool like Postman or curl to test the login endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dan@circuitry.solutions","password":"W1@3!-j/R"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Dan",
    "email": "dan@circuitry.solutions",
    "employee_id": null,
    "created_at": "..."
  },
  "message": "Login successful"
}
```

### 2. Test Password Change

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user-id-from-login>",
    "currentPassword":"W1@3!-j/R",
    "newPassword":"NewPassword123"
  }'
```

### 3. Test Employee Preference

```bash
curl -X POST http://localhost:3000/api/auth/update-employee-preference \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user-id>",
    "employeeId":"<employee-id>"
  }'
```

## Security Notes

**IMPORTANT**: The current implementation stores passwords in plain text for simplicity. 
In a production environment, you should:

1. Install bcrypt: `npm install bcrypt`
2. Hash passwords before storing:
   ```javascript
   const bcrypt = require('bcrypt');
   const saltRounds = 10;
   const hash = await bcrypt.hash(password, saltRounds);
   ```
3. Compare passwords securely:
   ```javascript
   const match = await bcrypt.compare(password, user.password_hash);
   ```

## User Credentials

- **User 1 (Dan)**
  - Email: dan@circuitry.solutions
  - Password: W1@3!-j/R

- **User 2 (Mike)**
  - Email: mike@circuitry.solutions
  - Password: W1@3!-j/R

## Features

1. **User Login**: Users must log in before accessing the check-in form
2. **Password Change**: Users can change their password from within the app
3. **Employee Autofill**: Users can select their employee entry, which will be saved and auto-filled in future check-ins
4. **Session Management**: User session is stored locally using AsyncStorage
5. **Logout**: Users can logout from the user menu in the check-in screen

## Troubleshooting

### Login fails with "User not found"
- Verify the users table was created successfully
- Check that the initial users were inserted
- Verify the email address is correct

### Password change fails
- Ensure the current password is correct
- Check that the user ID is valid
- Verify the database connection is working

### Employee preference not saving
- Ensure the employee_id foreign key constraint is set up correctly
- Verify the employee exists in the employees table
- Check server logs for any errors

### Foreign key constraint error
- Ensure the employees table exists in the dbo schema
- Verify the employees table has an 'id' column that is a primary key
- Use the troubleshooting queries above to diagnose the issue
- Try creating the table without the foreign key first, then adding it separately
