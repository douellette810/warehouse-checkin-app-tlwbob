
# Authentication Setup Guide

This guide will help you set up user authentication for the Warehouse Check-In app.

## Database Setup

### IMPORTANT: Foreign Key Constraint Error Fix

If you're getting the error **"Foreign key 'FK_users_employee_id' references invalid table 'dbo.employees'"**, follow these steps:

#### Step 1: Verify employees table has a PRIMARY KEY

The most common cause is that the `employees` table doesn't have a primary key defined on the `id` column. Run this query to check:

```sql
-- Check if employees table has a primary key
SELECT 
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE,
    kcu.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_NAME = 'employees' 
    AND tc.TABLE_SCHEMA = 'dbo'
    AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY';
```

**If this returns no results**, the `id` column is not a primary key. Fix it with:

```sql
-- Add primary key to employees table
ALTER TABLE dbo.employees
ADD CONSTRAINT PK_employees PRIMARY KEY (id);
```

#### Step 2: Verify the id column data type matches

Both columns must have the exact same data type. Check with:

```sql
-- Check data types
SELECT 
    'employees' AS TableName,
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length,
    c.is_nullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.employees') AND c.name = 'id'

UNION ALL

SELECT 
    'users' AS TableName,
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length,
    c.is_nullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.users') AND c.name = 'employee_id';
```

Both should show `uniqueidentifier` as the data type.

#### Step 3: Drop existing foreign key constraint (if it exists)

If you've tried to create the constraint multiple times, you might have a broken constraint:

```sql
-- Find and drop any existing foreign key constraints on users.employee_id
DECLARE @ConstraintName NVARCHAR(200);
DECLARE @SQL NVARCHAR(MAX);

SELECT @ConstraintName = name 
FROM sys.foreign_keys 
WHERE parent_object_id = OBJECT_ID('dbo.users')
    AND parent_column_id = (
        SELECT column_id 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.users') 
        AND name = 'employee_id'
    );

IF @ConstraintName IS NOT NULL
BEGIN
    SET @SQL = 'ALTER TABLE dbo.users DROP CONSTRAINT ' + @ConstraintName;
    PRINT 'Dropping constraint: ' + @ConstraintName;
    EXEC sp_executesql @SQL;
    PRINT 'Constraint dropped successfully';
END
ELSE
BEGIN
    PRINT 'No existing constraint found';
END
```

#### Step 4: Create the foreign key constraint with explicit database reference

Try creating the constraint with the full database path:

```sql
-- Create foreign key with explicit database reference
ALTER TABLE dbo.users
ADD CONSTRAINT FK_users_employee_id 
FOREIGN KEY (employee_id) 
REFERENCES dbo.employees(id) 
ON DELETE SET NULL;
```

#### Step 5: Alternative - Use sp_fkeys to verify

You can also use the system stored procedure to check foreign keys:

```sql
-- Check existing foreign keys
EXEC sp_fkeys @pktable_name = 'employees', @pktable_owner = 'dbo';
```

### COMPLETE SOLUTION: Run This Script

If you're still having issues, run this complete script that handles everything:

