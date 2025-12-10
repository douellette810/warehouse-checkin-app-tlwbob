
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  try {
    console.log('Initializing local database...');
    db = await SQLite.openDatabaseAsync('warehouse_checkin.db');
    
    await createTables();
    console.log('Database initialized successfully');
    
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createTables = async () => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Create employees table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create companies table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create value_scrap table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS value_scrap (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        measurement TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create charge_materials table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS charge_materials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        measurement TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create i_series table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS i_series (
        id TEXT PRIMARY KEY,
        processor_series TEXT NOT NULL,
        processor_generation TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create check_ins table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        employee_name TEXT NOT NULL,
        total_time TEXT NOT NULL,
        company_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        address TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        categories TEXT,
        value_scrap TEXT,
        charge_materials TEXT,
        suspected_value_note TEXT,
        other_notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        started_at TEXT,
        finished_at TEXT,
        value_scrap_totals TEXT,
        charge_materials_totals TEXT,
        has_i_series_pcs INTEGER DEFAULT 0,
        has_i_series_laptops INTEGER DEFAULT 0,
        i_series_pcs TEXT,
        i_series_laptops TEXT
      );
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Helper function to generate UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
