
import { getDatabase, generateUUID } from './database';
import type { 
  Employee, 
  Company, 
  Category, 
  Material, 
  ISeriesProcessor,
  CheckInFormData 
} from '@/types/checkIn';

// Employee operations
export const getAllEmployees = async (): Promise<Employee[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Employee>(
    'SELECT * FROM employees ORDER BY created_at DESC'
  );
  return result;
};

export const addEmployee = async (name: string): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO employees (id, name) VALUES (?, ?)',
    [id, name]
  );
};

export const updateEmployee = async (id: string, name: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE employees SET name = ? WHERE id = ?',
    [name, id]
  );
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM employees WHERE id = ?', [id]);
};

// Company operations
export const getAllCompanies = async (): Promise<Company[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Company>(
    'SELECT * FROM companies ORDER BY created_at DESC'
  );
  return result;
};

export const addCompany = async (company: Omit<Company, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO companies (id, name, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [id, company.name, company.address, company.contact_person, company.email, company.phone]
  );
};

export const updateCompany = async (id: string, company: Omit<Company, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE companies SET name = ?, address = ?, contact_person = ?, email = ?, phone = ? WHERE id = ?',
    [company.name, company.address, company.contact_person, company.email, company.phone, id]
  );
};

export const deleteCompany = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM companies WHERE id = ?', [id]);
};

// Category operations
export const getAllCategories = async (): Promise<Category[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY created_at DESC'
  );
  return result;
};

export const addCategory = async (name: string): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO categories (id, name) VALUES (?, ?)',
    [id, name]
  );
};

export const updateCategory = async (id: string, name: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, id]
  );
};

export const deleteCategory = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

// Value Scrap operations
export const getAllValueScrap = async (): Promise<Material[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Material>(
    'SELECT * FROM value_scrap ORDER BY created_at DESC'
  );
  return result;
};

export const addValueScrap = async (material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO value_scrap (id, name, measurement) VALUES (?, ?, ?)',
    [id, material.name, material.measurement]
  );
};

export const updateValueScrap = async (id: string, material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE value_scrap SET name = ?, measurement = ? WHERE id = ?',
    [material.name, material.measurement, id]
  );
};

export const deleteValueScrap = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM value_scrap WHERE id = ?', [id]);
};

// Charge Materials operations
export const getAllChargeMaterials = async (): Promise<Material[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Material>(
    'SELECT * FROM charge_materials ORDER BY created_at DESC'
  );
  return result;
};

export const addChargeMaterial = async (material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO charge_materials (id, name, measurement) VALUES (?, ?, ?)',
    [id, material.name, material.measurement]
  );
};

export const updateChargeMaterial = async (id: string, material: Omit<Material, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE charge_materials SET name = ?, measurement = ? WHERE id = ?',
    [material.name, material.measurement, id]
  );
};

export const deleteChargeMaterial = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM charge_materials WHERE id = ?', [id]);
};

// i-Series operations
export const getAllISeries = async (): Promise<ISeriesProcessor[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<ISeriesProcessor>(
    'SELECT * FROM i_series ORDER BY created_at DESC'
  );
  return result;
};

export const addISeries = async (processor: Omit<ISeriesProcessor, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  await db.runAsync(
    'INSERT INTO i_series (id, processor_series, processor_generation) VALUES (?, ?, ?)',
    [id, processor.processor_series, processor.processor_generation]
  );
};

export const updateISeries = async (id: string, processor: Omit<ISeriesProcessor, 'id' | 'created_at'>): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE i_series SET processor_series = ?, processor_generation = ? WHERE id = ?',
    [processor.processor_series, processor.processor_generation, id]
  );
};

export const deleteISeries = async (id: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM i_series WHERE id = ?', [id]);
};

// Check-in operations
export const getAllCheckIns = async (): Promise<any[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM check_ins ORDER BY created_at DESC'
  );
  
  // Parse JSON fields
  return result.map((row: any) => ({
    ...row,
    categories: row.categories ? JSON.parse(row.categories) : [],
    value_scrap: row.value_scrap ? JSON.parse(row.value_scrap) : [],
    charge_materials: row.charge_materials ? JSON.parse(row.charge_materials) : [],
    value_scrap_totals: row.value_scrap_totals ? JSON.parse(row.value_scrap_totals) : [],
    charge_materials_totals: row.charge_materials_totals ? JSON.parse(row.charge_materials_totals) : [],
    i_series_pcs: row.i_series_pcs ? JSON.parse(row.i_series_pcs) : [],
    i_series_laptops: row.i_series_laptops ? JSON.parse(row.i_series_laptops) : [],
    has_i_series_pcs: row.has_i_series_pcs === 1,
    has_i_series_laptops: row.has_i_series_laptops === 1,
  }));
};

export const addCheckIn = async (checkIn: CheckInFormData): Promise<void> => {
  const db = getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO check_ins (
      id, employee_name, total_time, company_id, company_name, 
      address, contact_person, email, phone, categories, 
      value_scrap, charge_materials, suspected_value_note, other_notes,
      created_at, started_at, finished_at, value_scrap_totals, 
      charge_materials_totals, has_i_series_pcs, has_i_series_laptops,
      i_series_pcs, i_series_laptops
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      checkIn.employeeName,
      checkIn.totalTime,
      checkIn.companyId,
      checkIn.companyName,
      checkIn.address,
      checkIn.contactPerson,
      checkIn.email,
      checkIn.phone,
      JSON.stringify(checkIn.categories),
      JSON.stringify(checkIn.valueScrap),
      JSON.stringify(checkIn.chargeMaterials),
      checkIn.suspectedValueNote,
      checkIn.otherNotes,
      now,
      checkIn.startedAt,
      now, // finished_at
      JSON.stringify(checkIn.valueScrapTotals),
      JSON.stringify(checkIn.chargeMaterialsTotals),
      checkIn.hasISeriesPcs ? 1 : 0,
      checkIn.hasISeriesLaptops ? 1 : 0,
      JSON.stringify(checkIn.iSeriesPcs),
      JSON.stringify(checkIn.iSeriesLaptops),
    ]
  );
};