```sql
-- ============================================================================
-- COMPLETE FOREIGN KEY FIX SCRIPT
-- ============================================================================

USE WarehouseCheckIn;
GO

PRINT '========================================';
PRINT 'Step 1: Verify employees table exists';
PRINT '========================================';

IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
    PRINT 'ERROR: employees table does not exist!';
    PRINT 'Please create the employees table first.';
END
ELSE
BEGIN
    PRINT 'SUCCESS: employees table exists';
    
    -- Show employees table structure
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length,
        c.is_nullable,
        c.is_identity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.employees');
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 2: Check for PRIMARY KEY on employees.id';
PRINT '========================================';

IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    WHERE tc.TABLE_NAME = 'employees' 
        AND tc.TABLE_SCHEMA = 'dbo'
        AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        AND kcu.COLUMN_NAME = 'id'
)
BEGIN
    PRINT 'WARNING: No PRIMARY KEY found on employees.id';
    PRINT 'Adding PRIMARY KEY constraint...';
    
    ALTER TABLE dbo.employees
    ADD CONSTRAINT PK_employees PRIMARY KEY (id);
    
    PRINT 'SUCCESS: PRIMARY KEY added to employees.id';
END
ELSE
BEGIN
    PRINT 'SUCCESS: PRIMARY KEY exists on employees.id';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 3: Verify users table exists';
PRINT '========================================';

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    PRINT 'ERROR: users table does not exist!';
    PRINT 'Please create the users table first.';
END
ELSE
BEGIN
    PRINT 'SUCCESS: users table exists';
    
    -- Show users table structure
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length,
        c.is_nullable
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.users');
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 4: Drop existing foreign key (if exists)';
PRINT '========================================';

DECLARE @ConstraintName NVARCHAR(200);
DECLARE @SQL NVARCHAR(MAX);

SELECT @ConstraintName = name 
FROM sys.foreign_keys 
WHERE parent_object_id = OBJECT_ID('dbo.users')
    AND parent_column_id = (
        SELECT column_id 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.users') 
        AND name = 'employee_id'
    );

IF @ConstraintName IS NOT NULL
BEGIN
    SET @SQL = 'ALTER TABLE dbo.users DROP CONSTRAINT ' + @ConstraintName;
    PRINT 'Dropping existing constraint: ' + @ConstraintName;
    EXEC sp_executesql @SQL;
    PRINT 'SUCCESS: Constraint dropped';
END
ELSE
BEGIN
    PRINT 'No existing constraint found (this is OK)';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 5: Verify data types match';
PRINT '========================================';

SELECT 
    'employees.id' AS Column_Reference,
    t.name AS DataType,
    c.max_length,
    c.is_nullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.employees') AND c.name = 'id'

UNION ALL

SELECT 
    'users.employee_id' AS Column_Reference,
    t.name AS DataType,
    c.max_length,
    c.is_nullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.users') AND c.name = 'employee_id';
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 6: Create foreign key constraint';
PRINT '========================================';

BEGIN TRY
    ALTER TABLE dbo.users
    ADD CONSTRAINT FK_users_employee_id 
    FOREIGN KEY (employee_id) 
    REFERENCES dbo.employees(id) 
    ON DELETE SET NULL;
    
    PRINT 'SUCCESS: Foreign key constraint created!';
END TRY
BEGIN CATCH
    PRINT 'ERROR: Failed to create foreign key constraint';
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS NVARCHAR(10));
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
END CATCH
GO

PRINT '';
PRINT '========================================';
PRINT 'Step 7: Verify foreign key was created';
PRINT '========================================';

SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn,
    fk.delete_referential_action_desc AS DeleteAction
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc 
    ON fk.object_id = fkc.constraint_object_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.users')
    AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'employee_id';
GO

PRINT '';
PRINT '========================================';
PRINT 'COMPLETE! Foreign key setup finished.';
PRINT '========================================';
```

### IMPORTANT: Check for Existing Users Table First

Before creating the users table, check if it already exists:

```sql
-- Check if users table exists in any schema
SELECT 
    s.name AS SchemaName,
    t.name AS TableName,
    t.object_id AS ObjectID
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.name = 'users';

-- Alternative check using sys.objects
SELECT 
    name AS ObjectName,
    type_desc AS ObjectType,
    object_id AS ObjectID,
    create_date AS CreateDate,
    modify_date AS ModifyDate
FROM sys.objects 
WHERE name = 'users';
```

If the query returns results, the table exists. Proceed to the **"Table Already Exists"** section below.

### If Table Already Exists - Resolution Steps

If you get the error "There is already an object named 'users' in the database", follow these steps:

#### Step 1: Refresh SSMS
1. In SSMS, right-click on the **Tables** folder
2. Select **Refresh**
3. Check if the `users` table now appears

#### Step 2: Check All Schemas
The table might exist in a different schema:

```sql
-- List all tables named 'users' across all schemas
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName
FROM sys.tables
WHERE name = 'users';
```

#### Step 3: View Table Structure (If Found)
If the table exists, check its structure:

```sql
-- View columns in the users table
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.users');

-- View existing data
SELECT * FROM dbo.users;
```

#### Step 4: Drop and Recreate (If Needed)

**WARNING: This will delete all existing user data!**

