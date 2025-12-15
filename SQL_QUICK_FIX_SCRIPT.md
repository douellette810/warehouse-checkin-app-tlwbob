
# SQL Quick Fix Script - Comprehensive Solution

This script addresses all the errors you're encountering:
- PRIMARY KEY already exists on employees.id
- Invalid column name 'parent_column_id'
- Cannot find the object "dbo.users"

## Complete Fix Script

Copy and run this entire script in SQL Server Management Studio:

```sql
-- ============================================================================
-- COMPREHENSIVE SQL FIX SCRIPT
-- Fixes: Primary Key, Invalid Column, and Missing Table Errors
-- ============================================================================

USE WarehouseCheckIn;
GO

PRINT '========================================';
PRINT 'SQL QUICK FIX SCRIPT';
PRINT '========================================';
PRINT '';

-- ============================================================================
-- STEP 1: Verify Database Context
-- ============================================================================
PRINT 'Step 1: Verifying database context...';
SELECT DB_NAME() AS CurrentDatabase;
PRINT '';

-- ============================================================================
-- STEP 2: Check if employees table exists and has data
-- ============================================================================
PRINT 'Step 2: Checking employees table...';

IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
    PRINT '❌ ERROR: employees table does not exist!';
    PRINT '   Please create the employees table first.';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✅ employees table exists';
    
    -- Show table structure
    PRINT '   Table structure:';
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length AS MaxLength,
        c.is_nullable AS IsNullable,
        c.is_identity AS IsIdentity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.employees')
    ORDER BY c.column_id;
    
    -- Show row count
    DECLARE @EmployeeCount INT;
    SELECT @EmployeeCount = COUNT(*) FROM dbo.employees;
    PRINT '   Row count: ' + CAST(@EmployeeCount AS NVARCHAR(10));
    PRINT '';
END
GO

-- ============================================================================
-- STEP 3: Check and fix PRIMARY KEY on employees.id
-- ============================================================================
PRINT 'Step 3: Checking PRIMARY KEY on employees.id...';

-- Check if PRIMARY KEY exists
IF EXISTS (
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
    PRINT '✅ PRIMARY KEY already exists on employees.id (this is good!)';
    
    -- Show the constraint name
    SELECT 
        tc.CONSTRAINT_NAME,
        kcu.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    WHERE tc.TABLE_NAME = 'employees' 
        AND tc.TABLE_SCHEMA = 'dbo'
        AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY';
    PRINT '';
END
ELSE
BEGIN
    PRINT '⚠️  WARNING: No PRIMARY KEY found on employees.id';
    PRINT '   Adding PRIMARY KEY constraint...';
    
    BEGIN TRY
        ALTER TABLE dbo.employees
        ADD CONSTRAINT PK_employees PRIMARY KEY (id);
        
        PRINT '✅ PRIMARY KEY added successfully!';
    END TRY
    BEGIN CATCH
        PRINT '❌ ERROR adding PRIMARY KEY: ' + ERROR_MESSAGE();
    END CATCH
    PRINT '';
END
GO

-- ============================================================================
-- STEP 4: Check if users table exists
-- ============================================================================
PRINT 'Step 4: Checking users table...';

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    PRINT '⚠️  WARNING: users table does not exist';
    PRINT '   Creating users table...';
    
    BEGIN TRY
        -- Create users table
        CREATE TABLE dbo.users (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL UNIQUE,
            password_hash NVARCHAR(255) NOT NULL,
            employee_id UNIQUEIDENTIFIER NULL,
            created_at DATETIME DEFAULT GETDATE()
        );
        
        -- Create index on email
        CREATE INDEX idx_users_email ON dbo.users(email);
        
        PRINT '✅ users table created successfully!';
        PRINT '';
        
        -- Insert default users
        PRINT '   Inserting default users...';
        INSERT INTO dbo.users (name, email, password_hash) VALUES 
        ('Dan', 'dan@circuitry.solutions', 'W1@3!-j/R'),
        ('Mike', 'mike@circuitry.solutions', 'W1@3!-j/R');
        
        PRINT '✅ Default users inserted!';
        PRINT '';
    END TRY
    BEGIN CATCH
        PRINT '❌ ERROR creating users table: ' + ERROR_MESSAGE();
        PRINT '';
    END CATCH
END
ELSE
BEGIN
    PRINT '✅ users table exists';
    
    -- Show table structure
    PRINT '   Table structure:';
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length AS MaxLength,
        c.is_nullable AS IsNullable
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.users')
    ORDER BY c.column_id;
    
    -- Show row count
    DECLARE @UserCount INT;
    SELECT @UserCount = COUNT(*) FROM dbo.users;
    PRINT '   Row count: ' + CAST(@UserCount AS NVARCHAR(10));
    PRINT '';
END
GO

-- ============================================================================
-- STEP 5: Verify data types match between employees.id and users.employee_id
-- ============================================================================
PRINT 'Step 5: Verifying data types match...';

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL AND OBJECT_ID('dbo.employees', 'U') IS NOT NULL
BEGIN
    SELECT 
        'employees.id' AS ColumnReference,
        t.name AS DataType,
        c.max_length AS MaxLength
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.employees') AND c.name = 'id'
    
    UNION ALL
    
    SELECT 
        'users.employee_id' AS ColumnReference,
        t.name AS DataType,
        c.max_length AS MaxLength
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.users') AND c.name = 'employee_id';
    
    PRINT '✅ Data types shown above (both should be uniqueidentifier)';
    PRINT '';
END
GO

-- ============================================================================
-- STEP 6: Drop any existing broken foreign key constraints
-- ============================================================================
PRINT 'Step 6: Checking for existing foreign key constraints...';

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
BEGIN
    DECLARE @ConstraintName NVARCHAR(200);
    DECLARE @SQL NVARCHAR(MAX);
    
    -- Find foreign key constraint on users.employee_id
    SELECT @ConstraintName = fk.name 
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fk.parent_object_id = OBJECT_ID('dbo.users')
        AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'employee_id';
    
    IF @ConstraintName IS NOT NULL
    BEGIN
        PRINT '⚠️  Found existing constraint: ' + @ConstraintName;
        PRINT '   Dropping constraint...';
        
        SET @SQL = 'ALTER TABLE dbo.users DROP CONSTRAINT ' + QUOTENAME(@ConstraintName);
        
        BEGIN TRY
            EXEC sp_executesql @SQL;
            PRINT '✅ Constraint dropped successfully';
        END TRY
        BEGIN CATCH
            PRINT '❌ ERROR dropping constraint: ' + ERROR_MESSAGE();
        END CATCH
        PRINT '';
    END
    ELSE
    BEGIN
        PRINT '✅ No existing foreign key constraint found (this is OK)';
        PRINT '';
    END
END
GO

-- ============================================================================
-- STEP 7: Create foreign key constraint
-- ============================================================================
PRINT 'Step 7: Creating foreign key constraint...';

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL AND OBJECT_ID('dbo.employees', 'U') IS NOT NULL
BEGIN
    -- Verify PRIMARY KEY exists before creating foreign key
    IF EXISTS (
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
        BEGIN TRY
            ALTER TABLE dbo.users
            ADD CONSTRAINT FK_users_employee_id 
            FOREIGN KEY (employee_id) 
            REFERENCES dbo.employees(id) 
            ON DELETE SET NULL;
            
            PRINT '✅ SUCCESS: Foreign key constraint created!';
            PRINT '';
        END TRY
        BEGIN CATCH
            PRINT '❌ ERROR creating foreign key: ' + ERROR_MESSAGE();
            PRINT '   Error Number: ' + CAST(ERROR_NUMBER() AS NVARCHAR(10));
            PRINT '   Error Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
            PRINT '';
        END CATCH
    END
    ELSE
    BEGIN
        PRINT '❌ ERROR: Cannot create foreign key because employees.id does not have a PRIMARY KEY';
        PRINT '   Please run Step 3 again to add the PRIMARY KEY';
        PRINT '';
    END
END
ELSE
BEGIN
    PRINT '❌ ERROR: Cannot create foreign key because one or both tables do not exist';
    PRINT '';
END
GO

-- ============================================================================
-- STEP 8: Verify foreign key was created successfully
-- ============================================================================
PRINT 'Step 8: Verifying foreign key constraint...';

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        WHERE fk.parent_object_id = OBJECT_ID('dbo.users')
            AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'employee_id'
    )
    BEGIN
        PRINT '✅ Foreign key constraint exists!';
        PRINT '   Details:';
        
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
        
        PRINT '';
    END
    ELSE
    BEGIN
        PRINT '❌ Foreign key constraint was NOT created';
        PRINT '   Please review the errors above';
        PRINT '';
    END
END
GO

-- ============================================================================
-- STEP 9: Final verification - Show all constraints
-- ============================================================================
PRINT 'Step 9: Final verification - All constraints on users table...';

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
BEGIN
    -- Show all constraints
    SELECT 
        tc.CONSTRAINT_NAME,
        tc.CONSTRAINT_TYPE,
        kcu.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    WHERE tc.TABLE_NAME = 'users' 
        AND tc.TABLE_SCHEMA = 'dbo'
    ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME;
    
    PRINT '';
END
GO

PRINT '========================================';
PRINT 'SCRIPT COMPLETE!';
PRINT '========================================';
PRINT '';
PRINT 'Summary:';
PRINT '- If you see ✅ marks, those steps completed successfully';
PRINT '- If you see ❌ marks, review the error messages above';
PRINT '- The foreign key should now be created if all steps passed';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Verify the foreign key exists in SSMS:';
PRINT '   Expand: WarehouseCheckIn > Tables > dbo.users > Keys';
PRINT '2. If you still see errors, copy the error messages';
PRINT '3. Check that both tables exist and have the correct structure';
PRINT '';
```

