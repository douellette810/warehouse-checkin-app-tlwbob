
# Foreign Key Constraint Fix - Quick Reference

## Problem
Getting error: **"Foreign key 'FK_users_employee_id' references invalid table 'dbo.employees'"**

Even though the `dbo.employees` table clearly exists in SQL Server Management Studio.

## Root Cause
The most common cause is that the `employees` table doesn't have a **PRIMARY KEY** constraint on the `id` column. Foreign keys can only reference columns that are primary keys or have unique constraints.

## Quick Fix (Copy and Run This)

```sql
USE WarehouseCheckIn;
GO

-- Step 1: Add PRIMARY KEY to employees table (if missing)
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_NAME = 'employees' 
        AND TABLE_SCHEMA = 'dbo'
        AND CONSTRAINT_TYPE = 'PRIMARY KEY'
)
BEGIN
    PRINT 'Adding PRIMARY KEY to employees.id...';
    ALTER TABLE dbo.employees
    ADD CONSTRAINT PK_employees PRIMARY KEY (id);
    PRINT 'PRIMARY KEY added successfully!';
END
ELSE
BEGIN
    PRINT 'PRIMARY KEY already exists on employees.id';
END
GO

-- Step 2: Drop any broken foreign key constraints
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
    PRINT 'Constraint dropped successfully';
END
GO

-- Step 3: Create the foreign key constraint
BEGIN TRY
    ALTER TABLE dbo.users
    ADD CONSTRAINT FK_users_employee_id 
    FOREIGN KEY (employee_id) 
    REFERENCES dbo.employees(id) 
    ON DELETE SET NULL;
    
    PRINT 'SUCCESS: Foreign key constraint created!';
END TRY
BEGIN CATCH
    PRINT 'ERROR: ' + ERROR_MESSAGE();
END CATCH
GO

-- Step 4: Verify it worked
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc 
    ON fk.object_id = fkc.constraint_object_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.users');
```

## Verification Queries

### Check if employees has a PRIMARY KEY
```sql
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

**Expected Result:** Should show `PK_employees` or similar with `id` column

### Check data types match
```sql
SELECT 
    'employees.id' AS Column_Reference,
    t.name AS DataType
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.employees') AND c.name = 'id'

UNION ALL

SELECT 
    'users.employee_id' AS Column_Reference,
    t.name AS DataType
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.users') AND c.name = 'employee_id';
```

**Expected Result:** Both should show `uniqueidentifier`

## Still Not Working?

If the quick fix above doesn't work, run the **COMPLETE FOREIGN KEY FIX SCRIPT** in `AUTHENTICATION_SETUP.md` which includes more detailed diagnostics and error handling.

## Common Mistakes

1. ❌ **Trying to create foreign key before PRIMARY KEY exists**
   - Solution: Always ensure PRIMARY KEY exists first

2. ❌ **Data type mismatch between columns**
   - Solution: Both columns must be exactly the same type (uniqueidentifier)

3. ❌ **Wrong schema or database**
   - Solution: Always use `dbo.employees` and `dbo.users` with explicit schema

4. ❌ **Insufficient permissions**
   - Solution: Ensure your SQL user has ALTER permissions on both tables

## Success Indicators

After running the fix, you should see:
- ✅ "SUCCESS: Foreign key constraint created!"
- ✅ Query in Step 4 returns one row showing the FK_users_employee_id constraint
- ✅ In SSMS, you can expand `dbo.users` → `Keys` and see `FK_users_employee_id`