If the existing table structure is incorrect or you want to start fresh:

```sql
-- Step 4a: Drop foreign key constraints first (if they exist)
DECLARE @ConstraintName NVARCHAR(200);
DECLARE @SQL NVARCHAR(MAX);

-- Find and drop all foreign key constraints referencing users table
DECLARE constraint_cursor CURSOR FOR
SELECT name 
FROM sys.foreign_keys 
WHERE referenced_object_id = OBJECT_ID('dbo.users');

OPEN constraint_cursor;
FETCH NEXT FROM constraint_cursor INTO @ConstraintName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'ALTER TABLE ' + OBJECT_NAME(parent_object_id) + ' DROP CONSTRAINT ' + @ConstraintName;
    EXEC sp_executesql @SQL;
    FETCH NEXT FROM constraint_cursor INTO @ConstraintName;
END;

CLOSE constraint_cursor;
DEALLOCATE constraint_cursor;

-- Step 4b: Drop foreign key constraints FROM users table
DECLARE constraint_cursor2 CURSOR FOR
SELECT name 
FROM sys.foreign_keys 
WHERE parent_object_id = OBJECT_ID('dbo.users');

OPEN constraint_cursor2;
FETCH NEXT FROM constraint_cursor2 INTO @ConstraintName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'ALTER TABLE dbo.users DROP CONSTRAINT ' + @ConstraintName;
    EXEC sp_executesql @SQL;
    FETCH NEXT FROM constraint_cursor2 INTO @ConstraintName;
END;

CLOSE constraint_cursor2;
DEALLOCATE constraint_cursor2;

-- Step 4c: Drop the users table
DROP TABLE dbo.users;

-- Step 4d: Verify it's gone
SELECT * FROM sys.objects WHERE name = 'users';
-- Should return no results
```

#### Step 5: Alternative - Use Existing Table

If the table structure is correct, you can skip creation and just insert the users:

```sql
-- Check if users already exist
SELECT * FROM dbo.users WHERE email IN ('dan@circuitry.solutions', 'mike@circuitry.solutions');

-- If they don't exist, insert them
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'dan@circuitry.solutions')
BEGIN
    INSERT INTO dbo.users (name, email, password_hash) 
    VALUES ('Dan', 'dan@circuitry.solutions', 'W1@3!-j/R');
END

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'mike@circuitry.solutions')
BEGIN
    INSERT INTO dbo.users (name, email, password_hash) 
    VALUES ('Mike', 'mike@circuitry.solutions', 'W1@3!-j/R');
END

-- Verify
SELECT * FROM dbo.users;
```

### 1. Create Users Table (Fresh Installation)

Run the following SQL script in SQL Server Management Studio to create the users table:

```sql
-- Create users table WITHOUT foreign key first
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

**THEN**, after the users table is created, run the **COMPLETE FOREIGN KEY FIX SCRIPT** above to add the foreign key constraint.

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

### Foreign Key Constraint Error: "references invalid table 'dbo.employees'"

**This is the most common error!** Follow these steps in order:

1. **Run the COMPLETE FOREIGN KEY FIX SCRIPT** at the top of this document
2. The script will automatically:
   - Verify both tables exist
   - Check for and add PRIMARY KEY on employees.id if missing
   - Drop any broken foreign key constraints
   - Verify data types match
   - Create the foreign key constraint
   - Verify the constraint was created successfully

3. **If the script still fails**, check these manually:
   - Ensure `employees.id` is a PRIMARY KEY (not just a regular column)
   - Ensure both `employees.id` and `users.employee_id` are `uniqueidentifier` type
   - Ensure you're running the script in the correct database (WarehouseCheckIn)
   - Ensure your SQL user has ALTER permissions on both tables

### "There is already an object named 'users' in the database" Error
- Follow the **"If Table Already Exists - Resolution Steps"** section
- Use the provided SQL queries to locate and inspect the existing table
- Either drop and recreate the table, or use the existing table structure

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

### Table not visible in SSMS but exists
- Right-click on Tables folder and select Refresh
- Check if the table is in a different schema using the provided queries
- Verify you're connected to the correct database
- Close and reopen SSMS if refresh doesn't work