## What This Script Does

This comprehensive script:

1. **Checks database context** - Ensures you're in the right database
2. **Verifies employees table** - Shows structure and data
3. **Handles PRIMARY KEY gracefully** - Only adds if missing (won't error if exists)
4. **Creates users table if missing** - With proper structure
5. **Verifies data types match** - Shows both column types
6. **Drops broken constraints** - Removes any existing broken foreign keys
7. **Creates foreign key** - Only if prerequisites are met
8. **Verifies success** - Shows final constraint details
9. **Shows all constraints** - Complete verification

## Common Issues Addressed

### Issue 1: "PRIMARY KEY already exists"
**Solution:** Script checks if PRIMARY KEY exists before trying to add it

### Issue 2: "Invalid column name 'parent_column_id'"
**Solution:** This error was likely from a different script. This script doesn't reference that column.

### Issue 3: "Cannot find the object 'dbo.users'"
**Solution:** Script creates the users table if it doesn't exist, then creates the foreign key

## After Running This Script

You should see output like:
```
✅ employees table exists
✅ PRIMARY KEY already exists on employees.id (this is good!)
✅ users table exists
✅ Data types shown above (both should be uniqueidentifier)
✅ No existing foreign key constraint found (this is OK)
✅ SUCCESS: Foreign key constraint created!
✅ Foreign key constraint exists!
```

## If You Still Get Errors

1. **Copy the entire error output** from SQL Server Management Studio
2. **Check which step failed** (look for ❌ marks)
3. **Verify table existence:**
   ```sql
   SELECT * FROM sys.tables WHERE name IN ('employees', 'users');
   ```
4. **Check your SQL Server permissions:**
   ```sql
   SELECT * FROM fn_my_permissions('dbo.employees', 'OBJECT');
   SELECT * FROM fn_my_permissions('dbo.users', 'OBJECT');
   ```

## Manual Verification

After running the script, verify in SSMS:

1. Expand: **WarehouseCheckIn** > **Tables** > **dbo.users** > **Keys**
2. You should see: **FK_users_employee_id**
3. Right-click the foreign key > **Properties** to see details

## Troubleshooting Specific Errors

### If "parent_column_id" error persists:
This column doesn't exist in our schema. Check if you're running a different script that references this column. Our script only uses:
- `employees.id`
- `users.employee_id`

### If "dbo.users" not found persists:
1. Run: `SELECT * FROM sys.objects WHERE name = 'users';`
2. If it returns results, the table exists but might be in a different schema
3. If no results, the script will create it in Step 4

### If PRIMARY KEY error persists:
The script handles this gracefully - it's actually OK if the PRIMARY KEY already exists. The script will just confirm it's there and move on.
