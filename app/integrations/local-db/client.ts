
import { initDatabase } from './database';
import * as operations from './operations';

// Initialize database on module load
let dbInitialized = false;

export const ensureDbInitialized = async () => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
};

// Export a client-like interface similar to Supabase
export const localDb = {
  // Initialize the database
  init: ensureDbInitialized,
  
  // Table operations
  employees: {
    getAll: operations.getAllEmployees,
    add: operations.addEmployee,
    update: operations.updateEmployee,
    delete: operations.deleteEmployee,
  },
  
  companies: {
    getAll: operations.getAllCompanies,
    add: operations.addCompany,
    update: operations.updateCompany,
    delete: operations.deleteCompany,
  },
  
  categories: {
    getAll: operations.getAllCategories,
    add: operations.addCategory,
    update: operations.updateCategory,
    delete: operations.deleteCategory,
  },
  
  valueScrap: {
    getAll: operations.getAllValueScrap,
    add: operations.addValueScrap,
    update: operations.updateValueScrap,
    delete: operations.deleteValueScrap,
  },
  
  chargeMaterials: {
    getAll: operations.getAllChargeMaterials,
    add: operations.addChargeMaterial,
    update: operations.updateChargeMaterial,
    delete: operations.deleteChargeMaterial,
  },
  
  iSeries: {
    getAll: operations.getAllISeries,
    add: operations.addISeries,
    update: operations.updateISeries,
    delete: operations.deleteISeries,
  },
  
  checkIns: {
    getAll: operations.getAllCheckIns,
    add: operations.addCheckIn,
  },
};
